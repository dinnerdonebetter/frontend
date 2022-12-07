import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import {
  TextInput,
  Button,
  Group,
  Container,
  Switch,
  NumberInput,
  Title,
  Space,
  Autocomplete,
  Divider,
  List,
  AutocompleteItem,
  ActionIcon,
  Grid,
  Table,
  Center,
} from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { IconTrash } from '@tabler/icons';
import Link from 'next/link';

import {
  ValidIngredient,
  ValidIngredientMeasurementUnit,
  ValidIngredientMeasurementUnitCreationRequestInput,
  ValidIngredientMeasurementUnitList,
  ValidIngredientPreparation,
  ValidIngredientPreparationList,
  ValidIngredientStateIngredient,
  ValidIngredientStateIngredientList,
  ValidIngredientUpdateRequestInput,
  ValidMeasurementUnit,
} from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { serverSideTracer } from '../../src/tracer';

declare interface ValidIngredientPageProps {
  pageLoadMeasurementUnits: ValidIngredientMeasurementUnitList;
  pageLoadIngredientPreparations: ValidIngredientPreparation[];
  pageLoadValidIngredientStates: ValidIngredientStateIngredient[];
  pageLoadValidIngredient: ValidIngredient;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidIngredientPageProps>> => {
  const span = serverSideTracer.startSpan('ValidIngredientPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { validIngredientID } = context.query;
  if (!validIngredientID) {
    throw new Error('valid ingredient ID is somehow missing!');
  }

  const pageLoadValidIngredientPromise = pfClient
    .getValidIngredient(validIngredientID.toString())
    .then((result: AxiosResponse<ValidIngredient>) => {
      span.addEvent('valid ingredient retrieved');
      return result.data;
    });

  const pageLoadMeasurementUnitsPromise = pfClient
    .validIngredientMeasurementUnitsForIngredientID(validIngredientID.toString())
    .then((res: AxiosResponse<ValidIngredientMeasurementUnitList>) => {
      span.addEvent('valid ingredient measurement units retrieved');
      return res.data;
    });

  const pageLoadIngredientPreparationsPromise = pfClient
    .validIngredientPreparationsForIngredientID(validIngredientID.toString())
    .then((res: AxiosResponse<ValidIngredientPreparationList>) => {
      span.addEvent('valid ingredient preparations retrieved');
      return res.data.data || [];
    });

  const pageLoadValidIngredientStatesPromise = pfClient
    .validIngredientStateIngredientsForIngredientID(validIngredientID.toString())
    .then((res: AxiosResponse<ValidIngredientStateIngredientList>) => {
      span.addEvent('valid ingredient states retrieved');
      return res.data.data || [];
    });

  const [
    pageLoadValidIngredient,
    pageLoadMeasurementUnits,
    pageLoadIngredientPreparations,
    pageLoadValidIngredientStates,
  ] = await Promise.all([
    pageLoadValidIngredientPromise,
    pageLoadMeasurementUnitsPromise,
    pageLoadIngredientPreparationsPromise,
    pageLoadValidIngredientStatesPromise,
  ]);

  span.end();
  return {
    props: {
      pageLoadValidIngredient,
      pageLoadMeasurementUnits,
      pageLoadIngredientPreparations,
      pageLoadValidIngredientStates,
    },
  };
};

const validIngredientUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

function ValidIngredientPage(props: ValidIngredientPageProps) {
  const {
    pageLoadValidIngredient,
    pageLoadMeasurementUnits,
    pageLoadIngredientPreparations,
    pageLoadValidIngredientStates,
  } = props;

  const apiClient = buildLocalClient();
  const [validIngredient, setValidIngredient] = useState<ValidIngredient>(pageLoadValidIngredient);
  const [originalValidIngredient, setOriginalValidIngredient] = useState<ValidIngredient>(pageLoadValidIngredient);

  const [newMeasurementUnitForIngredientInput, setNewMeasurementUnitForIngredientInput] =
    useState<ValidIngredientMeasurementUnitCreationRequestInput>(
      new ValidIngredientMeasurementUnitCreationRequestInput({
        validIngredientID: validIngredient.id,
      }),
    );
  const [measurementUnitQuery, setMeasurementUnitQuery] = useState('');
  const [measurementUnitsForIngredient, setMeasurementUnitsForIngredient] =
    useState<ValidIngredientMeasurementUnitList>(pageLoadMeasurementUnits);
  const [suggestedMeasurementUnits, setSuggestedMeasurementUnits] = useState<ValidMeasurementUnit[]>([]);

  useEffect(() => {
    if (measurementUnitQuery.length <= 2) {
      setSuggestedMeasurementUnits([]);
      return;
    }

    console.log('searching for measurement units...');

    const pfClient = buildLocalClient();
    pfClient
      .searchForValidMeasurementUnits(measurementUnitQuery)
      .then((res: AxiosResponse<ValidMeasurementUnit[]>) => {
        const newSuggestions = res.data.filter((mu: ValidMeasurementUnit) => {
          return !measurementUnitsForIngredient.data.some((vimu: ValidIngredientMeasurementUnit) => {
            return vimu.measurementUnit.id === mu.id;
          });
        });

        console.log('found measurement units', newSuggestions);

        setSuggestedMeasurementUnits(newSuggestions);
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [measurementUnitQuery]);

  const updateForm = useForm({
    initialValues: validIngredient,
    validate: zodResolver(validIngredientUpdateFormSchema),
  });

  const dataHasChanged = (): boolean => {
    return (
      originalValidIngredient.name !== updateForm.values.name ||
      originalValidIngredient.pluralName !== updateForm.values.pluralName ||
      originalValidIngredient.description !== updateForm.values.description ||
      originalValidIngredient.warning !== updateForm.values.warning ||
      originalValidIngredient.iconPath !== updateForm.values.iconPath ||
      originalValidIngredient.containsDairy !== updateForm.values.containsDairy ||
      originalValidIngredient.containsPeanut !== updateForm.values.containsPeanut ||
      originalValidIngredient.containsTreeNut !== updateForm.values.containsTreeNut ||
      originalValidIngredient.containsEgg !== updateForm.values.containsEgg ||
      originalValidIngredient.containsWheat !== updateForm.values.containsWheat ||
      originalValidIngredient.containsShellfish !== updateForm.values.containsShellfish ||
      originalValidIngredient.containsSesame !== updateForm.values.containsSesame ||
      originalValidIngredient.containsFish !== updateForm.values.containsFish ||
      originalValidIngredient.containsGluten !== updateForm.values.containsGluten ||
      originalValidIngredient.animalFlesh !== updateForm.values.animalFlesh ||
      originalValidIngredient.isMeasuredVolumetrically !== updateForm.values.isMeasuredVolumetrically ||
      originalValidIngredient.isLiquid !== updateForm.values.isLiquid ||
      originalValidIngredient.containsSoy !== updateForm.values.containsSoy ||
      originalValidIngredient.animalDerived !== updateForm.values.animalDerived ||
      originalValidIngredient.restrictToPreparations !== updateForm.values.restrictToPreparations ||
      originalValidIngredient.containsAlcohol !== updateForm.values.containsAlcohol ||
      originalValidIngredient.minimumIdealStorageTemperatureInCelsius !==
        updateForm.values.minimumIdealStorageTemperatureInCelsius ||
      originalValidIngredient.maximumIdealStorageTemperatureInCelsius !==
        updateForm.values.maximumIdealStorageTemperatureInCelsius ||
      originalValidIngredient.slug !== updateForm.values.slug ||
      originalValidIngredient.shoppingSuggestions !== updateForm.values.shoppingSuggestions
    );
  };

  const submit = async () => {
    const validation = updateForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidIngredientUpdateRequestInput({
      name: updateForm.values.name,
      pluralName: updateForm.values.pluralName,
      description: updateForm.values.description,
      warning: updateForm.values.warning,
      iconPath: updateForm.values.iconPath,
      containsDairy: updateForm.values.containsDairy,
      containsPeanut: updateForm.values.containsPeanut,
      containsTreeNut: updateForm.values.containsTreeNut,
      containsEgg: updateForm.values.containsEgg,
      containsWheat: updateForm.values.containsWheat,
      containsShellfish: updateForm.values.containsShellfish,
      containsSesame: updateForm.values.containsSesame,
      containsFish: updateForm.values.containsFish,
      containsGluten: updateForm.values.containsGluten,
      animalFlesh: updateForm.values.animalFlesh,
      isMeasuredVolumetrically: updateForm.values.isMeasuredVolumetrically,
      isLiquid: updateForm.values.isLiquid,
      containsSoy: updateForm.values.containsSoy,
      animalDerived: updateForm.values.animalDerived,
      restrictToPreparations: updateForm.values.restrictToPreparations,
      containsAlcohol: updateForm.values.containsAlcohol,
      minimumIdealStorageTemperatureInCelsius: updateForm.values.minimumIdealStorageTemperatureInCelsius,
      maximumIdealStorageTemperatureInCelsius: updateForm.values.maximumIdealStorageTemperatureInCelsius,
      slug: updateForm.values.slug,
      shoppingSuggestions: updateForm.values.shoppingSuggestions,
    });

    await apiClient
      .updateValidIngredient(validIngredient.id, submission)
      .then((result: AxiosResponse<ValidIngredient>) => {
        if (result.data) {
          updateForm.setValues(result.data);
          setValidIngredient(result.data);
          setOriginalValidIngredient(result.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Valid Ingredient">
      <Container size="xs">
        <form onSubmit={updateForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...updateForm.getInputProps('name')} />
          <TextInput label="Slug" placeholder="thing" {...updateForm.getInputProps('slug')} />
          <TextInput label="Plural Name" placeholder="things" {...updateForm.getInputProps('pluralName')} />
          <TextInput
            label="Description"
            placeholder="stuff about things"
            {...updateForm.getInputProps('description')}
          />
          <TextInput label="Warning" placeholder="warning" {...updateForm.getInputProps('warning')} />
          <NumberInput
            label="Min Storage Temp (C°)"
            {...updateForm.getInputProps('minimumIdealStorageTemperatureInCelsius')}
          />
          <NumberInput
            label="Max Storage Temp (C°)"
            {...updateForm.getInputProps('maximumIdealStorageTemperatureInCelsius')}
          />

          <Switch
            checked={updateForm.values.containsDairy}
            label="Contains Dairy"
            {...updateForm.getInputProps('containsDairy')}
          />
          <Switch
            checked={updateForm.values.containsPeanut}
            label="Contains Peanut"
            {...updateForm.getInputProps('containsPeanut')}
          />
          <Switch
            checked={updateForm.values.containsTreeNut}
            label="Contains TreeNut"
            {...updateForm.getInputProps('containsTreeNut')}
          />
          <Switch
            checked={updateForm.values.containsEgg}
            label="Contains Egg"
            {...updateForm.getInputProps('containsEgg')}
          />
          <Switch
            checked={updateForm.values.containsWheat}
            label="Contains Wheat"
            {...updateForm.getInputProps('containsWheat')}
          />
          <Switch
            checked={updateForm.values.containsShellfish}
            label="Contains Shellfish"
            {...updateForm.getInputProps('containsShellfish')}
          />
          <Switch
            checked={updateForm.values.containsSesame}
            label="Contains Sesame"
            {...updateForm.getInputProps('containsSesame')}
          />
          <Switch
            checked={updateForm.values.containsFish}
            label="Contains Fish"
            {...updateForm.getInputProps('containsFish')}
          />
          <Switch
            checked={updateForm.values.containsGluten}
            label="Contains Gluten"
            {...updateForm.getInputProps('containsGluten')}
          />
          <Switch
            checked={updateForm.values.containsSoy}
            label="Contains Soy"
            {...updateForm.getInputProps('containsSoy')}
          />
          <Switch
            checked={updateForm.values.containsAlcohol}
            label="Contains Alcohol"
            {...updateForm.getInputProps('containsAlcohol')}
          />
          <Switch
            checked={updateForm.values.animalFlesh}
            label="Animal Flesh"
            {...updateForm.getInputProps('animalFlesh')}
          />
          <Switch
            checked={updateForm.values.animalDerived}
            label="Animal Derived"
            {...updateForm.getInputProps('animalDerived')}
          />
          <Switch
            checked={updateForm.values.isMeasuredVolumetrically}
            label="Measured Volumetrically"
            {...updateForm.getInputProps('isMeasuredVolumetrically')}
          />
          <Switch checked={updateForm.values.isLiquid} label="Liquid" {...updateForm.getInputProps('isLiquid')} />
          <Switch
            checked={updateForm.values.restrictToPreparations}
            label="Restrict To Preparations"
            {...updateForm.getInputProps('restrictToPreparations')}
          />

          <Group position="center">
            <Button type="submit" mt="sm" fullWidth disabled={!dataHasChanged()}>
              Submit
            </Button>
          </Group>
        </form>

        <Space h="xl" />
        <Divider />
        <Space h="xl" />

        <form>
          <Center><Title order={4}>Measurement Units</Title></Center>

          <Table mt="xl" withColumnBorders>
            <thead>
              <tr>
                <th>Min Allowed</th>
                <th>Max Allowed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(measurementUnitsForIngredient.data || []).map((measurementUnit: ValidIngredientMeasurementUnit) => {
                return (
                  <tr key={measurementUnit.id}>
                    <td>
                      {measurementUnit.minimumAllowableQuantity}{' '}
                      {measurementUnit.minimumAllowableQuantity === 1
                        ? measurementUnit.measurementUnit.name
                        : measurementUnit.measurementUnit.pluralName}
                    </td>
                    <td>
                      {measurementUnit.maximumAllowableQuantity}{' '}
                      {measurementUnit.minimumAllowableQuantity === 1
                        ? measurementUnit.measurementUnit.name
                        : measurementUnit.measurementUnit.pluralName}
                    </td>
                    <td>
                      <Center>
                        <ActionIcon
                          variant="outline"
                          aria-label="remove valid ingredient measurement unit"
                          onClick={async () => {
                            await apiClient
                              .deleteValidIngredientMeasurementUnit(measurementUnit.id)
                              .then(() => {
                                setMeasurementUnitsForIngredient({
                                  ...measurementUnitsForIngredient,
                                  data: measurementUnitsForIngredient.data.filter(
                                    (x: ValidIngredientMeasurementUnit) => x.id !== measurementUnit.id,
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
              })}
            </tbody>
          </Table>


          <Space h="xs" />

          <Grid>
            <Grid.Col span="auto">
              <Autocomplete
                placeholder="gram"
                label="Measurement Unit"
                value={measurementUnitQuery}
                onChange={setMeasurementUnitQuery}
                onItemSubmit={async (item: AutocompleteItem) => {
                  const selectedMeasurementUnit = suggestedMeasurementUnits.find(
                    (x: ValidMeasurementUnit) => x.pluralName === item.value,
                  );

                  if (!selectedMeasurementUnit) {
                    console.error(`selectedMeasurementUnit not found for item ${item.value}}`);
                    return;
                  }

                  setNewMeasurementUnitForIngredientInput({
                    ...newMeasurementUnitForIngredientInput,
                    validMeasurementUnitID: selectedMeasurementUnit.id,
                  });
                }}
                data={suggestedMeasurementUnits.map((x: ValidMeasurementUnit) => {
                  return { value: x.pluralName, label: x.pluralName };
                })}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <NumberInput
                value={newMeasurementUnitForIngredientInput.minimumAllowableQuantity}
                label="Min. Qty"
                onChange={(value: number) =>
                  setNewMeasurementUnitForIngredientInput({
                    ...newMeasurementUnitForIngredientInput,
                    minimumAllowableQuantity: value,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <NumberInput
                value={newMeasurementUnitForIngredientInput.maximumAllowableQuantity}
                label="Max. Qty"
                onChange={(value: number) =>
                  setNewMeasurementUnitForIngredientInput({
                    ...newMeasurementUnitForIngredientInput,
                    maximumAllowableQuantity: value,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Button
                mt="xl"
                disabled={
                  newMeasurementUnitForIngredientInput.validIngredientID === '' ||
                  newMeasurementUnitForIngredientInput.validMeasurementUnitID === '' ||
                  newMeasurementUnitForIngredientInput.minimumAllowableQuantity === 0
                }
                onClick={async () => {
                  await apiClient
                    .createValidIngredientMeasurementUnit(newMeasurementUnitForIngredientInput)
                    .then((res: AxiosResponse<ValidIngredientMeasurementUnit>) => {
                      // the returned value doesn't have enough information to put it in the list, so we have to fetch it
                      apiClient
                        .getValidIngredientMeasurementUnit(res.data.id)
                        .then((res: AxiosResponse<ValidIngredientMeasurementUnit>) => {
                          const returnedValue = res.data;

                          setMeasurementUnitsForIngredient({
                            ...measurementUnitsForIngredient,
                            data: [...measurementUnitsForIngredient.data, returnedValue],
                          });

                          setNewMeasurementUnitForIngredientInput(
                            new ValidIngredientMeasurementUnitCreationRequestInput({
                              validIngredientID: validIngredient.id,
                              validMeasurementUnitID: '',
                              minimumAllowableQuantity: 0,
                              maximumAllowableQuantity: 0,
                            }),
                          );

                          setMeasurementUnitQuery('');
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

export default ValidIngredientPage;
