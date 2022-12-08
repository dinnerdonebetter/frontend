import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import {
  TextInput,
  Button,
  Group,
  Container,
  Switch,
  Autocomplete,
  Divider,
  List,
  Space,
  Title,
  ActionIcon,
  Text,
  AutocompleteItem,
  Center,
  Grid,
  Pagination,
  Table,
  ThemeIcon,
  NumberInput,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AxiosError, AxiosResponse } from 'axios';
import { IconTrash } from '@tabler/icons';
import { z } from 'zod';

import {
  ValidIngredient,
  ValidIngredientMeasurementUnit,
  ValidIngredientMeasurementUnitList,
  ValidMeasurementUnit,
  ValidMeasurementUnitUpdateRequestInput,
  ValidIngredientMeasurementUnitCreationRequestInput,
  ValidMeasurementConversion,
  ValidMeasurementConversionCreationRequestInput,
} from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { serverSideTracer } from '../../src/tracer';

declare interface ValidMeasurementUnitPageProps {
  pageLoadValidMeasurementUnit: ValidMeasurementUnit;
  pageLoadIngredientsForMeasurementUnit: ValidIngredientMeasurementUnitList;
  pageLoadMeasurementUnitConversionsFromUnit: ValidMeasurementConversion[];
  pageLoadMeasurementUnitConversionsToUnit: ValidMeasurementConversion[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidMeasurementUnitPageProps>> => {
  const span = serverSideTracer.startSpan('ValidMeasurementUnitPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { validMeasurementUnitID } = context.query;
  if (!validMeasurementUnitID) {
    throw new Error('valid measurementUnit ID is somehow missing!');
  }

  const pageLoadValidMeasurementUnitPromise = pfClient
    .getValidMeasurementUnit(validMeasurementUnitID.toString())
    .then((result: AxiosResponse<ValidMeasurementUnit>) => {
      span.addEvent('valid measurement unit retrieved');
      return result.data;
    });

  const pageLoadIngredientsForMeasurementUnitPromise = pfClient
    .validIngredientMeasurementUnitsForMeasurementUnitID(validMeasurementUnitID.toString())
    .then((res: AxiosResponse<ValidIngredientMeasurementUnitList>) => {
      span.addEvent('valid ingredient measurement units retrieved');
      return res.data;
    });

  const pageLoadMeasurementUnitConversionsFromUnitPromise = pfClient
    .getValidMeasurementConversionsFromUnit(validMeasurementUnitID.toString())
    .then((res: AxiosResponse<ValidMeasurementConversion[]>) => {
      span.addEvent('valid ingredient measurement units retrieved');
      return res.data;
    });

  const pageLoadMeasurementUnitConversionsToUnitPromise = pfClient
    .getValidMeasurementConversionsToUnit(validMeasurementUnitID.toString())
    .then((res: AxiosResponse<ValidMeasurementConversion[]>) => {
      span.addEvent('valid ingredient measurement units retrieved');
      return res.data;
    });

  const [
    pageLoadValidMeasurementUnit,
    pageLoadIngredientsForMeasurementUnit,
    pageLoadMeasurementUnitConversionsFromUnit,
    pageLoadMeasurementUnitConversionsToUnit,
  ] = await Promise.all([
    pageLoadValidMeasurementUnitPromise,
    pageLoadIngredientsForMeasurementUnitPromise,
    pageLoadMeasurementUnitConversionsFromUnitPromise,
    pageLoadMeasurementUnitConversionsToUnitPromise,
  ]);

  span.end();
  return {
    props: {
      pageLoadValidMeasurementUnit,
      pageLoadIngredientsForMeasurementUnit,
      pageLoadMeasurementUnitConversionsFromUnit,
      pageLoadMeasurementUnitConversionsToUnit,
    },
  };
};

const validMeasurementUnitUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

function ValidMeasurementUnitPage(props: ValidMeasurementUnitPageProps) {
  const apiClient = buildLocalClient();
  const {
    pageLoadValidMeasurementUnit,
    pageLoadIngredientsForMeasurementUnit,
    pageLoadMeasurementUnitConversionsFromUnit,
    pageLoadMeasurementUnitConversionsToUnit,
  } = props;

  const [validMeasurementUnit, setValidMeasurementUnit] = useState<ValidMeasurementUnit>(pageLoadValidMeasurementUnit);
  const [originalValidMeasurementUnit, setOriginalValidMeasurementUnit] =
    useState<ValidMeasurementUnit>(pageLoadValidMeasurementUnit);

  const [newIngredientForMeasurementUnitInput, setNewIngredientForMeasurementUnitInput] =
    useState<ValidIngredientMeasurementUnitCreationRequestInput>(
      new ValidIngredientMeasurementUnitCreationRequestInput({
        validMeasurementUnitID: validMeasurementUnit.id,
        minimumAllowableQuantity: 1,
      }),
    );
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [ingredientsForMeasurementUnit, setIngredientsForMeasurementUnit] =
    useState<ValidIngredientMeasurementUnitList>(pageLoadIngredientsForMeasurementUnit);
  const [suggestedIngredients, setSuggestedIngredients] = useState<ValidIngredient[]>([]);

  useEffect(() => {
    if (ingredientQuery.length <= 2) {
      setSuggestedIngredients([]);
      return;
    }

    const pfClient = buildLocalClient();
    pfClient
      .searchForValidIngredients(ingredientQuery)
      .then((res: AxiosResponse<ValidIngredient[]>) => {
        const newSuggestions = (res.data || []).filter((mu: ValidIngredient) => {
          return !(ingredientsForMeasurementUnit.data || []).some((vimu: ValidIngredientMeasurementUnit) => {
            return vimu.ingredient.id === mu.id;
          });
        });

        console.log(`found ${newSuggestions.length} suggestions, setting`);
        setSuggestedIngredients(newSuggestions);
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [ingredientQuery]);

  const [newMeasurementUnitConversionFromMeasurementUnit, setNewMeasurementUnitConversionFromMeasurementUnit] =
    useState<ValidMeasurementConversionCreationRequestInput>(
      new ValidMeasurementConversionCreationRequestInput({
        from: validMeasurementUnit.id,
        modifier: 1,
      }),
    );
  const [conversionFromUnitQuery, setConversionFromUnitQuery] = useState('');
  const [measurementUnitsToConvertFrom, setMeasurementUnitsToConvertFrom] = useState<ValidMeasurementConversion[]>(
    pageLoadMeasurementUnitConversionsFromUnit,
  );
  const [suggestedMeasurementUnitsToConvertFrom, setSuggestedMeasurementUnitsToConvertFrom] = useState<
    ValidMeasurementUnit[]
  >([]);
  const [conversionFromOnlyIngredientQuery, setConversionFromOnlyIngredientQuery] = useState('');
  const [suggestedIngredientsToRestrictConversionFrom, setSuggestedIngredientsToRestrictConversionFrom] = useState<
    ValidIngredient[]
  >([]);

  useEffect(() => {
    if (conversionFromUnitQuery.length <= 2) {
      setSuggestedMeasurementUnitsToConvertFrom([]);
      return;
    }

    const pfClient = buildLocalClient();
    pfClient
      .searchForValidMeasurementUnits(conversionFromUnitQuery)
      .then((res: AxiosResponse<ValidMeasurementUnit[]>) => {
        const newSuggestions = (res.data || []).filter((mu: ValidMeasurementUnit) => {
          return mu.id != validMeasurementUnit.id;
        });

        console.log(`found ${newSuggestions.length} suggestions, setting`);
        setSuggestedMeasurementUnitsToConvertFrom(newSuggestions);
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [conversionFromUnitQuery]);

  const [newMeasurementUnitConversionToMeasurementUnit, setNewMeasurementUnitConversionToMeasurementUnit] =
    useState<ValidMeasurementConversionCreationRequestInput>(
      new ValidMeasurementConversionCreationRequestInput({
        to: validMeasurementUnit.id,
        modifier: 1,
      }),
    );
  const [conversionToUnitQuery, setConversionToUnitQuery] = useState('');
  const [measurementUnitsToConvertTo, setMeasurementUnitsToConvertTo] = useState<ValidMeasurementConversion[]>(
    pageLoadMeasurementUnitConversionsToUnit,
  );
  const [suggestedMeasurementUnitsToConvertTo, setSuggestedMeasurementUnitsToConvertTo] = useState<
    ValidMeasurementUnit[]
  >([]);
  const [conversionToOnlyIngredientQuery, setConversionToOnlyIngredientQuery] = useState('');
  const [suggestedIngredientsToRestrictConversionTo, setSuggestedIngredientsToRestrictConversionTo] = useState<
    ValidIngredient[]
  >([]);

  useEffect(() => {
    if (conversionToUnitQuery.length <= 2) {
      setSuggestedMeasurementUnitsToConvertTo([]);
      return;
    }

    const pfClient = buildLocalClient();
    pfClient
      .searchForValidMeasurementUnits(conversionToUnitQuery)
      .then((res: AxiosResponse<ValidMeasurementUnit[]>) => {
        const newSuggestions = (res.data || []).filter((mu: ValidMeasurementUnit) => {
          return mu.id != validMeasurementUnit.id;
        });

        console.log(`found ${newSuggestions.length} suggestions, setting`);
        setSuggestedMeasurementUnitsToConvertTo(newSuggestions);
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [conversionToUnitQuery]);

  useEffect(() => {
    if (conversionFromOnlyIngredientQuery.length <= 2) {
      setSuggestedIngredientsToRestrictConversionFrom([]);
      return;
    }

    const pfClient = buildLocalClient();
    pfClient
      .searchForValidIngredients(conversionFromOnlyIngredientQuery)
      .then((res: AxiosResponse<ValidIngredient[]>) => {
        const newSuggestions = (res.data || []).filter((mu: ValidIngredient) => {
          return !(ingredientsForMeasurementUnit.data || []).some((vimu: ValidIngredientMeasurementUnit) => {
            return vimu.ingredient.id === mu.id;
          });
        });

        console.log(`found ${newSuggestions.length} suggestions, setting`);
        setSuggestedIngredientsToRestrictConversionFrom(newSuggestions);
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [conversionFromOnlyIngredientQuery]);

  useEffect(() => {
    if (conversionToOnlyIngredientQuery.length <= 2) {
      setSuggestedIngredientsToRestrictConversionTo([]);
      return;
    }

    const pfClient = buildLocalClient();
    pfClient
      .searchForValidIngredients(conversionToOnlyIngredientQuery)
      .then((res: AxiosResponse<ValidIngredient[]>) => {
        const newSuggestions = (res.data || []).filter((mu: ValidIngredient) => {
          return !(ingredientsForMeasurementUnit.data || []).some((vimu: ValidIngredientMeasurementUnit) => {
            return vimu.ingredient.id === mu.id;
          });
        });

        console.log(`found ${newSuggestions.length} suggestions, setting`);
        setSuggestedIngredientsToRestrictConversionTo(newSuggestions);
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [conversionToOnlyIngredientQuery]);

  const updateForm = useForm({
    initialValues: validMeasurementUnit,
    validate: zodResolver(validMeasurementUnitUpdateFormSchema),
  });

  const dataHasChanged = (): boolean => {
    return (
      originalValidMeasurementUnit.name !== updateForm.values.name ||
      originalValidMeasurementUnit.description !== updateForm.values.description ||
      originalValidMeasurementUnit.pluralName !== updateForm.values.pluralName ||
      originalValidMeasurementUnit.universal !== updateForm.values.universal ||
      originalValidMeasurementUnit.volumetric !== updateForm.values.volumetric ||
      originalValidMeasurementUnit.metric !== updateForm.values.metric ||
      originalValidMeasurementUnit.imperial !== updateForm.values.imperial ||
      originalValidMeasurementUnit.slug !== updateForm.values.slug
    );
  };

  const submit = async () => {
    const validation = updateForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidMeasurementUnitUpdateRequestInput({
      name: updateForm.values.name,
      description: updateForm.values.description,
      universal: updateForm.values.universal,
      metric: updateForm.values.metric,
      volumetric: updateForm.values.volumetric,
      imperial: updateForm.values.imperial,
      pluralName: updateForm.values.pluralName,
      slug: updateForm.values.slug,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .updateValidMeasurementUnit(validMeasurementUnit.id, submission)
      .then((result: AxiosResponse<ValidMeasurementUnit>) => {
        if (result.data) {
          updateForm.setValues(result.data);
          setValidMeasurementUnit(result.data);
          setOriginalValidMeasurementUnit(result.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Valid MeasurementUnit">
      <Container size="sm">
        <form onSubmit={updateForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...updateForm.getInputProps('name')} />
          <TextInput label="Plural Name" placeholder="things" {...updateForm.getInputProps('pluralName')} />
          <TextInput label="Slug" placeholder="thing" {...updateForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...updateForm.getInputProps('description')} />

          <Switch
            checked={updateForm.values.volumetric}
            label="Volumetric"
            {...updateForm.getInputProps('volumetric')}
          />
          <Switch checked={updateForm.values.universal} label="Universal" {...updateForm.getInputProps('universal')} />
          <Switch checked={updateForm.values.metric} label="Metric" {...updateForm.getInputProps('metric')} />
          <Switch checked={updateForm.values.imperial} label="Imperial" {...updateForm.getInputProps('imperial')} />

          <Group position="center">
            <Button type="submit" mt="sm" fullWidth disabled={!dataHasChanged()}>
              Submit
            </Button>
          </Group>
        </form>

        {!validMeasurementUnit.universal && (
          <>
            {/*

            INGREDIENTS

            */}

            <Space h="xl" />
            <Divider />
            <Space h="xl" />

            <form>
              <Center>
                <Title order={4}>Ingredients</Title>
              </Center>

              {ingredientsForMeasurementUnit.data && (ingredientsForMeasurementUnit.data || []).length !== 0 && (
                <>
                  <Table mt="xl" withColumnBorders>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Min Qty</th>
                        <th>Max Qty</th>
                        <th>Notes</th>
                        <th>
                          <Center>
                            <ThemeIcon variant="outline" color="gray">
                              <IconTrash size="sm" color="gray" />
                            </ThemeIcon>
                          </Center>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ingredientsForMeasurementUnit.data || []).map(
                        (validIngredientMeasurementUnit: ValidIngredientMeasurementUnit) => {
                          return (
                            <tr key={validIngredientMeasurementUnit.id}>
                              <td>
                                <Link href={`/valid_ingredients/${validIngredientMeasurementUnit.ingredient.id}`}>
                                  {validIngredientMeasurementUnit.ingredient.name}
                                </Link>
                              </td>
                              <td>
                                <Text>{validIngredientMeasurementUnit.minimumAllowableQuantity}</Text>
                              </td>
                              <td>
                                <Text>{validIngredientMeasurementUnit.maximumAllowableQuantity}</Text>
                              </td>
                              <td>
                                <Text>{validIngredientMeasurementUnit.notes}</Text>
                              </td>
                              <td>
                                <Center>
                                  <ActionIcon
                                    variant="outline"
                                    aria-label="remove valid ingredient measurement unit"
                                    onClick={async () => {
                                      await apiClient
                                        .deleteValidIngredientMeasurementUnit(validIngredientMeasurementUnit.id)
                                        .then(() => {
                                          setIngredientsForMeasurementUnit({
                                            ...ingredientsForMeasurementUnit,
                                            data: ingredientsForMeasurementUnit.data.filter(
                                              (x: ValidIngredientMeasurementUnit) =>
                                                x.id !== validIngredientMeasurementUnit.id,
                                            ),
                                          });
                                        })
                                        .catch((error) => {
                                          console.error(error);
                                        });
                                    }}
                                  >
                                    <IconTrash size="md" color="tomato" />
                                  </ActionIcon>
                                </Center>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </Table>

                  <Space h="xs" />

                  <Pagination
                    disabled={
                      Math.ceil(ingredientsForMeasurementUnit.totalCount / ingredientsForMeasurementUnit.limit) <=
                      ingredientsForMeasurementUnit.page
                    }
                    position="center"
                    page={ingredientsForMeasurementUnit.page}
                    total={Math.ceil(ingredientsForMeasurementUnit.totalCount / ingredientsForMeasurementUnit.limit)}
                    onChange={(value: number) => {
                      setIngredientsForMeasurementUnit({ ...ingredientsForMeasurementUnit, page: value });
                    }}
                  />
                </>
              )}

              <Grid>
                <Grid.Col span="auto">
                  <Autocomplete
                    placeholder="garlic"
                    label="Ingredient"
                    value={ingredientQuery}
                    onChange={setIngredientQuery}
                    onItemSubmit={async (item: AutocompleteItem) => {
                      const selectedIngredient = suggestedIngredients.find(
                        (x: ValidIngredient) => x.name === item.value,
                      );

                      if (!selectedIngredient) {
                        console.error(`selectedIngredient not found for item ${item.value}}`);
                        return;
                      }

                      setNewIngredientForMeasurementUnitInput({
                        ...newIngredientForMeasurementUnitInput,
                        validIngredientID: selectedIngredient.id,
                      });
                    }}
                    data={suggestedIngredients.map((x: ValidIngredient) => {
                      return { value: x.name, label: x.name };
                    })}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    value={newIngredientForMeasurementUnitInput.minimumAllowableQuantity}
                    label="Min. Qty"
                    onChange={(value: number) =>
                      setNewIngredientForMeasurementUnitInput({
                        ...newIngredientForMeasurementUnitInput,
                        minimumAllowableQuantity: value,
                      })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <NumberInput
                    value={newIngredientForMeasurementUnitInput.maximumAllowableQuantity}
                    label="Max. Qty"
                    onChange={(value: number) =>
                      setNewIngredientForMeasurementUnitInput({
                        ...newIngredientForMeasurementUnitInput,
                        maximumAllowableQuantity: value,
                      })
                    }
                  />
                </Grid.Col>
                <Grid.Col span="auto">
                  <TextInput
                    label="Notes"
                    value={newIngredientForMeasurementUnitInput.notes}
                    onChange={(event) =>
                      setNewIngredientForMeasurementUnitInput({
                        ...newIngredientForMeasurementUnitInput,
                        notes: event.target.value,
                      })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <Button
                    mt="xl"
                    disabled={
                      newIngredientForMeasurementUnitInput.validMeasurementUnitID === '' ||
                      newIngredientForMeasurementUnitInput.validIngredientID === ''
                    }
                    onClick={async () => {
                      await apiClient
                        .createValidIngredientMeasurementUnit(newIngredientForMeasurementUnitInput)
                        .then((res: AxiosResponse<ValidIngredientMeasurementUnit>) => {
                          // the returned value doesn't have enough information to put it in the list, so we have to fetch it
                          apiClient
                            .getValidIngredientMeasurementUnit(res.data.id)
                            .then((res: AxiosResponse<ValidIngredientMeasurementUnit>) => {
                              const returnedValue = res.data;

                              setIngredientsForMeasurementUnit({
                                ...ingredientsForMeasurementUnit,
                                data: [...(ingredientsForMeasurementUnit.data || []), returnedValue],
                              });

                              setNewIngredientForMeasurementUnitInput(
                                new ValidIngredientMeasurementUnitCreationRequestInput({
                                  validMeasurementUnitID: validMeasurementUnit.id,
                                  minimumAllowableQuantity: 1,
                                  validIngredientID: '',
                                  notes: '',
                                }),
                              );

                              setIngredientQuery('');
                            });
                        })
                        .catch((error) => {
                          console.error(error);
                        });
                    }}
                  >
                    Save
                  </Button>
                </Grid.Col>
              </Grid>
            </form>
          </>
        )}

        {/*

        CONVERSIONS FROM THIS MEASUREMENT UNIT

        */}

        <Space h="xl" />
        <Divider />
        <Space h="xl" />

        <form>
          <Center>
            <Title order={4}>Conversions From</Title>
          </Center>

          {measurementUnitsToConvertFrom && (measurementUnitsToConvertFrom || []).length !== 0 && (
            <>
              <Table mt="xl" withColumnBorders>
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Modifier</th>
                    <th>Only For Ingredient</th>
                    <th>Notes</th>
                    <th>
                      <Center>
                        <ThemeIcon variant="outline" color="gray">
                          <IconTrash size="sm" color="gray" />
                        </ThemeIcon>
                      </Center>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(measurementUnitsToConvertFrom || []).map(
                    (validMeasurementConversion: ValidMeasurementConversion) => {
                      return (
                        <tr key={validMeasurementConversion.id}>
                          <td>
                            <Link href={`/valid_measurement_units/${validMeasurementConversion.from.id}`}>
                              {validMeasurementConversion.from.pluralName}
                            </Link>
                          </td>
                          <td>
                            <Link href={`/valid_measurement_units/${validMeasurementConversion.to.id}`}>
                              {validMeasurementConversion.to.pluralName}
                            </Link>
                          </td>
                          <td>
                            <Text>{validMeasurementConversion.modifier}</Text>
                          </td>
                          <td>
                            {(validMeasurementConversion.onlyForIngredient && (
                              <Link href={`/valid_ingredients/${validMeasurementConversion.onlyForIngredient.id}`}>
                                {validMeasurementConversion.to.pluralName}
                              </Link>
                            )) || <Text> - </Text>}
                          </td>
                          <td>
                            <Text>{validMeasurementConversion.notes}</Text>
                          </td>
                          <td>
                            <Center>
                              <ActionIcon
                                variant="outline"
                                aria-label="remove valid ingredient measurement unit"
                                onClick={async () => {
                                  await apiClient
                                    .deleteValidMeasurementConversion(validMeasurementConversion.id)
                                    .then(() => {
                                      setMeasurementUnitsToConvertFrom([
                                        ...measurementUnitsToConvertFrom.filter(
                                          (x: ValidMeasurementConversion) => x.id !== validMeasurementConversion.id,
                                        ),
                                      ]);
                                    })
                                    .catch((error) => {
                                      console.error(error);
                                    });
                                }}
                              >
                                <IconTrash size="md" color="tomato" />
                              </ActionIcon>
                            </Center>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </Table>

              <Space h="xs" />

              {/*
              <Pagination
                disabled={
                  Math.ceil(measurementUnitsToConvertFrom.totalCount / measurementUnitsToConvertFrom.limit) <=
                  measurementUnitsToConvertFrom.page
                }
                position="center"
                page={measurementUnitsToConvertFrom.page}
                total={Math.ceil(measurementUnitsToConvertFrom.totalCount / measurementUnitsToConvertFrom.limit)}
                onChange={(value: number) => {
                  setMeasurementUnitsToConvertFrom({ ...measurementUnitsToConvertFrom, page: value });
                }}
              />
              */}
            </>
          )}

          <Grid>
            <Grid.Col span="auto">
              <Autocomplete
                placeholder="grams"
                label="Measurement Unit"
                value={conversionFromUnitQuery}
                onChange={setConversionFromUnitQuery}
                onItemSubmit={async (item: AutocompleteItem) => {
                  const selectedMeasurementUnit = suggestedMeasurementUnitsToConvertFrom.find(
                    (x: ValidMeasurementUnit) => x.name === item.value,
                  );

                  if (!selectedMeasurementUnit) {
                    console.error(`selectedMeasurementUnit not found for item ${item.value}}`);
                    return;
                  }

                  setNewMeasurementUnitConversionFromMeasurementUnit({
                    ...newMeasurementUnitConversionFromMeasurementUnit,
                    to: selectedMeasurementUnit.id,
                  });
                }}
                data={suggestedMeasurementUnitsToConvertFrom.map((x: ValidMeasurementUnit) => {
                  return { value: x.name, label: x.name };
                })}
              />
            </Grid.Col>
            <Grid.Col span="auto">
              <NumberInput
                label="Modifier"
                step={0.00001}
                precision={5}
                value={newMeasurementUnitConversionFromMeasurementUnit.modifier}
                onChange={(value: number) =>
                  setNewMeasurementUnitConversionFromMeasurementUnit({
                    ...newMeasurementUnitConversionFromMeasurementUnit,
                    modifier: value,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span="auto">
              <Autocomplete
                placeholder="onions"
                label="Only For Ingredient"
                value={conversionFromOnlyIngredientQuery}
                onChange={setConversionFromOnlyIngredientQuery}
                onItemSubmit={async (item: AutocompleteItem) => {
                  const selectedValidIngredient = suggestedIngredientsToRestrictConversionFrom.find(
                    (x: ValidIngredient) => x.name === item.value,
                  );

                  if (!selectedValidIngredient) {
                    console.error(`selectedValidIngredient not found for item ${item.value}}`);
                    return;
                  }

                  setNewMeasurementUnitConversionFromMeasurementUnit({
                    ...newMeasurementUnitConversionFromMeasurementUnit,
                    onlyForIngredient: selectedValidIngredient.id,
                  });
                }}
                data={suggestedIngredientsToRestrictConversionFrom.map((x: ValidIngredient) => {
                  return { value: x.name, label: x.name };
                })}
              />
            </Grid.Col>
            <Grid.Col span="auto">
              <TextInput
                label="Notes"
                value={newMeasurementUnitConversionFromMeasurementUnit.notes}
                onChange={(event) =>
                  setNewMeasurementUnitConversionFromMeasurementUnit({
                    ...newMeasurementUnitConversionFromMeasurementUnit,
                    notes: event.target.value,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Button
                mt="xl"
                disabled={
                  newMeasurementUnitConversionFromMeasurementUnit.from === '' ||
                  newMeasurementUnitConversionFromMeasurementUnit.to === ''
                }
                onClick={async () => {
                  await apiClient
                    .createValidMeasurementConversion(newMeasurementUnitConversionFromMeasurementUnit)
                    .then((res: AxiosResponse<ValidMeasurementConversion>) => {
                      // the returned value doesn't have enough information to put it in the list, so we have to fetch it
                      apiClient
                        .getValidMeasurementConversion(res.data.id)
                        .then((res: AxiosResponse<ValidMeasurementConversion>) => {
                          const returnedValue = res.data;

                          setMeasurementUnitsToConvertFrom([...(measurementUnitsToConvertFrom || []), returnedValue]);

                          setNewMeasurementUnitConversionFromMeasurementUnit(
                            new ValidMeasurementConversionCreationRequestInput({
                              from: validMeasurementUnit.id,
                              to: '',
                              notes: '',
                              modifier: 1,
                            }),
                          );

                          setIngredientQuery('');
                        });
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                }}
              >
                Save
              </Button>
            </Grid.Col>
          </Grid>
        </form>

        {/*

        CONVERSIONS FROM THIS MEASUREMENT UNIT

        */}

        <Space h="xl" />
        <Divider />
        <Space h="xl" />

        <form>
          <Center>
            <Title order={4}>Conversions To</Title>
          </Center>

          {measurementUnitsToConvertTo && (measurementUnitsToConvertTo || []).length !== 0 && (
            <>
              <Table mt="xl" withColumnBorders>
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Modifier</th>
                    <th>Only for Ingredient</th>
                    <th>Notes</th>
                    <th>
                      <Center>
                        <ThemeIcon variant="outline" color="gray">
                          <IconTrash size="sm" color="gray" />
                        </ThemeIcon>
                      </Center>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(measurementUnitsToConvertTo || []).map((validMeasurementConversion: ValidMeasurementConversion) => {
                    return (
                      <tr key={validMeasurementConversion.id}>
                        <td>
                          <Link href={`/valid_measurement_units/${validMeasurementConversion.from.id}`}>
                            {validMeasurementConversion.from.pluralName}
                          </Link>
                        </td>
                        <td>
                          <Link href={`/valid_measurement_units/${validMeasurementConversion.to.id}`}>
                            {validMeasurementConversion.to.pluralName}
                          </Link>
                        </td>
                        <td>
                          <Text>{validMeasurementConversion.modifier}</Text>
                        </td>
                        <td>
                          {(validMeasurementConversion.onlyForIngredient && (
                            <Link href={`/valid_ingredients/${validMeasurementConversion.onlyForIngredient.id}`}>
                              {validMeasurementConversion.to.pluralName}
                            </Link>
                          )) || <Text> - </Text>}
                        </td>
                        <td>
                          <Text>{validMeasurementConversion.notes}</Text>
                        </td>
                        <td>
                          <Center>
                            <ActionIcon
                              variant="outline"
                              aria-label="remove valid ingredient measurement unit"
                              onClick={async () => {
                                await apiClient
                                  .deleteValidMeasurementConversion(validMeasurementConversion.id)
                                  .then(() => {
                                    setMeasurementUnitsToConvertTo([
                                      ...measurementUnitsToConvertTo.filter(
                                        (x: ValidMeasurementConversion) => x.id !== validMeasurementConversion.id,
                                      ),
                                    ]);
                                  })
                                  .catch((error) => {
                                    console.error(error);
                                  });
                              }}
                            >
                              <IconTrash size="md" color="tomato" />
                            </ActionIcon>
                          </Center>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <Space h="xs" />

              {/*
              <Pagination
                disabled={
                  Math.ceil(measurementUnitsToConvertTo.totalCount / measurementUnitsToConvertTo.limit) <=
                  measurementUnitsToConvertTo.page
                }
                position="center"
                page={measurementUnitsToConvertTo.page}
                total={Math.ceil(measurementUnitsToConvertTo.totalCount / measurementUnitsToConvertTo.limit)}
                onChange={(value: number) => {
                  setMeasurementUnitsToConvertTo({ ...measurementUnitsToConvertTo, page: value });
                }}
              />
              */}
            </>
          )}

          <Grid>
            <Grid.Col span="auto">
              <Autocomplete
                placeholder="grams"
                label="Measurement Unit"
                value={conversionToUnitQuery}
                onChange={setConversionToUnitQuery}
                onItemSubmit={async (item: AutocompleteItem) => {
                  const selectedMeasurementUnit = suggestedMeasurementUnitsToConvertTo.find(
                    (x: ValidMeasurementUnit) => x.name === item.value,
                  );

                  if (!selectedMeasurementUnit) {
                    console.error(`selectedMeasurementUnit not found for item ${item.value}}`);
                    return;
                  }

                  setNewMeasurementUnitConversionToMeasurementUnit({
                    ...newMeasurementUnitConversionToMeasurementUnit,
                    from: selectedMeasurementUnit.id,
                  });
                }}
                data={suggestedMeasurementUnitsToConvertTo.map((x: ValidMeasurementUnit) => {
                  return { value: x.name, label: x.name };
                })}
              />
            </Grid.Col>
            <Grid.Col span="auto">
              <NumberInput
                label="Modifier"
                step={0.00001}
                precision={5}
                value={newMeasurementUnitConversionToMeasurementUnit.modifier}
                onChange={(value: number) =>
                  setNewMeasurementUnitConversionToMeasurementUnit({
                    ...newMeasurementUnitConversionToMeasurementUnit,
                    modifier: value,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span="auto">
              <Autocomplete
                placeholder="onions"
                label="Only For Ingredient"
                value={conversionToOnlyIngredientQuery}
                onChange={setConversionToOnlyIngredientQuery}
                onItemSubmit={async (item: AutocompleteItem) => {
                  const selectedValidIngredient = suggestedIngredientsToRestrictConversionTo.find(
                    (x: ValidIngredient) => x.name === item.value,
                  );

                  if (!selectedValidIngredient) {
                    console.error(`selectedValidIngredient not found for item ${item.value}}`);
                    return;
                  }

                  setNewMeasurementUnitConversionToMeasurementUnit({
                    ...newMeasurementUnitConversionToMeasurementUnit,
                    onlyForIngredient: selectedValidIngredient.id,
                  });
                }}
                data={suggestedIngredientsToRestrictConversionTo.map((x: ValidIngredient) => {
                  return { value: x.name, label: x.name };
                })}
              />
            </Grid.Col>
            <Grid.Col span="auto">
              <TextInput
                label="Notes"
                value={newMeasurementUnitConversionToMeasurementUnit.notes}
                onChange={(event) =>
                  setNewMeasurementUnitConversionToMeasurementUnit({
                    ...newMeasurementUnitConversionToMeasurementUnit,
                    notes: event.target.value,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Button
                mt="xl"
                disabled={
                  newMeasurementUnitConversionToMeasurementUnit.from === '' ||
                  newMeasurementUnitConversionToMeasurementUnit.to === ''
                }
                onClick={async () => {
                  await apiClient
                    .createValidMeasurementConversion(newMeasurementUnitConversionToMeasurementUnit)
                    .then((res: AxiosResponse<ValidMeasurementConversion>) => {
                      // the returned value doesn't have enough information to put it in the list, so we have to fetch it
                      apiClient
                        .getValidMeasurementConversion(res.data.id)
                        .then((res: AxiosResponse<ValidMeasurementConversion>) => {
                          const returnedValue = res.data;

                          setMeasurementUnitsToConvertTo([...(measurementUnitsToConvertTo || []), returnedValue]);

                          setNewMeasurementUnitConversionToMeasurementUnit(
                            new ValidMeasurementConversionCreationRequestInput({
                              to: validMeasurementUnit.id,
                              from: '',
                              notes: '',
                              modifier: 1,
                            }),
                          );

                          setIngredientQuery('');
                        });
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                }}
              >
                Save
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </Container>
    </AppLayout>
  );
}

export default ValidMeasurementUnitPage;
