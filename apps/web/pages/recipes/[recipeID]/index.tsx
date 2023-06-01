import { AxiosError, AxiosResponse } from 'axios';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { Recipe } from '@dinnerdonebetter/models';

import { buildServerSideClient } from '../../../src/client';
import { AppLayout } from '../../../src/layouts';
import { RecipeComponent } from '../../../src/components';
import { serverSideTracer } from '../../../src/tracer';
import { serverSideAnalytics } from '../../../src/analytics';
import { extractUserInfoFromCookie } from '../../../src/auth';

declare interface RecipePageProps {
  recipe: Recipe;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<RecipePageProps>> => {
  const span = serverSideTracer.startSpan('RecipePage.getServerSideProps');
  const apiClient = buildServerSideClient(context);

  const { recipeID } = context.query;
  if (!recipeID) {
    throw new Error('recipe ID is somehow missing!');
  }

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);
  if (userSessionData?.userID) {
    serverSideAnalytics.page(userSessionData.userID, 'RECIPE_PAGE', context, {
      recipeID,
      householdID: userSessionData.householdID,
    });
  }

  let props!: GetServerSidePropsResult<RecipePageProps>;
  await apiClient
    .getRecipe(recipeID.toString())
    .then((result: AxiosResponse) => {
      span.addEvent(`recipe retrieved`);
      props = { props: { recipe: result.data } };
    })
    .catch((error: AxiosError) => {
      if (error.response?.status === 404) {
        console.log('attempting redirect');
        props = {
          redirect: {
            destination: '/recipes',
            permanent: false,
          },
        };
      }
    });

  span.end();
  return props;
};

function RecipePage({ recipe }: RecipePageProps) {
  return (
    <AppLayout title={recipe.name} userLoggedIn>
      <RecipeComponent recipe={recipe} />
    </AppLayout>
  );
}

export default RecipePage;
