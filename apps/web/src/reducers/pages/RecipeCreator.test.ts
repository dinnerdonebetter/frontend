import { useRecipeCreationReducer, RecipeCreationPageState } from './RecipeCreator';

test('should be able to change the name', () => {
  const state = new RecipeCreationPageState();
  expect(state.recipe.name).toEqual('');

  const newName = 'test';
  const newState = useRecipeCreationReducer(state, { type: 'UPDATE_NAME', newName: newName });

  expect(newState.recipe.name).toEqual(newName);
});

test('should be able to change the description', () => {
  const state = new RecipeCreationPageState();
  expect(state.recipe.description).toEqual('');

  const newDescription = 'test';
  const newState = useRecipeCreationReducer(state, { type: 'UPDATE_DESCRIPTION', newDescription: newDescription });

  expect(newState.recipe.description).toEqual(newDescription);
});

test('should be able to toggle show all ingredients', () => {
  //
});

test('should be able to toggle show all instruments', () => {
  //
});

test('should be able to toggle showing advanced prep steps', () => {
  //
});

test('should be able to update submission error', () => {
  //
});

test('should be able to update the recipe source', () => {
  //
});

test('should be able to update the number of yielded portions', () => {
  //
});

test('should be able to add a step', () => {
  //
});

test('should be able to toggle showing a step', () => {
  //
});

test('should be able to remove a step', () => {
  //
});

test('should be able to add an ingredient to a recipe step', () => {
  //
});

test('should be able to add an instrument to a recipe step', () => {
  //
});

test('should be able to remove an ingredient from a recipe step', () => {
  //
});

test('should be able to remove an instrument from a recipe step', () => {
  //
});

test('should be able to update a step preparation query', () => {
  //
});

test('should be able to update the notes for a recipe step', () => {
  //
});

test('should be able to update the ingredient query for a recipe step', () => {
  //
});

test('should be able to update the product measurement unit query for a given step product', () => {
  //
});

test('should be able to update the product measurement unit suggestions for a given step product', () => {
  //
});

test('should be able to add a completion condition to a recipe step', () => {
  //
});

test('should be able to update the completion condition ingredient state query for a given recipe step completion condition', () => {
  //
});

test('should be able to update the completion condition ingredient state suggestions for a given recipe step completion condition', () => {
  //
});

test('should be able to update the valid ingredient state for a given recipe step completion condition', () => {
  //
});

test('should be able to remove a recipe step completion condition', () => {
  //
});

test('should be able to update the measurement unit for a given recipe step product', () => {
  //
});

test('should be able to update the type of a recipe step product', () => {
  //
});

test('should be able to update the measurement unit query of a given recipe step ingredient', () => {
  //
});

test('should be able to udpate the measurement unit suggestions for a given recipe step ingredient', () => {
  //
});

test('should be able to update the measurement unit for a given reciep step measurement unit', () => {
  //
});

test('should be able to update the ingredient query for a given recipe step', () => {
  //
});

test('should be able to update the instrument suggestions for a given recipe step', () => {
  //
});

test('should be able to update the preparation suggestions for a given recipe step', () => {
  //
});

test('should be able to update the minimum quantity of a given recipe step ingredient', () => {
  //
});

test('should be able to update the maximum quantity of a given recipe step ingredient', () => {
  //
});

test('should be able to update the minimum quantity of a given recipe step product', () => {
  //
});

test('should be able to update the maximum quantity of a given recipe step product', () => {
  //
});

test('should be able to update the minimum quantity of a given recipe step instrument', () => {
  //
});

test('should be able to update the maximum quantity of a given recipe step instrument', () => {
  //
});

test('should be able to update the preparation for a recipe step', () => {
  //
});

test('should be able to update the name of a recipe step product', () => {
  //
});

test('should be able to toggle ranged status for a given recipe step ingredient', () => {
  //
});

test('should be able to toggle ranged status for a given recipe step instrument', () => {
  //
});

test('should be able to toggle whether or not a product is ranged', () => {
  //
});

test('should be able to toggle manual product naming', () => {
  //
});
