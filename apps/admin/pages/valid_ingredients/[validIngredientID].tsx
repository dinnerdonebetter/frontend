import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { z } from 'zod';

import { AppLayout } from '../../lib/layouts';
import { ValidIngredient, ValidIngredientUpdateRequestInput } from '@prixfixeco/models';
import { buildLocalClient, buildServerSideClient } from '../../lib/client';
import { serverSideTracer } from '../../lib/tracer';
import { useState } from 'react';

declare interface ValidIngredientPageProps {
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

  const { data: pageLoadValidIngredient } = await pfClient
    .getValidIngredient(validIngredientID.toString())
    .then((result) => {
      span.addEvent('valid ingredient retrieved');
      return result;
    });

  span.end();
  return { props: { pageLoadValidIngredient } };
};

const validIngredientUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

function ValidIngredientPage(props: ValidIngredientPageProps) {
  const { pageLoadValidIngredient } = props;

  const [validIngredient, setValidIngredient] = useState<ValidIngredient>(pageLoadValidIngredient);
  const [originalValidIngredient, setOriginalValidIngredient] = useState<ValidIngredient>(pageLoadValidIngredient);

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

    const apiClient = buildLocalClient();

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
    <AppLayout title="Create New Valid Ingredient">
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
            checked={validIngredient.containsDairy}
            label="Contains Dairy"
            {...updateForm.getInputProps('containsDairy')}
          ></Switch>
          <Switch
            checked={validIngredient.containsPeanut}
            label="Contains Peanut"
            {...updateForm.getInputProps('containsPeanut')}
          ></Switch>
          <Switch
            checked={validIngredient.containsTreeNut}
            label="Contains TreeNut"
            {...updateForm.getInputProps('containsTreeNut')}
          ></Switch>
          <Switch
            checked={validIngredient.containsEgg}
            label="Contains Egg"
            {...updateForm.getInputProps('containsEgg')}
          ></Switch>
          <Switch
            checked={validIngredient.containsWheat}
            label="Contains Wheat"
            {...updateForm.getInputProps('containsWheat')}
          ></Switch>
          <Switch
            checked={validIngredient.containsShellfish}
            label="Contains Shellfish"
            {...updateForm.getInputProps('containsShellfish')}
          ></Switch>
          <Switch
            checked={validIngredient.containsSesame}
            label="Contains Sesame"
            {...updateForm.getInputProps('containsSesame')}
          ></Switch>
          <Switch
            checked={validIngredient.containsFish}
            label="Contains Fish"
            {...updateForm.getInputProps('containsFish')}
          ></Switch>
          <Switch
            checked={validIngredient.containsGluten}
            label="Contains Gluten"
            {...updateForm.getInputProps('containsGluten')}
          ></Switch>
          <Switch
            checked={validIngredient.containsSoy}
            label="Contains Soy"
            {...updateForm.getInputProps('containsSoy')}
          ></Switch>
          <Switch
            checked={validIngredient.containsAlcohol}
            label="Contains Alcohol"
            {...updateForm.getInputProps('containsAlcohol')}
          ></Switch>
          <Switch
            checked={validIngredient.animalFlesh}
            label="Animal Flesh"
            {...updateForm.getInputProps('animalFlesh')}
          ></Switch>
          <Switch
            checked={validIngredient.animalDerived}
            label="Animal Derived"
            {...updateForm.getInputProps('animalDerived')}
          ></Switch>
          <Switch
            checked={validIngredient.isMeasuredVolumetrically}
            label="Measured Volumetrically"
            {...updateForm.getInputProps('isMeasuredVolumetrically')}
          ></Switch>
          <Switch checked={validIngredient.isLiquid} label="Liquid" {...updateForm.getInputProps('isLiquid')}></Switch>
          <Switch
            checked={validIngredient.restrictToPreparations}
            label="Restrict To Preparations"
            {...updateForm.getInputProps('restrictToPreparations')}
          ></Switch>

          <Group position="center">
            <Button type="submit" mt="sm" fullWidth disabled={!dataHasChanged()}>
              Submit
            </Button>
          </Group>
        </form>
      </Container>
    </AppLayout>
  );
}

export default ValidIngredientPage;
