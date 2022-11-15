import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Badge, Card, List, Title, Text, Grid, Divider } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { ReactNode } from 'react';

import dagre from 'dagre';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Position,
} from 'reactflow';
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

  console.dir(recipe);
  recipe.steps.forEach((step) => {
    step.instruments.forEach((instrument) => {
      console.dir(instrument.instrument?.displayInSummaryLists);
    });
  });

  span.end();
  return { props: { recipe } };
};

const stepElementIsProduct = (x: RecipeStepInstrument | RecipeStepIngredient): boolean => {
  return Boolean(x.productOfRecipeStep) && Boolean(x.recipeStepProductID) && x.recipeStepProductID !== '';
};

const findStepIndexForRecipeStepProductID = (recipe: Recipe, recipeStepProductID: string): string => {
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
  const productIngredients = (recipeStep.ingredients || []).filter(stepElementIsProduct);

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
    return (recipeStep.instruments || [])
    .forEach((instrument: RecipeStepInstrument) => {
      if (instrument.instrument !== null && instrument.instrument!.displayInSummaryLists) {
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
          {stepElementIsProduct(ingredient) && showProductBadge && (
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

function makeWorkingInitialNodes(): [Node[], Edge[]] {
  const initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
    { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
  ];

  const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

  return [initialNodes, initialEdges];
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

// from https://reactflow.dev/docs/examples/layout/dagre/
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

function makeGraphForRecipe(recipe: Recipe): [Node[], Edge[]] {
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  let addedNodeCount = 0;

  recipe.steps.forEach((step: RecipeStep) => {
    const stepIndex = (step.index + 1).toString();
    initialNodes.push({
      id: stepIndex,
      position: { x: 0, y: addedNodeCount * 50 },
      data: { label: step.products.map((x: RecipeStepProduct) => x.name).join('') },
      // data: { label: `${step.preparation.name} ${step.ingredients.map((x: RecipeStepIngredient) => x.name).join(', ')}` },
    });
    addedNodeCount += 1;
  });

  recipe.steps.forEach((step: RecipeStep) => {
    const stepIndex = (step.index + 1).toString();
    step.ingredients.forEach((ingredient: RecipeStepIngredient) => {
      if (stepElementIsProduct(ingredient)) {
        initialEdges.push({
          id: `e${ingredient.recipeStepProductID!}-${stepIndex}`,
          source: findStepIndexForRecipeStepProductID(recipe, ingredient.recipeStepProductID!),
          target: stepIndex,
        });
      }
    });

    step.instruments.forEach((instrument: RecipeStepInstrument) => {
      if (stepElementIsProduct(instrument)) {
        initialEdges.push({
          id: `e${instrument.recipeStepProductID!}-${stepIndex}`,
          source: findStepIndexForRecipeStepProductID(recipe, instrument.recipeStepProductID!),
          target: stepIndex,
        });
      }
    });
  });

  return [initialNodes, initialEdges];
}

function RecipePage({ recipe }: RecipePageProps) {
  let [initialNodes, initialEdges] = makeGraphForRecipe(recipe);
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

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
          <div style={{ height: 500 }}>
            <ReactFlow
              nodes={layoutedNodes}
              edges={layoutedEdges}
              fitView
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </Card>

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
