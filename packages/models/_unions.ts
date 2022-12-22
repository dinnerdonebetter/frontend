export const ALL_VALID_INGREDIENT_STATE_ATTRIBUTE_TYPES: string[] = [
  'texture',
  'consistency',
  'color',
  'appearance',
  'odor',
  'taste',
  'sound',
  'other',
];

type ValidIngredientStateAttributeTypeTuple = typeof ALL_VALID_INGREDIENT_STATE_ATTRIBUTE_TYPES;
export type ValidIngredientStateAttributeType = ValidIngredientStateAttributeTypeTuple[number];

export type ValidMealPlanStatus = 'awaiting_votes' | 'finalized';
export type ValidMealPlanElectionMethod = 'schulze' | 'instant-runoff';

export type ValidRecipeStepProductType = 'instrument' | 'ingredient';

export const ALL_MEAL_COMPONENT_TYPES = [
  'main',
  'side',
  'appetizer',
  'beverage',
  'dessert',
  'soup',
  'salad',
  'amuse-bouche',
  'unspecified',
];

type MealComponentTypeTuple = typeof ALL_MEAL_COMPONENT_TYPES;
export type MealComponentType = MealComponentTypeTuple[number];
