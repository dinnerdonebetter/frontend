import { useMemo } from 'react';
import { useImmerReducer } from 'use-immer';

import { NewRecipeCreationPageState, useNewRecipeCreationReducer } from './NewRecipeCreationReducer';

test('updates recipe name', () => {
  const [state, updatePageState] = useImmerReducer(useNewRecipeCreationReducer, new NewRecipeCreationPageState());

  expect(state.name).toBe('');

  const newName = 'test';
  updatePageState({
    type: 'SET_RECIPE_NAME',
    content: newName,
  });

  expect(state.name).toBe(newName);
});
