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
import { useImmer } from 'use-immer';
import { useRouter } from 'next/router';

import {
  IRecipeStepCompletionCondition,
  IRecipeStepIngredient,
  IRecipeStepProduct,
  IValidPreparation,
  QueryFilteredResult,
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

import { buildLocalClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { NewRecipeCreationPageState, NewRecipeStepCreationPageState } from '../../src/reducers';

function RecipesPage() {
  const router = useRouter();

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
  //
  //   return !Boolean(recipeCreationFormSchema.safeParse(pageState.recipe).success);
  // };

  // const submitRecipe = async () => {
  //   const apiClient = buildLocalClient();
  //   apiClient
  //     .createRecipe(ConvertRecipeToRecipeCreationRequestInput(pageState.recipe))
  //     .then((res: AxiosResponse<Recipe>) => {
  //       router.push(`/meals/${res.data.id}`);
  //     })
  //     .catch((err: AxiosError) => {
  //       console.error(`Failed to create meal: ${err}`);
  //     });
  // };

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

  // const addingStepCompletionConditionsShouldBeDisabled = (step: NewRecipeStepCreationPageState): boolean => {
  //   return (
  //     step.completionConditions.length > 0 &&
  //     step.completionConditions[step.completionConditions.length - 1].ingredientState.id === '' &&
  //     step.completionConditions[step.completionConditions.length - 1].ingredients.length === 0
  //   );
  // };

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
                aria-label="remove step"
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
                    required
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
                      <IconCircleX
                        size={18}
                        color={step.preparationQuery === '' ? 'gray' : 'tomato'}
                        onClick={() => {
                          // clear the preparation
                          updatePageState((x: NewRecipeCreationPageState) => {
                            x.steps[stepIndex].preparationQuery = '';
                            x.preparationQueryToExecute = null;
                            x.steps[stepIndex].selectedPreparation = null;
                            x.steps[stepIndex].preparationSuggestions = [];
                          });
                        }}
                      />
                    }
                  />

                  <Textarea
                    label="Notes"
                    value={step.notes}
                    minRows={2}
                    onChange={(event) => {
                      updatePageState((x: NewRecipeCreationPageState) => {
                        x.steps[stepIndex].notes = event.target.value;
                      });
                    }}
                  />

                  <Divider label="using" labelPosition="center" mb="md" />

                  <Select
                    label="Instrument(s)"
                    required
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
                              required
                              min={1}
                              onChange={(value) => {
                                if (value) {
                                  updatePageState((x: NewRecipeCreationPageState) => {
                                    x.steps[stepIndex].instruments[recipeStepInstrumentIndex].minimumQuantity = value;
                                  });
                                }
                              }}
                              value={step.instruments[recipeStepInstrumentIndex].minimumQuantity}
                              maxLength={0}
                            />
                          </Grid.Col>

                          {step.instrumentIsRanged[recipeStepInstrumentIndex] && (
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Max Quantity"
                                maxLength={0}
                                min={0}
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

                <Divider label="consuming" labelPosition="center" mb="md" />

                <Autocomplete
                  label="Ingredients"
                  required={Boolean(step.selectedPreparation?.minimumIngredientCount)}
                  value={step.ingredientQuery}
                  error={
                    (step.selectedPreparation?.minimumIngredientCount || -1) > step.ingredients.length
                      ? `at least ${step.selectedPreparation?.minimumIngredientCount} ingredient${
                          step.selectedPreparation?.minimumIngredientCount === 1 ? '' : 's'
                        } required`
                      : undefined
                  }
                  disabled={
                    step.selectedPreparation?.name.trim() === '' ||
                    step.selectedPreparation?.maximumIngredientCount === step.ingredients.length
                  }
                  onChange={(value) => {
                    // updatePageState({
                    //   type: 'UPDATE_STEP_INGREDIENT_QUERY',
                    //   newQuery: value,
                    //   stepIndex: stepIndex,
                    // })
                  }}
                  onItemSubmit={(item: AutocompleteItem) => {
                    // updatePageState({
                    //   type: 'ADD_INGREDIENT_TO_STEP',
                    //   stepIndex: stepIndex,
                    //   ingredientName: item.value,
                    // });
                  }}
                  data={(
                    determineAvailableRecipeStepProducts(pageState.steps, stepIndex).concat(
                      step.ingredientSuggestions[stepIndex],
                    ) || []
                  ).map((ingredient: RecipeStepIngredient) =>
                    ingredient
                      ? {
                          value: ingredient.ingredient?.name || ingredient.name || 'UNKNOWN',
                          label: ingredient.ingredient?.name || ingredient.name || 'UNKNOWN',
                        }
                      : { value: 'unknown', label: 'unknown' },
                  )}
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
                            pageState.steps[stepIndex].ingredientIsRanged[recipeStepIngredientIndex]
                              ? 'ranged'
                              : 'simple'
                          }
                          onChange={() => {
                            // updatePageState({
                            //   type: 'TOGGLE_INGREDIENT_RANGE',
                            //   stepIndex,
                            //   recipeStepIngredientIndex,
                            // })
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
                          required
                          onChange={(value) => {
                            // updatePageState({
                            //   type: 'UPDATE_STEP_INGREDIENT_MINIMUM_QUANTITY',
                            //   stepIndex,
                            //   recipeStepIngredientIndex,
                            //   newAmount: value || -1,
                            // })
                          }}
                          value={ingredient.minimumQuantity}
                        />
                      </Grid.Col>

                      {pageState.steps[stepIndex].ingredientIsRanged[recipeStepIngredientIndex] && (
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Max Quantity"
                            onChange={(value) => {
                              // updatePageState({
                              //   type: 'UPDATE_STEP_INGREDIENT_MAXIMUM_QUANTITY',
                              //   stepIndex,
                              //   recipeStepIngredientIndex,
                              //   newAmount: value || -1,
                              // })
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
                          data={(
                            pageState.steps[stepIndex].ingredientMeasurementUnitSuggestions[
                              recipeStepIngredientIndex
                            ] || []
                          ).map((validMeasurementUnit: ValidMeasurementUnit) => ({
                            value: validMeasurementUnit.pluralName,
                            label: validMeasurementUnit.pluralName,
                          }))}
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
                        />
                      </Grid.Col>
                    </Grid>
                  </Box>
                ))}

                <Divider label="until" labelPosition="center" my="md" />

                {(step.completionConditions || []).map(
                  (completionCondition: IRecipeStepCompletionCondition, conditionIndex: number) => {
                    return (
                      <Grid key={conditionIndex}>
                        <Grid.Col span="auto">
                          <Select
                            disabled={step.ingredients.length === 0 || !completionCondition.ingredientState.id}
                            label="Add Ingredient"
                            required
                            data={step.ingredients
                              .filter((recipeStepIngredient: IRecipeStepIngredient) => recipeStepIngredient.ingredient)
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
                            required
                            disabled={step.ingredients.length === 0}
                            value={pageState.steps[stepIndex].completionConditionIngredientStateQueries[conditionIndex]}
                            data={pageState.steps[stepIndex].completionConditionIngredientStateSuggestions[
                              conditionIndex
                            ].map((validIngredientState: ValidIngredientState) => {
                              return {
                                value: validIngredientState.name,
                                label: validIngredientState.name,
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
                              //   ].find((validIngredientState: ValidIngredientState) => validIngredientState.name === value.value),
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

                {(step.products || []).map((product: RecipeStepProduct, productIndex: number) => {
                  return (
                    <Grid key={productIndex}>
                      {/*
                    <Grid.Col span="content">
                      <Switch
                        mt="lg"
                        size="md"
                        onLabel="ranged"
                        offLabel="simple"
                        value={pageState.productIsRanged[stepIndex][productIndex] ? 'ranged' : 'simple'}
                        onChange={() =>{
                          // updatePageState({
                          //   type: 'TOGGLE_PRODUCT_RANGE',
                          //   stepIndex,
                          //   productIndex,
                          // })
                        }}
                      />
                    </Grid.Col>
                    */}

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
                          label={
                            pageState.steps[stepIndex].productIsRanged[productIndex] ? 'Min. Quantity' : 'Quantity'
                          }
                          disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                          onChange={(value) => {
                            // updatePageState({
                            //   type: 'UPDATE_STEP_PRODUCT_MINIMUM_QUANTITY',
                            //   stepIndex,
                            //   productIndex,
                            //   newAmount: value || -1,
                            // })
                          }}
                          value={product.minimumQuantity}
                        />
                      </Grid.Col>

                      {pageState.steps[stepIndex].productIsRanged[productIndex] && (
                        <Grid.Col md="auto" sm={12}>
                          <NumberInput
                            label="Max Quantity"
                            disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                            onChange={(value) => {
                              // updatePageState({
                              //   type: 'UPDATE_STEP_PRODUCT_MAXIMUM_QUANTITY',
                              //   stepIndex,
                              //   productIndex,
                              //   newAmount: value || -1,
                              // })
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
                            (product.type === 'ingredient' && step.ingredients.length === 0)
                          }
                          value={pageState.steps[stepIndex].productMeasurementUnitQueries[productIndex]}
                          data={(pageState.steps[stepIndex].productMeasurementUnitSuggestions[productIndex] || []).map(
                            (validMeasurementUnit: ValidMeasurementUnit) => ({
                              value: validMeasurementUnit.pluralName,
                              label: validMeasurementUnit.pluralName,
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
                          disabled={product.type === 'ingredient' && step.ingredients.length === 0}
                          onClick={() => {
                            // updatePageState({
                            //   type: 'TOGGLE_MANUAL_PRODUCT_NAMING',
                            //   stepIndex,
                            //   productIndex,
                            // })
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
                    updatePageState((x: NewRecipeCreationPageState) => {
                      x.name = event.target.value;
                    });
                  }}
                  mt="xs"
                />

                <NumberInput
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

                <Button>
                  {/* onClick={submitRecipe} disabled={recipeIsReadyForSubmission()} */}
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
                    aria-label="remove step"
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
                <Box>{/* TODO */}</Box>
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
