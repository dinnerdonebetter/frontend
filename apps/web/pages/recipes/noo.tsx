import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Grid,
  Text,
  Stack,
  Textarea,
  TextInput,
  Autocomplete,
  NumberInput,
  Select,
  Space,
  Collapse,
  Box,
  Title,
  Center,
  AutocompleteItem,
  Switch,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconCircleX, IconPencil, IconPlus, IconTrash } from '@tabler/icons';
import { AxiosResponse, AxiosError } from 'axios';
import { useEffect } from 'react';
import { useImmerReducer } from 'use-immer';
import { useRouter } from 'next/router';

import {
  IRecipeStepProduct,
  IValidPreparation,
  QueryFilteredResult,
  RecipeStepCompletionCondition,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeStepProduct,
  ValidIngredient,
  ValidIngredientState,
  ValidMeasurementUnit,
  ValidPreparation,
  ValidPreparationInstrument,
} from '@prixfixeco/models';

import { buildLocalClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import {
  NewRecipeCreationPageState,
  NewRecipeStepCreationPageState,
  useNewRecipeCreationReducer,
} from '../../src/reducers';

function RecipesPage() {
  const router = useRouter();

  const [pageState, updatePageState] = useImmerReducer(useNewRecipeCreationReducer, new NewRecipeCreationPageState());

  const recipeIsReadyForSubmission = (): boolean => {
    //   const recipeCreationFormSchema = z.object({
    //     name: z.string().min(1, 'name is required').trim(),
    //     yieldsPortions: z.number().min(1),
    //     steps: z
    //       .array(
    //         z.object({
    //           preparation: z.object({
    //             id: z.string().min(1, 'preparation ID is required'),
    //           }),
    //         }),
    //       )
    //       .min(2),
    //   });
    //
    //   return !Boolean(recipeCreationFormSchema.safeParse(pageState.recipe).success);
    return false;
  };

  const submitRecipe = async () => {
    //   const apiClient = buildLocalClient();
    //   apiClient
    //     .createRecipe(ConvertRecipeToRecipeCreationRequestInput(pageState.recipe))
    //     .then((res: AxiosResponse<Recipe>) => {
    //       router.push(`/meals/${res.data.id}`);
    //     })
    //     .catch((err: AxiosError) => {
    //       console.error(`Failed to create meal: ${err}`);
    //     });
  };

  useEffect(() => {
    const apiClient = buildLocalClient();
    if ((pageState.preparationQueryToExecute?.query || '').length > 2) {
      apiClient
        .searchForValidPreparations(pageState.preparationQueryToExecute!.query)
        .then((res: AxiosResponse<ValidPreparation[]>) => {
          updatePageState({
            type: 'SET_RECIPE_STEP_PREPARATION_RESULTS',
            stepIndex: pageState.preparationQueryToExecute!.stepIndex,
            results: res.data,
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get preparations: ${err}`);
        });
    }
  }, [pageState.preparationQueryToExecute]);

  useEffect(() => {
    const apiClient = buildLocalClient();
    if ((pageState.completionConditionIngredientStateQueryToExecute?.query || '').length > 2) {
      apiClient
        .searchForValidIngredientStates(pageState.completionConditionIngredientStateQueryToExecute!.query)
        .then((res: AxiosResponse<ValidIngredientState[]>) => {
          updatePageState({
            type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY_RESULTS',
            stepIndex: pageState.completionConditionIngredientStateQueryToExecute!.stepIndex,
            conditionIndex: pageState.completionConditionIngredientStateQueryToExecute!.secondaryIndex!,
            results: res.data,
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get preparations: ${err}`);
        });
    }
  }, [pageState.completionConditionIngredientStateQueryToExecute, updatePageState]);

  useEffect(() => {
    const apiClient = buildLocalClient();
    if ((pageState.ingredientQueryToExecute?.query || '').length > 2) {
      apiClient
        .searchForValidIngredients(pageState.ingredientQueryToExecute!.query)
        .then((res: AxiosResponse<ValidIngredient[]>) => {
          updatePageState({
            type: 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS',
            stepIndex: pageState.ingredientQueryToExecute!.stepIndex,
            results: (
              res.data.filter((validIngredient: ValidIngredient) => {
                let found = false;

                (pageState.steps[pageState.ingredientQueryToExecute!.stepIndex]?.ingredients || []).forEach(
                  (ingredient) => {
                    if ((ingredient.ingredient?.id || '') === validIngredient.id) {
                      found = true;
                    }
                  },
                );

                // return true if the ingredient is not already used by another ingredient in the step
                return !found;
              }) || []
            ).map(
              (x: ValidIngredient) =>
                new RecipeStepIngredient({
                  ingredient: x,
                  minimumQuantity: 1,
                  maximumQuantity: 1,
                }),
            ),
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredients: ${err}`);
        });
    }
  }, [pageState.ingredientQueryToExecute, pageState.steps, updatePageState]);

  useEffect(() => {
    const apiClient = buildLocalClient();
    if ((pageState.instrumentQueryToExecute?.query || '').length > 2) {
      apiClient
        .validPreparationInstrumentsForPreparationID(pageState.instrumentQueryToExecute!.query)
        .then((res: AxiosResponse<QueryFilteredResult<ValidPreparationInstrument>>) => {
          updatePageState({
            type: 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS',
            stepIndex: pageState.instrumentQueryToExecute!.stepIndex,
            results: (res.data.data || []).map(
              (x: ValidPreparationInstrument) =>
                new RecipeStepInstrument({
                  instrument: x.instrument,
                  notes: '',
                  preferenceRank: 0,
                  optional: false,
                  optionIndex: 0,
                }),
            ),
          });

          return res.data.data || [];
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get preparation instruments: ${err}`);
        });
    }
  }, [pageState.instrumentQueryToExecute, updatePageState]);

  useEffect(() => {
    const apiClient = buildLocalClient();
    if ((pageState.ingredientMeasurementUnitQueryToExecute?.query || '').length > 2) {
      apiClient
        .searchForValidMeasurementUnitsByIngredientID(pageState.ingredientMeasurementUnitQueryToExecute!.query)
        .then((res: AxiosResponse<QueryFilteredResult<ValidMeasurementUnit>>) => {
          updatePageState({
            type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY_RESULTS',
            stepIndex: pageState.ingredientMeasurementUnitQueryToExecute!.stepIndex,
            recipeStepIngredientIndex: pageState.ingredientMeasurementUnitQueryToExecute!.secondaryIndex!,
            results: res.data.data || [],
          });
          return res.data || [];
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredient measurement units: ${err}`);
        });
    }
  }, [pageState.ingredientMeasurementUnitQueryToExecute, updatePageState]);

  useEffect(() => {
    const apiClient = buildLocalClient();
    if ((pageState.productMeasurementUnitQueryToExecute?.query || '').length > 2) {
      apiClient
        .searchForValidMeasurementUnits(pageState.productMeasurementUnitQueryToExecute!.query)
        .then((res: AxiosResponse<ValidMeasurementUnit[]>) => {
          updatePageState({
            type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY_RESULTS',
            stepIndex: pageState.productMeasurementUnitQueryToExecute!.stepIndex,
            productIndex: pageState.productMeasurementUnitQueryToExecute!.secondaryIndex!,
            results: res.data || [],
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredient measurement units: ${err}`);
        });
    }
  }, [pageState.productMeasurementUnitQueryToExecute, updatePageState]);

  const addingStepCompletionConditionsShouldBeDisabled = (step: NewRecipeStepCreationPageState): boolean => {
    return (
      step.completionConditions.length > 0 &&
      step.completionConditions[step.completionConditions.length - 1].ingredientState.id === '' &&
      step.completionConditions[step.completionConditions.length - 1].ingredients.length === 0
    );
  };

  const determinePreparedInstrumentOptions = (
    recipeSteps: NewRecipeStepCreationPageState[],
    stepIndex: number,
  ): Array<RecipeStepInstrument> => {
    var availableInstruments: Record<string, IRecipeStepProduct> = {};

    for (let i = 0; i < stepIndex; i++) {
      const step = recipeSteps[i];

      // add all recipe step product instruments to the record
      step.products.forEach((product: IRecipeStepProduct) => {
        if (product.type === 'instrument') {
          availableInstruments[product.name] = product;
        }
      });

      // remove recipe step product instruments that are used in subsequent steps
      step.instruments.forEach((instrument: RecipeStepInstrument) => {
        if (instrument.productOfRecipeStep) {
          delete availableInstruments[instrument.name];
        }
      });
    }

    // convert the product creation requests to recipe step products
    const suggestions: RecipeStepInstrument[] = [];
    for (let p in availableInstruments) {
      let i = availableInstruments[p];
      suggestions.push({
        ...i,
        optionIndex: 0,
        notes: '',
        preferenceRank: 0,
        optional: false,
        productOfRecipeStep: false,
      });
    }

    return suggestions;
  };

  const determineAvailableRecipeStepProducts = (
    recipeSteps: NewRecipeStepCreationPageState[],
    upToStep: number,
  ): Array<RecipeStepIngredient> => {
    // first we need to determine the available products thusfar
    var availableProducts: Record<string, IRecipeStepProduct> = {};

    for (let i = 0; i < upToStep; i++) {
      const step = recipeSteps[i];

      // add all recipe step products to the record
      step.products.forEach((product: IRecipeStepProduct) => {
        if (product.type === 'ingredient') {
          availableProducts[product.name] = product;
        }
      });

      // remove recipe step products that are used in subsequent steps
      step.ingredients.forEach((ingredient: RecipeStepIngredient) => {
        if (ingredient.productOfRecipeStep) {
          delete availableProducts[ingredient.name];
        }
      });
    }

    // convert the product creation requests to recipe step products
    const suggestedIngredients: RecipeStepIngredient[] = [];
    for (let p in availableProducts) {
      suggestedIngredients.push(
        new RecipeStepIngredient({
          name: availableProducts[p].name,
          measurementUnit: new ValidMeasurementUnit({ id: availableProducts[p].measurementUnit.id }),
          quantityNotes: availableProducts[p].quantityNotes,
          minimumQuantity: availableProducts[p].minimumQuantity,
        }),
      );
    }

    return suggestedIngredients;
  };

  const steps = (pageState.steps || []).map((step: NewRecipeStepCreationPageState, stepIndex: number) => {
    return (
      <Card key={stepIndex} shadow="sm" radius="md" withBorder sx={{ width: '100%', marginBottom: '1rem' }}>
        {/* this is the top of the recipe step view, with the step index indicator and the delete step button */}
        <Card.Section px="xs" sx={{ cursor: 'pointer' }}>
          <Grid justify="space-between" align="center">
            <Grid.Col span="auto">
              <Text weight="bold">{`Step #${stepIndex + 1}`}</Text>
            </Grid.Col>
            <Grid.Col span="content">
              <ActionIcon
                variant="outline"
                size="sm"
                style={{ float: 'right' }}
                aria-label="show step"
                disabled={(pageState.steps || []).length === 1 && pageState.steps[stepIndex].show}
                // onClick={() => updatePageState({ type: 'TOGGLE_SHOW_STEP', stepIndex: stepIndex })}
              >
                {pageState.steps[stepIndex].show ? (
                  <IconChevronUp size={16} color={(pageState.steps || []).length === 1 ? 'gray' : 'black'} />
                ) : (
                  <IconChevronDown size={16} color={(pageState.steps || []).length === 1 ? 'gray' : 'black'} />
                )}
              </ActionIcon>
            </Grid.Col>
            <Grid.Col span="content">
              <ActionIcon
                variant="outline"
                size="sm"
                style={{ float: 'right' }}
                aria-label="remove step"
                disabled={(pageState.steps || []).length === 1}
                // onClick={() => updatePageState({ type: 'REMOVE_STEP', stepIndex: stepIndex })}
              >
                <IconTrash size={16} color={(pageState.steps || []).length === 1 ? 'gray' : 'tomato'} />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        </Card.Section>

        <Collapse in={pageState.steps[stepIndex].show}>
          {/* this is the first input section */}
          <Card.Section px="xs" pb="xs">
            <Grid>
              <Grid.Col md="auto" sm={12}>
                <Stack>
                  <Autocomplete
                    label="Preparation"
                    required
                    tabIndex={0}
                    value={pageState.steps[stepIndex].preparationQuery}
                    onChange={(value: string) => {
                      updatePageState({
                        type: 'SET_RECIPE_STEP_PREPARATION_QUERY',
                        stepIndex: stepIndex,
                        content: value,
                      });
                    }}
                    data={(pageState.steps[stepIndex].preparationSuggestions || [])
                      .filter((x: ValidPreparation) => {
                        return x.name !== pageState.steps[stepIndex].preparation?.name;
                      })
                      .map((x: ValidPreparation) => ({
                        value: x.name,
                        label: x.name,
                      }))}
                    onItemSubmit={(value) => {
                      const selectedPreparation = (pageState.steps[stepIndex].preparationSuggestions || []).find(
                        (preparationSuggestion: IValidPreparation) => preparationSuggestion.name === value.value,
                      );

                      if (!selectedPreparation) {
                        console.error(
                          `couldn't find preparation to add: ${value.value}, ${JSON.stringify(
                            (pageState.steps[stepIndex].preparationSuggestions || []).map((x) => x.name),
                          )}`,
                        );
                        return;
                      }

                      console.log(`adding preparation: ${selectedPreparation.name}`);

                      updatePageState({
                        type: 'SET_RECIPE_STEP_PREPARATION',
                        stepIndex: stepIndex,
                        result: selectedPreparation,
                      });
                    }}
                    rightSection={
                      pageState.steps[stepIndex].preparation && (
                        <IconCircleX
                          size={18}
                          color={pageState.steps[stepIndex].preparation ? 'gray' : 'tomato'}
                          onClick={() => {
                            if (pageState.steps[stepIndex].preparation) {
                              return;
                            }

                            // clear the preparation
                            updatePageState({
                              type: 'CLEAR_RECIPE_STEP_PREPARATION',
                              stepIndex: stepIndex,
                            });
                          }}
                        />
                      )
                    }
                  />

                  <Textarea
                    label="Notes"
                    value={pageState.steps[stepIndex].notes}
                    minRows={2}
                    onChange={(event) => {
                      updatePageState({
                        type: 'SET_RECIPE_STEP_NOTES',
                        stepIndex: stepIndex,
                        content: event.target.value,
                      });
                    }}
                  />

                  <Divider label="using" labelPosition="center" mb="md" />

                  <Select
                    label="Instrument(s)"
                    required
                    error={
                      (pageState.steps[stepIndex].preparation?.minimumInstrumentCount || -1) >
                      pageState.steps[stepIndex].instruments.length
                        ? `at least ${pageState.steps[stepIndex].preparation?.minimumInstrumentCount} instrument${
                            pageState.steps[stepIndex].preparation?.minimumInstrumentCount === 1 ? '' : 's'
                          } required`
                        : undefined
                    }
                    disabled={
                      (pageState.steps[stepIndex].preparation?.maximumInstrumentCount || Number.MAX_SAFE_INTEGER) <=
                        pageState.steps[stepIndex].instruments.length ||
                      determinePreparedInstrumentOptions(pageState.steps, stepIndex)
                        .concat(pageState.steps[stepIndex].instrumentSuggestions || [])
                        // don't show instruments that have already been added
                        .filter((x: RecipeStepInstrument) => {
                          return !pageState.steps[stepIndex].instruments.find(
                            (y: RecipeStepInstrument) => y.name === x.instrument?.name || y.name === x.name,
                          );
                        }).length === 0
                    }
                    description={
                      (pageState.steps[stepIndex].preparation?.maximumInstrumentCount || Number.MAX_SAFE_INTEGER) <=
                      pageState.steps[stepIndex].instruments.length
                        ? `maximum instruments added`
                        : ``
                    }
                    onChange={(instrument) => {
                      if (instrument) {
                        updatePageState({
                          type: 'ADD_INSTRUMENT_TO_STEP',
                          stepIndex: stepIndex,
                          instrumentName: instrument,
                        });
                      }
                    }}
                    value={'Select an instrument'}
                    data={determinePreparedInstrumentOptions(pageState.steps, stepIndex)
                      .concat(pageState.steps[stepIndex].instrumentSuggestions || [])
                      // don't show instruments that have already been added
                      .filter((x: RecipeStepInstrument) => {
                        return !pageState.steps[stepIndex].instruments.find(
                          (y: RecipeStepInstrument) => y.name === x.instrument?.name || y.name === x.name,
                        );
                      })
                      .map((x: RecipeStepInstrument) => ({
                        value: x.instrument?.name || x.name || 'UNKNOWN',
                        label: x.instrument?.name || x.name || 'UNKNOWN',
                      }))}
                  />

                  {(pageState.steps[stepIndex].instruments || []).map(
                    (instrument: RecipeStepInstrument, recipeStepInstrumentIndex: number) => (
                      <Box key={recipeStepInstrumentIndex}>
                        <Grid>
                          <Grid.Col span="auto">
                            <Text mt="xl">{`${instrument.instrument?.name || instrument.name}`}</Text>
                          </Grid.Col>

                          <Grid.Col span="content">
                            <Switch
                              mt="sm"
                              size="md"
                              onLabel="ranged"
                              offLabel="simple"
                              value={
                                pageState.steps[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex]
                                  ? 'ranged'
                                  : 'simple'
                              }
                              onChange={() => {
                                updatePageState({
                                  type: 'TOGGLE_INSTRUMENT_RANGE',
                                  stepIndex,
                                  recipeStepInstrumentIndex,
                                });
                              }}
                            />
                          </Grid.Col>

                          <Grid.Col span="content" mt="sm">
                            <ActionIcon
                              mt="sm"
                              variant="outline"
                              size="sm"
                              aria-label="remove recipe step instrument"
                              onClick={() => {
                                // updatePageState({
                                //   type: 'REMOVE_INSTRUMENT_FROM_STEP',
                                //   stepIndex,
                                //   recipeStepInstrumentIndex,
                                // })
                              }}
                            >
                              <IconTrash size="md" color="tomato" />
                            </ActionIcon>
                          </Grid.Col>
                        </Grid>

                        <Grid>
                          <Grid.Col
                            span={pageState.steps[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex] ? 6 : 12}
                          >
                            <NumberInput
                              min={1}
                              precision={0}
                              label={
                                pageState.steps[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex]
                                  ? 'Min. Quantity'
                                  : 'Quantity'
                              }
                              aria-label="minimum recipe step instrument quantity"
                              required
                              onChange={(value) => {
                                updatePageState({
                                  type: 'UPDATE_STEP_INSTRUMENT_MINIMUM_QUANTITY',
                                  stepIndex,
                                  recipeStepInstrumentIndex,
                                  newAmount: value || 1,
                                });
                              }}
                              value={pageState.steps[stepIndex].instruments[recipeStepInstrumentIndex].minimumQuantity}
                            />
                          </Grid.Col>

                          {pageState.steps[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex] && (
                            <Grid.Col span={6}>
                              <NumberInput
                                min={0}
                                precision={0}
                                label="Max Quantity"
                                onChange={(value) => {
                                  updatePageState({
                                    type: 'UPDATE_STEP_INSTRUMENT_MAXIMUM_QUANTITY',
                                    stepIndex,
                                    recipeStepInstrumentIndex,
                                    newAmount: value || 0,
                                  });
                                }}
                                value={
                                  pageState.steps[stepIndex].instruments[recipeStepInstrumentIndex].maximumQuantity
                                }
                              />
                            </Grid.Col>
                          )}
                        </Grid>
                      </Box>
                    ),
                  )}
                </Stack>

                <Space h="xl" />

                <Divider label="consuming" labelPosition="center" mb="md" />

                <Autocomplete
                  label="Ingredients"
                  required={Boolean(pageState.steps[stepIndex].preparation?.minimumIngredientCount)}
                  value={pageState.steps[stepIndex].ingredientQuery}
                  error={
                    (pageState.steps[stepIndex].preparation?.minimumIngredientCount || -1) >
                    pageState.steps[stepIndex].ingredients.length
                      ? `at least ${pageState.steps[stepIndex].preparation?.minimumIngredientCount} ingredient${
                          pageState.steps[stepIndex].preparation?.minimumIngredientCount === 1 ? '' : 's'
                        } required`
                      : undefined
                  }
                  disabled={
                    pageState.steps[stepIndex].preparation?.name.trim() === '' ||
                    pageState.steps[stepIndex].preparation?.maximumIngredientCount ===
                      pageState.steps[stepIndex].ingredients.length
                  }
                  onChange={(value) => {
                    updatePageState({
                      type: 'UPDATE_STEP_INGREDIENT_QUERY',
                      content: value,
                      stepIndex: stepIndex,
                    });
                  }}
                  onItemSubmit={(item: AutocompleteItem) => {
                    updatePageState({
                      type: 'ADD_INGREDIENT_TO_STEP',
                      stepIndex: stepIndex,
                      ingredientName: item.value,
                    });
                  }}
                  data={(
                    determineAvailableRecipeStepProducts(pageState.steps, stepIndex).concat(
                      pageState.steps[stepIndex].ingredientSuggestions,
                    ) || []
                  ).map((x: RecipeStepIngredient) => ({
                    value: x.ingredient?.name || x.name || 'UNKNOWN',
                    label: x.ingredient?.name || x.name || 'UNKNOWN',
                  }))}
                />

                {(pageState.steps[stepIndex].ingredients || []).map(
                  (ingredient: RecipeStepIngredient, recipeStepIngredientIndex: number) => (
                    <Box key={recipeStepIngredientIndex}>
                      <Grid>
                        <Grid.Col span="auto">
                          <Text mt="xl">{`${ingredient.ingredient?.name || ingredient.name}`}</Text>
                        </Grid.Col>

                        <Grid.Col span="content">
                          <Switch
                            mt="sm"
                            size="md"
                            onLabel="ranged"
                            offLabel="simple"
                            value={
                              pageState.steps[stepIndex].ingredientIsRanged[recipeStepIngredientIndex]
                                ? 'ranged'
                                : 'simple'
                            }
                            onChange={() => {
                              updatePageState({
                                type: 'TOGGLE_INGREDIENT_RANGE',
                                stepIndex,
                                recipeStepIngredientIndex,
                              });
                            }}
                          />
                        </Grid.Col>

                        <Grid.Col span="content" mt="sm">
                          <ActionIcon
                            mt="sm"
                            variant="outline"
                            size="sm"
                            aria-label="remove recipe step ingredient"
                            onClick={() => {
                              // updatePageState({
                              //   type: 'REMOVE_INGREDIENT_FROM_STEP',
                              //   stepIndex,
                              //   recipeStepIngredientIndex,
                              // })
                            }}
                          >
                            <IconTrash size="md" color="tomato" />
                          </ActionIcon>
                        </Grid.Col>
                      </Grid>

                      <Grid>
                        <Grid.Col span={6}>
                          <NumberInput
                            label={
                              pageState.steps[stepIndex].ingredientIsRanged[recipeStepIngredientIndex]
                                ? 'Min. Quantity'
                                : 'Quantity'
                            }
                            aria-label="minimum recipe step ingredient quantity"
                            required
                            min={1}
                            precision={0}
                            onChange={(value) => {
                              updatePageState({
                                type: 'UPDATE_STEP_INGREDIENT_MINIMUM_QUANTITY',
                                stepIndex,
                                recipeStepIngredientIndex,
                                newAmount: value || 1,
                              });
                            }}
                            value={ingredient.minimumQuantity}
                          />
                        </Grid.Col>

                        {pageState.steps[stepIndex].ingredientIsRanged[recipeStepIngredientIndex] && (
                          <Grid.Col span={6}>
                            <NumberInput
                              precision={0}
                              label="Max Quantity"
                              onChange={(value) => {
                                updatePageState({
                                  type: 'UPDATE_STEP_INGREDIENT_MAXIMUM_QUANTITY',
                                  stepIndex,
                                  recipeStepIngredientIndex,
                                  newAmount: value || 1,
                                });
                              }}
                              value={ingredient.maximumQuantity}
                            />
                          </Grid.Col>
                        )}

                        <Grid.Col
                          span={pageState.steps[stepIndex].ingredientIsRanged[recipeStepIngredientIndex] ? 12 : 6}
                        >
                          <Select
                            label="Measurement"
                            required
                            value={ingredient.measurementUnit.pluralName}
                            onChange={(value: string) => {
                              // updatePageState({
                              //   type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT',
                              //   stepIndex,
                              //   recipeStepIngredientIndex,
                              //   measurementUnit: (
                              //     pageState.ingredientMeasurementUnitSuggestions[stepIndex][recipeStepIngredientIndex] ||
                              //     []
                              //   ).find(
                              //     (ingredientMeasurementUnitSuggestion: ValidMeasurementUnit) =>
                              //       ingredientMeasurementUnitSuggestion.pluralName === value,
                              //   ),
                              // });
                            }}
                            data={(
                              pageState.steps[stepIndex].ingredientMeasurementUnitSuggestions[
                                recipeStepIngredientIndex
                              ] || []
                            ).map((y: ValidMeasurementUnit) => ({
                              value: y.pluralName,
                              label: y.pluralName,
                            }))}
                          />
                        </Grid.Col>
                      </Grid>
                    </Box>
                  ),
                )}

                <Divider label="until" labelPosition="center" my="md" />

                {(pageState.steps[stepIndex].completionConditions || []).map(
                  (completionCondition: RecipeStepCompletionCondition, conditionIndex: number) => {
                    return (
                      <Grid key={conditionIndex}>
                        <Grid.Col span="auto">
                          <Select
                            disabled={
                              pageState.steps[stepIndex].ingredients.length === 0 ||
                              !completionCondition.ingredientState.id
                            }
                            label="Add Ingredient"
                            required
                            data={pageState.steps[stepIndex].ingredients
                              .filter((x: RecipeStepIngredient) => x.ingredient)
                              .map((x: RecipeStepIngredient) => {
                                return {
                                  value: x.ingredient!.name || x.name,
                                  label: x.ingredient!.name || x.name,
                                };
                              })}
                          />
                        </Grid.Col>

                        <Grid.Col span="auto">
                          <Autocomplete
                            label="Ingredient State"
                            required
                            disabled={pageState.steps[stepIndex].ingredients.length === 0}
                            value={pageState.steps[stepIndex].completionConditionIngredientStateQueries[conditionIndex]}
                            data={pageState.steps[stepIndex].completionConditionIngredientStateSuggestions[
                              conditionIndex
                            ].map((x: ValidIngredientState) => {
                              return {
                                value: x.name,
                                label: x.name,
                              };
                            })}
                            onChange={(value) => {
                              // updatePageState({
                              //   type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY',
                              //   stepIndex,
                              //   conditionIndex,
                              //   query: value,
                              // });
                            }}
                            onItemSubmit={(value: AutocompleteItem) => {
                              // updatePageState({
                              //   type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE',
                              //   stepIndex,
                              //   conditionIndex,
                              //   ingredientState: pageState.completionConditionIngredientStateSuggestions[stepIndex][
                              //     conditionIndex
                              //   ].find((x: ValidIngredientState) => x.name === value.value),
                              // });
                            }}
                          />
                        </Grid.Col>

                        <Grid.Col span="content" mt="xl">
                          <ActionIcon
                            mt={5}
                            style={{ float: 'right' }}
                            variant="outline"
                            size="md"
                            aria-label="remove condition"
                            onClick={() => {
                              // updatePageState({
                              //   type: 'REMOVE_RECIPE_STEP_COMPLETION_CONDITION',
                              //   stepIndex,
                              //   conditionIndex,
                              // })
                            }}
                          >
                            <IconTrash size="md" color="tomato" />
                          </ActionIcon>
                        </Grid.Col>
                      </Grid>
                    );
                  },
                )}

                <Grid>
                  <Grid.Col span="auto">
                    <Center>
                      <Button
                        mt="sm"
                        disabled={addingStepCompletionConditionsShouldBeDisabled(step)}
                        style={{
                          cursor: addingStepCompletionConditionsShouldBeDisabled(step) ? 'not-allowed' : 'pointer',
                        }}
                        onClick={() => {
                          // updatePageState({
                          //   type: 'ADD_COMPLETION_CONDITION_TO_STEP',
                          //   stepIndex,
                          // });
                        }}
                      >
                        Add Condition
                      </Button>
                    </Center>
                  </Grid.Col>
                </Grid>

                <Divider label="producing" labelPosition="center" my="md" />

                {(pageState.steps[stepIndex].products || []).map((product: RecipeStepProduct, productIndex: number) => {
                  return (
                    <Grid key={productIndex}>
                      <Grid.Col span="content">
                        <Switch
                          mt="lg"
                          size="md"
                          onLabel="ranged"
                          offLabel="simple"
                          value={pageState.steps[stepIndex].productIsRanged[productIndex] ? 'ranged' : 'simple'}
                          onChange={() => {
                            updatePageState({
                              type: 'TOGGLE_PRODUCT_RANGE',
                              stepIndex,
                              productIndex,
                            });
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col md="auto" sm={12}>
                        <Select
                          label="Type"
                          value={product.type}
                          data={['ingredient', 'instrument']}
                          onChange={(value: string) => {
                            // updatePageState({
                            //   type: 'UPDATE_STEP_PRODUCT_TYPE',
                            //   stepIndex,
                            //   productIndex,
                            //   newType: ['ingredient', 'instrument'].includes(value)
                            //     ? (value as ValidRecipeStepProductType)
                            //     : 'ingredient',
                            // });
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col md="auto" sm={12}>
                        <NumberInput
                          required
                          min={0}
                          label={
                            pageState.steps[stepIndex].productIsRanged[productIndex] ? 'Min. Quantity' : 'Quantity'
                          }
                          aria-label="minimum recipe step product quantity"
                          disabled={
                            product.type === 'ingredient' && pageState.steps[stepIndex].ingredients.length === 0
                          }
                          onChange={(value) => {
                            updatePageState({
                              type: 'UPDATE_STEP_PRODUCT_MINIMUM_QUANTITY',
                              stepIndex,
                              productIndex,
                              newAmount: value || 1,
                            });
                          }}
                          value={product.minimumQuantity}
                        />
                      </Grid.Col>

                      {pageState.steps[stepIndex].productIsRanged[productIndex] && (
                        <Grid.Col md="auto" sm={12}>
                          <NumberInput
                            min={0}
                            label="Max Quantity"
                            disabled={
                              product.type === 'ingredient' && pageState.steps[stepIndex].ingredients.length === 0
                            }
                            onChange={(value) => {
                              updatePageState({
                                type: 'UPDATE_STEP_PRODUCT_MAXIMUM_QUANTITY',
                                stepIndex,
                                productIndex,
                                newAmount: value || 1,
                              });
                            }}
                            value={product.maximumQuantity}
                          />
                        </Grid.Col>
                      )}

                      <Grid.Col md="auto" sm={12}>
                        <Autocomplete
                          required
                          label="Measurement"
                          disabled={
                            product.type === 'instrument' ||
                            (product.type === 'ingredient' && pageState.steps[stepIndex].ingredients.length === 0)
                          }
                          value={pageState.steps[stepIndex].productMeasurementUnitQueries[productIndex]}
                          data={(pageState.steps[stepIndex].productMeasurementUnitSuggestions[productIndex] || []).map(
                            (y: ValidMeasurementUnit) => ({
                              value: y.pluralName,
                              label: y.pluralName,
                            }),
                          )}
                          onItemSubmit={(value: AutocompleteItem) => {
                            // updatePageState({
                            //   type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT',
                            //   stepIndex,
                            //   productIndex,
                            //   measurementUnit: (
                            //     pageState.productMeasurementUnitSuggestions[stepIndex][productIndex] || []
                            //   ).find(
                            //     (productMeasurementUnitSuggestion: ValidMeasurementUnit) =>
                            //       productMeasurementUnitSuggestion.pluralName === value.value,
                            //   ),
                            // });
                          }}
                          onChange={(value) => {
                            // updatePageState({
                            //   type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY',
                            //   stepIndex,
                            //   productIndex,
                            //   query: value,
                            // })
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col span="auto">
                        <TextInput
                          required
                          label="Name"
                          disabled={pageState.steps[stepIndex].productsNamedManually[productIndex]}
                          value={product.name}
                          onChange={(event) => {
                            // updatePageState({
                            //   type: 'UPDATE_STEP_PRODUCT_NAME',
                            //   stepIndex,
                            //   productIndex,
                            //   newName: event.target.value || '',
                            // })
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col span="content" mt="xl">
                        <ActionIcon
                          mt={5}
                          style={{ float: 'right' }}
                          variant="outline"
                          size="md"
                          aria-label="add product"
                          disabled={
                            product.type === 'ingredient' && pageState.steps[stepIndex].ingredients.length === 0
                          }
                          onClick={() => {
                            updatePageState({
                              type: 'TOGGLE_MANUAL_PRODUCT_NAMING',
                              stepIndex,
                              productIndex,
                            });
                          }}
                        >
                          <IconPencil size="md" />
                        </ActionIcon>
                      </Grid.Col>

                      {productIndex === 0 && (
                        <Grid.Col span="content" mt="xl">
                          <ActionIcon
                            mt={5}
                            style={{ float: 'right' }}
                            variant="outline"
                            size="md"
                            aria-label="add product"
                            disabled
                            onClick={() => {}}
                          >
                            <IconPlus size="md" />
                          </ActionIcon>
                        </Grid.Col>
                      )}
                    </Grid>
                  );
                })}
              </Grid.Col>
            </Grid>
          </Card.Section>
        </Collapse>
      </Card>
    );
  });

  return (
    <AppLayout title="New Recipe" containerSize="xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitRecipe();
        }}
      >
        <Grid>
          <Grid.Col md={4} sm={12}>
            <Stack>
              <Stack>
                <TextInput
                  withAsterisk
                  label="Name"
                  value={pageState.name}
                  onChange={(event) => updatePageState({ type: 'SET_RECIPE_NAME', content: event.target.value })}
                  mt="xs"
                />

                <NumberInput
                  label="Portions"
                  required
                  min={1}
                  precision={0}
                  value={pageState.yieldsPortions}
                  onChange={(portions: number) =>
                    updatePageState({ type: 'SET_RECIPE_PORTION_YIELD', portions: portions })
                  }
                  mt="xs"
                />

                <TextInput
                  label="Source"
                  value={pageState.source}
                  onChange={(event) => updatePageState({ type: 'SET_RECIPE_SOURCE', content: event.target.value })}
                  mt="xs"
                />

                <Textarea
                  label="Description"
                  value={pageState.description}
                  onChange={(event) => updatePageState({ type: 'SET_RECIPE_DESCRIPTION', content: event.target.value })}
                  minRows={4}
                  mt="xs"
                />

                <Button onClick={submitRecipe} disabled={recipeIsReadyForSubmission()}>
                  Save
                </Button>
              </Stack>

              <Divider />

              <Grid justify="space-between" align="center">
                <Grid.Col span="auto">
                  <Title order={4}>All Ingredients</Title>
                </Grid.Col>

                <Grid.Col span="auto">
                  <ActionIcon
                    variant="outline"
                    size="sm"
                    style={{ float: 'right' }}
                    aria-label="show all ingredients"
                    onClick={() => updatePageState({ type: 'TOGGLE_SHOW_ALL_INGREDIENTS' })}
                  >
                    {(pageState.showIngredientsSummary && <IconChevronUp size={16} color="gray" />) || (
                      <IconChevronDown size={16} color="gray" />
                    )}
                  </ActionIcon>
                </Grid.Col>
              </Grid>

              <Divider />

              <Collapse sx={{ minHeight: '10rem' }} in={pageState.showIngredientsSummary}>
                <Box />
              </Collapse>

              <Grid justify="space-between" align="center">
                <Grid.Col span="auto">
                  <Title order={4}>All Instruments</Title>
                </Grid.Col>
                <Grid.Col span="auto">
                  <ActionIcon
                    variant="outline"
                    size="sm"
                    style={{ float: 'right' }}
                    aria-label="show all instruments"
                    onClick={() => updatePageState({ type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' })}
                  >
                    {(pageState.showInstrumentsSummary && <IconChevronUp size={16} color="gray" />) || (
                      <IconChevronDown size={16} color="gray" />
                    )}
                  </ActionIcon>
                </Grid.Col>
              </Grid>

              <Divider />

              <Collapse sx={{ minHeight: '10rem' }} in={pageState.showInstrumentsSummary}>
                <Box>{/* TODO */}</Box>
              </Collapse>

              <Grid justify="space-between" align="center">
                <Grid.Col span="auto">
                  <Title order={4}>Advanced Prep</Title>
                </Grid.Col>
                <Grid.Col span="auto">
                  <ActionIcon
                    variant="outline"
                    size="sm"
                    style={{ float: 'right' }}
                    aria-label="show advanced prep tasks"
                    onClick={() => updatePageState({ type: 'TOGGLE_SHOW_ADVANCED_PREP_STEPS' })}
                  >
                    {(pageState.showAdvancedPrepStepInputs && <IconChevronUp size={16} color="gray" />) || (
                      <IconChevronDown size={16} color="gray" />
                    )}
                  </ActionIcon>
                </Grid.Col>
              </Grid>

              <Collapse sx={{ minHeight: '10rem' }} in={pageState.showAdvancedPrepStepInputs}>
                <Box>{/* TODO */}</Box>
              </Collapse>

              <Divider />
            </Stack>
          </Grid.Col>

          <Grid.Col span="auto" mt={'2.2rem'} mb="xl">
            {steps}
            <Button
              fullWidth
              // onClick={() => updatePageState({ type: 'ADD_STEP' })}
              mb="xl"
              disabled={
                pageState.steps.filter((x: NewRecipeStepCreationPageState) => {
                  return x.preparation?.id === '';
                }).length !== 0
              }
            >
              Add Step
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </AppLayout>
  );
}

export default RecipesPage;
