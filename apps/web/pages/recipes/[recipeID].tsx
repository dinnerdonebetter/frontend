import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Badge, Card, List, Title, Text, Grid, Divider } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';

import { Recipe, RecipeStep, RecipeStepIngredient, RecipeStepInstrument, RecipeStepProduct } from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { ReactNode } from 'react';
import { serverSideTracer } from '../../src/tracer';

declare interface RecipePageProps {
  recipe: Recipe;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<RecipePageProps>> => {
  const span = serverSideTracer.startSpan('RecipePage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { recipeID } = context.query;
  if (!recipeID) {
    throw new Error('recipe ID is somehow missing!');
  }

  const { data: recipe } = await pfClient.getRecipe(recipeID.toString()).then((result) => {
    span.addEvent('recipe retrieved');
    return result;
  });

  span.end();
  return { props: { recipe } };
};

const ingredientIsProduct = (ingredient: RecipeStepIngredient): boolean => {
  return (
    Boolean(ingredient.productOfRecipeStep) &&
    Boolean(ingredient.recipeStepProductID) &&
    ingredient.recipeStepProductID !== ''
  );
};

const getRecipeStepIndexByID = (recipe: Recipe, id: string): number => {
  let retVal = -1;

  (recipe.steps || []).forEach((step: RecipeStep, stepIndex: number) => {
    if (step.products.findIndex((product: RecipeStepProduct) => product.id === id) !== -1) {
      retVal = stepIndex + 1;
    }
  });

  return retVal;
};

const formatProductList = (recipeStep: RecipeStep): ReactNode => {
  return (recipeStep.products || []).map((product: RecipeStepProduct) => {
    return (
      <List.Item key={product.id}>
        <Text size="sm">{product.name}</Text>
      </List.Item>
    );
  });
};

const formatIngredientList = (recipe: Recipe, recipeStep: RecipeStep): ReactNode => {
  const validIngredients = (recipeStep.ingredients || []).filter((ingredient) => ingredient.ingredient !== null);
  const productIngredients = (recipeStep.ingredients || []).filter(ingredientIsProduct);

  return validIngredients.concat(productIngredients).map(formatIngredient(recipe));
};

const formatAllIngredientList = (recipe: Recipe): ReactNode => {
  const validIngredients = (recipe.steps || [])
    .map((recipeStep: RecipeStep) => {
      return (recipeStep.ingredients || []).filter((ingredient) => ingredient.ingredient !== null);
    })
    .flat();

  return validIngredients.map(formatIngredient(recipe));
};

const formatAllInstrumentList = (recipe: Recipe): ReactNode => {
  const uniqueValidInstruments: Record<string, RecipeStepInstrument> = {};

  (recipe.steps || []).forEach((recipeStep: RecipeStep) => {
    return (recipeStep.instruments || []).forEach((instrument) => {
      if (instrument.instrument !== null) {
        uniqueValidInstruments[instrument.instrument!.id] = instrument;
      }
    });
  });

  return Object.values(uniqueValidInstruments).map(formatInstrument());
};

const formatIngredient = (
  recipe: Recipe,
  showProductBadge: boolean = true,
): ((_: RecipeStepIngredient) => ReactNode) => {
  // eslint-disable-next-line react/display-name
  return (ingredient: RecipeStepIngredient): ReactNode => {
    return (
      <List.Item key={ingredient.id}>
        <Text size="sm">
          {`${ingredient.name} `}
          {`(${ingredient.minimumQuantity}${ingredient.maximumQuantity > 0 ? `- ${ingredient.maximumQuantity}` : ''}  ${
            ingredient.minimumQuantity === 1 ? ingredient.measurementUnit.name : ingredient.measurementUnit.pluralName
          })`}
          {ingredientIsProduct(ingredient) && showProductBadge && (
            <Text size="sm">
              &nbsp;from{' '}
              <Badge color="grape">step #{getRecipeStepIndexByID(recipe, ingredient.recipeStepProductID!)}</Badge>&nbsp;
            </Text>
          )}
        </Text>
      </List.Item>
    );
  };
};

const formatInstrument = (): ((_: RecipeStepInstrument) => ReactNode) => {
  // eslint-disable-next-line react/display-name
  return (instrument: RecipeStepInstrument): ReactNode => {
    return (
      <List.Item key={instrument.id}>
        <Text size="sm">
          {`${instrument.minimumQuantity}${
            instrument.maximumQuantity > 0 && instrument.maximumQuantity != instrument.minimumQuantity
              ? `- ${instrument.maximumQuantity}`
              : ''
          } ${instrument.instrument?.name}`}
        </Text>
      </List.Item>
    );
  };
};

function RecipePage({ recipe }: RecipePageProps) {
  const recipeSteps = (recipe.steps || []).map((recipeStep: RecipeStep) => (
    <Card key={recipeStep.id} shadow="sm" p="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
      {(recipeStep.media || []).length > 0 && (
        <Card.Section>
          <Image
            src={recipeStep.media[0].externalPath}
            height={160}
            alt={`recipe media #${recipeStep.media[0].index}`}
          />
        </Card.Section>
      )}

      <Grid justify="space-between">
        <Grid.Col span="content">
          <Text weight={700}>{recipeStep.preparation.name}</Text>
        </Grid.Col>
        <Grid.Col span="content">
          <Link href={`#${recipeStep.index + 1}`}>
            <Badge>Step #{recipeStep.index + 1}</Badge>
          </Link>
        </Grid.Col>
      </Grid>

      <List>{formatIngredientList(recipe, recipeStep)}</List>

      <Text size="sm" color="dimmed" my="sm">
        {recipeStep.explicitInstructions ? recipeStep.explicitInstructions : recipeStep.notes}
      </Text>

      <Divider my="sm" />

      <Text size="sm">yields</Text>
      <List>{formatProductList(recipeStep)}</List>
    </Card>
  ));

  return (
    <AppLayout>
      <Head>
        <title>Prixfixe - {recipe.name}</title>
      </Head>
      <Title order={3}>{recipe.name}</Title>
      <Grid grow gutter="md">
        <Card shadow="sm" p="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
          <Title order={5}>All Ingredients</Title>
          <List>{formatAllIngredientList(recipe)}</List>
        </Card>

        <Card shadow="sm" p="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
          <Title order={5}>All Instruments</Title>
          <List>{formatAllInstrumentList(recipe)}</List>
        </Card>

        {recipeSteps}
      </Grid>
    </AppLayout>
  );
}

export default RecipePage;
