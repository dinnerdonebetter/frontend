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
  Title,
  Autocomplete,
  AutocompleteItem,
  NumberInput,
  Select,
  Switch,
  Space,
  Collapse,
  Box,
} from '@mantine/core';
import { AxiosResponse, AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { IconEye, IconEyeOff, IconPencil, IconPlus, IconTrash } from '@tabler/icons';
import { useEffect, useReducer } from 'react';

import {
  Recipe,
  RecipeStep,
  RecipeStepIngredient,
  RecipeStepInstrument,
  ValidIngredient,
  ValidMeasurementUnit,
  ValidPreparation,
  ValidPreparationInstrument,
  ValidPreparationInstrumentList,
} from '@prixfixeco/models';

import { AppLayout } from '../../lib/layouts';
import { buildLocalClient } from '../../lib/client';
import { useMealCreationReducer, RecipeCreationPageState } from '../../lib/reducers';

function RecipesPage() {
  const router = useRouter();
  const apiClient = buildLocalClient();

  const [pageState, updatePageState] = useReducer(useMealCreationReducer, new RecipeCreationPageState());

  const submitRecipe = async () => {
    apiClient
      .createRecipe(Recipe.toCreationRequestInput(pageState.recipe))
      .then((res: AxiosResponse<Recipe>) => {
        router.push(`/meals/${res.data.id}`);
      })
      .catch((err: AxiosError) => {
        console.error(`Failed to create meal: ${err}`);
      });
  };

  useEffect(() => {
    if (pageState.preparationQueryToExecute?.query) {
      apiClient
        .searchForValidPreparations(pageState.preparationQueryToExecute.query)
        .then((res: AxiosResponse<ValidPreparation[]>) => {
          updatePageState({
            type: 'UPDATE_STEP_PREPARATION_QUERY_RESULTS',
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
    if (pageState.ingredientQueryToExecute?.query) {
      apiClient
        .searchForValidIngredients(pageState.ingredientQueryToExecute.query)
        .then((res: AxiosResponse<ValidIngredient[]>) => {
          updatePageState({
            type: 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS',
            stepIndex: pageState.ingredientQueryToExecute!.stepIndex,
            results:
              res.data.filter((validIngredient: ValidIngredient) => {
                let found = false;

                pageState.recipe.steps[pageState.ingredientQueryToExecute!.stepIndex].ingredients.forEach(
                  (ingredient) => {
                    if ((ingredient.ingredient?.id || '') === validIngredient.id) {
                      found = true;
                    }
                  },
                );

                // return true if the ingredient is not already used by another ingredient in the step
                return !found;
              }) || [],
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredients: ${err}`);
        });
    }
  }, [pageState.ingredientQueryToExecute]);

  useEffect(() => {
    if (pageState.instrumentQueryToExecute?.query) {
      apiClient
        .validPreparationInstrumentsForPreparationID(pageState.instrumentQueryToExecute.query)
        .then((res: AxiosResponse<ValidPreparationInstrumentList>) => {
          updatePageState({
            type: 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS',
            stepIndex: pageState.instrumentQueryToExecute!.stepIndex,
            results: res.data.data,
          });

          return res.data.data || [];
        })
        .then((instruments: ValidPreparationInstrument[]) => {
          if (instruments.length === 1) {
            updatePageState({
              type: 'ADD_INSTRUMENT_TO_STEP',
              stepIndex: pageState.instrumentQueryToExecute!.stepIndex,
              instrumentName: instruments[0].instrument.name,
            });
          }
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get preparation instruments: ${err}`);
        });
    }
  }, [pageState.instrumentQueryToExecute]);

  useEffect(() => {
    if (pageState.ingredientMeasurementUnitQueryToExecute?.query) {
      apiClient
        .searchForValidMeasurementUnits(pageState.ingredientMeasurementUnitQueryToExecute.query)
        .then((res: AxiosResponse<ValidMeasurementUnit[]>) => {
          updatePageState({
            type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY_RESULTS',
            stepIndex: pageState.ingredientMeasurementUnitQueryToExecute!.stepIndex,
            recipeStepIngredientIndex: pageState.ingredientMeasurementUnitQueryToExecute!.secondaryIndex!,
            results: res.data || [],
          });
          return res.data || [];
        })
        .then((data: ValidMeasurementUnit[]) => {
          if (data.length === 1) {
            updatePageState({
              type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT',
              stepIndex: pageState.ingredientMeasurementUnitQueryToExecute!.stepIndex,
              recipeStepIngredientIndex: pageState.ingredientMeasurementUnitQueryToExecute!.secondaryIndex!,
              measurementUnit: data[0],
            });
          }
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredient measurement units: ${err}`);
        });
    }
  }, [pageState.ingredientMeasurementUnitQueryToExecute]);

  const steps = pageState.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
    return (
      <Card key={stepIndex} shadow="sm" radius="md" withBorder sx={{ width: '100%', marginBottom: '1rem' }}>
        {/* this is the top of the recipe step view, with the step index indicator and the delete step button */}
        <Card.Section px="xs" sx={{ cursor: 'pointer' }}>
          <Grid justify="space-between" align="center">
            <Grid.Col span="auto">
              <Text weight="bold">{`Step #${stepIndex + 1}`}</Text>
            </Grid.Col>
            <Grid.Col span="auto">
              <ActionIcon
                variant="outline"
                size="sm"
                style={{ float: 'right' }}
                aria-label="remove step"
                disabled={pageState.recipe.steps.length === 1}
                onClick={() => updatePageState({ type: 'REMOVE_STEP', stepIndex: stepIndex })}
              >
                <IconTrash size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        </Card.Section>

        {/* this is the first input section, which */}
        <Card.Section px="xs" pb="xs">
          <Grid>
            <Grid.Col md="auto" sm={12}>
              <Textarea
                label="Notes"
                value={step.notes}
                minRows={2}
                onChange={(event) =>
                  updatePageState({
                    type: 'UPDATE_STEP_NOTES',
                    stepIndex: stepIndex,
                    newDescription: event.target.value,
                  })
                }
              />

              <Space h="xl" />

              <Stack>
                <Autocomplete
                  label="Preparation"
                  required
                  tabIndex={0}
                  value={pageState.preparationQueries[stepIndex]}
                  onChange={(value) =>
                    updatePageState({
                      type: 'UPDATE_STEP_PREPARATION_QUERY',
                      stepIndex: stepIndex,
                      newQuery: value,
                    })
                  }
                  data={pageState.preparationSuggestions[stepIndex]
                    .filter((x: ValidPreparation) => {
                      return x.name !== step.preparation.name;
                    })
                    .map((x: ValidPreparation) => ({
                      value: x.name,
                      label: x.name,
                    }))}
                  onItemSubmit={(value) => {
                    updatePageState({
                      type: 'UPDATE_STEP_PREPARATION',
                      stepIndex: stepIndex,
                      preparationName: value.value,
                    });
                  }}
                />

                <Select
                  label="Instrument(s)"
                  required
                  onChange={(instrument) => {
                    if (instrument) {
                      updatePageState({
                        type: 'ADD_INSTRUMENT_TO_STEP',
                        stepIndex: stepIndex,
                        instrumentName: instrument,
                      });
                    }
                  }}
                  value={''}
                  disabled={
                    // disable the select if all instrument suggestions have already been added
                    pageState.instrumentSuggestions[stepIndex].filter((x: ValidPreparationInstrument) => {
                      return !step.instruments.find((y: RecipeStepInstrument) => y.name === x.instrument?.name);
                    }).length === 0
                  }
                  data={pageState.instrumentSuggestions[stepIndex]
                    // don't show instruments that have already been added
                    .filter((x: ValidPreparationInstrument) => {
                      return !step.instruments.find((y: RecipeStepInstrument) => y.name === x.instrument?.name);
                    })
                    .map((x: ValidPreparationInstrument) => ({
                      value: x.instrument.name,
                      label: x.instrument.name,
                    }))}
                />

                {step.instruments.map((instrument: RecipeStepInstrument, recipeStepInstrumentIndex: number) => (
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
                          <IconTrash size="md" color="darkred" />
                        </ActionIcon>
                      </Grid.Col>
                    </Grid>

                    <Grid>
                      <Grid.Col span={pageState.instrumentIsRanged[stepIndex][recipeStepInstrumentIndex] ? 6 : 12}>
                        <NumberInput
                          label={
                            pageState.instrumentIsRanged[stepIndex][recipeStepInstrumentIndex] ? 'Min Amount' : 'Amount'
                          }
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
                            label="Max Amount"
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
                ))}
              </Stack>

              <Space h="xl" />

              <Divider label="consumes" labelPosition="center" mb="md" />

              <Autocomplete
                label="Ingredients"
                required
                value={pageState.ingredientQueries[stepIndex]}
                onChange={(value) =>
                  updatePageState({
                    type: 'UPDATE_STEP_INGREDIENT_QUERY',
                    newQuery: value,
                    stepIndex: stepIndex,
                  })
                }
                disabled={step.preparation.name.trim() === ''}
                onItemSubmit={(item: AutocompleteItem) => {
                  updatePageState({
                    type: 'ADD_INGREDIENT_TO_STEP',
                    stepIndex: stepIndex,
                    ingredientName: item.value,
                  });
                }}
                data={pageState.ingredientSuggestions[stepIndex].map((x: ValidIngredient) => ({
                  value: x.name,
                  label: x.name,
                }))}
                // dropdownPosition="bottom" // TODO: this doesn't work because the card component eats it up
              />

              {step.ingredients.map((ingredient: RecipeStepIngredient, recipeStepIngredientIndex: number) => (
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
                        value={pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex] ? 'ranged' : 'simple'}
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
                        <IconTrash size="md" color="darkred" />
                      </ActionIcon>
                    </Grid.Col>
                  </Grid>

                  <Grid>
                    <Grid.Col span={6}>
                      <NumberInput
                        label={
                          pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex] ? 'Min Amount' : 'Amount'
                        }
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
                          label="Max Amount"
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
                      </Grid.Col>
                    )}

                    <Grid.Col span={pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex] ? 12 : 6}>
                      <Select
                        label="Measurement"
                        value={ingredient.measurementUnit.pluralName}
                        data={pageState.ingredientMeasurementUnitSuggestions[stepIndex][recipeStepIngredientIndex].map(
                          (y: ValidMeasurementUnit) => ({
                            value: y.pluralName,
                            label: y.pluralName,
                          }),
                        )}
                        onChange={(value) => {
                          updatePageState({
                            type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT',
                            stepIndex,
                            recipeStepIngredientIndex,
                            measurementUnit: (
                              pageState.ingredientMeasurementUnitSuggestions[stepIndex][recipeStepIngredientIndex] || []
                            ).find(
                              (ingredientMeasurementUnitSuggestion: ValidMeasurementUnit) =>
                                ingredientMeasurementUnitSuggestion.name === (value || ''),
                            ),
                          });
                        }}
                      />
                    </Grid.Col>
                  </Grid>
                </Box>
              ))}

              <Divider label="produces" labelPosition="center" my="md" />

              {step.products.map((product, productIndex) => {
                return (
                  <Grid key={productIndex}>
                    <Grid.Col md={4} sm={12}>
                      <Select label="Type" value="ingredient" data={['ingredient', 'instrument']} />
                    </Grid.Col>

                    <Grid.Col md="auto" sm={12}>
                      <Autocomplete
                        label="Measurement"
                        value={product.measurementUnit.name}
                        data={[]}
                        onChange={(_value) => {}}
                      />
                    </Grid.Col>

                    <Grid.Col span="auto">
                      <TextInput label="Name" disabled value={product.name} onChange={(_value) => {}} />
                    </Grid.Col>

                    <Grid.Col span="content" mt="xl">
                      <ActionIcon
                        mt={5}
                        style={{ float: 'right' }}
                        variant="outline"
                        size="md"
                        aria-label="add product"
                        disabled={step.ingredients.length === 0}
                        onClick={() => {}}
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
                          disabled={step.products[0].name.trim() === ''}
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
                  value={pageState.recipe.name}
                  onChange={(event) => updatePageState({ type: 'UPDATE_NAME', newName: event.target.value })}
                  mt="xs"
                />
                <TextInput
                  label="Source"
                  value={pageState.recipe.source}
                  onChange={(event) => updatePageState({ type: 'UPDATE_SOURCE', newSource: event.target.value })}
                  mt="xs"
                />
                <Textarea
                  label="Description"
                  value={pageState.recipe.description}
                  onChange={(event) =>
                    updatePageState({ type: 'UPDATE_DESCRIPTION', newDescription: event.target.value })
                  }
                  minRows={4}
                  mt="xs"
                />
                <Button onClick={() => {}} disabled>
                  Save
                </Button>
              </Stack>

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
                    onClick={() => updatePageState({ type: 'TOGGLE_SHOW_ALL_INGREDIENTS' })}
                  >
                    {(pageState.showIngredientsSummary && (
                      <IconEyeOff size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />
                    )) || <IconEye size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />}
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
                    onClick={() => updatePageState({ type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' })}
                  >
                    {(pageState.showInstrumentsSummary && (
                      <IconEyeOff size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />
                    )) || <IconEye size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />}
                  </ActionIcon>
                </Grid.Col>
              </Grid>

              <Divider />

              <Collapse sx={{ minHeight: '10rem' }} in={pageState.showInstrumentsSummary}>
                <Box>{/* TODO */}</Box>
              </Collapse>
            </Stack>
          </Grid.Col>

          <Grid.Col span="auto" mt={'2.2rem'} mb="xl">
            {steps}
            <Button fullWidth onClick={() => updatePageState({ type: 'ADD_STEP' })} mb="xl">
              Add Step
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </AppLayout>
  );
}

export default RecipesPage;
