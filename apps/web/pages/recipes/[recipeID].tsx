import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import {
  Badge,
  Card,
  List,
  Title,
  Text,
  Grid,
  ActionIcon,
  Collapse,
  Checkbox,
  Group,
  Divider,
  NumberInput,
} from '@mantine/core';
import { ReactNode, useState } from 'react';
import { IconCaretDown, IconCaretUp, IconRotate } from '@tabler/icons';
import dagre from 'dagre';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge, Position } from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Recipe,
  RecipeStep,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeStepProduct,
  RecipeStepVessel,
} from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';
import { buildRecipeStepText, cleanFloat, getRecipeStepIndexByID, stepElementIsProduct } from '@prixfixeco/pfutils';

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

const findValidIngredientsForRecipeStep = (recipeStep: RecipeStep): RecipeStepIngredient[] => {
  const validIngredients = (recipeStep.ingredients || []).filter((ingredient) => ingredient.ingredient !== null);
  const productIngredients = (recipeStep.ingredients || []).filter(stepElementIsProduct);

  return validIngredients.concat(productIngredients);
};

const formatStepIngredientList = (
  recipe: Recipe,
  recipeScale: number,
  recipeStep: RecipeStep,
  stepIndex: number,
  recipeGraph: dagre.graphlib.Graph<string>,
  stepsNeedingCompletion: boolean[],
): ReactNode => {
  return findValidIngredientsForRecipeStep(recipeStep).map(
    formatIngredientForStep(recipe, recipeScale, stepIndex, recipeGraph, stepsNeedingCompletion),
  );
};

const formatProductList = (recipeStep: RecipeStep): ReactNode => {
  return (recipeStep.products || []).map((product: RecipeStepProduct) => {
    return (
      <List.Item key={product.id}>
        <Badge size="xs" variant="outline">
          {product.type}
        </Badge>
        <Text size="sm" italic ml={5}>
          {product.name}
        </Text>
      </List.Item>
    );
  });
};

const formatInstrumentList = (
  recipe: Recipe,
  recipeStep: RecipeStep,
  stepIndex: number,
  recipeGraph: dagre.graphlib.Graph<string>,
  stepsNeedingCompletion: boolean[],
): ReactNode => {
  return (recipeStep.instruments || []).map((instrument: RecipeStepInstrument) => {
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
                &nbsp;{` from step #${getRecipeStepIndexByID(recipe, instrument.recipeStepProductID!)}`}
              </Text>
            </>
          )) || <Checkbox size="sm" label={instrument.name} disabled={checkboxDisabled} />}
        </List.Item>
      )
    );
  });
};

const formatVesselList = (
  recipe: Recipe,
  recipeStep: RecipeStep,
  stepIndex: number,
  recipeGraph: dagre.graphlib.Graph<string>,
  stepsNeedingCompletion: boolean[],
): ReactNode => {
  return (recipeStep.vessels || []).map((vessel: RecipeStepVessel) => {
    const elementIsProduct = stepElementIsProduct(vessel);
    const checkboxDisabled = recipeStepCanBePerformed(stepIndex, recipeGraph, stepsNeedingCompletion);

    return (
      ((vessel.instrument && vessel.instrument?.displayInSummaryLists) || vessel.recipeStepProductID) && (
        <List.Item key={vessel.id}>
          {(elementIsProduct && (
            <>
              <Text size="sm" italic>
                {vessel.name}
              </Text>{' '}
              <Text size="sm">
                &nbsp;{` from step #${getRecipeStepIndexByID(recipe, vessel.recipeStepProductID!)}`}
              </Text>
            </>
          )) || <Checkbox size="sm" label={vessel.name} disabled={checkboxDisabled} />}
        </List.Item>
      )
    );
  });
};

const formatAllIngredientList = (recipe: Recipe): ReactNode => {
  const validIngredients = (recipe.steps || [])
    .map((recipeStep: RecipeStep) => {
      return (recipeStep.ingredients || []).filter((ingredient) => ingredient.ingredient !== null);
    })
    .flat();

  return validIngredients.map(formatIngredientForTotalList());
};

