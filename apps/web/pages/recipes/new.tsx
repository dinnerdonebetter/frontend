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
  RecipeStepIngredient,
  RecipeStepInstrument,
  ValidIngredient,
  ValidIngredientState,
  ValidMeasurementUnit,
  ValidPreparation,
  ValidPreparationInstrument,
  ValidRecipeStepProductType,
  QueryFilteredResult,
  RecipeStepCreationRequestInput,
  RecipeStepInstrumentCreationRequestInput,
  RecipeStepIngredientCreationRequestInput,
  RecipeStepCompletionConditionCreationRequestInput,
  RecipeStepProductCreationRequestInput,
} from '@prixfixeco/models';
import { determineAvailableRecipeStepProducts, determinePreparedInstrumentOptions } from '@prixfixeco/pfutils';

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
    apiClient
      .createRecipe(pageState.recipe)
      .then((res: AxiosResponse<Recipe>) => {
        router.push(`/recipes/${res.data.id}`);
      })
      .catch((err: AxiosError) => {
        console.error(`Failed to create recipe: ${err}`);
      });
  };

  const addingStepCompletionConditionsShouldBeDisabled = (step: RecipeStepCreationRequestInput): boolean => {
    return (
      step.completionConditions.length > 0 &&
      step.completionConditions[step.completionConditions.length - 1].ingredientState === '' &&
      step.completionConditions[step.completionConditions.length - 1].ingredients.length === 0
    );
  };

  const handlePreparationQueryChange = (stepIndex: number) => async (value: string) => {
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
  };

  const handlePreparationSelection = (stepIndex: number) => (value: AutocompleteItem) => {
    const selectedPreparation = (pageState.stepHelpers[stepIndex].preparationSuggestions || []).find(
      (preparationSuggestion: ValidPreparation) => preparationSuggestion.name === value.value,
    );

    if (!selectedPreparation) {
      console.error(
        `couldn't find preparation to add: ${value.value}, ${JSON.stringify(
          pageState.stepHelpers[stepIndex].preparationSuggestions.map((x: ValidPreparation) => x.name),
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
          results: (res.data.data || []).map((x: ValidPreparationInstrument) => {
            return new RecipeStepInstrument({
              instrument: x.instrument,
              name: x.instrument.name,
              notes: '',
              preferenceRank: 0,
              optional: false,
              optionIndex: 0,
            });
          }),
        });

        return res.data.data || [];
      })
      .catch((err: AxiosError) => {
        console.error(`Failed to get preparation instruments: ${err}`);
      });
  };

  const handleInstrumentSelection = (stepIndex: number) => (instrument: string) => {
    const rawSelectedInstrument = (determinePreparedInstrumentOptions(pageState.recipe, stepIndex) || [])
      .concat(pageState.stepHelpers[stepIndex].instrumentSuggestions || [])
      .find((instrumentSuggestion: RecipeStepInstrumentCreationRequestInput) => {
        if (
          pageState.recipe.steps[stepIndex].instruments.find((instrument: RecipeStepInstrumentCreationRequestInput) => {
            return (
              instrument.instrumentID === instrumentSuggestion.instrumentID ||
              instrument.name === instrumentSuggestion.name
            );
          })
        ) {
          return false;
        }
        return instrument === instrumentSuggestion.name;
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
  };

  const handleIngredientQueryChange =
    (stepIndex: number, recipeStepIngredientIndex: number) => async (value: string) => {
      updatePageState({
        type: 'UPDATE_STEP_INGREDIENT_QUERY',
        newQuery: value,
        stepIndex: stepIndex,
        recipeStepIngredientIndex: recipeStepIngredientIndex,
      });

      // FIXME: if a user selects a choice from the dropdown, it updates the query value first, then
      // this code runs, which then updates the query value again.
      if (value.length > 2) {
        await apiClient
          .searchForValidIngredients(value)
          .then((res: AxiosResponse<ValidIngredient[]>) => {
            updatePageState({
              type: 'UPDATE_STEP_INGREDIENT_SUGGESTIONS',
              stepIndex: stepIndex,
              recipeStepIngredientIndex: recipeStepIngredientIndex,
              results: (
                res.data.filter((validIngredient: ValidIngredient) => {
                  let found = false;

                  (pageState.recipe.steps[stepIndex]?.ingredients || []).forEach((ingredient) => {
                    if ((ingredient.ingredientID || '') === validIngredient.id) {
                      found = true;
                    }
                  });

                  // return true if the ingredient is not already used by another ingredient in the step
                  return !found;
                }) || []
              ).map((x: ValidIngredient) => {
                return new RecipeStepIngredient({
                  name: x.name,
                  ingredient: x,
                  minimumQuantity: 1,
                  maximumQuantity: 1,
                });
              }),
            });
          })
          .catch((err: AxiosError) => {
            console.error(`Failed to get ingredients: ${err}`);
          });
      } else {
        updatePageState({
          type: 'UPDATE_STEP_INGREDIENT_SUGGESTIONS',
          stepIndex: stepIndex,
          recipeStepIngredientIndex: recipeStepIngredientIndex,
          results: [],
        });
      }
    };

  const handleIngredientSelection =
    (stepIndex: number, recipeStepIngredientIndex: number) => async (item: AutocompleteItem) => {
      const selectedValidIngredient = (
        pageState.stepHelpers[stepIndex].ingredientSuggestions[recipeStepIngredientIndex] || []
      ).find((ingredientSuggestion: RecipeStepIngredient) => ingredientSuggestion.ingredient?.name === item.value);

      if (!selectedValidIngredient) {
        console.error("couldn't find ingredient to add");
        return;
      }

      if (
        pageState.recipe.steps[stepIndex].ingredients.find(
          (ingredient) => ingredient.ingredientID === selectedValidIngredient.ingredient?.id,
        )
      ) {
        console.error('ingredient already added');

        updatePageState({
          type: 'UPDATE_STEP_INGREDIENT_SUGGESTIONS',
          stepIndex: stepIndex,
          recipeStepIngredientIndex: recipeStepIngredientIndex,
          results: [],
        });

        return;
      }

      updatePageState({
        type: 'SET_INGREDIENT_FOR_RECIPE_STEP_INGREDIENT',
        stepIndex: stepIndex,
        recipeStepIngredientIndex: recipeStepIngredientIndex,
        selectedValidIngredient: selectedValidIngredient,
      });

      if ((selectedValidIngredient?.ingredient?.id || '').length > 2) {
        await apiClient
          .searchForValidMeasurementUnitsByIngredientID(selectedValidIngredient!.ingredient!.id)
          .then((res: AxiosResponse<QueryFilteredResult<ValidMeasurementUnit>>) => {
            updatePageState({
              type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_SUGGESTIONS',
              stepIndex: stepIndex,
              recipeStepIngredientIndex: pageState.recipe.steps[stepIndex].ingredients.length,
              results: res.data.data || [],
            });
            return res.data || [];
          })
          .catch((err: AxiosError) => {
            console.error(`Failed to get ingredient measurement units: ${err}`);
          });
      }
    };

  const determineIngredientSuggestions = (stepIndex: number, recipeStepIngredientIndex: number) => {
    const products =
      (determineAvailableRecipeStepProducts(pageState.recipe, stepIndex) || []).concat(
        pageState.stepHelpers[stepIndex].ingredientSuggestions[recipeStepIngredientIndex],
      ) || [];

    return products
      .filter((x?: RecipeStepIngredient) => x)
      .map((x: RecipeStepIngredient) => ({
        value: x.ingredient?.name || x.name || 'UNKNOWN',
        label: x.ingredient?.name || x.name || 'UNKNOWN',
      }));
  };

  const handleIngredientMeasurementUnitSelection =
    (stepIndex: number, recipeStepIngredientIndex: number) => (value: string) => {
      updatePageState({
        type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT',
        stepIndex,
        recipeStepIngredientIndex,
        measurementUnit: (
          pageState.stepHelpers[stepIndex].ingredientMeasurementUnitSuggestions[recipeStepIngredientIndex] || []
        ).find((ingredientMeasurementUnitSuggestion: ValidMeasurementUnit) => {
          return ingredientMeasurementUnitSuggestion.pluralName === value;
        }),
      });
    };

  const handleCompletionConditionIngredientStateQueryChange =
    (stepIndex: number, conditionIndex: number) => async (value: string) => {
      updatePageState({
        type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY',
        stepIndex,
        conditionIndex,
        query: value,
      });

      if (value.length > 2 && !pageState.recipe.steps[stepIndex].completionConditions[conditionIndex].ingredientState) {
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
    };

  const handleCompletionConditionIngredientStateSelection =
    (stepIndex: number, conditionIndex: number) => (value: AutocompleteItem) => {
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
    };

  const handleRecipeStepProductMeasurementUnitQueryUpdate =
    (stepIndex: number, productIndex: number) => async (value: string) => {
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
    };

  const handleRecipeStepProductMeasurementUnitSelection =
    (stepIndex: number, productIndex: number) => (value: AutocompleteItem) => {
      const selectedMeasurementUnit = (
        pageState.stepHelpers[stepIndex].productMeasurementUnitSuggestions[productIndex] || []
      ).find((productMeasurementUnitSuggestion: ValidMeasurementUnit) => {
        return productMeasurementUnitSuggestion.pluralName === value.value;
      });

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
    };

  const steps = (pageState.recipe.steps || []).map((step: RecipeStepCreationRequestInput, stepIndex: number) => {
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
              <Grid.Col md="auto">
                <Stack>
                  <Autocomplete
                    label="Preparation"
                    required
                    tabIndex={0}
                    value={pageState.stepHelpers[stepIndex].preparationQuery}
                    onChange={handlePreparationQueryChange(stepIndex)}
                    data={(pageState.stepHelpers[stepIndex].preparationSuggestions || [])
                      .filter((x: ValidPreparation) => {
                        return x.name !== pageState.stepHelpers[stepIndex].selectedPreparation?.name;
                      })
                      .map((x: ValidPreparation) => ({
                        value: x.name,
                        label: x.name,
                      }))}
                    onItemSubmit={handlePreparationSelection(stepIndex)}
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
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                      updatePageState({
                        type: 'UPDATE_STEP_NOTES',
                        stepIndex: stepIndex,
                        newNotes: event.target.value,
                      });
                    }}
                  />

                  <Divider label="using" labelPosition="center" mb="md" />

                  <Select
                    label="Instruments"
                    required
                    disabled={!pageState.stepHelpers[stepIndex].selectedPreparation}
                    description={
                      (pageState.stepHelpers[stepIndex].selectedPreparation?.maximumInstrumentCount ||
                        Number.MAX_SAFE_INTEGER) <= step.instruments.length
                        ? `maximum instruments added`
                        : ``
                    }
                    onChange={handleInstrumentSelection(stepIndex)}
                    value={'Select an instrument'}
                    data={determinePreparedInstrumentOptions(pageState.recipe, stepIndex)
                      .concat(pageState.stepHelpers[stepIndex].instrumentSuggestions || [])
                      // don't show instruments that have already been added
                      .filter((x: RecipeStepInstrumentCreationRequestInput) => {
                        return !step.instruments.find(
                          (y: RecipeStepInstrumentCreationRequestInput) => y.name === x.name,
                        );
                      })
                      .map((x: RecipeStepInstrumentCreationRequestInput) => ({
                        value: x.name || 'UNKNOWN',
                        label: x.name || 'UNKNOWN',
                      }))}
                  />

                  {(step.instruments || []).map(
                    (instrument: RecipeStepInstrumentCreationRequestInput, recipeStepInstrumentIndex: number) => (
                      <Box key={recipeStepInstrumentIndex}>
                        <Grid>
                          <Grid.Col span="auto">
                            <Text mt="xl">{`${instrument.name}`}</Text>
                          </Grid.Col>

                          <Grid.Col span="content">
                            <Switch
                              data-pf={`toggle-recipe-step-${stepIndex}-instrument-${recipeStepInstrumentIndex}-ranged-status`}
                              mt="sm"
                              size="md"
                              onLabel="ranged"
                              offLabel="simple"
                              value={
                                pageState.stepHelpers[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex]
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
                              data-pf={`remove-recipe-step-${stepIndex}-instrument-${recipeStepInstrumentIndex}`}
                              mt="sm"
                              variant="outline"
                              size="sm"
                              aria-label="remove recipe step instrument"
                              onClick={() => {
                                updatePageState({
                                  type: 'REMOVE_INSTRUMENT_FROM_STEP',
                                  stepIndex,
                                  recipeStepInstrumentIndex,
                                });
                              }}
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
                              data-pf={`recipe-step-${stepIndex}-instrument-${recipeStepInstrumentIndex}-min-quantity-input`}
                              label={
                                pageState.stepHelpers[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex]
                                  ? 'Min. Quantity'
                                  : 'Quantity'
                              }
                              required
                              onChange={(value: number) => {
                                updatePageState({
                                  type: 'UPDATE_STEP_INSTRUMENT_MINIMUM_QUANTITY',
                                  stepIndex,
                                  recipeStepInstrumentIndex,
                                  newAmount: value || -1,
                                });
                              }}
                              value={step.instruments[recipeStepInstrumentIndex].minimumQuantity}
                              maxLength={0}
                            />
                          </Grid.Col>

                          {pageState.stepHelpers[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex] && (
                            <Grid.Col span={6}>
                              <NumberInput
                                data-pf={`recipe-step-${stepIndex}-instrument-${recipeStepInstrumentIndex}-max-quantity-input`}
                                label="Max Quantity"
                                maxLength={0}
                                onChange={(value: number) => {
                                  updatePageState({
                                    type: 'UPDATE_STEP_INSTRUMENT_MAXIMUM_QUANTITY',
                                    stepIndex,
                                    recipeStepInstrumentIndex,
                                    newAmount: value || -1,
                                  });
                                }}
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

                {(step.ingredients || []).map(
                  (ingredient: RecipeStepIngredientCreationRequestInput, recipeStepIngredientIndex: number) => (
                    <Box key={recipeStepIngredientIndex}>
                      <Grid>
                        <Grid.Col span="content">
                          {stepIndex !== 0 && (
                            <Switch
                              data-pf={`toggle-recipe-step-${stepIndex}-ingredient-${recipeStepIngredientIndex}-product-switch`}
                              mt="sm"
                              size="md"
                              onLabel="product"
                              offLabel="ingredient"
                              disabled={pageState.stepHelpers[stepIndex].selectedPreparation === null}
                              value={
                                pageState.stepHelpers[stepIndex].ingredientIsProduct[recipeStepIngredientIndex]
                                  ? 'product'
                                  : 'ingredient'
                              }
                              onChange={() => {
                                updatePageState({
                                  type: 'TOGGLE_INGREDIENT_PRODUCT_STATE',
                                  stepIndex,
                                  recipeStepIngredientIndex,
                                });
                              }}
                            />
                          )}
                        </Grid.Col>

                        <Grid.Col span="content">
                          {(stepIndex == 0 ||
                            !pageState.stepHelpers[stepIndex].ingredientIsProduct[recipeStepIngredientIndex]) && (
                            <Autocomplete
                              data-pf={`recipe-step-${stepIndex}-ingredient-input`}
                              label="Ingredient"
                              limit={20}
                              required
                              value={pageState.stepHelpers[stepIndex].ingredientQueries[recipeStepIngredientIndex]}
                              disabled={pageState.stepHelpers[stepIndex].selectedPreparation === null}
                              onChange={handleIngredientQueryChange(stepIndex, recipeStepIngredientIndex)}
                              onItemSubmit={handleIngredientSelection(stepIndex, recipeStepIngredientIndex)}
                              data={determineIngredientSuggestions(stepIndex, recipeStepIngredientIndex)}
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
                                        type: 'UNSET_RECIPE_STEP_INGREDIENT',
                                        stepIndex: stepIndex,
                                        recipeStepIngredientIndex: recipeStepIngredientIndex,
                                      });
                                    }}
                                  />
                                )
                              }
                            />
                          )}
                        </Grid.Col>

                        <Grid.Col span="content">
                          <Switch
                            data-pf={`toggle-recipe-step-${stepIndex}-ingredient-${recipeStepIngredientIndex}-range`}
                            mt="sm"
                            size="md"
                            onLabel="ranged"
                            offLabel="single"
                            disabled={pageState.stepHelpers[stepIndex].selectedPreparation === null}
                            value={
                              pageState.stepHelpers[stepIndex].ingredientIsRanged[recipeStepIngredientIndex]
                                ? 'ranged'
                                : 'single'
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

                        <Grid.Col span="auto">
                          <NumberInput
                            data-pf={`recipe-step-${stepIndex}-ingredient-${recipeStepIngredientIndex}-min-quantity-input`}
                            label={
                              pageState.stepHelpers[stepIndex].ingredientIsRanged[recipeStepIngredientIndex]
                                ? 'Min. Quantity'
                                : 'Quantity'
                            }
                            required
                            disabled={pageState.stepHelpers[stepIndex].selectedPreparation === null}
                            onChange={(value: number) => {
                              updatePageState({
                                type: 'UPDATE_STEP_INGREDIENT_MINIMUM_QUANTITY',
                                stepIndex,
                                recipeStepIngredientIndex,
                                newAmount: value || -1,
                              });
                            }}
                            value={ingredient.minimumQuantity}
                          />
                        </Grid.Col>

                        {pageState.stepHelpers[stepIndex].ingredientIsRanged[recipeStepIngredientIndex] && (
                          <Grid.Col span="auto">
                            <NumberInput
                              data-pf={`recipe-step-${stepIndex}-ingredient-${recipeStepIngredientIndex}-max-quantity-input`}
                              label="Max Quantity"
                              disabled={pageState.stepHelpers[stepIndex].selectedPreparation === null}
                              onChange={(value: number) => {
                                updatePageState({
                                  type: 'UPDATE_STEP_INGREDIENT_MAXIMUM_QUANTITY',
                                  stepIndex,
                                  recipeStepIngredientIndex,
                                  newAmount: value || -1,
                                });
                              }}
                              value={ingredient.maximumQuantity}
                            />
                          </Grid.Col>
                        )}

                        <Grid.Col span="auto">
                          <Select
                            data-pf={`recipe-step-${stepIndex}-ingredient-${recipeStepIngredientIndex}-measurement-unit-input`}
                            label="Measurement"
                            required
                            disabled={pageState.stepHelpers[stepIndex].selectedPreparation === null}
                            value={
                              (
                                pageState.stepHelpers[stepIndex].ingredientMeasurementUnitSuggestions[
                                  recipeStepIngredientIndex
                                ] || []
                              ).find((x: ValidMeasurementUnit) => (x.id = ingredient.measurementUnitID))?.pluralName
                            }
                            onChange={handleIngredientMeasurementUnitSelection(stepIndex, recipeStepIngredientIndex)}
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

                        <Grid.Col span="content" mt="xl">
                          <ActionIcon
                            style={{ float: 'right' }}
                            variant="outline"
                            size="md"
                            aria-label="add ingredient"
                            disabled
                            onClick={() => {
                              dispatchEvent({
                                type: 'ADD_INGREDIENT_TO_STEP',
                                stepIndex: stepIndex,
                              });
                            }}
                          >
                            <IconPlus size="md" />
                          </ActionIcon>
                        </Grid.Col>

                        <Grid.Col span="content" mt="sm">
                          <ActionIcon
                            data-pf={`remove-recipe-step-${stepIndex}-ingredient-${recipeStepIngredientIndex}`}
                            mt="sm"
                            variant="outline"
                            size="sm"
                            disabled={pageState.stepHelpers[stepIndex].selectedPreparation === null}
                            aria-label="remove recipe step ingredient"
                            onClick={() => {
                              updatePageState({
                                type: 'REMOVE_INGREDIENT_FROM_STEP',
                                stepIndex,
                                recipeStepIngredientIndex,
                              });
                            }}
                          >
                            <IconTrash
                              size="md"
                              color={pageState.stepHelpers[stepIndex].selectedPreparation === null ? 'grey' : 'tomato'}
                            />
                          </ActionIcon>
                        </Grid.Col>
                      </Grid>
                    </Box>
                  ),
                )}

                <Divider label="until" labelPosition="center" my="md" />

                {(step.completionConditions || []).map(
                  (completionCondition: RecipeStepCompletionConditionCreationRequestInput, conditionIndex: number) => {
                    return (
                      <Grid key={conditionIndex}>
                        <Grid.Col span="auto">
                          <Select
                            data-pf={`recipe-step-${stepIndex}-completion-condition-${conditionIndex}-ingredient-selection-input`}
                            disabled={step.ingredients.length === 0 || !completionCondition.ingredientState}
                            label="Add Ingredient"
                            required
                            data={step.ingredients
                              .filter((x: RecipeStepIngredientCreationRequestInput) => x.ingredientID)
                              .map((x: RecipeStepIngredientCreationRequestInput) => {
                                return {
                                  value: x.name,
                                  label: x.name,
                                };
                              })}
                          />
                        </Grid.Col>

                        <Grid.Col span="auto">
                          <Autocomplete
                            data-pf={`recipe-step-${stepIndex}-completion-condition-${conditionIndex}-ingredient-state-input`}
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
                            onChange={handleCompletionConditionIngredientStateQueryChange(stepIndex, conditionIndex)}
                            onItemSubmit={handleCompletionConditionIngredientStateSelection(stepIndex, conditionIndex)}
                          />
                        </Grid.Col>

                        <Grid.Col span="content" mt="xl">
                          <ActionIcon
                            data-pf={`remove-recipe-step-${stepIndex}-completion-condition-${conditionIndex}`}
                            mt={5}
                            style={{ float: 'right' }}
                            variant="outline"
                            size="md"
                            aria-label="remove condition"
                            onClick={() => {
                              updatePageState({
                                type: 'REMOVE_RECIPE_STEP_COMPLETION_CONDITION',
                                stepIndex,
                                conditionIndex,
                              });
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

                {(step.products || []).map((product: RecipeStepProductCreationRequestInput, productIndex: number) => {
                  return (
                    <Grid key={productIndex}>
                      <Grid.Col span="content">
                        <Switch
                          mt="lg"
                          size="md"
                          onLabel="ranged"
                          offLabel="single"
                          value={pageState.stepHelpers[stepIndex].productIsRanged[productIndex] ? 'ranged' : 'single'}
                          onChange={() => {
                            updatePageState({
                              type: 'TOGGLE_PRODUCT_RANGE',
                              stepIndex,
                              productIndex,
                            });
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col md="auto">
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

                      <Grid.Col md="auto">
                        <NumberInput
                          required
                          label={
                            pageState.stepHelpers[stepIndex].productIsRanged[productIndex]
                              ? 'Min. Quantity'
                              : 'Quantity'
                          }
                          disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                          onChange={(value: number) => {
                            updatePageState({
                              type: 'UPDATE_STEP_PRODUCT_MINIMUM_QUANTITY',
                              stepIndex,
                              productIndex,
                              newAmount: value || -1,
                            });
                          }}
                          value={product.minimumQuantity}
                        />
                      </Grid.Col>

                      {pageState.stepHelpers[stepIndex].productIsRanged[productIndex] && (
                        <Grid.Col md="auto">
                          <NumberInput
                            label="Max Quantity"
                            disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                            onChange={(value: number) => {
                              updatePageState({
                                type: 'UPDATE_STEP_PRODUCT_MAXIMUM_QUANTITY',
                                stepIndex,
                                productIndex,
                                newAmount: value || -1,
                              });
                            }}
                            value={product.maximumQuantity}
                          />
                        </Grid.Col>
                      )}

                      <Grid.Col md="auto">
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
                          onItemSubmit={handleRecipeStepProductMeasurementUnitSelection(stepIndex, productIndex)}
                          onChange={handleRecipeStepProductMeasurementUnitQueryUpdate(stepIndex, productIndex)}
                          rightSection={
                            product.measurementUnitID && (
                              <IconCircleX
                                size={18}
                                color={product.measurementUnitID ? 'tomato' : 'gray'}
                                onClick={() => {
                                  if (!product.measurementUnitID) {
                                    return;
                                  }

                                  updatePageState({
                                    type: 'UNSET_STEP_PRODUCT_MEASUREMENT_UNIT',
                                    stepIndex: stepIndex,
                                    productIndex,
                                  });
                                }}
                              />
                            )
                          }
                        />
                      </Grid.Col>

                      <Grid.Col span="auto">
                        <TextInput
                          required
                          label="Name"
                          disabled={!pageState.stepHelpers[stepIndex].productIsNamedManually[productIndex]}
                          value={product.name}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            updatePageState({
                              type: 'UPDATE_STEP_PRODUCT_NAME',
                              stepIndex,
                              productIndex,
                              newName: event.target.value || '',
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
                          aria-label="add product"
                          disabled={product.type === 'ingredient' && step.ingredients.length === 0}
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
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          submitRecipe();
        }}
      >
        <Grid>
          <Grid.Col md={4}>
            <Stack>
              <Stack>
                <TextInput
                  data-pf="recipe-name-input"
                  withAsterisk
                  label="Name"
                  value={pageState.recipe.name}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    updatePageState({ type: 'UPDATE_NAME', newName: event.target.value });
                  }}
                  mt="xs"
                />

                <NumberInput
                  data-pf="recipe-yields-portions-input"
                  label="Portions"
                  required
                  value={pageState.recipe.yieldsPortions}
                  onChange={(value: number) => {
                    updatePageState({ type: 'UPDATE_YIELDS_PORTIONS', newPortions: value });
                  }}
                  mt="xs"
                />

                <TextInput
                  data-pf="recipe-source-input"
                  label="Source"
                  value={pageState.recipe.source}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    updatePageState({ type: 'UPDATE_SOURCE', newSource: event.target.value });
                  }}
                  mt="xs"
                />

                <Textarea
                  data-pf="recipe-description-input"
                  label="Description"
                  value={pageState.recipe.description}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    updatePageState({ type: 'UPDATE_DESCRIPTION', newDescription: event.target.value });
                  }}
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
                    data-pf="toggle-all-ingredients"
                    variant="outline"
                    size="sm"
                    style={{ float: 'right' }}
                    aria-label="show all ingredients"
                    onClick={() => {
                      updatePageState({ type: 'TOGGLE_SHOW_ALL_INGREDIENTS' });
                    }}
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
                    data-pf="toggle-all-instruments"
                    variant="outline"
                    size="sm"
                    style={{ float: 'right' }}
                    aria-label="show all instruments"
                    onClick={() => {
                      updatePageState({ type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' });
                    }}
                  >
                    {(pageState.showInstrumentsSummary && <IconChevronUp size={16} color="gray" />) || (
                      <IconChevronDown size={16} color="gray" />
                    )}
                  </ActionIcon>
                </Grid.Col>
              </Grid>

              <Divider />

              <Collapse sx={{ minHeight: '10rem' }} in={pageState.showInstrumentsSummary}>
                <Box />
              </Collapse>

              {pageState.recipe.steps.length > 1 && (
                <>
                  <Grid justify="space-between" align="center">
                    <Grid.Col span="auto">
                      <Title order={4}>Advanced Prep</Title>
                    </Grid.Col>
                    <Grid.Col span="auto">
                      <ActionIcon
                        data-pf="toggle-all-advanced-prep-steps"
                        variant="outline"
                        size="sm"
                        style={{ float: 'right' }}
                        aria-label="show advanced prep tasks"
                        onClick={() => {
                          updatePageState({ type: 'TOGGLE_SHOW_ADVANCED_PREP_STEPS' });
                        }}
                      >
                        {(pageState.showAdvancedPrepStepInputs && <IconChevronUp size={16} color="gray" />) || (
                          <IconChevronDown size={16} color="gray" />
                        )}
                      </ActionIcon>
                    </Grid.Col>
                  </Grid>

                  <Collapse sx={{ minHeight: '10rem' }} in={pageState.showAdvancedPrepStepInputs}>
                    <Box />
                  </Collapse>

                  <Divider />
                </>
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col span="auto" mt={'2.2rem'} mb="xl">
            {steps}
            <Button
              fullWidth
              onClick={() => updatePageState({ type: 'ADD_STEP' })}
              mb="xl"
              disabled={
                pageState.recipe.steps.filter((x: RecipeStepCreationRequestInput) => {
                  return x.preparationID === '';
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
