import { List, Checkbox } from '@mantine/core';
import { ReactNode } from 'react';

import { Recipe, RecipeStepIngredient, RecipeStep } from '@prixfixeco/models';
import {
  stepElementIsProduct,
  cleanFloat,
  getRecipeStepIndexByProductID,
  recipeStepCanBePerformed,
} from '@prixfixeco/utils';

const formatIngredientForStep = (
  recipe: Recipe,
  recipeScale: number,
  stepIndex: number,
  recipeGraph: dagre.graphlib.Graph<string>,
  stepsNeedingCompletion: boolean[],
  onClick: (_ingredient: RecipeStepIngredient) => () => void = (_: RecipeStepIngredient) => () => {},
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
        <Checkbox onClick={onClick(ingredient)} label={lineText} disabled={checkboxDisabled} mt="-sm" />
      </List.Item>
    );
  };
};

declare interface RecipeComponentProps {
  recipe: Recipe;
  recipeScale: number;
  recipeStep: RecipeStep;
  stepIndex: number;
  recipeGraph: dagre.graphlib.Graph<string>;
  stepsNeedingCompletion: boolean[];
  onClick?: (_ingredient: RecipeStepIngredient) => () => void;
}

export const RecipeIngredientListComponent = ({
  recipe,
  recipeScale,
  recipeStep,
  stepIndex,
  recipeGraph,
  stepsNeedingCompletion,
  onClick = (_: RecipeStepIngredient) => () => {},
}: RecipeComponentProps): JSX.Element => {
  const validIngredients = (recipeStep.ingredients || []).filter((ingredient) => ingredient.ingredient !== null);
  const productIngredients = (recipeStep.ingredients || []).filter(stepElementIsProduct);

  return (
    <List icon={<></>} mt={-10}>
      {validIngredients
        .concat(productIngredients)
        .map(formatIngredientForStep(recipe, recipeScale, stepIndex, recipeGraph, stepsNeedingCompletion, onClick))}
    </List>
  );
};