const formatAllInstrumentList = (recipe: Recipe): ReactNode => {
  const uniqueValidInstruments: Record<string, RecipeStepInstrument> = {};

  (recipe.steps || []).forEach((recipeStep: RecipeStep) => {
    return (recipeStep.instruments || []).forEach((instrument: RecipeStepInstrument) => {
      if (instrument.instrument !== null && instrument.instrument!.displayInSummaryLists) {
        uniqueValidInstruments[instrument.instrument!.id] = instrument;
      }
    });
  });

  return Object.values(uniqueValidInstruments).map(formatInstrumentForTotalList());
};

const formatIngredientForStep = (
  recipe: Recipe,
  recipeScale: number,
  stepIndex: number,
  recipeGraph: dagre.graphlib.Graph<string>,
  stepsNeedingCompletion: boolean[],
): ((_: RecipeStepIngredient) => ReactNode) => {
  // eslint-disable-next-line react/display-name
  return (ingredient: RecipeStepIngredient): ReactNode => {
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
          shouldDisplayMaxQuantity ? `- ${cleanFloat((ingredient.maximumQuantity ?? 0) * recipeScale)}` : ''
        } ${measurementName}
    `}
        {elementIsProduct ? <em>{ingredientName}</em> : <>{ingredientName}</>}
        {`${elementIsProduct ? ` from step #${getRecipeStepIndexByID(recipe, ingredient.recipeStepProductID!)}` : ''}
    `}
      </>
    );

    return (
      <List.Item key={ingredient.id}>
        <Checkbox label={lineText} disabled={checkboxDisabled} />
      </List.Item>
    );
  };
};

const formatIngredientForTotalList = (): ((_: RecipeStepIngredient) => ReactNode) => {
  // eslint-disable-next-line react/display-name
  return (ingredient: RecipeStepIngredient): ReactNode => {
    let measurmentUnitName =
      ingredient.minimumQuantity === 1 ? ingredient.measurementUnit.name : ingredient.measurementUnit.pluralName;

    return (
      <List.Item key={ingredient.id}>
        <Checkbox
          label={
            <>
              <u>
                {` ${ingredient.minimumQuantity}${
                  (ingredient.maximumQuantity ?? -1) > 0 ? `- ${ingredient.maximumQuantity}` : ''
                } ${['unit', 'units'].includes(measurmentUnitName) ? '' : measurmentUnitName}`}
              </u>{' '}
              {ingredient.name}
            </>
          }
        />
      </List.Item>
    );
  };
};

const formatInstrumentForTotalList = (): ((_: RecipeStepInstrument) => ReactNode) => {
  // eslint-disable-next-line react/display-name
  return (instrument: RecipeStepInstrument): ReactNode => {
    return (
      <List.Item key={instrument.id}>
        <Checkbox
          size="sm"
          label={`${instrument.minimumQuantity}${
            (instrument.maximumQuantity ?? 0) > 0 && instrument.maximumQuantity != instrument.minimumQuantity
              ? `- ${instrument.maximumQuantity}`
              : ''
          } ${instrument.instrument?.name}`}
        />
      </List.Item>
    );
  };
};

const buildNodeIDForRecipeStepProduct = (recipe: Recipe, recipeStepProductID: string): string => {
  let found = 'UNKNOWN';
  (recipe.steps || []).forEach((step: RecipeStep, stepIndex: number) => {
    (step.products || []).forEach((product: RecipeStepProduct) => {
      if (product.id === recipeStepProductID) {
        found = (stepIndex + 1).toString();
      }
    });
  });

  return found;
};

function makeGraphForRecipe(
  recipe: Recipe,
  direction: 'TB' | 'LR' = 'TB',
): [Node[], Edge[], dagre.graphlib.Graph<string>] {
  const nodes: Node[] = [];
  const initialEdges: Edge[] = [];

  const nodeWidth = 200;
  const nodeHeight = 50;
  const isHorizontal = direction === 'LR';

  const dagreGraph: dagre.graphlib.Graph<string> = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction });

  let addedNodeCount = 0;

  (recipe.steps || []).forEach((step: RecipeStep) => {
    const stepIndex = (step.index + 1).toString();
    nodes.push({
      id: stepIndex,
      position: { x: 0, y: addedNodeCount * 50 },
      data: { label: `(step #${stepIndex})` },
    });
    dagreGraph.setNode(stepIndex, { width: nodeWidth, height: nodeHeight });
    addedNodeCount += 1;
  });

  (recipe.steps || []).forEach((step: RecipeStep) => {
    const stepIndex = (step.index + 1).toString();
    (step.ingredients || []).forEach((ingredient: RecipeStepIngredient) => {
      if (stepElementIsProduct(ingredient)) {
        initialEdges.push({
          id: `e${ingredient.recipeStepProductID!}-${stepIndex}`,
          source: buildNodeIDForRecipeStepProduct(recipe, ingredient.recipeStepProductID!),
          target: stepIndex,
        });
        dagreGraph.setEdge(buildNodeIDForRecipeStepProduct(recipe, ingredient.recipeStepProductID!), stepIndex);
      }
    });

    (step.instruments || []).forEach((instrument: RecipeStepInstrument) => {
      if (stepElementIsProduct(instrument)) {
        initialEdges.push({
          id: `e${instrument.recipeStepProductID!}-${stepIndex}`,
          source: buildNodeIDForRecipeStepProduct(recipe, instrument.recipeStepProductID!),
          target: stepIndex,
        });
        dagreGraph.setEdge(buildNodeIDForRecipeStepProduct(recipe, instrument.recipeStepProductID!), stepIndex);
      }
    });

    (step.vessels || []).forEach((vessel: RecipeStepVessel) => {
      if (stepElementIsProduct(vessel)) {
        initialEdges.push({
          id: `e${vessel.recipeStepProductID!}-${stepIndex}`,
          source: buildNodeIDForRecipeStepProduct(recipe, vessel.recipeStepProductID!),
          target: stepIndex,
        });
        dagreGraph.setEdge(buildNodeIDForRecipeStepProduct(recipe, vessel.recipeStepProductID!), stepIndex);
      }
    });
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the
    // top left, so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return [nodes, initialEdges, dagreGraph];
}

function gatherAllPredecessorsForStep(recipeGraph: dagre.graphlib.Graph<string>, stepIndex: number): string[] {
  let p: string[] = recipeGraph.predecessors((stepIndex + 1).toString()) || [];

  p.forEach((predecessor: string) => {
    p = p.concat(gatherAllPredecessorsForStep(recipeGraph, parseInt(predecessor, 10) - 1));
  });

  return p;
}

const recipeStepCanBePerformed = (
  stepIndex: number,
  recipeGraph: dagre.graphlib.Graph<string>,
  stepsNeedingCompletion: boolean[],
): boolean => {
  const performedPredecessors: boolean[] = (gatherAllPredecessorsForStep(recipeGraph, stepIndex) || []).map(
    (node: string) => {
      return stepsNeedingCompletion[parseInt(node, 10) - 1];
    },
  );

  return performedPredecessors.length === 0 ? false : !performedPredecessors.every((element) => element === false);
};

function RecipePage({ recipe }: RecipePageProps) {
  const [flowChartDirection, setFlowChartDirection] = useState<'TB' | 'LR'>('TB');
  let [recipeNodes, recipeEdges, recipeGraph] = makeGraphForRecipe(recipe, flowChartDirection);

  const [stepsNeedingCompletion, setStepsNeedingCompletion] = useState(
    Array(recipe.steps.length).fill(true) as boolean[],
  );
  const [flowChartVisible, setFlowChartVisibility] = useState(false);
  const [allIngredientListVisible, setIngredientListVisibility] = useState(false);
  const [allInstrumentListVisible, setInstrumentListVisibility] = useState(false);

  const [recipeScale, setRecipeScale] = useState(1.0);

  const recipeSteps = (recipe.steps || []).map((recipeStep: RecipeStep, stepIndex: number) => {
    const checkboxDisabled = recipeStepCanBePerformed(stepIndex, recipeGraph, stepsNeedingCompletion);

    return (
      <Card key={recipeStep.id} shadow="sm" p="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
        <Card.Section px="sm">
          <Grid justify="space-between">
            <Grid.Col span="content">
              <Badge mb="sm">Step #{recipeStep.index + 1}</Badge>
            </Grid.Col>
            <Grid.Col span="auto" />
            <Grid.Col span="content">
              <Group style={{ float: 'right' }}>
                <Checkbox
                  checked={!stepsNeedingCompletion[stepIndex]}
                  onChange={() => {}}
                  onClick={() =>
                    setStepsNeedingCompletion(
                      stepsNeedingCompletion.map((x: boolean, i: number) => {
                        return i === stepIndex ? !x : x;
                      }),
                    )
                  }
                  disabled={checkboxDisabled}
                />
              </Group>
            </Grid.Col>
          </Grid>
        </Card.Section>

        <Text strikethrough={!stepsNeedingCompletion[stepIndex]}>
          {buildRecipeStepText(recipe, recipeStep, recipeScale)}
        </Text>

        <Text strikethrough={!stepsNeedingCompletion[stepIndex]} mt="md">
          {recipeStep.notes}
        </Text>

        <Collapse in={stepsNeedingCompletion[stepIndex]}>
          <Divider m="lg" />

          {(recipeStep.instruments || []).filter(
            (instrument: RecipeStepInstrument) =>
              (instrument.instrument && instrument.instrument?.displayInSummaryLists) || instrument.recipeStepProductID,
          ).length > 0 && (
            <Card.Section px="sm">
              <Title order={6}>Tools:</Title>
              <List icon={<></>} mt={-10}>
                {formatInstrumentList(recipe, recipeStep, stepIndex, recipeGraph, stepsNeedingCompletion)}
              </List>
            </Card.Section>
          )}

          {(recipeStep.vessels || []).filter(
            (vessel: RecipeStepVessel) =>
              (vessel.instrument && vessel.instrument?.displayInSummaryLists) || vessel.recipeStepProductID,
          ).length > 0 && (
            <Card.Section px="sm">
              <Title order={6}>Vessels:</Title>
              <List icon={<></>} mt={-10}>
                {formatVesselList(recipe, recipeStep, stepIndex, recipeGraph, stepsNeedingCompletion)}
              </List>
            </Card.Section>
          )}

          {(recipeStep.ingredients || []).length > 0 && (
            <Card.Section px="sm" pt="sm">
              <Title order={6}>Ingredients:</Title>
              <List icon={<></>} mt={-10}>
                {formatStepIngredientList(
                  recipe,
                  recipeScale,
                  recipeStep,
                  stepIndex,
                  recipeGraph,
                  stepsNeedingCompletion,
                )}
              </List>
            </Card.Section>
          )}

          <Card.Section px="sm" pt="sm">
            <Title order={6}>Products:</Title>
            <List icon={<></>} mt={-10}>
              {formatProductList(recipeStep)}
            </List>
          </Card.Section>
        </Collapse>
      </Card>
    );
  });

  return (
    <AppLayout title={recipe.name}>
      <Title order={3}>{recipe.name}</Title>
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
                  disabled={!flowChartVisible}
                  onClick={() => setFlowChartDirection(flowChartDirection === 'TB' ? 'LR' : 'TB')}
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

          <Collapse in={flowChartVisible}>
            <Card.Section>
              <div style={{ height: 500 }}>
                <ReactFlow nodes={recipeNodes} edges={recipeEdges} fitView>
                  <MiniMap />
                  <Controls />
                  <Background />
                </ReactFlow>
              </div>
            </Card.Section>
          </Collapse>
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
              {formatAllIngredientList(recipe)}
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
              {formatAllInstrumentList(recipe)}
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
              step={0.1}
              description={`this recipe normally yields about ${recipe.yieldsPortions} ${
                recipe.yieldsPortions === 1 ? recipe.portionName : recipe.pluralPortionName
              }${
                recipeScale === 1.0
                  ? ''
                  : `, but is now set up to yield ${recipe.yieldsPortions * recipeScale}  ${
                      recipe.yieldsPortions === 1 ? recipe.portionName : recipe.pluralPortionName
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
    </AppLayout>
  );
}

export default RecipePage;
