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
