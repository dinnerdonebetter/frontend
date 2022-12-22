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
import { IconChevronDown, IconChevronUp, IconCircleX, IconPencil, IconPlus, IconTrash } from '@tabler/icons';
import { FormEvent, useReducer } from 'react';
import { z } from 'zod';

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
  QueryFilteredResult,
} from '@prixfixeco/models';
import {
  ConvertRecipeToRecipeCreationRequestInput,
  determineAvailableRecipeStepProducts,
  determinePreparedInstrumentOptions,
} from '@prixfixeco/pfutils';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient } from '../../src/client';
import { useRecipeCreationReducer, RecipeCreationPageState } from '../../src/reducers';

function RecipeCreator() {
  const apiClient = buildLocalClient();
  const router = useRouter();
  const [pageState, updatePageState] = useReducer(useRecipeCreationReducer, new RecipeCreationPageState());

  const recipeIsReadyForSubmission = (): boolean => {
    const recipeCreationFormSchema = z.object({
      name: z.string().min(1, 'name is required').trim(),
      yieldsPortions: z.number().min(1),
      steps: z
        .array(
          z.object({
            preparation: z.object({
              id: z.string().min(1, 'preparation ID is required'),
            }),
          }),
        )
        .min(2),
    });

    const evaluatedResult = recipeCreationFormSchema.safeParse(pageState.recipe);

    return !Boolean(evaluatedResult.success);
  };

  const submitRecipe = async () => {
    const apiClient = buildLocalClient();
    apiClient
      .createRecipe(ConvertRecipeToRecipeCreationRequestInput(pageState.recipe))
      .then((res: AxiosResponse<Recipe>) => {
        router.push(`/meals/${res.data.id}`);
      })
      .catch((err: AxiosError) => {
        console.error(`Failed to create meal: ${err}`);
      });
  };

  const addingStepCompletionConditionsShouldBeDisabled = (step: RecipeStep): boolean => {
    return (
      step.completionConditions.length > 0 &&
      step.completionConditions[step.completionConditions.length - 1].ingredientState.id === '' &&
      step.completionConditions[step.completionConditions.length - 1].ingredients.length === 0
    );
  };

  const steps = (pageState.recipe.steps || []).map((step: RecipeStep, stepIndex: number) => {
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
                data-pf={`toggle-step-${stepIndex}`}
                variant="outline"
                size="sm"
                style={{ float: 'right' }}
                aria-label="show step"
                disabled={(pageState.recipe.steps || []).length === 1 && pageState.stepHelpers[stepIndex].show}
                onClick={() => updatePageState({ type: 'TOGGLE_SHOW_STEP', stepIndex: stepIndex })}
              >
                {pageState.stepHelpers[stepIndex].show ? (
                  <IconChevronUp size={16} color={(pageState.recipe.steps || []).length === 1 ? 'gray' : 'black'} />
                ) : (
                  <IconChevronDown size={16} color={(pageState.recipe.steps || []).length === 1 ? 'gray' : 'black'} />
                )}
              </ActionIcon>
            </Grid.Col>
            <Grid.Col span="content">
              <ActionIcon
                variant="outline"
                size="sm"
                style={{ float: 'right' }}
                aria-label="remove step"
                disabled={(pageState.recipe.steps || []).length === 1}
                onClick={() => updatePageState({ type: 'REMOVE_STEP', stepIndex: stepIndex })}
              >
                <IconTrash size={16} color={(pageState.recipe.steps || []).length === 1 ? 'gray' : 'tomato'} />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        </Card.Section>

        <Collapse in={pageState.stepHelpers[stepIndex].show}>
          {/* this is the first input section */}
          <Card.Section px="xs" pb="xs">
            <Grid>
              <Grid.Col md="auto" sm={12}>
                <Stack>
                  <Autocomplete
                    label="Preparation"
                    required
                    tabIndex={0}
                    value={pageState.stepHelpers[stepIndex].preparationQuery}
                    onChange={async (value: string) => {
                      updatePageState({
                        type: 'UPDATE_STEP_PREPARATION_QUERY',
                        stepIndex: stepIndex,
                        newQuery: value,
                      });

                      if (value.length > 2) {
                        await apiClient
                          .searchForValidPreparations(value)
                          .then((res: AxiosResponse<ValidPreparation[]>) => {
                            updatePageState({
                              type: 'UPDATE_STEP_PREPARATION_SUGGESTIONS',
                              stepIndex: stepIndex,
                              results: res.data,
                            });
                          })
                          .catch((err: AxiosError) => {
                            console.error(`Failed to get preparations: ${err}`);
                          });
                      }
                    }}
                    data={(pageState.stepHelpers[stepIndex].preparationSuggestions || [])
                      .filter((x: ValidPreparation) => {
                        return x.name !== step.preparation.name;
                      })
                      .map((x: ValidPreparation) => ({
                        value: x.name,
                        label: x.name,
                      }))}
                    onItemSubmit={(value: AutocompleteItem) => {
                      const selectedPreparation = (pageState.stepHelpers[stepIndex].preparationSuggestions || []).find(
                        (preparationSuggestion: ValidPreparation) => preparationSuggestion.name === value.value,
                      );

                      if (!selectedPreparation) {
                        console.error(
                          `couldn't find preparation to add: ${value.value}, ${JSON.stringify(
                            pageState.stepHelpers[stepIndex].preparationSuggestions.map(
                              (x: ValidPreparation) => x.name,
                            ),
                          )}`,
                        );
                        return;
                      }

                      updatePageState({
                        type: 'UPDATE_STEP_PREPARATION',
                        stepIndex: stepIndex,
                        selectedPreparation: selectedPreparation,
                      });

                      apiClient
                        .validPreparationInstrumentsForPreparationID(selectedPreparation.id)
                        .then((res: AxiosResponse<QueryFilteredResult<ValidPreparationInstrument>>) => {
                          updatePageState({
                            type: 'UPDATE_STEP_INSTRUMENT_SUGGESTIONS',
                            stepIndex: stepIndex,
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
                    }}
                    rightSection={
                      pageState.stepHelpers[stepIndex].selectedPreparation && (
                        <IconCircleX
                          size={18}
                          color={pageState.stepHelpers[stepIndex].selectedPreparation ? 'tomato' : 'gray'}
                          onClick={() => {
                            if (!pageState.stepHelpers[stepIndex].selectedPreparation) {
                              return;
                            }

                            updatePageState({
                              type: 'UNSET_STEP_PREPARATION',
                              stepIndex: stepIndex,
                            });
                          }}
                        />
                      )
                    }
                  />

                  <Textarea
                    label="Notes"
                    value={step.notes}
                    minRows={2}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                      updatePageState({
                        type: 'UPDATE_STEP_NOTES',
                        stepIndex: stepIndex,
                        newNotes: event.target.value,
                      })
                    }
                  />

                  <Divider label="using" labelPosition="center" mb="md" />

                  <Select
                    label="Instruments"
                    required
                    disabled={
                      (step.preparation.maximumInstrumentCount || Number.MAX_SAFE_INTEGER) <= step.instruments.length ||
                      determinePreparedInstrumentOptions(pageState.recipe, stepIndex)
                        .concat(pageState.stepHelpers[stepIndex].instrumentSuggestions || [])
                        // don't show instruments that have already been added
                        .filter((x: RecipeStepInstrument) => {
                          return !step.instruments.find(
                            (y: RecipeStepInstrument) => y.name === x.instrument?.name || y.name === x.name,
                          );
                        }).length === 0
                    }
                    description={
                      (step.preparation.maximumInstrumentCount || Number.MAX_SAFE_INTEGER) <= step.instruments.length
                        ? `maximum instruments added`
                        : ``
                    }
                    onChange={(instrument: string) => {
                      const rawSelectedInstrument = (
                        determinePreparedInstrumentOptions(pageState.recipe, stepIndex) || []
                      )
                        .concat(pageState.stepHelpers[stepIndex].instrumentSuggestions || [])
                        .find((instrumentSuggestion: RecipeStepInstrument) => {
                          if (
                            pageState.recipe.steps[stepIndex].instruments.find(
                              (instrument: RecipeStepInstrument) =>
                                instrument.instrument?.id === instrumentSuggestion.instrument?.id ||
                                instrument.name === instrumentSuggestion.name,
                            )
                          ) {
                            return false;
                          }
                          return (
                            instrument === instrumentSuggestion.instrument?.name ||
                            instrument === instrumentSuggestion.name
                          );
                        });

                      const selectedInstrument = new RecipeStepInstrument({
                        ...rawSelectedInstrument,
                        minimumQuantity: 1,
                        maximumQuantity: 1,
                      });

                      if (!selectedInstrument) {
                        console.error("couldn't find instrument to add");
                        return;
                      }

                      if (instrument) {
                        updatePageState({
                          type: 'ADD_INSTRUMENT_TO_STEP',
                          stepIndex: stepIndex,
                          instrumentName: instrument,
                          selectedInstrument: selectedInstrument,
                        });
                      }
                    }}
                    value={'Select an instrument'}
                    data={determinePreparedInstrumentOptions(pageState.recipe, stepIndex)
                      .concat(pageState.stepHelpers[stepIndex].instrumentSuggestions || [])
                      // don't show instruments that have already been added
                      .filter((x: RecipeStepInstrument) => {
                        return !step.instruments.find(
                          (y: RecipeStepInstrument) => y.name === x.instrument?.name || y.name === x.name,
                        );
                      })
                      .map((x: RecipeStepInstrument) => ({
                        value: x.instrument?.name || x.name || 'UNKNOWN',
                        label: x.instrument?.name || x.name || 'UNKNOWN',
                      }))}
                  />

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
                                pageState.stepHelpers[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex]
                                  ? 'ranged'
                                  : 'simple'
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
                          <Grid.Col
                            span={
                              pageState.stepHelpers[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex] ? 6 : 12
                            }
                          >
                            <NumberInput
                              label={
                                pageState.stepHelpers[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex]
                                  ? 'Min. Quantity'
                                  : 'Quantity'
                              }
                              required
                              onChange={(value: number) =>
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

                          {pageState.stepHelpers[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex] && (
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Max Quantity"
                                maxLength={0}
                                onChange={(value: number) =>
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
                </Stack>

                <Space h="xl" />

                <Divider label="consuming" labelPosition="center" mb="md" />

                <Autocomplete
                  label="Ingredients"
                  limit={20}
                  required={Boolean(step.preparation.minimumIngredientCount)}
                  value={pageState.stepHelpers[stepIndex].ingredientQuery}
                  disabled={
                    step.preparation.name.trim() === '' ||
                    step.preparation.maximumIngredientCount === step.ingredients.length
                  }
                  onChange={async (value: string) => {
                    updatePageState({
                      type: 'UPDATE_STEP_INGREDIENT_QUERY',
                      newQuery: value,
                      stepIndex: stepIndex,
                    });

                    // FIXME: if a user selects a choice from the dropdown, it updates the query value first, then
                    // this code runs, which then updates the query value again.
                    if (value.length > 2 && step.ingredients.find((x) => x.ingredient?.name === value) === undefined) {
                      console.dir(
                        value,
                        step.ingredients.find((x) => x.ingredient?.name === value),
                      );

                      await apiClient
                        .searchForValidIngredients(value)
                        .then((res: AxiosResponse<ValidIngredient[]>) => {
                          updatePageState({
                            type: 'UPDATE_STEP_INGREDIENT_SUGGESTIONS',
                            stepIndex: stepIndex,
                            results: (
                              res.data.filter((validIngredient: ValidIngredient) => {
                                let found = false;

                                (pageState.recipe.steps[stepIndex]?.ingredients || []).forEach((ingredient) => {
                                  if ((ingredient.ingredient?.id || '') === validIngredient.id) {
                                    found = true;
                                  }
                                });

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
                    } else {
                      updatePageState({
                        type: 'UPDATE_STEP_INGREDIENT_SUGGESTIONS',
                        stepIndex: stepIndex,
                        results: [],
                      });
                    }
                  }}
                  onItemSubmit={async (item: AutocompleteItem) => {
                    const selectedValidIngredient = (pageState.stepHelpers[stepIndex].ingredientSuggestions || []).find(
                      (ingredientSuggestion: RecipeStepIngredient) =>
                        ingredientSuggestion.ingredient?.name === item.value,
                    );

                    const selectedRecipeStepProduct = (
                      determineAvailableRecipeStepProducts(pageState.recipe, stepIndex) || []
                    ).find((recipeStepProduct: RecipeStepIngredient) => recipeStepProduct.name === item.value);

                    if (!selectedValidIngredient && !selectedRecipeStepProduct) {
                      console.error("couldn't find ingredient to add");
                      return;
                    }

                    const selectedIngredient = selectedValidIngredient || selectedRecipeStepProduct;
                    if (!selectedIngredient) {
                      console.error("couldn't find ingredient to add");
                      return;
                    }

                    if (
                      step.ingredients.find(
                        (ingredient) => ingredient.ingredient?.id === selectedIngredient.ingredient?.id,
                      )
                    ) {
                      console.error('ingredient already added');

                      updatePageState({
                        type: 'UPDATE_STEP_INGREDIENT_SUGGESTIONS',
                        stepIndex: stepIndex,
                        results: [],
                      });

                      return;
                    }

                    updatePageState({
                      type: 'ADD_INGREDIENT_TO_STEP',
                      stepIndex: stepIndex,
                      selectedIngredient: selectedIngredient,
                      selectedValidIngredient: selectedValidIngredient,
                    });

                    if ((selectedValidIngredient?.ingredient?.id || '').length > 2) {
                      await apiClient
                        .searchForValidMeasurementUnitsByIngredientID(selectedValidIngredient!.ingredient!.id)
                        .then((res: AxiosResponse<QueryFilteredResult<ValidMeasurementUnit>>) => {
                          updatePageState({
                            type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_SUGGESTIONS',
                            stepIndex: stepIndex,
                            recipeStepIngredientIndex: step.ingredients.length,
                            results: res.data.data || [],
                          });
                          return res.data || [];
                        })
                        .catch((err: AxiosError) => {
                          console.error(`Failed to get ingredient measurement units: ${err}`);
                        });
                    }
                  }}
                  data={(
                    (determineAvailableRecipeStepProducts(pageState.recipe, stepIndex) || []).concat(
                      pageState.stepHelpers[stepIndex].ingredientSuggestions,
                    ) || []
                  ).map((x: RecipeStepIngredient) => ({
                    value: x.ingredient?.name || x.name || 'UNKNOWN',
                    label: x.ingredient?.name || x.name || 'UNKNOWN',
                  }))}
                />

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
                            pageState.stepHelpers[stepIndex].ingredientIsRanged[recipeStepIngredientIndex]
                              ? 'ranged'
                              : 'simple'
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
                            pageState.stepHelpers[stepIndex].ingredientIsRanged[recipeStepIngredientIndex]
                              ? 'Min. Quantity'
                              : 'Quantity'
                          }
                          required
                          onChange={(value: number) =>
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

                      {pageState.stepHelpers[stepIndex].ingredientIsRanged[recipeStepIngredientIndex] && (
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Max Quantity"
                            onChange={(value: number) =>
                              updatePageState({
                                type: 'UPDATE_STEP_INGREDIENT_MAXIMUM_QUANTITY',
                                stepIndex,
                                recipeStepIngredientIndex,
                                newAmount: value || -1,
                              })
                            }
                            value={ingredient.maximumQuantity}
                          />
                        </Grid.Col>
                      )}

                      <Grid.Col
                        span={pageState.stepHelpers[stepIndex].ingredientIsRanged[recipeStepIngredientIndex] ? 12 : 6}
                      >
                        <Select
                          label="Measurement"
                          required
                          value={ingredient.measurementUnit.pluralName}
                          onChange={(value: string) => {
                            updatePageState({
                              type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT',
                              stepIndex,
                              recipeStepIngredientIndex,
                              measurementUnit: (
                                pageState.stepHelpers[stepIndex].ingredientMeasurementUnitSuggestions[
                                  recipeStepIngredientIndex
                                ] || []
                              ).find(
                                (ingredientMeasurementUnitSuggestion: ValidMeasurementUnit) =>
                                  ingredientMeasurementUnitSuggestion.pluralName === value,
                              ),
                            });
                          }}
                          data={(
                            pageState.stepHelpers[stepIndex].ingredientMeasurementUnitSuggestions[
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
                ))}

                <Divider label="until" labelPosition="center" my="md" />

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
                            disabled={step.ingredients.length === 0}
                            value={
                              pageState.stepHelpers[stepIndex].completionConditionIngredientStateQueries[conditionIndex]
                            }
                            data={pageState.stepHelpers[stepIndex].completionConditionIngredientStateSuggestions[
                              conditionIndex
                            ].map((x: ValidIngredientState) => {
                              return {
                                value: x.name,
                                label: x.name,
                              };
                            })}
                            onChange={async (value: string) => {
                              updatePageState({
                                type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY',
                                stepIndex,
                                conditionIndex,
                                query: value,
                              });

                              if (value.length > 2 && !completionCondition.ingredientState.id) {
                                await apiClient
                                  .searchForValidIngredientStates(value)
                                  .then((res: AxiosResponse<ValidIngredientState[]>) => {
                                    updatePageState({
                                      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_SUGGESTIONS',
                                      stepIndex: stepIndex,
                                      conditionIndex: conditionIndex,
                                      results: res.data,
                                    });
                                  })
                                  .catch((err: AxiosError) => {
                                    console.error(`Failed to get preparations: ${err}`);
                                  });
                              }
                            }}
                            onItemSubmit={(value: AutocompleteItem) => {
                              const selectedValidIngredientState = pageState.stepHelpers[
                                stepIndex
                              ].completionConditionIngredientStateSuggestions[conditionIndex].find(
                                (x: ValidIngredientState) => x.name === value.value,
                              );

                              if (!selectedValidIngredientState) {
                                console.error(`unknown ingredient state: ${value.value}`);
                                return;
                              }

                              updatePageState({
                                type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE',
                                stepIndex,
                                conditionIndex,
                                ingredientState: selectedValidIngredientState,
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
                          updatePageState({
                            type: 'ADD_COMPLETION_CONDITION_TO_STEP',
                            stepIndex,
                          });
                        }}
                      >
                        Add Condition
                      </Button>
                    </Center>
                  </Grid.Col>
                </Grid>

                <Divider label="producing" labelPosition="center" my="md" />

                {(step.products || []).map((product: RecipeStepProduct, productIndex: number) => {
                  return (
                    <Grid key={productIndex}>
                      <Grid.Col span="content">
                        <Switch
                          mt="lg"
                          size="md"
                          onLabel="ranged"
                          offLabel="simple"
                          value={pageState.stepHelpers[stepIndex].productIsRanged[productIndex] ? 'ranged' : 'simple'}
                          onChange={() =>
                            updatePageState({
                              type: 'TOGGLE_PRODUCT_RANGE',
                              stepIndex,
                              productIndex,
                            })
                          }
                        />
                      </Grid.Col>

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
                          label={
                            pageState.stepHelpers[stepIndex].productIsRanged[productIndex]
                              ? 'Min. Quantity'
                              : 'Quantity'
                          }
                          disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                          onChange={(value: number) =>
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

                      {pageState.stepHelpers[stepIndex].productIsRanged[productIndex] && (
                        <Grid.Col md="auto" sm={12}>
                          <NumberInput
                            label="Max Quantity"
                            disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                            onChange={(value: number) =>
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
                          value={pageState.stepHelpers[stepIndex].productMeasurementUnitQueries[productIndex]}
                          data={(
                            pageState.stepHelpers[stepIndex].productMeasurementUnitSuggestions[productIndex] || []
                          ).map((y: ValidMeasurementUnit) => ({
                            value: y.pluralName,
                            label: y.pluralName,
                          }))}
                          onItemSubmit={(value: AutocompleteItem) => {
                            const selectedMeasurementUnit = (
                              pageState.stepHelpers[stepIndex].productMeasurementUnitSuggestions[productIndex] || []
                            ).find(
                              (productMeasurementUnitSuggestion: ValidMeasurementUnit) =>
                                productMeasurementUnitSuggestion.pluralName === value.value,
                            );

                            if (!selectedMeasurementUnit) {
                              console.error('Could not find measurement unit', value);
                              return;
                            }

                            updatePageState({
                              type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT',
                              stepIndex,
                              productIndex,
                              measurementUnit: selectedMeasurementUnit,
                            });
                          }}
                          onChange={async (value: string) => {
                            updatePageState({
                              type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY',
                              stepIndex,
                              productIndex,
                              newQuery: value,
                            });

                            if (value.length > 2) {
                              await apiClient
                                .searchForValidMeasurementUnits(value)
                                .then((res: AxiosResponse<ValidMeasurementUnit[]>) => {
                                  updatePageState({
                                    type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_SUGGESTIONS',
                                    stepIndex: stepIndex,
                                    productIndex: productIndex,
                                    results: res.data || [],
                                  });
                                })
                                .catch((err: AxiosError) => {
                                  console.error(`Failed to get ingredient measurement units: ${err}`);
                                });
                            }
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col span="auto">
                        <TextInput
                          required
                          label="Name"
                          disabled={!pageState.stepHelpers[stepIndex].productsNamedManually[productIndex]}
                          value={product.name}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
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
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          submitRecipe();
        }}
      >
        <Grid>
          <Grid.Col md={4} sm={12}>
            <Stack>
              <Stack>
                <TextInput
                  data-pf="recipe-name-input"
                  withAsterisk
                  label="Name"
                  value={pageState.recipe.name}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    updatePageState({ type: 'UPDATE_NAME', newName: event.target.value })
                  }
                  mt="xs"
                />

                <NumberInput
                  data-pf="recipe-yields-portions-input"
                  label="Portions"
                  required
                  value={pageState.recipe.yieldsPortions}
                  onChange={(value: number) => updatePageState({ type: 'UPDATE_YIELDS_PORTIONS', newPortions: value })}
                  mt="xs"
                />

                <TextInput
                  data-pf="recipe-source-input"
                  label="Source"
                  value={pageState.recipe.source}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    updatePageState({ type: 'UPDATE_SOURCE', newSource: event.target.value })
                  }
                  mt="xs"
                />

                <Textarea
                  data-pf="recipe-description-input"
                  label="Description"
                  value={pageState.recipe.description}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                    updatePageState({ type: 'UPDATE_DESCRIPTION', newDescription: event.target.value })
                  }
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
              onClick={() => updatePageState({ type: 'ADD_STEP' })}
              mb="xl"
              disabled={
                pageState.recipe.steps.filter((x: RecipeStep) => {
                  return x.preparation.id === '';
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

export default RecipeCreator;
