import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Badge, Card, List, Title, Text, Grid, ActionIcon, Collapse, Checkbox, Group } from '@mantine/core';
import { ReactNode, useState } from 'react';
import { IconCaretDown, IconCaretUp, IconRotate } from '@tabler/icons';
import dagre, { Node as DAGNode } from 'dagre';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge, Position } from 'reactflow';
// 👇 you need to import the reactflow styles
import 'reactflow/dist/style.css';

import { Recipe, RecipeStep, RecipeStepIngredient, RecipeStepInstrument, RecipeStepProduct } from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
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

const stepElementIsProduct = (x: RecipeStepInstrument | RecipeStepIngredient): boolean => {
  return Boolean(x.recipeStepProductID) && x.recipeStepProductID !== '';
};

function findValidIngredientsForRecipeStep(recipeStep: RecipeStep): RecipeStepIngredient[] {
  const validIngredients = (recipeStep.ingredients || []).filter((ingredient) => ingredient.ingredient !== null);
  const productIngredients = (recipeStep.ingredients || []).filter(stepElementIsProduct);

  return validIngredients.concat(productIngredients);
}

const formatStepIngredientList = (
  recipe: Recipe,
  recipeStep: RecipeStep,
  stepIndex: number,
  recipeGraph: dagre.graphlib.Graph<string>,
  stepsNeedingCompletion: boolean[],
): ReactNode => {
  return findValidIngredientsForRecipeStep(recipeStep).map(
    formatIngredientForStep(recipe, stepIndex, recipeGraph, stepsNeedingCompletion),
  );
};

const filterInstrumentsInStepLists = (x: RecipeStepInstrument): boolean => {
  return Boolean(x.instrument?.displayInSummaryLists);
};

function findValidInstrumentsForRecipeStep(recipeStep: RecipeStep): RecipeStepInstrument[] {
  const validInstruments = (recipeStep.instruments || [])
    .filter((instrument) => instrument.instrument !== null)
    .filter(filterInstrumentsInStepLists);
  const productInstruments = (recipeStep.instruments || []).filter(stepElementIsProduct);

  return validInstruments.concat(productInstruments);
}

const formatStepInstrumentList = (recipe: Recipe, recipeStep: RecipeStep): ReactNode => {
  return findValidInstrumentsForRecipeStep(recipeStep).map(formatInstrumentForStep(recipe));
};

