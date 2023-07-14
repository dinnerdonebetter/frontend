import { Card, List, Title, Text, Grid, ActionIcon, Collapse, Checkbox, Group, NumberInput, Box } from '@mantine/core';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { IconCaretDown, IconCaretUp, IconRotate } from '@tabler/icons';
import dagre from 'dagre';

import {
  Recipe,
  RecipeStep,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeStepVessel,
} from '@dinnerdonebetter/models';
import {
  buildRecipeStepText,
  cleanFloat,
  getRecipeStepIndexByProductID,
  recipeStepCanBePerformed,
  renderMermaidDiagramForRecipe,
  stepElementIsProduct,
  toDAG,
} from '@dinnerdonebetter/utils';

import { Mermaid } from '../components';
import { browserSideAnalytics } from '../../src/analytics';
import { RecipeIngredientListComponent } from './IngredientList';
import { RecipeInstrumentListComponent } from './InstrumentList';

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

    const dump = JSON.parse(JSON.stringify(instrument));
    const displayInSummaryLists = dump.hasOwnProperty('vessel')
      ? (instrument as RecipeStepVessel).vessel?.displayInSummaryLists
      : (instrument as RecipeStepInstrument).instrument?.displayInSummaryLists;

    return (
      (displayInSummaryLists || instrument.recipeStepProductID) && (
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

const renderRecipeStep =
  (
    recipe: Recipe,
    recipeScale: number,
    recipeGraph: dagre.graphlib.Graph<string>,
    stepsNeedingCompletion: boolean[],
    stepCheckboxClicked: (_stepIndex: number) => void = () => {},
  ) =>
  // eslint-disable-next-line react/display-name
  (recipeStep: RecipeStep, stepIndex: number) => {
    const checkboxDisabled = recipeStepCanBePerformed(stepIndex, recipeGraph, stepsNeedingCompletion);

    const allInstruments = (recipeStep.instruments || []).filter(
      (instrument: RecipeStepInstrument) =>
        (instrument.instrument && instrument.instrument?.displayInSummaryLists) || instrument.recipeStepProductID,
    );
    const allVessels = (recipeStep.vessels || []).filter(
      (vessel: RecipeStepVessel) =>
        (vessel.vessel && vessel.vessel?.displayInSummaryLists) || vessel.recipeStepProductID,
    );
    const allTools: (RecipeStepInstrument | RecipeStepVessel)[] = [...allInstruments, ...allVessels];

    const validIngredients = (recipeStep.ingredients || []).filter((ingredient) => ingredient.ingredient !== null);
    const productIngredients = (recipeStep.ingredients || []).filter(stepElementIsProduct);
    const allIngredients = validIngredients.concat(productIngredients);

    return (
      <Card key={recipeStep.id} shadow="sm" p="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
        <Card.Section px="sm">
          <Grid justify="space-between">
            <Grid.Col span="content">
              <Text italic={!stepsNeedingCompletion[stepIndex]}>
                {recipeStep.preparation.name} {allIngredients.map((ingredient) => ingredient.name)}
              </Text>
            </Grid.Col>
            <Grid.Col span="auto" />
            <Grid.Col span="content">
              <Group style={{ float: 'right' }}>
                <Checkbox
                  checked={!stepsNeedingCompletion[stepIndex]}
                  label={
                    checkboxDisabled ? 'Not Ready' : !stepsNeedingCompletion[stepIndex] ? 'Completed' : 'Not Completed'
                  }
                  labelPosition="left"
                  onChange={() => {}}
                  onClick={() => {
                    browserSideAnalytics.track('RECIPE_STEP_TOGGLED', {
                      recipeID: recipe.id,
                      recipeStepID: recipeStep.id,
                      checked: !stepsNeedingCompletion[stepIndex],
                    });

                    stepCheckboxClicked(stepIndex);
                  }}
                  disabled={checkboxDisabled}
                />
              </Group>
            </Grid.Col>
          </Grid>
        </Card.Section>

        <Collapse in={stepsNeedingCompletion[stepIndex]}>
          <Grid justify="center">
            <Grid.Col sm={12} md={8}>
              <Text strikethrough={!stepsNeedingCompletion[stepIndex]}>
                {buildRecipeStepText(recipe, recipeStep, recipeScale)}
              </Text>

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
                  <List icon={<></>} mt={-10}>
                    {allIngredients.map((ingredient: RecipeStepIngredient): ReactNode => {
                      const checkboxDisabled = recipeStepCanBePerformed(stepIndex, recipeGraph, stepsNeedingCompletion);

                      const shouldDisplayMinQuantity = !stepElementIsProduct(ingredient);
                      const shouldDisplayMaxQuantity =
                        shouldDisplayMinQuantity &&
                        ingredient.maximumQuantity !== undefined &&
                        ingredient.maximumQuantity !== null &&
                        (ingredient.maximumQuantity ?? -1) > ingredient.minimumQuantity &&
                        ingredient.minimumQuantity != ingredient.maximumQuantity;
                      const elementIsProduct = stepElementIsProduct(ingredient);

                      let measurementName = shouldDisplayMinQuantity
                        ? cleanFloat(ingredient.minimumQuantity * recipeScale) === 1
                          ? ingredient.measurementUnit.name
                          : ingredient.measurementUnit.pluralName
                        : '';
                      measurementName = ['unit', 'units'].includes(measurementName) ? '' : measurementName;

                      const ingredientName =
                        cleanFloat(ingredient.minimumQuantity * recipeScale) === 1
                          ? ingredient.ingredient?.name || ingredient.name
                          : ingredient.ingredient?.pluralName || ingredient.name;

                      const lineText = (
                        <>
                          {`${shouldDisplayMinQuantity ? cleanFloat(ingredient.minimumQuantity * recipeScale) : ''}${
                            shouldDisplayMaxQuantity
                              ? `- ${cleanFloat((ingredient.maximumQuantity ?? 0) * recipeScale)}`
                              : ''
                          } ${measurementName}
                              `}
                          {elementIsProduct ? <em>{ingredientName}</em> : <>{ingredientName}</>}
                          {`${
                            elementIsProduct
                              ? ` from step #${getRecipeStepIndexByProductID(recipe, ingredient.recipeStepProductID!)}`
                              : ''
                          }
                              `}
                        </>
                      );

                      return (
                        <List.Item key={ingredient.id} mt="xs">
                          <Checkbox label={lineText} disabled={checkboxDisabled} mt="-sm" />
                        </List.Item>
                      );
                    })}
                  </List>
                </Card.Section>
              )}
            </Grid.Col>
          </Grid>
        </Collapse>
      </Card>
    );
  };

declare interface RecipeComponentProps {
  recipe: Recipe;
  scale?: number;
}

export const RecipeComponent = ({ recipe, scale = 1.0 }: RecipeComponentProps): JSX.Element => {
  let recipeGraph = toDAG(recipe);

  const [stepsNeedingCompletion, setStepsNeedingCompletion] = useState(
    Array((recipe.steps || []).length).fill(true) as boolean[],
  );
  const [flowChartVisible, setFlowChartVisibility] = useState(false);
  const [allIngredientListVisible, setIngredientListVisibility] = useState(false);
  const [allInstrumentListVisible, setInstrumentListVisibility] = useState(false);

  const [recipeScale, setRecipeScale] = useState(scale);

  const [graphDirection, setGraphDirection] = useState<'TB' | 'LR' | 'BT' | 'RL'>('TB');
  const [recipeGraphDiagram, setRecipeGraphDiagram] = useState(renderMermaidDiagramForRecipe(recipe, graphDirection));

  useEffect(() => {
    setRecipeGraphDiagram(renderMermaidDiagramForRecipe(recipe, graphDirection));
  }, [recipe, graphDirection]);

  const recipeSteps = (recipe.steps || []).map(
    renderRecipeStep(recipe, recipeScale, recipeGraph, stepsNeedingCompletion, (stepIndex: number) => {
      setStepsNeedingCompletion(
        stepsNeedingCompletion.map((x: boolean, i: number) => {
          return i === stepIndex ? !x : x;
        }),
      );
    }),
  );

  return (
    <Box>
      <Grid grow justify="space-between" mx="xs">
        <Grid.Col span="content">
          <Title order={3} mr={'-xs'}>
            {recipe.name}
          </Title>
        </Grid.Col>
        <Grid.Col span="auto">
          {recipe.source && (
            <Link style={{ float: 'right' }} href={recipe.source}>
              source
            </Link>
          )}
        </Grid.Col>
      </Grid>
      <Grid grow gutter="md" mb="xl">
        <Card shadow="sm" p="sm" radius="md" withBorder sx={{ width: '100%', margin: '1rem' }}>
          <Card.Section px="xs" sx={{ cursor: 'pointer' }}>
            <Grid justify="space-between" align="center">
              <Grid.Col span="content">
                <Title order={5} sx={{ display: 'inline-block' }} mt="xs">
                  Flow Chart
                </Title>
                <ActionIcon
                  sx={{ float: 'right' }}
                  pt="sm"
                  variant="transparent"
                  aria-label="rotate recipe flow chart orientation"
                  onClick={() => setGraphDirection(graphDirection === 'TB' ? 'LR' : 'TB')}
                >
                  <IconRotate size={15} color="green" />
                </ActionIcon>
              </Grid.Col>
              <Grid.Col span="auto" onClick={() => setFlowChartVisibility((x: boolean) => !x)}>
                <ActionIcon sx={{ float: 'right' }} aria-label="toggle recipe flow chart">
                  {flowChartVisible && <IconCaretUp />}
                  {!flowChartVisible && <IconCaretDown />}
                </ActionIcon>
              </Grid.Col>
            </Grid>
          </Card.Section>

          {flowChartVisible && <Mermaid chartDefinition={recipeGraphDiagram} />}
        </Card>

        <Card shadow="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
          <Card.Section px="xs" sx={{ cursor: 'pointer' }}>
            <Grid justify="space-between" align="center">
              <Grid.Col span="content">
                <Title order={5} style={{ display: 'inline-block' }} mt="xs">
                  All Ingredients
                </Title>
              </Grid.Col>
              <Grid.Col span="auto" onClick={() => setIngredientListVisibility((x: boolean) => !x)}>
                <ActionIcon sx={{ float: 'right' }} aria-label="toggle recipe flow chart">
                  {allIngredientListVisible && <IconCaretUp />}
                  {!allIngredientListVisible && <IconCaretDown />}
                </ActionIcon>
              </Grid.Col>
            </Grid>
          </Card.Section>

          <Collapse in={allIngredientListVisible}>
            <List icon={<></>} spacing={-15}>
              <RecipeIngredientListComponent recipes={[recipe]} scale={recipeScale} />
            </List>
          </Collapse>
        </Card>

        <Card shadow="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
          <Card.Section px="xs" sx={{ cursor: 'pointer' }}>
            <Grid justify="space-between" align="center">
              <Grid.Col span="content">
                <Title order={5} style={{ display: 'inline-block' }} mt="xs">
                  All Instruments
                </Title>
              </Grid.Col>
              <Grid.Col span="auto" onClick={() => setInstrumentListVisibility((x: boolean) => !x)}>
                <ActionIcon sx={{ float: 'right' }} aria-label="toggle recipe flow chart">
                  {allInstrumentListVisible && <IconCaretUp />}
                  {!allInstrumentListVisible && <IconCaretDown />}
                </ActionIcon>
              </Grid.Col>
            </Grid>
          </Card.Section>

          <Collapse in={allInstrumentListVisible}>
            <List icon={<></>} spacing={-15}>
              <RecipeInstrumentListComponent recipes={[recipe]} />
            </List>
          </Collapse>
        </Card>

        <Card shadow="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
          <Card.Section px="xs" sx={{ cursor: 'pointer' }}>
            <Grid justify="space-between" align="center">
              <Grid.Col span="content">
                <Title order={5} style={{ display: 'inline-block' }} mt="xs">
                  Scale
                </Title>
              </Grid.Col>
            </Grid>

            <NumberInput
              mt="sm"
              mb="lg"
              value={recipeScale}
              precision={2}
              step={0.25}
              removeTrailingZeros={true}
              description={`this recipe normally yields about ${recipe.minimumEstimatedPortions} ${
                recipe.minimumEstimatedPortions === 1 ? recipe.portionName : recipe.pluralPortionName
              }${
                recipeScale === 1.0
                  ? ''
                  : `, but is now set up to yield ${recipe.minimumEstimatedPortions * recipeScale}  ${
                      recipe.minimumEstimatedPortions === 1 ? recipe.portionName : recipe.pluralPortionName
                    }`
              }`}
              onChange={(value: number | undefined) => {
                if (!value) return;

                setRecipeScale(value);
              }}
            />
          </Card.Section>
        </Card>

        {recipeSteps}
      </Grid>
    </Box>
  );
};
