import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Checkbox, Container, Divider, Grid, List, NumberInput, Space, Text, Title } from '@mantine/core';
import { ReactNode, useState } from 'react';

import {
  ALL_MEAL_COMPONENT_TYPES,
  Meal,
  MealComponent,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeStepVessel,
} from '@prixfixeco/models';
import { determineAllIngredientsForRecipes, determineAllInstrumentsForRecipes, cleanFloat } from '@prixfixeco/pfutils';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import Link from 'next/link';
import { serverSideTracer } from '../../src/tracer';
import { serverSideAnalytics } from '../../src/analytics';
import { extractUserInfoFromCookie } from '../../src/auth';

declare interface MealPageProps {
  meal: Meal;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPageProps>> => {
  const span = serverSideTracer.startSpan('MealPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { mealID } = context.query;
  if (!mealID) {
    throw new Error('meal ID is somehow missing!');
  }

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);
  if (userSessionData?.userID) {
    serverSideAnalytics.page(userSessionData.userID, 'MEAL_PAGE', context, {
      mealID,
      householdID: userSessionData.householdID,
    });
  }

  const { data: meal } = await pfClient.getMeal(mealID.toString()).then((result) => {
    span.addEvent('meal retrieved');
    return result;
  });

  span.end();
  return { props: { meal } };
};

// https://stackoverflow.com/a/14872766
const ordering: Record<string, number> = {};
for (let i = 0; i < ALL_MEAL_COMPONENT_TYPES.length; i++) {
  ordering[ALL_MEAL_COMPONENT_TYPES[i]] = i;
}

const formatRecipeList = (meal: Meal): ReactNode => {
  const sorted = (meal.components || []).sort(function (a: MealComponent, b: MealComponent) {
    return ordering[a.componentType] - ordering[b.componentType] || a.componentType.localeCompare(b.componentType);
  });

  return sorted.map((c: MealComponent, index: number) => {
    return (
      <List.Item key={index} mb="md">
        <Link href={`/recipes/${c.recipe.id}`}>{c.recipe.name}</Link>
        <em>{c.recipe.description}</em>
      </List.Item>
    );
  });
};

const formatInstrumentList = (meal: Meal): ReactNode => {
  return (determineAllInstrumentsForRecipes(meal.components.map((x) => x.recipe)) || []).map(
    (instrument: RecipeStepInstrument | RecipeStepVessel) => {
      return (
        ((instrument.instrument && instrument.instrument?.displayInSummaryLists) || instrument.recipeStepProductID) && (
          <List.Item key={instrument.id} m="-sm">
            <Checkbox size="sm" label={instrument.name} />
          </List.Item>
        )
      );
    },
  );
};

const formatIngredientForTotalList = (scale: number): ((_: RecipeStepIngredient) => ReactNode) => {
  // eslint-disable-next-line react/display-name
  return (ingredient: RecipeStepIngredient): ReactNode => {
    const minQty = cleanFloat(scale === 1.0 ? ingredient.minimumQuantity : ingredient.minimumQuantity * scale);
    const maxQty = cleanFloat(
      scale === 1.0 ? ingredient.maximumQuantity ?? 0 : ingredient.maximumQuantity ?? 0 * scale,
    );
    const measurmentUnitName = minQty === 1 ? ingredient.measurementUnit.name : ingredient.measurementUnit.pluralName;

    return (
      <List.Item key={ingredient.id} m="-sm">
        <Checkbox
          label={
            <>
              <u>
                {` ${minQty}${maxQty > 0 ? `- ${maxQty}` : ''} ${
                  ['unit', 'units'].includes(measurmentUnitName) ? '' : measurmentUnitName
                }`}
              </u>{' '}
              {ingredient.ingredient?.id ? ingredient.ingredient?.name : ingredient.name}
            </>
          }
        />
      </List.Item>
    );
  };
};

const formatIngredientList = (meal: Meal, scale: number = 1.0): ReactNode => {
  const recipeDetails = meal.components.map((x) => {
    return { scale: x.recipeScale, recipe: x.recipe };
  });

  return (determineAllIngredientsForRecipes(recipeDetails) || []).map(formatIngredientForTotalList(scale));
};

function MealPage({ meal }: MealPageProps) {
  const [mealScale, setMealScale] = useState(1.0);

  return (
    <AppLayout title={meal.name}>
      <Container size="xs">
        <Title order={3}>{meal.name}</Title>

        <NumberInput
          mt="sm"
          mb="lg"
          value={mealScale}
          precision={2}
          step={0.25}
          removeTrailingZeros={true}
          description={`this meal normally yields about ${meal.minimumEstimatedPortions} ${
            meal.minimumEstimatedPortions === 1 ? 'portion' : 'portions'
          }${
            mealScale === 1.0
              ? ''
              : `, but is now set up to yield ${meal.minimumEstimatedPortions * mealScale}  ${
                  meal.minimumEstimatedPortions === 1 ? 'portion' : 'portions'
                }`
          }`}
          onChange={(value: number | undefined) => {
            if (!value) return;

            setMealScale(value);
          }}
        />

        <Divider label="recipes" labelPosition="center" mb="xs" />

        <Grid grow gutter="md">
          <List mt="sm">{formatRecipeList(meal)}</List>
        </Grid>

        <Divider label="resources" labelPosition="center" mb="md" />

        <Grid>
          <Grid.Col span={6}>
            <Title order={6}>Tools:</Title>
            {determineAllInstrumentsForRecipes(meal.components.map((x) => x.recipe)).length > 0 && (
              <List icon={<></>} mt={-10}>
                {formatInstrumentList(meal)}
              </List>
            )}
          </Grid.Col>

          <Grid.Col span={6}>
            <Title order={6}>Ingredients:</Title>
            {determineAllIngredientsForRecipes(
              meal.components.map((x) => {
                return { scale: mealScale, recipe: x.recipe };
              }),
            ).length > 0 && (
              <List icon={<></>} mt={-10}>
                {formatIngredientList(meal, mealScale)}
              </List>
            )}
          </Grid.Col>
        </Grid>
      </Container>
      <Space h="xl" my="xl" />
    </AppLayout>
  );
}

export default MealPage;
