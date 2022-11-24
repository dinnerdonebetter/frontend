import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AxiosResponse } from 'axios';
import { Button, Center, Container, List } from '@mantine/core';

import { Meal, MealList, QueryFilter } from '@prixfixeco/models';

import { serverSideTracer } from '../../lib/tracer';
import { buildServerSideClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';
import { buildServerSideLogger } from '../../lib/logger';

declare interface MealsPageProps {
  meals: Meal[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealsPageProps>> => {
  const span = serverSideTracer.startSpan('MealsPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);
  const logger = buildServerSideLogger('RecipesPage');

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  let props!: GetServerSidePropsResult<MealsPageProps>;

  await pfClient
    .getMeals(qf)
    .then((result: AxiosResponse<MealList>) => {
      span.addEvent('meals retrieved');
      props = { props: { meals: result.data.data } };
    })
    .catch((error) => {
      span.addEvent('error retrieving meals');
      logger.error(error.response?.status);
      if (error.response?.status === 401) {
        props = {
          redirect: {
            destination: `/login?dest=${encodeURIComponent(context.resolvedUrl)}`,
            permanent: false,
          },
        };
        return;
      }

      throw error;
    });

  span.end();
  return props;
};

function MealsPage(props: MealsPageProps) {
  const router = useRouter();
  const { meals } = props;

  const mealItems = (meals || []).map((meal: Meal) => (
    <List.Item key={meal.id}>
      <Link href={`/meals/${meal.id}`}>{meal.name}</Link>
    </List.Item>
  ));

  return (
    <AppLayout title="Meals">
      <Container size="xs">
        <Center>
          <Button
            my="lg"
            onClick={() => {
              router.push('/meals/new');
            }}
          >
            New Meal
          </Button>
        </Center>
        <List>{mealItems}</List>
      </Container>
    </AppLayout>
  );
}

export default MealsPage;
