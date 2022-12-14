import { useRecipeCreationReducer, RecipeCreationPageState } from './RecipeCreator';

test('should be able to change the name', () => {
  const state = new RecipeCreationPageState();
  expect(state.recipe.name).toEqual('');

  const newValue = 'test';
  const newState = useRecipeCreationReducer(state, { type: 'UPDATE_NAME', newName: newValue });

  expect(newState.recipe.name).toEqual(newValue);
});

test('should be able to change the description', () => {
  const state = new RecipeCreationPageState();
  expect(state.recipe.description).toEqual('');

  const newValue = 'test';
  const newState = useRecipeCreationReducer(state, { type: 'UPDATE_DESCRIPTION', newDescription: newValue });

  expect(newState.recipe.description).toEqual(newValue);
});

test('should be able to update the recipe source', () => {
  const state = new RecipeCreationPageState();
  expect(state.recipe.source).toEqual('');

  const newValue = 'test';
  const newState = useRecipeCreationReducer(state, { type: 'UPDATE_SOURCE', newSource: newValue });

  expect(newState.recipe.source).toEqual(newValue);
});

test('should be able to update the yielded portions', () => {
  const state = new RecipeCreationPageState();
  expect(state.recipe.yieldsPortions).toEqual(1);

  const newValue = 123;
  const newState = useRecipeCreationReducer(state, { type: 'UPDATE_YIELDS_PORTIONS', newPortions: newValue });

  expect(newState.recipe.yieldsPortions).toEqual(newValue);
});

test('should be able to toggle show all ingredients', () => {
  const state = new RecipeCreationPageState();
  expect(state.showIngredientsSummary).toEqual(false);

  const newState = useRecipeCreationReducer(state, { type: 'TOGGLE_SHOW_ALL_INGREDIENTS' });

  expect(newState.showIngredientsSummary).toEqual(true);
});

