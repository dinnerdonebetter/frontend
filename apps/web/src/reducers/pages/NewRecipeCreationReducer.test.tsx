import produce from 'immer';

import { NewRecipeCreationPageState } from './NewRecipeCreationReducer';

test('updates recipe name', () => {
  const state = new NewRecipeCreationPageState();

  expect(state.name).toBe('');

  const newName = 'test';
  produce(state, (draft) => {
    draft.name = newName;
  });

  expect(state.name).toBe(newName);
});
