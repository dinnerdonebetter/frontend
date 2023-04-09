import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { Button, Center, Container, List } from '@mantine/core';
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
  const pfClient = buildServerSideClient(context);

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);

  if (userSessionData?.userID) {
    serverSideAnalytics.page(userSessionData.userID, 'MEAL_PLANS_PAGE', context, {
      householdID: userSessionData.householdID,
    });
  }

  const { data: mealPlans } = await pfClient.getMealPlans(qf).then((result) => {
    span.addEvent('meal plan list retrieved');
    return result;
  });

  span.end();
  return { props: { mealPlans: mealPlans.data } };
};

const dateFormat = 'h aa M/d/yy';

function MealPlansPage(props: MealPlansPageProps) {
  const router = useRouter();
  const { mealPlans } = props;

  const mealPlanItems = (mealPlans || []).map((mealPlan: MealPlan) => {
    const earliestEvent = mealPlan.events.reduce((earliest, event) => {
      if (event.startsAt < earliest.startsAt) {
        return event;
      }
      return earliest;
    });
    const latestEvent = mealPlan.events.reduce((earliest, event) => {
      if (event.startsAt > earliest.startsAt) {
        return event;
      }
      return earliest;
    });

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
          <Button
            my="lg"
            onClick={() => {
              router.push('/meal_plans/new');
            }}
          >
            New Meal Plan
          </Button>
        </Center>
        <List icon={<></>}>{mealPlanItems}</List>
      </Container>
    </AppLayout>
  );
}

export default MealPlansPage;