const formatAllIngredientList = (recipe: Recipe): ReactNode => {
  const validIngredients = (recipe.steps || [])
    .map((recipeStep: RecipeStep) => {
      return (recipeStep.ingredients || []).filter((ingredient) => ingredient.ingredient !== null);
    })
    .flat();

  return validIngredients.map(formatIngredientForTotalList(recipe));
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

const getRecipeStepIndexByID = (recipe: Recipe, id: string): number => {
  let retVal = -1;

  (recipe.steps || []).forEach((step: RecipeStep, stepIndex: number) => {
    if (step.products.findIndex((product: RecipeStepProduct) => product.id === id) !== -1) {
      retVal = stepIndex + 1;
    }
  });

  return retVal;
};

const formatIngredientForStep = (
  recipe: Recipe,
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
      ingredient.maximumQuantity > 0 &&
      ingredient.minimumQuantity != ingredient.maximumQuantity;

    const lineText = (
      <>
        {`${shouldDisplayMinQuantity ? ingredient.minimumQuantity : ''}${
          shouldDisplayMaxQuantity ? `- ${ingredient.maximumQuantity}` : ''
        } ${
          shouldDisplayMinQuantity
            ? ingredient.minimumQuantity === 1
              ? ingredient.measurementUnit.name
              : ingredient.measurementUnit.pluralName
            : ''
        }
    `}
        {stepElementIsProduct(ingredient) ? <em>{ingredient.name}</em> : <>{ingredient.name}</>}
        {`${
          stepElementIsProduct(ingredient)
            ? ` from step #${getRecipeStepIndexByID(recipe, ingredient.recipeStepProductID!)}`
            : ''
        }
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

const formatIngredientForTotalList = (recipe: Recipe): ((_: RecipeStepIngredient) => ReactNode) => {
  // eslint-disable-next-line react/display-name
  return (ingredient: RecipeStepIngredient): ReactNode => {
    return (
      <List.Item key={ingredient.id}>
        <Checkbox
          label={`${ingredient.name} (${ingredient.minimumQuantity}${
            ingredient.maximumQuantity > 0 ? `- ${ingredient.maximumQuantity}` : ''
          }  ${
            ingredient.minimumQuantity === 1 ? ingredient.measurementUnit.name : ingredient.measurementUnit.pluralName
          })`}
        />
      </List.Item>
    );
  };
};

const formatInstrumentForStep = (recipe: Recipe): ((_: RecipeStepInstrument) => ReactNode) => {
  // eslint-disable-next-line react/display-name
  return (instrument: RecipeStepInstrument): ReactNode => {
    const shouldDisplayMinQuantity = !stepElementIsProduct(instrument) && instrument.minimumQuantity > 1;
    const shouldDisplayMaxQuantity =
      shouldDisplayMinQuantity &&
      instrument.maximumQuantity > 0 &&
      instrument.minimumQuantity != instrument.maximumQuantity;

    return (
      <List.Item key={instrument.id}>
        <Checkbox
          label={
            <>
              {`${shouldDisplayMinQuantity ? `(${instrument.minimumQuantity})` : ''}${
                shouldDisplayMaxQuantity ? `- ${instrument.maximumQuantity}` : ''
              } ${instrument.instrument?.name || instrument.name}${
                stepElementIsProduct(instrument)
                  ? ` from step #${getRecipeStepIndexByID(recipe, instrument.recipeStepProductID!)}`
                  : ''
              }`}
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
            instrument.maximumQuantity > 0 && instrument.maximumQuantity != instrument.minimumQuantity
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
  direction: 'TB' | 'LR' = 'LR',
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

  recipe.steps.forEach((step: RecipeStep) => {
    const stepIndex = (step.index + 1).toString();
    nodes.push({
      id: stepIndex,
      position: { x: 0, y: addedNodeCount * 50 },
      data: { label: `(step #${stepIndex})` },
    });
    dagreGraph.setNode(stepIndex, { width: nodeWidth, height: nodeHeight });
    addedNodeCount += 1;
  });

  recipe.steps.forEach((step: RecipeStep) => {
    const stepIndex = (step.index + 1).toString();
    step.ingredients.forEach((ingredient: RecipeStepIngredient) => {
      if (stepElementIsProduct(ingredient)) {
        initialEdges.push({
          id: `e${ingredient.recipeStepProductID!}-${stepIndex}`,
          source: buildNodeIDForRecipeStepProduct(recipe, ingredient.recipeStepProductID!),
          target: stepIndex,
        });
        dagreGraph.setEdge(buildNodeIDForRecipeStepProduct(recipe, ingredient.recipeStepProductID!), stepIndex);
      }
    });

    step.instruments.forEach((instrument: RecipeStepInstrument) => {
      if (stepElementIsProduct(instrument)) {
        initialEdges.push({
          id: `e${instrument.recipeStepProductID!}-${stepIndex}`,
          source: buildNodeIDForRecipeStepProduct(recipe, instrument.recipeStepProductID!),
          target: stepIndex,
        });
        dagreGraph.setEdge(buildNodeIDForRecipeStepProduct(recipe, instrument.recipeStepProductID!), stepIndex);
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

const formatProductList = (recipeStep: RecipeStep): ReactNode => {
  return (recipeStep.products || []).map((product: RecipeStepProduct) => {
    return (
      <List.Item key={product.id}>
        <Text size="sm" italic>
          {product.name}
        </Text>
      </List.Item>
    );
  });
};

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
  const [flowChartDirection, setFlowChartDirection] = useState<'TB' | 'LR'>('LR');
  let [recipeNodes, recipeEdges, recipeGraph] = makeGraphForRecipe(recipe, flowChartDirection);

  const [stepsNeedingCompletion, setStepsNeedingCompletion] = useState(
    Array(recipe.steps.length).fill(true) as boolean[],
  );
  const [flowChartVisible, setFlowChartVisibility] = useState(false);
  const [allIngredientListVisible, setIngredientListVisibility] = useState(false);
  const [allInstrumentListVisible, setInstrumentListVisibility] = useState(false);

  const recipeSteps = (recipe.steps || []).map((recipeStep: RecipeStep, stepIndex: number) => {
    const checkboxDisabled = recipeStepCanBePerformed(stepIndex, recipeGraph, stepsNeedingCompletion);

    return (
      <Card key={recipeStep.id} shadow="sm" p="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
        <Card.Section px="sm">
          <Grid justify="space-between">
            <Grid.Col span="content">
              <Text weight="bold" strikethrough={!stepsNeedingCompletion[stepIndex]}>
                {recipeStep.preparation.name}:
              </Text>
            </Grid.Col>
            <Grid.Col span="auto" />
            <Grid.Col span="content">
              <Group style={{ float: 'right' }}>
                <Badge mb="sm">Step #{recipeStep.index + 1}</Badge>
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

        <Collapse in={stepsNeedingCompletion[stepIndex]}>
          <Card.Section px="sm">
            <List icon={<></>} mt={-20} spacing={-15}>
              {formatStepIngredientList(recipe, recipeStep, stepIndex, recipeGraph, stepsNeedingCompletion)}
            </List>
          </Card.Section>

          <Card.Section px="sm" pt="sm">
            <Title order={6}>to make:</Title>
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
      <Grid grow gutter="md">
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

        {recipeSteps}
      </Grid>
    </AppLayout>
  );
}

export default RecipePage;
