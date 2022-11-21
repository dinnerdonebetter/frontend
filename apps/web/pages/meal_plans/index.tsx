import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { Button, Center, Container, List } from '@mantine/core';
import { useRouter } from 'next/router';

import { MealPlan, QueryFilter } from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';

declare interface MealPlansPageProps {
  mealPlans: MealPlan[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPlansPageProps>> => {
  const span = serverSideTracer.startSpan('MealPlansPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  const { data: mealPlans } = await pfClient.getMealPlans(qf).then((result) => {
    span.addEvent('meal plan list retrieved');
    return result;
  });

  span.end();
  return { props: { mealPlans: mealPlans.data } };
};

function MealPlansPage(props: MealPlansPageProps) {
  const router = useRouter();
  const { mealPlans } = props;

  const mealPlanItems = (mealPlans || []).map((mealPlan: MealPlan) => (
    <List.Item key={mealPlan.id}>
      <Link href={`/meal_plans/${mealPlan.id}`}>{mealPlan.id}</Link>
    </List.Item>
  ));

  return (
    <AppLayout title='Meal Plans'>
      <Container size="xs">
        <Center>
          <Button
            my="lg"
            onClick={() => {
              router.push('/meal_plans/new');
            }}
          >
            New Meal Plan
          </Button>
        </Center>
        <List>{mealPlanItems}</List>
      </Container>
    </AppLayout>
  );
}

export default MealPlansPage;
