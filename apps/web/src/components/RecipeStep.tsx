import { Badge, Card, List, Title, Text, Grid, Collapse, Checkbox, Group } from '@mantine/core';
import { ReactNode } from 'react';
import dagre from 'dagre';

import { Recipe, RecipeStep, RecipeStepInstrument, RecipeStepVessel } from '@prixfixeco/models';
import {
  buildRecipeStepText,
  getRecipeStepIndexByProductID,
  recipeStepCanBePerformed,
  stepElementIsProduct,
} from '@prixfixeco/utils';

import { browserSideAnalytics } from '../analytics';
import { RecipeStepIngredientListComponent } from './IngredientList';

const formatInstrumentList = (
  instruments: (RecipeStepInstrument | RecipeStepVessel)[],
  recipe: Recipe,
  stepIndex: number,
  recipeGraph: dagre.graphlib.Graph<string>,
  stepsNeedingCompletion: boolean[],
): ReactNode => {
  return (instruments || []).map((instrument: RecipeStepInstrument | RecipeStepVessel) => {
    const elementIsProduct = stepElementIsProduct(instrument);
    const checkboxDisabled = recipeStepCanBePerformed(stepIndex, recipeGraph, stepsNeedingCompletion);

    return (
      ((instrument.instrument && instrument.instrument?.displayInSummaryLists) || instrument.recipeStepProductID) && (
        <List.Item key={instrument.id}>
          {(elementIsProduct && (
            <>
              <Text size="sm" italic>
                {instrument.name}
              </Text>{' '}
              <Text size="sm">
                &nbsp;{` from step #${getRecipeStepIndexByProductID(recipe, instrument.recipeStepProductID!)}`}
              </Text>
            </>
          )) || <Checkbox size="sm" label={instrument.name} disabled={checkboxDisabled} />}
        </List.Item>
      )
    );
  });
};

declare interface RecipeStepComponentProps {
  recipe: Recipe;
  recipeStep: RecipeStep;
  scale?: number;
  checked: boolean;
  recipeGraph: dagre.graphlib.Graph<string>;
  stepsNeedingCompletion: boolean[];
  stepCheckboxClicked: (_stepIndex: number) => void;
}

export const RecipeStepComponent = ({
  recipe,
  recipeStep,
  scale = 1.0,
  recipeGraph,
  checked,
  stepsNeedingCompletion,
  stepCheckboxClicked,
}: RecipeStepComponentProps): JSX.Element => {
  const stepIndex = (recipe.steps || []).findIndex((x) => x.id === recipeStep.id);
  const checkboxDisabled = recipeStepCanBePerformed(stepIndex, recipeGraph, stepsNeedingCompletion);

  const allInstruments = (recipeStep.instruments || []).filter(
    (instrument: RecipeStepInstrument) =>
      (instrument.instrument && instrument.instrument?.displayInSummaryLists) || instrument.recipeStepProductID,
  );
  const allVessels = (recipeStep.vessels || [])
    .filter(
      (vessel: RecipeStepVessel) =>
        (vessel.instrument && vessel.instrument?.displayInSummaryLists) || vessel.recipeStepProductID,
    )
    // only get vessels not already present as instruments
    .filter((vessel: RecipeStepVessel) => !allInstruments.find((x) => x.id !== vessel.instrument?.id));
  const allTools: (RecipeStepInstrument | RecipeStepVessel)[] = [...allInstruments, ...allVessels];

  return (
    <Card key={recipeStep.id} shadow="sm" p="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
      <Card.Section px="sm">
        <Grid justify="space-between">
          <Grid.Col span="content">
            <Badge mb="sm">Step #{recipeStep.index + 1}</Badge>
          </Grid.Col>
          <Grid.Col span="content">
            <Group style={{ float: 'right' }}>
              <Checkbox
                checked={!checked}
                onChange={() => {}}
                onClick={() => {
                  browserSideAnalytics.track('RECIPE_STEP_TOGGLED', {
                    recipeID: recipeStep.belongsToRecipe,
                    recipeStepID: recipeStep.id,
                    checked: !checked,
                  });

                  stepCheckboxClicked(stepIndex);
                }}
                disabled={checkboxDisabled}
              />
            </Group>
          </Grid.Col>
        </Grid>
      </Card.Section>

      <Collapse in={checked}>
        <Grid justify="center">
          <Grid.Col sm={12} md={8}>
            <Text strikethrough={!checked}>{buildRecipeStepText(recipe, recipeStep, scale)}</Text>

            <Text strikethrough={!recipeStepCanBePerformed(stepIndex, recipeGraph, stepsNeedingCompletion)} mt="md">
              {recipeStep.notes}
            </Text>
          </Grid.Col>

          <Grid.Col sm={12} md={4}>
            {allTools.length > 0 && (
              <Card.Section px="sm">
                <Title order={6}>Tools:</Title>
                <List icon={<></>} mt={-10}>
                  {formatInstrumentList(allTools, recipe, stepIndex, recipeGraph, stepsNeedingCompletion)}
                </List>
              </Card.Section>
            )}

            {(recipeStep.ingredients || []).length > 0 && (
              <Card.Section px="sm" pt="sm">
                <Title order={6}>Ingredients:</Title>
                <RecipeStepIngredientListComponent
                  recipe={recipe}
                  recipeScale={scale}
                  recipeStep={recipeStep}
                  stepIndex={stepIndex}
                  recipeGraph={recipeGraph}
                  stepsNeedingCompletion={stepsNeedingCompletion}
                />
              </Card.Section>
            )}
          </Grid.Col>
        </Grid>
      </Collapse>
    </Card>
  );
};
