import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { Button, Center, Container, Divider, List } from '@mantine/core';
import { useRouter } from 'next/router';
import { format } from 'date-fns';

import { MealPlan, QueryFilter } from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';
import { serverSideAnalytics } from '../../src/analytics';
import { extractUserInfoFromCookie } from '../../src/auth';

declare interface MealPlansPageProps {
  mealPlans: MealPlan[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPlansPageProps>> => {
  const span = serverSideTracer.startSpan('MealPlansPage.getServerSideProps');
  const apiClient = buildServerSideClient(context);

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);

  if (userSessionData?.userID) {
    serverSideAnalytics.page(userSessionData.userID, 'MEAL_PLANS_PAGE', context, {
      householdID: userSessionData.householdID,
    });
  }

  const { data: mealPlans } = await apiClient.getMealPlans(qf).then((result) => {
    span.addEvent('meal plan list retrieved');
    return result;
  });

  span.end();
  return { props: { mealPlans: mealPlans.data } };
};

const dateFormat = 'h aa M/d/yy';

const getEarliestEvent = (mealPlan: MealPlan) => {
  return mealPlan.events.reduce((earliest, event) => (event.startsAt < earliest.startsAt ? event : earliest));
};

const getLatestEvent = (mealPlan: MealPlan) => {
  return mealPlan.events.reduce((earliest, event) => (event.startsAt > earliest.startsAt ? event : earliest));
};

function MealPlansPage(props: MealPlansPageProps) {
  const router = useRouter();
  const { mealPlans } = props;

  const expiredMealPlans = (mealPlans || []).filter(
    (mealPlan: MealPlan) => new Date(mealPlan.votingDeadline).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0),
  );

  const expiredMealPlanItems = expiredMealPlans.map((mealPlan: MealPlan) => {
    const earliestEvent = getEarliestEvent(mealPlan);
    const latestEvent = getLatestEvent(mealPlan);

    return (
      <List.Item key={mealPlan.id}>
        <Link href={`/meal_plans/${mealPlan.id}`}>
          {format(new Date(earliestEvent.startsAt), dateFormat)} - {format(new Date(latestEvent.startsAt), dateFormat)}
        </Link>
      </List.Item>
    );
  });

  const votableMealPlanItems = (mealPlans || []).map((mealPlan: MealPlan) => {
    const earliestEvent = getEarliestEvent(mealPlan);
    const latestEvent = getLatestEvent(mealPlan);

    return (
      <List.Item key={mealPlan.id}>
        <Link href={`/meal_plans/${mealPlan.id}`}>
          {format(new Date(earliestEvent.startsAt), dateFormat)} - {format(new Date(latestEvent.startsAt), dateFormat)}
        </Link>
      </List.Item>
    );
  });

  return (
    <AppLayout title="Meal Plans">
      <Container size="xs">
        <Center>
          <Button my="lg" onClick={() => router.push('/meal_plans/new')}>
            New Meal Plan
          </Button>
        </Center>
        <List icon={<></>}>{votableMealPlanItems}</List>

        {expiredMealPlanItems.length > 0 && <Divider label="Expired" labelPosition="center" my="xl" />}
        <List icon={<></>}>{expiredMealPlanItems}</List>
      </Container>
    </AppLayout>
  );
}

export default MealPlansPage;
