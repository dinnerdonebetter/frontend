import {
  RecipeStepIngredient,
  RecipeStepInstrument,
  ValidIngredientState,
  ValidMeasurementUnit,
  ValidPreparation,
} from '@prixfixeco/models';
import { useRecipeCreationReducer, RecipeCreationPageState } from './RecipeCreator';

describe('useRecipeCreationReducer', () => {
  test('should be able to update the submission error', () => {
    let state = new RecipeCreationPageState();
    expect(state.submissionError).toEqual(null);

    const newValue = 'test';
    state = useRecipeCreationReducer(state, { type: 'UPDATE_SUBMISSION_ERROR', error: newValue });

    expect(state.submissionError).toEqual(newValue);
  });

  test('should be able to change the name', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.name).toEqual('');

    const newValue = 'test';
    state = useRecipeCreationReducer(state, { type: 'UPDATE_NAME', newName: newValue });

    expect(state.recipe.name).toEqual(newValue);
  });

  test('should be able to change the description', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.description).toEqual('');

    const newValue = 'test';
    state = useRecipeCreationReducer(state, { type: 'UPDATE_DESCRIPTION', newDescription: newValue });

    expect(state.recipe.description).toEqual(newValue);
  });

  test('should be able to update the recipe source', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.source).toEqual('');

    const newValue = 'test';
    state = useRecipeCreationReducer(state, { type: 'UPDATE_SOURCE', newSource: newValue });

    expect(state.recipe.source).toEqual(newValue);
  });

  test('should be able to update the yielded portions', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.yieldsPortions).toEqual(1);

    const newValue = 123;
    state = useRecipeCreationReducer(state, { type: 'UPDATE_YIELDS_PORTIONS', newPortions: newValue });

    expect(state.recipe.yieldsPortions).toEqual(newValue);
  });

  test('should be able to toggle show all ingredients', () => {
    let state = new RecipeCreationPageState();
    expect(state.showIngredientsSummary).toEqual(false);

    state = useRecipeCreationReducer(state, { type: 'TOGGLE_SHOW_ALL_INGREDIENTS' });

    expect(state.showIngredientsSummary).toEqual(true);
  });

  test('should be able to toggle show all instruments', () => {
    let state = new RecipeCreationPageState();
    expect(state.showInstrumentsSummary).toEqual(false);

    state = useRecipeCreationReducer(state, { type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' });

    expect(state.showInstrumentsSummary).toEqual(true);
  });

  test('should be able to toggle showing advanced prep steps', () => {
    let state = new RecipeCreationPageState();
    expect(state.showAdvancedPrepStepInputs).toEqual(false);

    state = useRecipeCreationReducer(state, { type: 'TOGGLE_SHOW_ADVANCED_PREP_STEPS' });

    expect(state.showAdvancedPrepStepInputs).toEqual(true);
  });

  test('should be able to add a step', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps.length).toEqual(1);
    const firstStep = state.recipe.steps[0];
    expect(firstStep.media.length).toEqual(0);
    expect(firstStep.ingredients.length).toEqual(0);
    expect(firstStep.instruments.length).toEqual(0);
    expect(firstStep.completionConditions.length).toEqual(0);
    expect(firstStep.products.length).toEqual(1);
    expect(firstStep.products[0].minimumQuantity).toEqual(1);

    state = useRecipeCreationReducer(state, { type: 'ADD_STEP' });

    expect(state.recipe.steps.length).toEqual(2);
    const secondStep = state.recipe.steps[1];
    expect(secondStep.media.length).toEqual(0);
    expect(secondStep.ingredients.length).toEqual(0);
    expect(secondStep.instruments.length).toEqual(0);
    expect(secondStep.completionConditions.length).toEqual(0);
    expect(secondStep.products.length).toEqual(1);
  });

  test('should be able to remove a step', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps.length).toEqual(1);
    let firstStep = state.recipe.steps[0];
    expect(firstStep.media.length).toEqual(0);
    expect(firstStep.ingredients.length).toEqual(0);
    expect(firstStep.instruments.length).toEqual(0);
    expect(firstStep.completionConditions.length).toEqual(0);
    expect(firstStep.products.length).toEqual(1);
    expect(firstStep.products[0].minimumQuantity).toEqual(1);

    state = useRecipeCreationReducer(state, { type: 'ADD_STEP' });

    expect(state.recipe.steps.length).toEqual(2);
    const secondStep = state.recipe.steps[1];
    expect(secondStep.media.length).toEqual(0);
    expect(secondStep.ingredients.length).toEqual(0);
    expect(secondStep.instruments.length).toEqual(0);
    expect(secondStep.completionConditions.length).toEqual(0);
    expect(secondStep.products.length).toEqual(1);

    state = useRecipeCreationReducer(state, {
      type: 'REMOVE_STEP',
      stepIndex: state.recipe.steps.length - 1,
    });

    expect(state.recipe.steps.length).toEqual(1);
    firstStep = state.recipe.steps[0];
    expect(firstStep.media.length).toEqual(0);
    expect(firstStep.ingredients.length).toEqual(0);
    expect(firstStep.instruments.length).toEqual(0);
    expect(firstStep.completionConditions.length).toEqual(0);
    expect(firstStep.products.length).toEqual(1);
    expect(firstStep.products[0].minimumQuantity).toEqual(1);
  });

  test('should be able to toggle showing a step', () => {
    let state = new RecipeCreationPageState();
    expect(state.showSteps).toEqual([true]);

    state = useRecipeCreationReducer(state, { type: 'ADD_STEP' });
    expect(state.showSteps).toEqual([true, true]);
    expect(state.stepHelpers[1].show).toEqual(true);

    state = useRecipeCreationReducer(state, {
      type: 'TOGGLE_SHOW_STEP',
      stepIndex: state.recipe.steps.length - 1,
    });
    expect(state.showSteps).toEqual([true, false]);
    expect(state.stepHelpers[1].show).toEqual(false);
  });

  test('should be able to add an ingredient to a recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps.length).toEqual(1);
    expect(state.recipe.steps[0].ingredients.length).toEqual(0);

    const exampleIngredient = new RecipeStepIngredient({ name: 'test' });
    state = useRecipeCreationReducer(state, {
      type: 'ADD_INGREDIENT_TO_STEP',
      stepIndex: 0,
      selectedIngredient: exampleIngredient,
    });

    expect(state.recipe.steps[0].ingredients.length).toEqual(1);
    expect(state.recipe.steps[0].ingredients[0].name).toEqual(exampleIngredient.name);
  });

  test('should be able to remove an ingredient from a recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps.length).toEqual(1);
    expect(state.recipe.steps[0].ingredients.length).toEqual(0);

    const exampleIngredient = new RecipeStepIngredient({ name: 'test' });
    state = useRecipeCreationReducer(state, {
      type: 'ADD_INGREDIENT_TO_STEP',
      stepIndex: 0,
      selectedIngredient: exampleIngredient,
    });

    expect(state.recipe.steps[0].ingredients.length).toEqual(1);
    expect(state.recipe.steps[0].ingredients[0].name).toEqual(exampleIngredient.name);

    state = useRecipeCreationReducer(state, {
      type: 'REMOVE_INGREDIENT_FROM_STEP',
      stepIndex: 0,
      recipeStepIngredientIndex: 0,
    });
    expect(state.recipe.steps[0].ingredients.length).toEqual(0);
  });

  test('should be able to add an instrument to a recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps.length).toEqual(1);
    expect(state.recipe.steps[0].instruments.length).toEqual(0);

    const exampleInstrument = new RecipeStepInstrument({ name: 'test' });
    state = useRecipeCreationReducer(state, {
      type: 'ADD_INSTRUMENT_TO_STEP',
      stepIndex: 0,
      selectedInstrument: exampleInstrument,
    });

    expect(state.recipe.steps[0].instruments.length).toEqual(1);
    expect(state.recipe.steps[0].instruments[0].name).toEqual(exampleInstrument.name);
  });

  test('should be able to remove an instrument from a recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps.length).toEqual(1);
    expect(state.recipe.steps[0].instruments.length).toEqual(0);

    const exampleInstrument = new RecipeStepInstrument({ name: 'test' });
    state = useRecipeCreationReducer(state, {
      type: 'ADD_INSTRUMENT_TO_STEP',
      stepIndex: 0,
      selectedInstrument: exampleInstrument,
    });

    expect(state.recipe.steps[0].instruments.length).toEqual(1);
    expect(state.recipe.steps[0].instruments[0].name).toEqual(exampleInstrument.name);

    state = useRecipeCreationReducer(state, {
      type: 'REMOVE_INSTRUMENT_FROM_STEP',
      stepIndex: 0,
      recipeStepInstrumentIndex: 0,
    });
    expect(state.recipe.steps[0].instruments.length).toEqual(0);
  });

  test('should be able to update a step preparation query', () => {
    let state = new RecipeCreationPageState();
    expect(state.preparationQueries).toEqual(['']);
    expect(state.stepHelpers[0].preparationQuery).toEqual('');

    const newValue = 'test';
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_PREPARATION_QUERY',
      stepIndex: 0,
      newQuery: newValue,
    });

    expect(state.preparationQueries).toEqual([newValue]);
    expect(state.stepHelpers[0].preparationQuery).toEqual(newValue);
  });

  test('should be able to update the notes for a recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps[0].notes).toEqual('');

    const newValue = 'test';
    state = useRecipeCreationReducer(state, { type: 'UPDATE_STEP_NOTES', stepIndex: 0, newNotes: newValue });

    expect(state.recipe.steps[0].notes).toEqual(newValue);
  });

  test('should be able to update the ingredient query for a recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.stepHelpers[0].ingredientQuery).toEqual('');

    const newValue = 'test';
    state = useRecipeCreationReducer(state, { type: 'UPDATE_STEP_INGREDIENT_QUERY', stepIndex: 0, newQuery: newValue });

    expect(state.stepHelpers[0].ingredientQuery).toEqual(newValue);
  });

  test('should be able to update the product measurement unit query for a given step product', () => {
    let state = new RecipeCreationPageState();
    expect(state.productMeasurementUnitQueries).toEqual([['']]);
    expect(state.stepHelpers[0].productMeasurementUnitQueries).toEqual(['']);

    const newValue = 'test';
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY',
      stepIndex: 0,
      productIndex: 0,
      newQuery: newValue,
    });

    expect(state.productMeasurementUnitQueries).toEqual([[newValue]]);
    expect(state.stepHelpers[0].productMeasurementUnitQueries).toEqual([newValue]);
  });

  test('should be able to update the product measurement unit suggestions for a given step product', () => {
    let state = new RecipeCreationPageState();
    expect(state.productMeasurementUnitSuggestions).toEqual([[[]]]);

    const newValue = new Array<ValidMeasurementUnit>();
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_SUGGESTIONS',
      stepIndex: 0,
      productIndex: 0,
      results: newValue,
    });

    expect(state.productMeasurementUnitSuggestions).toEqual([[newValue]]);
  });

  test('should be able to add a completion condition to a recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps[0].completionConditions.length).toEqual(0);

    state = useRecipeCreationReducer(state, { type: 'ADD_COMPLETION_CONDITION_TO_STEP', stepIndex: 0 });

    expect(state.recipe.steps[0].completionConditions.length).toEqual(1);
  });

  test('should be able to update the completion condition ingredient state query for a given recipe step completion condition', () => {
    let state = new RecipeCreationPageState();
    expect(state.completionConditionIngredientStateQueries).toEqual([[]]);

    state = useRecipeCreationReducer(state, { type: 'ADD_COMPLETION_CONDITION_TO_STEP', stepIndex: 0 });
    expect(state.completionConditionIngredientStateQueries).toEqual([['']]);

    const newValue = 'test';
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY',
      stepIndex: 0,
      conditionIndex: 0,
      query: newValue,
    });

    expect(state.completionConditionIngredientStateQueries).toEqual([[newValue]]);
  });

  test('should be able to update the completion condition ingredient state suggestions for a given recipe step completion condition', () => {
    let state = new RecipeCreationPageState();
    expect(state.completionConditionIngredientStateSuggestions).toEqual([[]]);

    state = useRecipeCreationReducer(state, { type: 'ADD_COMPLETION_CONDITION_TO_STEP', stepIndex: 0 });
    expect(state.recipe.steps[0].completionConditions.length).toEqual(1);
    expect(state.completionConditionIngredientStateSuggestions).toEqual([[[]]]);

    const newValue = new Array<ValidIngredientState>(new ValidIngredientState());
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_SUGGESTIONS',
      stepIndex: 0,
      conditionIndex: 0,
      results: newValue,
    });

    expect(state.completionConditionIngredientStateSuggestions).toEqual([[newValue]]);
  });

  test('should be able to update the valid ingredient state for a given recipe step completion condition', () => {
    let state = new RecipeCreationPageState();
    expect('TODO').toEqual('TODO');

    state = useRecipeCreationReducer(state, { type: 'ADD_COMPLETION_CONDITION_TO_STEP', stepIndex: 0 });
    expect(state.recipe.steps[0].completionConditions.length).toEqual(1);
    expect(state.recipe.steps[0].completionConditions[0].ingredientState).toEqual(new ValidIngredientState());

    const newValue = new ValidIngredientState({ name: 'test' });
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE',
      conditionIndex: 0,
      stepIndex: 0,
      ingredientState: newValue,
    });

    expect(state.recipe.steps[0].completionConditions[0].ingredientState).toEqual(newValue);
  });

  test('should be able to remove a recipe step completion condition', () => {
    let state = new RecipeCreationPageState();
    expect('TODO').toEqual('TODO');

    state = useRecipeCreationReducer(state, { type: 'ADD_COMPLETION_CONDITION_TO_STEP', stepIndex: 0 });
    expect(state.recipe.steps[0].completionConditions.length).toEqual(1);

    const newValue = 'test';
    state = useRecipeCreationReducer(state, {
      type: 'REMOVE_RECIPE_STEP_COMPLETION_CONDITION',
      stepIndex: 0,
      conditionIndex: 0,
    });

    expect(state.recipe.steps[0].completionConditions.length).toEqual(0);
  });

  test('should be able to update the measurement unit for a given recipe step product', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps[0].products[0].measurementUnit).toEqual(new ValidMeasurementUnit());

    const newValue = new ValidMeasurementUnit({ name: 'test' });
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT',
      stepIndex: 0,
      productIndex: 0,
      measurementUnit: newValue,
    });

    expect(state.recipe.steps[0].products[0].measurementUnit).toEqual(newValue);
  });

  test('should be able to update the type of a recipe step product', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps[0].products[0].type).toEqual('ingredient');

    const newValue = 'instrument';
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_PRODUCT_TYPE',
      stepIndex: 0,
      productIndex: 0,
      newType: newValue,
    });

    expect(state.recipe.steps[0].products[0].type).toEqual(newValue);
  });

  test('should be able to update the measurement unit query of a given recipe step ingredient', () => {
    let state = new RecipeCreationPageState();
    expect(state.ingredientMeasurementUnitQueries).toEqual([]);

    state = useRecipeCreationReducer(state, {
      type: 'ADD_INGREDIENT_TO_STEP',
      stepIndex: 0,
      selectedIngredient: new RecipeStepIngredient({ name: 'test' }),
    });
    expect(state.ingredientMeasurementUnitQueries).toEqual([['']]);

    const newValue = 'test';
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY',
      stepIndex: 0,
      recipeStepIngredientIndex: 0,
      newQuery: newValue,
    });

    expect(state.ingredientMeasurementUnitQueries).toEqual([[newValue]]);
  });

  test('should be able to update the measurement unit suggestions for a given recipe step ingredient', () => {
    let state = new RecipeCreationPageState();
    expect('TODO').toEqual('TODO');

    state = useRecipeCreationReducer(state, {
      type: 'ADD_INGREDIENT_TO_STEP',
      stepIndex: 0,
      selectedIngredient: new RecipeStepIngredient({ name: 'test' }),
    });
    expect(state.ingredientMeasurementUnitSuggestions).toEqual([[[]]]);

    const newValue = new Array<ValidMeasurementUnit>();
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_SUGGESTIONS',
      stepIndex: 0,
      recipeStepIngredientIndex: 0,
      results: newValue,
    });

    expect(state.ingredientMeasurementUnitSuggestions).toEqual([[newValue]]);
  });

  test('should be able to update the measurement unit for a given recipe step ingredient', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps[0].ingredients.length).toEqual(0);

    state = useRecipeCreationReducer(state, {
      type: 'ADD_INGREDIENT_TO_STEP',
      stepIndex: 0,
      selectedIngredient: new RecipeStepIngredient({ name: 'test' }),
    });
    expect(state.recipe.steps[0].ingredients[0].measurementUnit).toEqual(new ValidMeasurementUnit());

    const newValue = new ValidMeasurementUnit({ name: 'test' });
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT',
      stepIndex: 0,
      recipeStepIngredientIndex: 0,
      measurementUnit: newValue,
    });

    expect(state.recipe.steps[0].ingredients[0].measurementUnit).toEqual(newValue);
  });

  test('should be able to update the ingredient suggestions for a recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.ingredientSuggestions).toEqual([[]]);

    state = useRecipeCreationReducer(state, {
      type: 'ADD_INGREDIENT_TO_STEP',
      stepIndex: 0,
      selectedIngredient: new RecipeStepIngredient({ name: 'test' }),
    });

    const newValue = new Array<RecipeStepIngredient>();
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_INGREDIENT_SUGGESTIONS',
      stepIndex: 0,
      results: newValue,
    });

    expect(state.ingredientSuggestions).toEqual([newValue]);
  });

  test('should be able to update the instrument suggestions for a given recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.instrumentSuggestions).toEqual([[]]);

    const newValue = new Array<RecipeStepInstrument>();
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_INSTRUMENT_SUGGESTIONS',
      stepIndex: 0,
      results: newValue,
    });

    expect(state.instrumentSuggestions).toEqual([newValue]);
  });

  test('should be able to update the preparation suggestions for a given recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.preparationSuggestions).toEqual([[]]);

    const newValue = new Array<ValidPreparation>(new ValidPreparation());
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_PREPARATION_SUGGESTIONS',
      stepIndex: 0,
      results: newValue,
    });

    expect(state.preparationSuggestions).toEqual([newValue]);
  });

  test('should be able to update the minimum quantity of a given recipe step ingredient', () => {
    let state = new RecipeCreationPageState();
    expect('TODO').toEqual('TODO');

    state = useRecipeCreationReducer(state, {
      type: 'ADD_INGREDIENT_TO_STEP',
      stepIndex: 0,
      selectedIngredient: new RecipeStepIngredient({ name: 'test' }),
    });
    expect(state.recipe.steps[0].ingredients[0].minimumQuantity).toEqual(0);

    const newValue = 12.34;
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_INGREDIENT_MINIMUM_QUANTITY',
      stepIndex: 0,
      recipeStepIngredientIndex: 0,
      newAmount: newValue,
    });

    expect(state.recipe.steps[0].ingredients[0].minimumQuantity).toEqual(newValue);
  });

  test('should be able to update the maximum quantity of a given recipe step ingredient', () => {
    let state = new RecipeCreationPageState();
    expect('TODO').toEqual('TODO');

    state = useRecipeCreationReducer(state, {
      type: 'ADD_INGREDIENT_TO_STEP',
      stepIndex: 0,
      selectedIngredient: new RecipeStepIngredient({ name: 'test' }),
    });
    expect(state.recipe.steps[0].ingredients[0].maximumQuantity).toEqual(0);

    const newValue = 12.34;
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_INGREDIENT_MAXIMUM_QUANTITY',
      stepIndex: 0,
      recipeStepIngredientIndex: 0,
      newAmount: newValue,
    });

    expect(state.recipe.steps[0].ingredients[0].maximumQuantity).toEqual(newValue);
  });

  test('should be able to update the minimum quantity of a given recipe step product', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps[0].products[0].minimumQuantity).toEqual(1);

    const newValue = 12.34;
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_PRODUCT_MINIMUM_QUANTITY',
      stepIndex: 0,
      productIndex: 0,
      newAmount: newValue,
    });

    expect(state.recipe.steps[0].products[0].minimumQuantity).toEqual(newValue);
  });

  test('should be able to update the maximum quantity of a given recipe step product', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps[0].products[0].maximumQuantity).toEqual(1);

    const newValue = 12.34;
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_PRODUCT_MAXIMUM_QUANTITY',
      stepIndex: 0,
      productIndex: 0,
      newAmount: newValue,
    });

    expect(state.recipe.steps[0].products[0].maximumQuantity).toEqual(newValue);
  });

  test('should be able to update the minimum quantity of a given recipe step instrument', () => {
    let state = new RecipeCreationPageState();
    expect('TODO').toEqual('TODO');

    state = useRecipeCreationReducer(state, {
      type: 'ADD_INSTRUMENT_TO_STEP',
      stepIndex: 0,
      selectedInstrument: new RecipeStepInstrument({ name: 'test' }),
    });
    expect(state.recipe.steps[0].instruments[0].minimumQuantity).toEqual(0);

    const newValue = 12.34;
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_INSTRUMENT_MINIMUM_QUANTITY',
      stepIndex: 0,
      recipeStepInstrumentIndex: 0,
      newAmount: newValue,
    });

    expect(state.recipe.steps[0].instruments[0].minimumQuantity).toEqual(newValue);
  });

  test('should be able to update the maximum quantity of a given recipe step instrument', () => {
    let state = new RecipeCreationPageState();
    expect('TODO').toEqual('TODO');

    state = useRecipeCreationReducer(state, {
      type: 'ADD_INSTRUMENT_TO_STEP',
      stepIndex: 0,
      selectedInstrument: new RecipeStepInstrument({ name: 'test' }),
    });
    expect(state.recipe.steps[0].instruments[0].maximumQuantity).toEqual(0);

    const newValue = 12.34;
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_INSTRUMENT_MAXIMUM_QUANTITY',
      stepIndex: 0,
      recipeStepInstrumentIndex: 0,
      newAmount: newValue,
    });

    expect(state.recipe.steps[0].instruments[0].maximumQuantity).toEqual(newValue);
  });

  test('should be able to update the preparation for a recipe step', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps[0].preparation).toEqual(new ValidPreparation());
    expect('TODO').toEqual('TODO');

    const newValue = new ValidPreparation({ name: 'test' });
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_PREPARATION',
      stepIndex: 0,
      selectedPreparation: newValue,
    });

    expect(state.recipe.steps[0].preparation).toEqual(newValue);
  });

  test('should be able to update the name of a recipe step product', () => {
    let state = new RecipeCreationPageState();
    expect(state.recipe.steps[0].products[0].name).toEqual('');

    const newValue = 'test';
    state = useRecipeCreationReducer(state, {
      type: 'UPDATE_STEP_PRODUCT_NAME',
      stepIndex: 0,
      productIndex: 0,
      newName: newValue,
    });

    expect(state.recipe.steps[0].products[0].name).toEqual(newValue);
  });

  test('should be able to toggle ranged status for a given recipe step ingredient', () => {
    let state = new RecipeCreationPageState();
    expect(state.stepHelpers[0].ingredientIsRanged).toEqual([]);

    state = useRecipeCreationReducer(state, {
      type: 'ADD_INGREDIENT_TO_STEP',
      stepIndex: 0,
      selectedIngredient: new RecipeStepIngredient({ name: 'test' }),
    });

    state = useRecipeCreationReducer(state, {
      type: 'TOGGLE_INGREDIENT_RANGE',
      stepIndex: 0,
      recipeStepIngredientIndex: 0,
    });

    expect(state.stepHelpers[0].ingredientIsRanged).toEqual([true]);
  });

  test('should be able to toggle ranged status for a given recipe step instrument', () => {
    let state = new RecipeCreationPageState();
    expect(state.stepHelpers[0].instrumentIsRanged).toEqual([]);

    state = useRecipeCreationReducer(state, {
      type: 'ADD_INSTRUMENT_TO_STEP',
      stepIndex: 0,
      selectedInstrument: new RecipeStepInstrument({ name: 'test' }),
    });

    state = useRecipeCreationReducer(state, {
      type: 'TOGGLE_INSTRUMENT_RANGE',
      stepIndex: 0,
      recipeStepInstrumentIndex: 0,
    });

    expect(state.stepHelpers[0].instrumentIsRanged).toEqual([true]);
  });

  test('should be able to toggle whether or not a product is ranged', () => {
    let state = new RecipeCreationPageState();
    expect(state.stepHelpers[0].productIsRanged[0]).toEqual(false);

    state = useRecipeCreationReducer(state, {
      type: 'TOGGLE_PRODUCT_RANGE',
      stepIndex: 0,
      productIndex: 0,
    });

    expect(state.stepHelpers[0].productIsRanged[0]).toEqual(true);
  });

  test('should be able to toggle manual product naming', () => {
    let state = new RecipeCreationPageState();
    expect(state.stepHelpers[0].productsNamedManually).toEqual([false]);

    state = useRecipeCreationReducer(state, {
      type: 'TOGGLE_MANUAL_PRODUCT_NAMING',
      stepIndex: 0,
      productIndex: 0,
    });

    expect(state.stepHelpers[0].productsNamedManually).toEqual([true]);
  });
});
