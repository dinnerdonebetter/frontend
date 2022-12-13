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
import { useImmer, useImmerReducer } from 'use-immer';
import { useRouter } from 'next/router';

import {
  IRecipeStepCompletionCondition,
  IRecipeStepIngredient,
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

  const [pageState, updatePageState] = useImmer(new NewRecipeCreationPageState());

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
          updatePageState((x: NewRecipeCreationPageState) => {
            x.steps[pageState.preparationQueryToExecute!.stepIndex].preparationSuggestions = res.data;
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get preparations: ${err}`);
        });
    }
  }, [pageState.preparationQueryToExecute, updatePageState]);

  useEffect(() => {
    const apiClient = buildLocalClient();
    if ((pageState.completionConditionIngredientStateQueryToExecute?.query || '').length > 2) {
      apiClient
        .searchForValidIngredientStates(pageState.completionConditionIngredientStateQueryToExecute!.query)
        .then((res: AxiosResponse<ValidIngredientState[]>) => {
          updatePageState((x: NewRecipeCreationPageState) => {
            x.steps[
              pageState.completionConditionIngredientStateQueryToExecute!.stepIndex
            ].completionConditionIngredientStateSuggestions[
              pageState.completionConditionIngredientStateQueryToExecute!.secondaryIndex!
            ] = res.data;
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredient states: ${err}`);
        });
    }
  }, [pageState.completionConditionIngredientStateQueryToExecute, updatePageState]);

  useEffect(() => {
    const apiClient = buildLocalClient();
    if ((pageState.ingredientQueryToExecute?.query || '').length > 2) {
      apiClient
        .searchForValidIngredients(pageState.ingredientQueryToExecute!.query)
        .then((res: AxiosResponse<ValidIngredient[]>) => {
          updatePageState((x: NewRecipeCreationPageState) => {
            x.steps[pageState.ingredientQueryToExecute!.stepIndex].ingredientSuggestions = (
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
            );
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
      console.debug(`Querying for instruments for preparation ${pageState.instrumentQueryToExecute!.query}`);

      apiClient
        .validPreparationInstrumentsForPreparationID(pageState.instrumentQueryToExecute!.query)
        .then((res: AxiosResponse<QueryFilteredResult<ValidPreparationInstrument>>) => {
          updatePageState((x: NewRecipeCreationPageState) => {
            const newInstrumentSuggestions = (res.data.data || []).map(
              (validPreparationInstrument: ValidPreparationInstrument) =>
                new RecipeStepInstrument({
                  instrument: validPreparationInstrument.instrument,
                  notes: '',
                  preferenceRank: 0,
                  optional: false,
                  optionIndex: 0,
                }),
            );

            x.steps[pageState.instrumentQueryToExecute!.stepIndex].instrumentSuggestions = newInstrumentSuggestions;
          });

          return res.data.data || [];
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get preparation instruments: ${err}`);
        });
    }
  }, [pageState.instrumentQueryToExecute]);

  useEffect(() => {
    const apiClient = buildLocalClient();
    if ((pageState.ingredientMeasurementUnitQueryToExecute?.query || '').length > 2) {
      apiClient
        .searchForValidMeasurementUnitsByIngredientID(pageState.ingredientMeasurementUnitQueryToExecute!.query)
        .then((res: AxiosResponse<QueryFilteredResult<ValidMeasurementUnit>>) => {
          updatePageState((x: NewRecipeCreationPageState) => {
            x.steps[pageState.ingredientMeasurementUnitQueryToExecute!.stepIndex].ingredientMeasurementUnitSuggestions[
              pageState.ingredientMeasurementUnitQueryToExecute!.secondaryIndex!
            ] = res.data.data || [];
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
          updatePageState((x: NewRecipeCreationPageState) => {
            x.steps[pageState.productMeasurementUnitQueryToExecute!.stepIndex].productMeasurementUnitSuggestions[
              pageState.productMeasurementUnitQueryToExecute!.secondaryIndex!
            ] = res.data || [];
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
                aria-label="hide step"
                disabled={(pageState.steps || []).length === 1 && step.show}
                onClick={() => {
                  updatePageState((x: NewRecipeCreationPageState) => {
                    x.steps[stepIndex].show = !x.steps[stepIndex].show;
                  });
                }}
              >
                {step.show ? (
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
                // TODO: disable when the step is relied upon by another step
                onClick={() => {
                  updatePageState((x: NewRecipeCreationPageState) => {
                    x.steps = x.steps.filter((_, i) => i !== stepIndex);
                    x.steps = x.steps.filter((_, i) => i !== stepIndex);

                    if (x.steps.length === 1) {
                      x.steps[0].show = true;
                    }
                  });
                }}
              >
                <IconTrash size={16} color={(pageState.steps || []).length === 1 ? 'gray' : 'tomato'} />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        </Card.Section>

        <Collapse in={step.show}>
          <Card.Section px="xs" pb="xs">
            <Grid>
              <Grid.Col md="auto" sm={12}>
                <Stack>
                  <Autocomplete
                    label="Preparation"
                    required={!step.selectedPreparation}
                    tabIndex={0}
                    value={step.preparationQuery}
                    onChange={(value: string) => {
                      updatePageState((x: NewRecipeCreationPageState) => {
                        x.steps[stepIndex].preparationQuery = value;
                        x.preparationQueryToExecute = {
                          query: value,
                          stepIndex,
                        };
                      });
                    }}
                    data={(step.preparationSuggestions || [])
                      .filter((validPreparation: IValidPreparation) => {
                        return validPreparation.name !== step.selectedPreparation?.name;
                      })
                      .map((validPreparation: IValidPreparation) => ({
                        value: validPreparation.name,
                        label: validPreparation.name,
                      }))}
                    onItemSubmit={(value: AutocompleteItem) => {
                      const selectedPreparation = (step.preparationSuggestions || []).find(
                        (preparationSuggestion: IValidPreparation) => preparationSuggestion.name === value.value,
                      );

                      if (!selectedPreparation) {
                        console.error(
                          `couldn't find preparation to add: ${value.value}, ${JSON.stringify(
                            (step.preparationSuggestions || []).map((x) => x.name),
                          )}`,
                        );
                        return;
                      }

                      console.log(`adding preparation: ${selectedPreparation.name}`);

                      updatePageState((x: NewRecipeCreationPageState) => {
                        x.steps[stepIndex].preparationQuery = selectedPreparation.name;
                        x.preparationQueryToExecute = null;
                        x.steps[stepIndex].selectedPreparation = selectedPreparation;
                        x.instrumentQueryToExecute = {
                          query: selectedPreparation.id,
                          stepIndex: stepIndex,
                        };
                      });
                    }}
                    rightSection={
                      step.selectedPreparation && (
                        <IconCircleX
                          size={18}
                          color={step.preparationQuery === '' ? 'gray' : 'tomato'}
                          onClick={() => {
                            if (step.preparationQuery === '') {
                              return;
                            }

                            // clear the preparation
                            updatePageState((x: NewRecipeCreationPageState) => {
                              x.steps[stepIndex].preparationQuery = '';
                              x.preparationQueryToExecute = null;
                              x.steps[stepIndex].selectedPreparation = null;
                              x.steps[stepIndex].preparationSuggestions = [];
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
                    maxRows={4}
                    onChange={(event) => {
                      updatePageState((x: NewRecipeCreationPageState) => {
                        x.steps[stepIndex].notes = event.target.value;
                      });
                    }}
                  />

                  <Divider label="consuming" labelPosition="center" mb="md" />

                  <Autocomplete
                    label="Ingredient(s)"
                    required={
                      Boolean(step.selectedPreparation?.minimumIngredientCount) &&
                      step.ingredients.length < (step.selectedPreparation?.minimumIngredientCount || -1)
                    }
                    error={
                      (step.selectedPreparation?.minimumIngredientCount || -1) > step.ingredients.length
                        ? `at least ${step.selectedPreparation?.minimumIngredientCount} ingredient${
                            step.selectedPreparation?.minimumIngredientCount === 1 ? '' : 's'
                          } required`
                        : undefined
                    }
                    disabled={
                      (step.selectedPreparation?.name || '').trim() === '' ||
                      (step.selectedPreparation?.maximumIngredientCount || -1) === step.ingredients.length
                    }
                    value={step.ingredientQuery}
                    onChange={(value: string) => {
                      updatePageState((x: NewRecipeCreationPageState) => {
                        x.steps[stepIndex].ingredientQuery = value;
                        x.ingredientQueryToExecute = {
                          query: value,
                          stepIndex: stepIndex,
                        };
                      });
                    }}
                    data={determineAvailableRecipeStepProducts(pageState.steps, stepIndex)
                      .concat(step.ingredientSuggestions || [])
                      .map((x: RecipeStepIngredient) => ({
                        value: x.ingredient?.name || x.name || 'UNKNOWN',
                        label: x.ingredient?.name || x.name || 'UNKNOWN',
                      }))}
                    onItemSubmit={(item: AutocompleteItem) => {
                      const selectedValidIngredient = (step.ingredientSuggestions || []).find(
                        (ingredientSuggestion: RecipeStepIngredient) =>
                          ingredientSuggestion.ingredient?.name === item.value,
                      );

                      const selectedRecipeStepProduct = (
                        determineAvailableRecipeStepProducts(pageState.steps, stepIndex) || []
                      ).find((recipeStepProduct: RecipeStepIngredient) => recipeStepProduct.name === item.value);

                      if (!selectedValidIngredient && !selectedRecipeStepProduct) {
                        console.error("couldn't find ingredient to add");
                        return;
                      }

                      const selectedIngredient = selectedValidIngredient || selectedRecipeStepProduct;

                      updatePageState((x: NewRecipeCreationPageState) => {
                        x.steps[stepIndex].ingredientQuery = '';
                        x.steps[stepIndex].ingredients.push(new RecipeStepIngredient(selectedIngredient));
                        x.ingredientQueryToExecute = null;
                        x.ingredientMeasurementUnitQueryToExecute = {
                          query: selectedValidIngredient?.ingredient!.id || '',
                          stepIndex: stepIndex,
                          secondaryIndex: step.ingredients.length,
                        };
                      });
                    }}
                  />

                  {(step.ingredients || []).map(
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
                              value={step.ingredientIsRanged[recipeStepIngredientIndex] ? 'ranged' : 'simple'}
                              onChange={() => {
                                updatePageState((x: NewRecipeCreationPageState) => {
                                  x.steps[stepIndex].ingredientIsRanged[recipeStepIngredientIndex] =
                                    !x.steps[stepIndex].ingredientIsRanged[recipeStepIngredientIndex];
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
                                updatePageState((x: NewRecipeCreationPageState) => {
                                  x.steps[stepIndex].ingredients.splice(recipeStepIngredientIndex, 1);
                                });
                              }}
                            >
                              <IconTrash size="md" color="tomato" />
                            </ActionIcon>
                          </Grid.Col>
                        </Grid>

                        <Grid>
                          <Grid.Col span={6}>
                            <NumberInput
                              label={step.ingredientIsRanged[recipeStepIngredientIndex] ? 'Min. Quantity' : 'Quantity'}
                              min={1}
                              precision={2}
                              required={step.ingredients[recipeStepIngredientIndex].minimumQuantity == 0}
                              onChange={(value: number) => {
                                updatePageState((x: NewRecipeCreationPageState) => {
                                  x.steps[stepIndex].ingredients[recipeStepIngredientIndex].minimumQuantity = value;
                                });
                              }}
                              value={step.ingredients[recipeStepIngredientIndex].minimumQuantity}
                            />
                          </Grid.Col>

                          {step.ingredientIsRanged[recipeStepIngredientIndex] && (
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Max Quantity"
                                min={0}
                                precision={2}
                                onChange={(value: number) => {
                                  updatePageState((x: NewRecipeCreationPageState) => {
                                    x.steps[stepIndex].ingredients[recipeStepIngredientIndex].maximumQuantity =
                                      Math.max(
                                        x.steps[stepIndex].ingredients[recipeStepIngredientIndex].minimumQuantity,
                                        value,
                                      );
                                  });
                                }}
                                value={ingredient.maximumQuantity}
                              />
                            </Grid.Col>
                          )}

                          <Grid.Col span={step.ingredientIsRanged[recipeStepIngredientIndex] ? 12 : 6}>
                            <Select
                              label="Measurement"
                              aria-label="ingredient measurement unit selection"
                              required={!step.ingredients[recipeStepIngredientIndex].measurementUnit}
                              value={step.ingredients[recipeStepIngredientIndex].measurementUnit?.pluralName || ''}
                              onChange={(value: string) => {
                                updatePageState((x: NewRecipeCreationPageState) => {
                                  const selectedMeasurementUnit = (
                                    step.ingredientMeasurementUnitSuggestions[recipeStepIngredientIndex] || []
                                  ).find(
                                    (ingredientMeasurementUnitSuggestion: ValidMeasurementUnit) =>
                                      ingredientMeasurementUnitSuggestion.pluralName === value,
                                  );

                                  if (!selectedMeasurementUnit) {
                                    console.error("couldn't find measurement unit to add");
                                    return;
                                  }

                                  x.steps[stepIndex].ingredients[recipeStepIngredientIndex].measurementUnit =
                                    selectedMeasurementUnit;
                                });
                              }}
                              data={(step.ingredientMeasurementUnitSuggestions[recipeStepIngredientIndex] || []).map(
                                (validMeasurementUnit: ValidMeasurementUnit) => ({
                                  value: validMeasurementUnit.pluralName,
                                  label: validMeasurementUnit.pluralName,
                                }),
                              )}
                            />
                          </Grid.Col>
                        </Grid>
                      </Box>
                    ),
                  )}

                  <Divider label="using" labelPosition="center" mb="md" />

                  <Select
                    label="Instrument(s)"
                    required={
                      Boolean(step.selectedPreparation?.minimumInstrumentCount) &&
                      step.instruments.length < (step.selectedPreparation?.minimumInstrumentCount || -1)
                    }
                    error={
                      (step.selectedPreparation?.minimumInstrumentCount || -1) > step.instruments.length
                        ? `at least ${step.selectedPreparation?.minimumInstrumentCount} instrument${
                            step.selectedPreparation?.minimumInstrumentCount === 1 ? '' : 's'
                          } required`
                        : undefined
                    }
                    disabled={
                      (step.selectedPreparation?.maximumInstrumentCount || Number.MAX_SAFE_INTEGER) <=
                        step.instruments.length ||
                      determinePreparedInstrumentOptions(pageState.steps, stepIndex)
                        .concat(step.instrumentSuggestions[stepIndex] || [])
                        // don't show instruments that have already been added
                        .filter((recipeStepInstrument: RecipeStepInstrument) => {
                          return !step.instruments.find(
                            (recipeStepInstrument: RecipeStepInstrument) =>
                              recipeStepInstrument.name === recipeStepInstrument.instrument?.name ||
                              recipeStepInstrument.name === recipeStepInstrument.name,
                          );
                        }).length === 0
                    }
                    description={
                      (step.selectedPreparation?.maximumInstrumentCount || Number.MAX_SAFE_INTEGER) <=
                      step.instruments.length
                        ? `maximum instruments added`
                        : ``
                    }
                    onChange={(instrumentName) => {
                      if (instrumentName) {
                        const selectedInstruments = (
                          determinePreparedInstrumentOptions(pageState.steps, stepIndex) || []
                        )
                          .concat(step.instrumentSuggestions || [])
                          .filter((instrumentSuggestion: RecipeStepInstrument) => {
                            if (
                              step.instruments.find(
                                (instrument: RecipeStepInstrument) =>
                                  instrument.instrument?.id === instrumentSuggestion.instrument?.id ||
                                  instrument.name === instrumentSuggestion.name,
                              )
                            ) {
                              return false;
                            }
                            return (
                              instrumentName === instrumentSuggestion.instrument?.name ||
                              instrumentName === instrumentSuggestion.name
                            );
                          })
                          .map((instrumentSuggestion: RecipeStepInstrument) => {
                            return { ...instrumentSuggestion, minimumQuantity: 1, maximumQuantity: 1 };
                          });

                        if (!selectedInstruments || selectedInstruments.length === 0) {
                          console.error("couldn't find instrument to add");
                          return;
                        }

                        updatePageState((x: NewRecipeCreationPageState) => {
                          x.steps[stepIndex].instruments = x.steps[stepIndex].instruments.concat(selectedInstruments);
                          x.steps[stepIndex].instrumentIsRanged.push(false);
                        });
                      }
                    }}
                    value={'Select an instrument'}
                    data={determinePreparedInstrumentOptions(pageState.steps, stepIndex)
                      .concat(step.instrumentSuggestions || [])
                      // don't show instruments that have already been added
                      .filter((recipeStepInstrument: RecipeStepInstrument) => {
                        return !step.instruments.find(
                          (recipeStepInstrument: RecipeStepInstrument) =>
                            recipeStepInstrument.name === recipeStepInstrument.instrument?.name ||
                            recipeStepInstrument.name === recipeStepInstrument.name,
                        );
                      })
                      .map((recipeStepInstrument: RecipeStepInstrument) => ({
                        value: recipeStepInstrument.instrument?.name || recipeStepInstrument.name || 'UNKNOWN',
                        label: recipeStepInstrument.instrument?.name || recipeStepInstrument.name || 'UNKNOWN',
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
                              value={step.instrumentIsRanged[recipeStepInstrumentIndex] ? 'ranged' : 'simple'}
                              onChange={() => {
                                updatePageState((x: NewRecipeCreationPageState) => {
                                  x.steps[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex] =
                                    !x.steps[stepIndex].instrumentIsRanged[recipeStepInstrumentIndex];
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
                                updatePageState((x: NewRecipeCreationPageState) => {
                                  x.steps[stepIndex].instruments.splice(recipeStepInstrumentIndex, 1);
                                });
                              }}
                            >
                              <IconTrash size="md" color="tomato" />
                            </ActionIcon>
                          </Grid.Col>
                        </Grid>

                        <Grid>
                          <Grid.Col span={step.instrumentIsRanged[recipeStepInstrumentIndex] ? 6 : 12}>
                            <NumberInput
                              label={step.instrumentIsRanged[recipeStepInstrumentIndex] ? 'Min. Quantity' : 'Quantity'}
                              value={step.instruments[recipeStepInstrumentIndex].minimumQuantity}
                              required={step.instruments[recipeStepInstrumentIndex].minimumQuantity == 0}
                              min={1}
                              precision={0}
                              onChange={(value) => {
                                if (value) {
                                  updatePageState((x: NewRecipeCreationPageState) => {
                                    x.steps[stepIndex].instruments[recipeStepInstrumentIndex].minimumQuantity = value;
                                  });
                                }
                              }}
                              maxLength={0}
                            />
                          </Grid.Col>

                          {step.instrumentIsRanged[recipeStepInstrumentIndex] && (
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Max Quantity"
                                maxLength={0}
                                min={0}
                                precision={0}
                                onChange={(value) => {
                                  if (value) {
                                    updatePageState((x: NewRecipeCreationPageState) => {
                                      x.steps[stepIndex].instruments[recipeStepInstrumentIndex].maximumQuantity =
                                        Math.min(
                                          x.steps[stepIndex].instruments[recipeStepInstrumentIndex].minimumQuantity,
                                          value,
                                        );
                                    });
                                  }
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

                <Divider label="until" labelPosition="center" my="md" />

                {(step.completionConditions || []).map(
                  (completionCondition: IRecipeStepCompletionCondition, conditionIndex: number) => {
                    return (
                      <div key={conditionIndex}>
                        <Grid>
                          <Grid.Col span="auto">
                            <Select
                              disabled={step.ingredients.length === 0 || !completionCondition.ingredientState.id}
                              label="Add Ingredient"
                              required={completionCondition.ingredients.length === 0}
                              data={(step.ingredients || [])
                                .filter(
                                  (recipeStepIngredient: IRecipeStepIngredient) => recipeStepIngredient.ingredient,
                                )
                                .map((recipeStepIngredient: IRecipeStepIngredient) => {
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
                              aria-label="recipe step completion condition ingredient state"
                              required={!step.completionConditions[conditionIndex].ingredientState.id}
                              disabled={step.ingredients.length === 0}
                              value={step.completionConditionIngredientStateQueries[conditionIndex]}
                              data={(step.completionConditionIngredientStateSuggestions[conditionIndex] || []).map(
                                (validIngredientState: ValidIngredientState) => {
                                  return {
                                    value: validIngredientState.name,
                                    label: validIngredientState.name,
                                  };
                                },
                              )}
                              onChange={(value: string) => {
                                updatePageState((x: NewRecipeCreationPageState) => {
                                  x.steps[stepIndex].completionConditionIngredientStateQueries[conditionIndex] = value;
                                  x.completionConditionIngredientStateQueryToExecute = {
                                    query: value,
                                    stepIndex: stepIndex,
                                    secondaryIndex: conditionIndex,
                                  };
                                });
                              }}
                              onItemSubmit={(value: AutocompleteItem) => {
                                const selectedIngredientState = (
                                  pageState.steps[stepIndex].completionConditionIngredientStateSuggestions[
                                    conditionIndex
                                  ] || []
                                ).find(
                                  (validIngredientState: ValidIngredientState) =>
                                    validIngredientState.name === value.value,
                                );

                                if (!selectedIngredientState) {
                                  console.error("couldn't find ingredient state to add");
                                  return;
                                }

                                updatePageState((x: NewRecipeCreationPageState) => {
                                  x.steps[stepIndex].completionConditions[conditionIndex].ingredientState =
                                    selectedIngredientState;
                                });
                              }}
                              rightSection={
                                step.completionConditions[conditionIndex].ingredientState.id && (
                                  <IconCircleX
                                    size={18}
                                    color={
                                      step.completionConditionIngredientStateQueries[conditionIndex] === ''
                                        ? 'gray'
                                        : 'tomato'
                                    }
                                    onClick={() => {
                                      if (step.completionConditionIngredientStateQueries[conditionIndex] === '') {
                                        return;
                                      }

                                      updatePageState((x: NewRecipeCreationPageState) => {
                                        x.steps[stepIndex].completionConditions[conditionIndex].ingredientState =
                                          new ValidIngredientState();
                                      });
                                    }}
                                  />
                                )
                              }
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
                                updatePageState((x: NewRecipeCreationPageState) => {
                                  x.steps[stepIndex].completionConditions.splice(conditionIndex, 1);
                                });
                              }}
                            >
                              <IconTrash size="md" color="tomato" />
                            </ActionIcon>
                          </Grid.Col>
                        </Grid>
                      </div>
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
                          updatePageState((x: NewRecipeCreationPageState) => {
                            x.steps[stepIndex].completionConditions.push(new RecipeStepCompletionCondition());
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
                          value={pageState.steps[stepIndex].productIsRanged[productIndex] ? 'ranged' : 'simple'}
                          onChange={() => {
                            updatePageState((x: NewRecipeCreationPageState) => {
                              x.steps[stepIndex].productIsRanged[productIndex] =
                                !x.steps[stepIndex].productIsRanged[productIndex];
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
                            updatePageState((x: NewRecipeCreationPageState) => {
                              product.type = value;
                            });
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col md="auto" sm={12}>
                        <NumberInput
                          min={0}
                          precision={2}
                          label={step.productIsRanged[productIndex] ? 'Min. Quantity' : 'Quantity'}
                          disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                          onChange={(value: number) => {
                            updatePageState((x: NewRecipeCreationPageState) => {
                              product.maximumQuantity = value;
                            });
                          }}
                          value={product.minimumQuantity}
                          required={product.minimumQuantity == 0}
                        />
                      </Grid.Col>

                      {step.productIsRanged[productIndex] && (
                        <Grid.Col md="auto" sm={12}>
                          <NumberInput
                            label="Max Quantity"
                            min={0}
                            precision={2}
                            disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                            onChange={(value: number) => {
                              updatePageState((x: NewRecipeCreationPageState) => {
                                product.maximumQuantity = Math.max(product.minimumQuantity, value);
                              });
                            }}
                            value={product.maximumQuantity}
                          />
                        </Grid.Col>
                      )}

                      <Grid.Col md="auto" sm={12}>
                        <Autocomplete
                          label="Measurement"
                          aria-label="product measurement unit selection"
                          disabled={
                            !Boolean(step.selectedPreparation) &&
                            product.type === 'ingredient' &&
                            step.ingredients.length === 0
                          }
                          error={
                            Boolean(step.selectedPreparation) &&
                            product.type === 'ingredient' &&
                            step.ingredients.length === 0 &&
                            !step.products[productIndex].measurementUnit.id
                              ? 'required'
                              : ''
                          }
                          required={Boolean(step.selectedPreparation) && step.ingredients.length > 0}
                          value={step.productMeasurementUnitQueries[productIndex]}
                          onChange={(value: string) => {
                            updatePageState((x: NewRecipeCreationPageState) => {
                              x.steps[stepIndex].productMeasurementUnitQueries[productIndex] = value;
                              x.steps[stepIndex].products[productIndex].measurementUnit.name = value;
                              x.productMeasurementUnitQueryToExecute = {
                                query: value,
                                stepIndex: stepIndex,
                                secondaryIndex: productIndex,
                              };
                            });
                          }}
                          data={(step.productMeasurementUnitSuggestions[productIndex] || []).map(
                            (validMeasurementUnit: ValidMeasurementUnit) => ({
                              value: validMeasurementUnit.pluralName,
                              label: validMeasurementUnit.pluralName,
                            }),
                          )}
                          onItemSubmit={(value: AutocompleteItem) =>
                            updatePageState((x: NewRecipeCreationPageState) => {
                              const selectedMeasurementUnit = (
                                step.productMeasurementUnitSuggestions[productIndex] || []
                              ).find(
                                (productMeasurementUnitSuggestion: ValidMeasurementUnit) =>
                                  productMeasurementUnitSuggestion.pluralName === value.value,
                              );

                              if (!selectedMeasurementUnit) {
                                return;
                              }

                              x.steps[stepIndex].products[productIndex].measurementUnit = selectedMeasurementUnit;
                              x.productMeasurementUnitQueryToExecute = null;
                              x.steps[stepIndex].productMeasurementUnitSuggestions[productIndex] = [];
                            })
                          }
                          rightSection={
                            step.products[productIndex].measurementUnit.id && (
                              <IconCircleX
                                size={18}
                                color={step.productMeasurementUnitQueries[productIndex] === '' ? 'gray' : 'tomato'}
                                onClick={() => {
                                  updatePageState((x: NewRecipeCreationPageState) => {
                                    x.steps[stepIndex].productMeasurementUnitQueries[productIndex] = '';
                                    x.steps[stepIndex].productMeasurementUnitSuggestions[productIndex] = [];
                                    x.steps[stepIndex].products[productIndex].measurementUnit =
                                      new ValidMeasurementUnit();
                                  });
                                }}
                              />
                            )
                          }
                        />
                      </Grid.Col>

                      <Grid.Col span="auto">
                        <TextInput
                          required={Boolean(step.selectedPreparation)}
                          error={Boolean(step.selectedPreparation) ? 'required' : ''}
                          label="Product Name"
                          disabled={step.productsNamedManually[productIndex]}
                          value={product.name}
                          onChange={(event) => {
                            updatePageState((x: NewRecipeCreationPageState) => {
                              x.name = event.target.value;
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
                            updatePageState((x: NewRecipeCreationPageState) => {
                              x.steps[stepIndex].productsNamedManually[productIndex] =
                                !x.steps[stepIndex].productsNamedManually[productIndex];
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
                            onClick={() => {
                              updatePageState((x: NewRecipeCreationPageState) => {
                                x.steps[stepIndex].products.push(new RecipeStepProduct());
                              });
                            }}
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
                  onChange={(event) => {
                    updatePageState((x: NewRecipeCreationPageState) => {
                      x.name = event.target.value;
                    });
                  }}
                  mt="xs"
                />

                <NumberInput
                  min={1}
                  precision={0}
                  label="Portions"
                  required
                  value={pageState.yieldsPortions}
                  onChange={(amount: number) => {
                    updatePageState((x: NewRecipeCreationPageState) => {
                      x.yieldsPortions = amount;
                    });
                  }}
                  mt="xs"
                />

                <TextInput
                  label="Source"
                  value={pageState.source}
                  onChange={(event) => {
                    updatePageState((x: NewRecipeCreationPageState) => {
                      x.source = event.target.value;
                    });
                  }}
                  mt="xs"
                />

                <Textarea
                  label="Description"
                  value={pageState.description}
                  onChange={(event) => {
                    updatePageState((x: NewRecipeCreationPageState) => {
                      x.description = event.target.value;
                    });
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
                    variant="outline"
                    size="sm"
                    style={{ float: 'right' }}
                    aria-label="show or hide ingredients summary"
                    onClick={() => {
                      updatePageState((x: NewRecipeCreationPageState) => {
                        x.showIngredientsSummary = !x.showIngredientsSummary;
                      });
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
                    variant="outline"
                    size="sm"
                    style={{ float: 'right' }}
                    aria-label="show or hide instruments summary"
                    onClick={() => {
                      updatePageState((x: NewRecipeCreationPageState) => {
                        x.showInstrumentsSummary = !x.showInstrumentsSummary;
                      });
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
                    onClick={() => {
                      updatePageState((x: NewRecipeCreationPageState) => {
                        x.showAdvancedPrepStepInputs = !x.showAdvancedPrepStepInputs;
                      });
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
            </Stack>
          </Grid.Col>

          <Grid.Col span="auto" mt={'2.2rem'} mb="xl">
            {steps}
            <Button
              fullWidth
              onClick={() => {
                updatePageState((x: NewRecipeCreationPageState) => {
                  x.steps.push(new NewRecipeStepCreationPageState());
                });
              }}
              mb="xl"
              disabled={
                pageState.steps.filter((recipeStep: NewRecipeStepCreationPageState) => {
                  return recipeStep.selectedPreparation === null;
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
