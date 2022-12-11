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
  AutocompleteItem,
  NumberInput,
  Select,
  Switch,
  Space,
  Collapse,
  Box,
  Title,
  Center,
} from '@mantine/core';
import { AxiosResponse, AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { IconChevronDown, IconChevronUp, IconPencil, IconPlus, IconTrash } from '@tabler/icons';
import { useEffect, useReducer } from 'react';
import { z } from 'zod';
import { useImmer } from 'use-immer';

import {
  Recipe,
  RecipeStep,
  RecipeStepCompletionCondition,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeStepProduct,
  ValidIngredient,
  ValidIngredientState,
  ValidMeasurementUnit,
  ValidPreparation,
  ValidPreparationInstrument,
  ValidRecipeStepProductType,
} from '@prixfixeco/models';
import { determineAvailableRecipeStepProducts } from '@prixfixeco/pfutils';

import { AppLayout } from '../../lib/layouts';
import { buildLocalClient } from '../../lib/client';
import { NewRecipeCreationPageState, NewRecipeStepCreationPageState } from '../../lib/reducers';

function RecipesPage() {
  // const router = useRouter();

  const [pageState, updatePageState] = useImmer(new NewRecipeCreationPageState());

  // const recipeIsReadyForSubmission = (): boolean => {
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

  //   const evaluatedResult = recipeCreationFormSchema.safeParse(pageState.recipe);

  //   return !Boolean(evaluatedResult.success);
  // };

  // const submitRecipe = async () => {
  //   const apiClient = buildLocalClient();
  //   apiClient
  //     .createRecipe(Recipe.toCreationRequestInput(pageState.recipe))
  //     .then((res: AxiosResponse<Recipe>) => {
  //       router.push(`/meals/${res.data.id}`);
  //     })
  //     .catch((err: AxiosError) => {
  //       console.error(`Failed to create meal: ${err}`);
  //     });
  // };

  // useEffect(() => {
  //   const apiClient = buildLocalClient();
  //   if ((pageState.preparationQueryToExecute?.query || '').length > 2) {
  //     apiClient
  //       .searchForValidPreparations(pageState.preparationQueryToExecute!.query)
  //       .then((res: AxiosResponse<ValidPreparation[]>) => {
  //         updatePageState({
  //           type: 'UPDATE_STEP_PREPARATION_QUERY_RESULTS',
  //           stepIndex: pageState.preparationQueryToExecute!.stepIndex,
  //           results: res.data,
  //         });
  //       })
  //       .catch((err: AxiosError) => {
  //         console.error(`Failed to get preparations: ${err}`);
  //       });
  //   }
  // }, [pageState.preparationQueryToExecute]);

  // useEffect(() => {
  //   const apiClient = buildLocalClient();
  //   if ((pageState.completionConditionIngredientStateQueryToExecute?.query || '').length > 2) {
  //     apiClient
  //       .searchForValidIngredientStates(pageState.completionConditionIngredientStateQueryToExecute!.query)
  //       .then((res: AxiosResponse<ValidIngredientState[]>) => {
  //         updatePageState({
  //           type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY_RESULTS',
  //           stepIndex: pageState.completionConditionIngredientStateQueryToExecute!.stepIndex,
  //           conditionIndex: pageState.completionConditionIngredientStateQueryToExecute!.secondaryIndex!,
  //           results: res.data,
  //         });
  //       })
  //       .catch((err: AxiosError) => {
  //         console.error(`Failed to get preparations: ${err}`);
  //       });
  //   }
  // }, [pageState.completionConditionIngredientStateQueryToExecute]);

  // useEffect(() => {
  //   const apiClient = buildLocalClient();
  //   if ((pageState.ingredientQueryToExecute?.query || '').length > 2) {
  //     apiClient
  //       .searchForValidIngredients(pageState.ingredientQueryToExecute!.query)
  //       .then((res: AxiosResponse<ValidIngredient[]>) => {
  //         updatePageState({
  //           type: 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS',
  //           stepIndex: pageState.ingredientQueryToExecute!.stepIndex,
  //           results: (
  //             res.data.filter((validIngredient: ValidIngredient) => {
  //               let found = false;

  //               (pageState.steps[pageState.ingredientQueryToExecute!.stepIndex]?.ingredients || []).forEach(
  //                 (ingredient) => {
  //                   if ((ingredient.ingredient?.id || '') === validIngredient.id) {
  //                     found = true;
  //                   }
  //                 },
  //               );

  //               // return true if the ingredient is not already used by another ingredient in the step
  //               return !found;
  //             }) || []
  //           ).map(
  //             (validIngredient: ValidIngredient) =>
  //               new RecipeStepIngredient({
  //                 ingredient: validIngredient,
  //                 minimumQuantity: 1,
  //                 maximumQuantity: 1,
  //               }),
  //           ),
  //         });
  //       })
  //       .catch((err: AxiosError) => {
  //         console.error(`Failed to get ingredients: ${err}`);
  //       });
  //   }
  // }, [pageState.ingredientQueryToExecute, pageState.steps]);

  // useEffect(() => {
  //   const apiClient = buildLocalClient();
  //   if ((pageState.instrumentQueryToExecute?.query || '').length > 2) {
  //     apiClient
  //       .validPreparationInstrumentsForPreparationID(pageState.instrumentQueryToExecute!.query)
  //       .then((res: AxiosResponse<QueryFilteredResult<ValidPreparationInstrument>>) => {
  //         updatePageState({
  //           type: 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS',
  //           stepIndex: pageState.instrumentQueryToExecute!.stepIndex,
  //           results: (res.data.data || []).map(
  //             (validPreparationInstrument: ValidPreparationInstrument) =>
  //               new RecipeStepInstrument({
  //                 instrument: validPreparationInstrument.instrument,
  //                 displayInSummaryLists: false,
  //                 notes: '',
  //                 preferenceRank: 0,
  //                 optional: false,
  //                 optionIndex: 0,
  //               }),
  //           ),
  //         });

  //         return res.data.data || [];
  //       })
  //       .then((instruments: ValidPreparationInstrument[]) => {
  //         if (instruments.length === 1 && false) {
  //           // disabled: automatically set the instrument when only one is present
  //           updatePageState({
  //             type: 'ADD_INSTRUMENT_TO_STEP',
  //             stepIndex: pageState.instrumentQueryToExecute!.stepIndex,
  //             instrumentName: instruments[0].instrument.name,
  //           });
  //         }
  //       })
  //       .catch((err: AxiosError) => {
  //         console.error(`Failed to get preparation instruments: ${err}`);
  //       });
  //   }
  // }, [pageState.instrumentQueryToExecute]);

  // useEffect(() => {
  //   const apiClient = buildLocalClient();
  //   if ((pageState.ingredientMeasurementUnitQueryToExecute?.query || '').length > 2) {
  //     apiClient
  //       .searchForValidMeasurementUnitsByIngredientID(pageState.ingredientMeasurementUnitQueryToExecute!.query)
  //       .then((res: AxiosResponse<QueryFilteredResult<ValidMeasurementUnit>>) => {
  //         updatePageState({
  //           type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY_RESULTS',
  //           stepIndex: pageState.ingredientMeasurementUnitQueryToExecute!.stepIndex,
  //           recipeStepIngredientIndex: pageState.ingredientMeasurementUnitQueryToExecute!.secondaryIndex!,
  //           results: res.data.data || [],
  //         });
  //         return res.data || [];
  //       })
  //       .then((data: ValidMeasurementUnitList) => {
  //         if (data.data.length === 1 && false) {
  //           // disabled: automatically set the ingredient measurement unit when only one is present
  //           updatePageState({
  //             type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT',
  //             stepIndex: pageState.ingredientMeasurementUnitQueryToExecute!.stepIndex,
  //             recipeStepIngredientIndex: pageState.ingredientMeasurementUnitQueryToExecute!.secondaryIndex!,
  //             measurementUnit: data.data[0],
  //           });
  //         }
  //       })
  //       .catch((err: AxiosError) => {
  //         console.error(`Failed to get ingredient measurement units: ${err}`);
  //       });
  //   }
  // }, [pageState.ingredientMeasurementUnitQueryToExecute]);

  // useEffect(() => {
  //   const apiClient = buildLocalClient();
  //   if ((pageState.productMeasurementUnitQueryToExecute?.query || '').length > 2) {
  //     apiClient
  //       .searchForValidMeasurementUnits(pageState.productMeasurementUnitQueryToExecute!.query)
  //       .then((res: AxiosResponse<ValidMeasurementUnit[]>) => {
  //         updatePageState({
  //           type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY_RESULTS',
  //           stepIndex: pageState.productMeasurementUnitQueryToExecute!.stepIndex,
  //           productIndex: pageState.productMeasurementUnitQueryToExecute!.secondaryIndex!,
  //           results: res.data || [],
  //         });
  //       })
  //       .catch((err: AxiosError) => {
  //         console.error(`Failed to get ingredient measurement units: ${err}`);
  //       });
  //   }
  // }, [pageState.productMeasurementUnitQueryToExecute]);

  // const addingStepCompletionConditionsShouldBeDisabled = (step: NewRecipeStepCreationPageState): boolean => {
  //   return (
  //     step.completionConditions.length > 0 &&
  //     step.completionConditions[step.completionConditions.length - 1].ingredientState.id === '' &&
  //     step.completionConditions[step.completionConditions.length - 1].ingredients.length === 0
  //   );
  // };

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
              {/* <ActionIcon
                variant="outline"
                size="sm"
                style={{ float: 'right' }}
                aria-label="remove step"
                disabled={(pageState.steps || []).length === 1 && pageState.showSteps[stepIndex]}
                onClick={() => updatePageState({ type: 'TOGGLE_SHOW_STEP', stepIndex: stepIndex })}
              >
                {pageState.showSteps[stepIndex] ? (
                  <IconChevronUp size={16} color={(pageState.steps || []).length === 1 ? 'gray' : 'black'} />
                ) : (
                  <IconChevronDown size={16} color={(pageState.steps || []).length === 1 ? 'gray' : 'black'} />
                )}
              </ActionIcon> */}
            </Grid.Col>
            <Grid.Col span="content">
              {/* <ActionIcon
                variant="outline"
                size="sm"
                style={{ float: 'right' }}
                aria-label="remove step"
                disabled={(pageState.steps || []).length === 1}
                onClick={() => updatePageState({ type: 'REMOVE_STEP', stepIndex: stepIndex })}
              >
                <IconTrash size={16} color={(pageState.steps || []).length === 1 ? 'gray' : 'tomato'} />
              </ActionIcon> */}
            </Grid.Col>
          </Grid>
        </Card.Section>

        <Collapse in={pageState.stepHelpers[stepIndex].show}>
          {/* this is the first input section */}
          <Card.Section px="xs" pb="xs">
            <Grid>
              <Grid.Col md="auto" sm={12}>
                <Textarea
                  label="Notes"
                  value={step.notes}
                  minRows={2}
                  onChange={() => {}}
                  // onChange={(event) =>
                  //   updatePageState({
                  //     type: 'UPDATE_STEP_NOTES',
                  //     stepIndex: stepIndex,
                  //     newDescription: event.target.value,
                  //   })
                  // }
                />

                <Space h="xl" />

                <Stack>
                  <Autocomplete
                    label="Preparation"
                    required
                    tabIndex={0}
                    value={''}
                    data={[]}
                    // value={pageState.preparationQueries[stepIndex]}
                    onChange={() => {}}
                    // onChange={(value) =>
                    //   updatePageState({
                    //     type: 'UPDATE_STEP_PREPARATION_QUERY',
                    //     stepIndex: stepIndex,
                    //     newQuery: value,
                    //   })
                    // }
                    // data={(pageState.preparationSuggestions[stepIndex] || [])
                    //   .filter((validPreparation: ValidPreparation) => {
                    //     return validPreparation.name !== step.preparation.name;
                    //   })
                    //   .map((validPreparation: ValidPreparation) => ({
                    //     value: validPreparation.name,
                    //     label: validPreparation.name,
                    //   }))}
                    // onItemSubmit={(value) => {
                    //   updatePageState({
                    //     type: 'UPDATE_STEP_PREPARATION',
                    //     stepIndex: stepIndex,
                    //     preparationName: value.value,
                    //   });
                    // }}
                  />

                  <Divider label="using" labelPosition="center" mb="md" />

                  <Select
                    label="Instrument(s)"
                    required
                    data={[]}
                    // error={
                    //   step.preparation.minimumInstrumentCount > step.instruments.length
                    //     ? `at least ${step.preparation.minimumInstrumentCount} instrument${
                    //         step.preparation.minimumInstrumentCount === 1 ? '' : 's'
                    //       } required`
                    //     : undefined
                    // }
                    // disabled={
                    //   (step.preparation.maximumInstrumentCount || Number.MAX_SAFE_INTEGER) <= step.instruments.length ||
                    //   determinePreparedInstrumentOptions(pageState.recipe, stepIndex)
                    //     .concat(pageState.instrumentSuggestions[stepIndex] || [])
                    //     // don't show instruments that have already been added
                    //     .filter((recipeStepInstrument: RecipeStepInstrument) => {
                    //       return !step.instruments.find(
                    //         (recipeStepInstrument: RecipeStepInstrument) => recipeStepInstrument.name === recipeStepInstrument.instrument?.name || recipeStepInstrument.name === recipeStepInstrument.name,
                    //       );
                    //     }).length === 0
                    // }
                    // description={
                    //   (step.preparation.maximumInstrumentCount || Number.MAX_SAFE_INTEGER) <= step.instruments.length
                    //     ? `maximum instruments added`
                    //     : ``
                    // }
                    onChange={() => {}}
                    // onChange={(instrument) => {
                    //   if (instrument) {
                    //     updatePageState({
                    //       type: 'ADD_INSTRUMENT_TO_STEP',
                    //       stepIndex: stepIndex,
                    //       instrumentName: instrument,
                    //     });
                    //   }
                    // }}
                    value={'Select an instrument'}
                    // data={determinePreparedInstrumentOptions(pageState.recipe, stepIndex)
                    //   .concat(pageState.instrumentSuggestions[stepIndex] || [])
                    //   // don't show instruments that have already been added
                    //   .filter((recipeStepInstrument: RecipeStepInstrument) => {
                    //     return !step.instruments.find(
                    //       (recipeStepInstrument: RecipeStepInstrument) => recipeStepInstrument.name === recipeStepInstrument.instrument?.name || recipeStepInstrument.name === recipeStepInstrument.name,
                    //     );
                    //   })
                    //   .map((recipeStepInstrument: RecipeStepInstrument) => ({
                    //     value: recipeStepInstrument.instrument?.name || recipeStepInstrument.name || 'UNKNOWN',
                    //     label: recipeStepInstrument.instrument?.name || recipeStepInstrument.name || 'UNKNOWN',
                    //   }))}
                  />

                  {/*

                  {(step.instruments || []).map(
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
                                pageState.instrumentIsRanged[stepIndex][recipeStepInstrumentIndex] ? 'ranged' : 'simple'
                              }
                              onChange={() =>
                                updatePageState({
                                  type: 'TOGGLE_INSTRUMENT_RANGE',
                                  stepIndex,
                                  recipeStepInstrumentIndex,
                                })
                              }
                            />
                          </Grid.Col>

                          <Grid.Col span="content" mt="sm">
                            <ActionIcon
                              mt="sm"
                              variant="outline"
                              size="sm"
                              aria-label="remove recipe step instrument"
                              onClick={() =>
                                updatePageState({
                                  type: 'REMOVE_INSTRUMENT_FROM_STEP',
                                  stepIndex,
                                  recipeStepInstrumentIndex,
                                })
                              }
                            >
                              <IconTrash size="md" color="tomato" />
                            </ActionIcon>
                          </Grid.Col>
                        </Grid>

                        <Grid>
                          <Grid.Col span={pageState.instrumentIsRanged[stepIndex][recipeStepInstrumentIndex] ? 6 : 12}>
                            <NumberInput
                              label={
                                pageState.instrumentIsRanged[stepIndex][recipeStepInstrumentIndex]
                                  ? 'Min. Quantity'
                                  : 'Quantity'
                              }
                              required
                              onChange={(value) =>
                                updatePageState({
                                  type: 'UPDATE_STEP_INSTRUMENT_MINIMUM_QUANTITY',
                                  stepIndex,
                                  recipeStepInstrumentIndex,
                                  newAmount: value || -1,
                                })
                              }
                              value={step.instruments[recipeStepInstrumentIndex].minimumQuantity}
                              maxLength={0}
                            />
                          </Grid.Col>

                          {pageState.instrumentIsRanged[stepIndex][recipeStepInstrumentIndex] && (
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Max Quantity"
                                maxLength={0}
                                onChange={(value) =>
                                  updatePageState({
                                    type: 'UPDATE_STEP_INSTRUMENT_MAXIMUM_QUANTITY',
                                    stepIndex,
                                    recipeStepInstrumentIndex,
                                    newAmount: value || -1,
                                  })
                                }
                                value={step.instruments[recipeStepInstrumentIndex].maximumQuantity}
                              />
                            </Grid.Col>
                          )}
                        </Grid>
                      </Box>
                    ),
                  )}

                   */}
                </Stack>

                <Space h="xl" />

                <Divider label="consuming" labelPosition="center" mb="md" />

                <Autocomplete label="Ingredients" value={''} data={[]} />

                {/*

                <Autocomplete
                  label="Ingredients"
                  required={Boolean(step.preparation.minimumIngredientCount)}
                  value={pageState.ingredientQueries[stepIndex]}
                  error={
                    step.preparation.minimumIngredientCount > step.ingredients.length
                      ? `at least ${step.preparation.minimumIngredientCount} ingredient${
                          step.preparation.minimumIngredientCount === 1 ? '' : 's'
                        } required`
                      : undefined
                  }
                  disabled={
                    step.preparation.name.trim() === '' ||
                    step.preparation.maximumIngredientCount === step.ingredients.length
                  }
                  onChange={(value) =>
                    updatePageState({
                      type: 'UPDATE_STEP_INGREDIENT_QUERY',
                      newQuery: value,
                      stepIndex: stepIndex,
                    })
                  }
                  onItemSubmit={(item: AutocompleteItem) => {
                    updatePageState({
                      type: 'ADD_INGREDIENT_TO_STEP',
                      stepIndex: stepIndex,
                      ingredientName: item.value,
                    });
                  }}
                  data={(
                    determineAvailableRecipeStepProducts(pageState.recipe, stepIndex).concat(
                      pageState.ingredientSuggestions[stepIndex],
                    ) || []
                  ).map((recipeStepIngredient: RecipeStepIngredient) => ({
                    value: recipeStepIngredient.ingredient?.name || recipeStepIngredient.name || 'UNKNOWN',
                    label: recipeStepIngredient.ingredient?.name || recipeStepIngredient.name || 'UNKNOWN',
                  }))}
                />

                */}

                {/*

                {(step.ingredients || []).map((ingredient: RecipeStepIngredient, recipeStepIngredientIndex: number) => (
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
                            pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex] ? 'ranged' : 'simple'
                          }
                          onChange={() =>
                            updatePageState({
                              type: 'TOGGLE_INGREDIENT_RANGE',
                              stepIndex,
                              recipeStepIngredientIndex,
                            })
                          }
                        />
                      </Grid.Col>

                      <Grid.Col span="content" mt="sm">
                        <ActionIcon
                          mt="sm"
                          variant="outline"
                          size="sm"
                          aria-label="remove recipe step ingredient"
                          onClick={() =>
                            updatePageState({
                              type: 'REMOVE_INGREDIENT_FROM_STEP',
                              stepIndex,
                              recipeStepIngredientIndex,
                            })
                          }
                        >
                          <IconTrash size="md" color="tomato" />
                        </ActionIcon>
                      </Grid.Col>
                    </Grid>

                    <Grid>
                      <Grid.Col span={6}>
                        <NumberInput
                          label={
                            pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex]
                              ? 'Min. Quantity'
                              : 'Quantity'
                          }
                          required
                          onChange={(value) =>
                            updatePageState({
                              type: 'UPDATE_STEP_INGREDIENT_MINIMUM_QUANTITY',
                              stepIndex,
                              recipeStepIngredientIndex,
                              newAmount: value || -1,
                            })
                          }
                          value={ingredient.minimumQuantity}
                        />
                      </Grid.Col>

                      {pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex] && (
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Max Quantity"
                            onChange={(value) =>
                              updatePageState({
                                type: 'UPDATE_STEP_INGREDIENT_MAXIMUM_QUANTITY',
                                stepIndex,
                                recipeStepIngredientIndex,
                                newAmount: value || -1,
                              })
                            }
                            value={ingredient.maximumQuantity}
                          />
                        </Grid.Col>s
                      )}

                      <Grid.Col span={pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex] ? 12 : 6}>
                        <Select
                          label="Measurement"
                          required
                          value={ingredient.measurementUnit.pluralName}
                          data={(
                            pageState.ingredientMeasurementUnitSuggestions[stepIndex][recipeStepIngredientIndex] || []
                          ).map((validMeasurementUnit: ValidMeasurementUnit) => ({
                            value: validMeasurementUnit.pluralName,
                            label: validMeasurementUnit.pluralName,
                          }))}
                          onChange={(value: string) => {
                            updatePageState({
                              type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT',
                              stepIndex,
                              recipeStepIngredientIndex,
                              measurementUnit: (
                                pageState.ingredientMeasurementUnitSuggestions[stepIndex][recipeStepIngredientIndex] ||
                                []
                              ).find(
                                (ingredientMeasurementUnitSuggestion: ValidMeasurementUnit) =>
                                  ingredientMeasurementUnitSuggestion.pluralName === value,
                              ),
                            });
                          }}
                        />
                      </Grid.Col>
                    </Grid>
                  </Box>
                ))}

                */}

                <Divider label="until" labelPosition="center" my="md" />
                {/*

                {(step.completionConditions || []).map(
                  (completionCondition: RecipeStepCompletionCondition, conditionIndex: number) => {
                    return (
                      <Grid key={conditionIndex}>
                        <Grid.Col span="auto">
                          <Select
                            disabled={step.ingredients.length === 0 || !completionCondition.ingredientState.id}
                            label="Add Ingredient"
                            required
                            data={step.ingredients
                              .filter((recipeStepIngredient: RecipeStepIngredient) => recipeStepIngredient.ingredient)
                              .map((recipeStepIngredient: RecipeStepIngredient) => {
                                return {
                                  value: recipeStepIngredient.ingredient!.name || recipeStepIngredient.name,
                                  label: recipeStepIngredient.ingredient!.name || recipeStepIngredient.name,
                                };
                              })}
                          />
                        </Grid.Col>

                        <Grid.Col span="auto">
                          <Autocomplete
                            label="Ingredient State"
                            required
                            disabled={step.ingredients.length === 0}
                            value={pageState.completionConditionIngredientStateQueries[stepIndex][conditionIndex]}
                            data={pageState.completionConditionIngredientStateSuggestions[stepIndex][
                              conditionIndex
                            ].map((validIngredientState: ValidIngredientState) => {
                              return {
                                value: validIngredientState.name,
                                label: validIngredientState.name,
                              };
                            })}
                            onChange={(value) => {
                              updatePageState({
                                type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY',
                                stepIndex,
                                conditionIndex,
                                query: value,
                              });
                            }}
                            onItemSubmit={(value: AutocompleteItem) => {
                              updatePageState({
                                type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE',
                                stepIndex,
                                conditionIndex,
                                ingredientState: pageState.completionConditionIngredientStateSuggestions[stepIndex][
                                  conditionIndex
                                ].find((validIngredientState: ValidIngredientState) => validIngredientState.name === value.value),
                              });
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
                            onClick={() =>
                              updatePageState({
                                type: 'REMOVE_RECIPE_STEP_COMPLETION_CONDITION',
                                stepIndex,
                                conditionIndex,
                              })
                            }
                          >
                            <IconTrash size="md" color="tomato" />
                          </ActionIcon>
                        </Grid.Col>
                      </Grid>
                    );
                  },
                )}
                 */}

                <Grid>
                  <Grid.Col span="auto">
                    <Center>
                      <Button
                        mt="sm"
                        // disabled={addingStepCompletionConditionsShouldBeDisabled(step)}
                        // style={{
                        //   cursor: addingStepCompletionConditionsShouldBeDisabled(step) ? 'not-allowed' : 'pointer',
                        // }}
                        // onClick={() => {
                        //   updatePageState({
                        //     type: 'ADD_COMPLETION_CONDITION_TO_STEP',
                        //     stepIndex,
                        //   });
                        // }}
                      >
                        Add Condition
                      </Button>
                    </Center>
                  </Grid.Col>
                </Grid>

                <Divider label="producing" labelPosition="center" my="md" />

                {/*

                {(step.products || []).map((product: RecipeStepProduct, productIndex: number) => {
                  return (
                    <Grid key={productIndex}>




                      <p>the below grid.col was commented out</p>

                    <Grid.Col span="content">
                      <Switch
                        mt="lg"
                        size="md"
                        onLabel="ranged"
                        offLabel="simple"
                        value={pageState.productIsRanged[stepIndex][productIndex] ? 'ranged' : 'simple'}
                        onChange={() =>
                          updatePageState({
                            type: 'TOGGLE_PRODUCT_RANGE',
                            stepIndex,
                            productIndex,
                          })
                        }
                      />
                    </Grid.Col>

                        <p>the above grid.col was commented out</p>


                      <Grid.Col md="auto" sm={12}>
                        <Select
                          label="Type"
                          value={product.type}
                          data={['ingredient', 'instrument']}
                          onChange={(value: string) => {
                            updatePageState({
                              type: 'UPDATE_STEP_PRODUCT_TYPE',
                              stepIndex,
                              productIndex,
                              newType: ['ingredient', 'instrument'].includes(value)
                                ? (value as ValidRecipeStepProductType)
                                : 'ingredient',
                            });
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col md="auto" sm={12}>
                        <NumberInput
                          required
                          label={pageState.productIsRanged[stepIndex][productIndex] ? 'Min. Quantity' : 'Quantity'}
                          disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                          onChange={(value) =>
                            updatePageState({
                              type: 'UPDATE_STEP_PRODUCT_MINIMUM_QUANTITY',
                              stepIndex,
                              productIndex,
                              newAmount: value || -1,
                            })
                          }
                          value={product.minimumQuantity}
                        />
                      </Grid.Col>

                      {pageState.productIsRanged[stepIndex][productIndex] && (
                        <Grid.Col md="auto" sm={12}>
                          <NumberInput
                            label="Max Quantity"
                            disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                            onChange={(value) =>
                              updatePageState({
                                type: 'UPDATE_STEP_PRODUCT_MAXIMUM_QUANTITY',
                                stepIndex,
                                productIndex,
                                newAmount: value || -1,
                              })
                            }
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
                            (product.type === 'ingredient' && step.ingredients.length === 0)
                          }
                          value={pageState.productMeasurementUnitQueries[stepIndex][productIndex]}
                          data={(pageState.productMeasurementUnitSuggestions[stepIndex][productIndex] || []).map(
                            (validMeasurementUnit: ValidMeasurementUnit) => ({
                              value: validMeasurementUnit.pluralName,
                              label: validMeasurementUnit.pluralName,
                            }),
                          )}
                          onItemSubmit={(value: AutocompleteItem) => {
                            updatePageState({
                              type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT',
                              stepIndex,
                              productIndex,
                              measurementUnit: (
                                pageState.productMeasurementUnitSuggestions[stepIndex][productIndex] || []
                              ).find(
                                (productMeasurementUnitSuggestion: ValidMeasurementUnit) =>
                                  productMeasurementUnitSuggestion.pluralName === value.value,
                              ),
                            });
                          }}
                          onChange={(value) =>
                            updatePageState({
                              type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY',
                              stepIndex,
                              productIndex,
                              query: value,
                            })
                          }
                        />
                      </Grid.Col>

                      <Grid.Col span="auto">
                        <TextInput
                          required
                          label="Name"
                          disabled={pageState.productsNamedManually[stepIndex][productIndex]}
                          value={product.name}
                          onChange={(event) =>
                            updatePageState({
                              type: 'UPDATE_STEP_PRODUCT_NAME',
                              stepIndex,
                              productIndex,
                              newName: event.target.value || '',
                            })
                          }
                        />
                      </Grid.Col>

                      <Grid.Col span="content" mt="xl">
                        <ActionIcon
                          mt={5}
                          style={{ float: 'right' }}
                          variant="outline"
                          size="md"
                          aria-label="add product"
                          disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                          onClick={() =>
                            updatePageState({
                              type: 'TOGGLE_MANUAL_PRODUCT_NAMING',
                              stepIndex,
                              productIndex,
                            })
                          }
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

 */}
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
          // submitRecipe();
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
                  onChange={(event) => {
                    updatePageState((x) => {
                      x.name = event.target.value;
                    });
                  }}
                  // onChange={(event) => updatePageState({ type: 'UPDATE_NAME', newName: event.target.value })}
                  mt="xs"
                />

                <NumberInput
                  label="Portions"
                  required
                  value={pageState.yieldsPortions}
                  onChange={() => {}}
                  // onChange={(value) => updatePageState({ type: 'UPDATE_YIELDS_PORTIONS', newPortions: value })}
                  mt="xs"
                />

                <TextInput
                  label="Source"
                  value={pageState.source}
                  onChange={() => {}}
                  // onChange={(event) => updatePageState({ type: 'UPDATE_SOURCE', newSource: event.target.value })}
                  mt="xs"
                />

                <Textarea
                  label="Description"
                  value={pageState.description}
                  onChange={() => {}}
                  // onChange={(event) =>
                  //   updatePageState({ type: 'UPDATE_DESCRIPTION', newDescription: event.target.value })
                  // }
                  minRows={4}
                  mt="xs"
                />

                <Button>
                  {' '}
                  {/* onClick={submitRecipe} disabled={recipeIsReadyForSubmission()}> */}
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
                    aria-label="remove step"
                    // onClick={() => updatePageState({ type: 'TOGGLE_SHOW_ALL_INGREDIENTS' })}
                  >
                    {/*
                    {(pageState.showIngredientsSummary && <IconChevronUp size={16} color="gray" />) || (
                      <IconChevronDown size={16} color="gray" />
                    )}
                     */}
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
                    aria-label="remove step"
                    // onClick={() => updatePageState({ type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' })}
                  >
                    {/*
                    {(pageState.showInstrumentsSummary && <IconChevronUp size={16} color="gray" />) || (
                      <IconChevronDown size={16} color="gray" />
                    )}
                     */}
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
                    // onClick={() => updatePageState({ type: 'TOGGLE_SHOW_ADVANCED_PREP_STEPS' })}
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
              // disabled={
              //   pageState.steps.filter((recipeStep: RecipeStep) => {
              //     return recipeStep.preparation.id === '';
              //   }).length !== 0
              // }
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
