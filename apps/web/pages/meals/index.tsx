import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { Button, Center, Container, List } from '@mantine/core';

import { Meal } from 'models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { useRouter } from 'next/router';
import { serverSideTracer } from '../../src/tracer';

declare interface MealsPageProps {
  meals: Meal[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealsPageProps>> => {
  const span = serverSideTracer.startSpan('MealsPage.getInitialProps');
  const pfClient = buildServerSideClient(context);

  // TODO: parse context.query as QueryFilter.
  const { data: meals } = await pfClient.getMeals();

  span.end();
  return { props: { meals: meals.data } };
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
    <AppLayout>
      <Container size="xs">
        <Center>
          <Button
            my="lg"
            onClick={() => {
              router.push('/meal_plans/new');
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