test('should be able to toggle show all instruments', () => {
  const state = new RecipeCreationPageState();
  expect(state.showInstrumentsSummary).toEqual(false);

  const newState = useRecipeCreationReducer(state, { type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' });

  expect(newState.showInstrumentsSummary).toEqual(true);
});

test('should be able to toggle showing advanced prep steps', () => {
  const state = new RecipeCreationPageState();
  expect(state.showAdvancedPrepStepInputs).toEqual(false);

  const newState = useRecipeCreationReducer(state, { type: 'TOGGLE_SHOW_ADVANCED_PREP_STEPS' });

  expect(newState.showAdvancedPrepStepInputs).toEqual(true);
});

test('should be able to add a step', () => {
  const state = new RecipeCreationPageState();
  expect(state.recipe.steps.length).toEqual(1);
  const firstStep = state.recipe.steps[0];
  expect(firstStep.media.length).toEqual(0);
  expect(firstStep.ingredients.length).toEqual(0);
  expect(firstStep.instruments.length).toEqual(0);
  expect(firstStep.completionConditions.length).toEqual(0);
  expect(firstStep.products.length).toEqual(1);
  expect(firstStep.products[0].minimumQuantity).toEqual(1);

  const newState = useRecipeCreationReducer(state, { type: 'ADD_STEP' });

  expect(newState.recipe.steps.length).toEqual(2);
  const secondStep = newState.recipe.steps[1];
  expect(secondStep.media.length).toEqual(0);
  expect(secondStep.ingredients.length).toEqual(0);
  expect(secondStep.instruments.length).toEqual(0);
  expect(secondStep.completionConditions.length).toEqual(0);
  expect(secondStep.products.length).toEqual(1);
});

test('should be able to remove a step', () => {
  const state = new RecipeCreationPageState();
  expect(state.recipe.steps.length).toEqual(1);
  let firstStep = state.recipe.steps[0];
  expect(firstStep.media.length).toEqual(0);
  expect(firstStep.ingredients.length).toEqual(0);
  expect(firstStep.instruments.length).toEqual(0);
  expect(firstStep.completionConditions.length).toEqual(0);
  expect(firstStep.products.length).toEqual(1);
  expect(firstStep.products[0].minimumQuantity).toEqual(1);

  const newState = useRecipeCreationReducer(state, { type: 'ADD_STEP' });

  expect(newState.recipe.steps.length).toEqual(2);
  const secondStep = newState.recipe.steps[1];
  expect(secondStep.media.length).toEqual(0);
  expect(secondStep.ingredients.length).toEqual(0);
  expect(secondStep.instruments.length).toEqual(0);
  expect(secondStep.completionConditions.length).toEqual(0);
  expect(secondStep.products.length).toEqual(1);

  const newerState = useRecipeCreationReducer(newState, {
    type: 'REMOVE_STEP',
    stepIndex: newState.recipe.steps.length - 1,
  });

  expect(newerState.recipe.steps.length).toEqual(1);
  firstStep = state.recipe.steps[0];
  expect(firstStep.media.length).toEqual(0);
  expect(firstStep.ingredients.length).toEqual(0);
  expect(firstStep.instruments.length).toEqual(0);
  expect(firstStep.completionConditions.length).toEqual(0);
  expect(firstStep.products.length).toEqual(1);
  expect(firstStep.products[0].minimumQuantity).toEqual(1);
});

test('should be able to toggle showing a step', () => {
  const state = new RecipeCreationPageState();
  expect(state.showSteps).toEqual([true]);

  const newState = useRecipeCreationReducer(state, { type: 'ADD_STEP' });
  expect(newState.showSteps).toEqual([true, true]);

  const newerState = useRecipeCreationReducer(newState, {
    type: 'TOGGLE_SHOW_STEP',
    stepIndex: newState.recipe.steps.length - 1,
  });
  expect(newerState.showSteps).toEqual([true, false]);
});

test('should be able to add an ingredient to a recipe step', () => {
  // TODO
});

test('should be able to add an instrument to a recipe step', () => {
  // TODO
});

test('should be able to remove an ingredient from a recipe step', () => {
  // TODO
});

test('should be able to remove an instrument from a recipe step', () => {
  // TODO
});

test('should be able to update a step preparation query', () => {
  // TODO
});

test('should be able to update the notes for a recipe step', () => {
  // TODO
});

test('should be able to update the ingredient query for a recipe step', () => {
  // TODO
});

test('should be able to update the product measurement unit query for a given step product', () => {
  // TODO
});

test('should be able to update the product measurement unit suggestions for a given step product', () => {
  // TODO
});

test('should be able to add a completion condition to a recipe step', () => {
  // TODO
});

test('should be able to update the completion condition ingredient state query for a given recipe step completion condition', () => {
  // TODO
});

test('should be able to update the completion condition ingredient state suggestions for a given recipe step completion condition', () => {
  // TODO
});

test('should be able to update the valid ingredient state for a given recipe step completion condition', () => {
  // TODO
});

test('should be able to remove a recipe step completion condition', () => {
  // TODO
});

test('should be able to update the measurement unit for a given recipe step product', () => {
  // TODO
});

test('should be able to update the type of a recipe step product', () => {
  // TODO
});

test('should be able to update the measurement unit query of a given recipe step ingredient', () => {
  // TODO
});

test('should be able to udpate the measurement unit suggestions for a given recipe step ingredient', () => {
  // TODO
});

test('should be able to update the measurement unit for a given reciep step measurement unit', () => {
  // TODO
});

test('should be able to update the ingredient query for a given recipe step', () => {
  // TODO
});

test('should be able to update the instrument suggestions for a given recipe step', () => {
  // TODO
});

test('should be able to update the preparation suggestions for a given recipe step', () => {
  // TODO
});

test('should be able to update the minimum quantity of a given recipe step ingredient', () => {
  // TODO
});

test('should be able to update the maximum quantity of a given recipe step ingredient', () => {
  // TODO
});

test('should be able to update the minimum quantity of a given recipe step product', () => {
  // TODO
});

test('should be able to update the maximum quantity of a given recipe step product', () => {
  // TODO
});

test('should be able to update the minimum quantity of a given recipe step instrument', () => {
  // TODO
});

test('should be able to update the maximum quantity of a given recipe step instrument', () => {
  // TODO
});

test('should be able to update the preparation for a recipe step', () => {
  // TODO
});

test('should be able to update the name of a recipe step product', () => {
  // TODO
});

test('should be able to toggle ranged status for a given recipe step ingredient', () => {
  // TODO
});

test('should be able to toggle ranged status for a given recipe step instrument', () => {
  // TODO
});

test('should be able to toggle whether or not a product is ranged', () => {
  // TODO
});

test('should be able to toggle manual product naming', () => {
  // TODO
});
