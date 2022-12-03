import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput } from '@mantine/core';
import { z } from 'zod';

import { AppLayout } from '../../lib/layouts';
import { ValidIngredient, ValidIngredientCreationRequestInput } from '@prixfixeco/models';
import { AxiosResponse } from 'axios';
import { buildLocalClient } from '../../lib/client';

const validIngredientCreationFormSchema = z.object({
  name: z.string().min(1, 'name is required'),
  slug: z.string().min(1, 'slug is required'),
});

export default function ValidIngredientCreator(): JSX.Element {
  const router = useRouter();

  const creationForm = useForm({
    initialValues: {
      name: '',
      pluralName: '',
      description: '',
      warning: '',
      iconPath: '',
      containsDairy: false,
      containsPeanut: false,
      containsTreeNut: false,
      containsEgg: false,
      containsWheat: false,
      containsShellfish: false,
      containsSesame: false,
      containsFish: false,
      containsGluten: false,
      animalFlesh: false,
      isMeasuredVolumetrically: false,
      isLiquid: false,
      containsSoy: false,
      animalDerived: false,
      restrictToPreparations: false,
      minimumIdealStorageTemperatureInCelsius: undefined,
      maximumIdealStorageTemperatureInCelsius: undefined,
      slug: '',
      shoppingSuggestions: '',
      containsAlcohol: false,
    },
    validate: zodResolver(validIngredientCreationFormSchema),
  });

  const submit = async () => {
    if (creationForm.validate().hasErrors) {
      return;
    }

    const submission = new ValidIngredientCreationRequestInput({
      name: creationForm.values.name,
      pluralName: creationForm.values.pluralName,
      description: creationForm.values.description,
      warning: creationForm.values.warning,
      iconPath: creationForm.values.iconPath,
      containsDairy: creationForm.values.containsDairy,
      containsPeanut: creationForm.values.containsPeanut,
      containsTreeNut: creationForm.values.containsTreeNut,
      containsEgg: creationForm.values.containsEgg,
      containsWheat: creationForm.values.containsWheat,
      containsShellfish: creationForm.values.containsShellfish,
      containsSesame: creationForm.values.containsSesame,
      containsFish: creationForm.values.containsFish,
      containsGluten: creationForm.values.containsGluten,
      animalFlesh: creationForm.values.animalFlesh,
      isMeasuredVolumetrically: creationForm.values.isMeasuredVolumetrically,
      isLiquid: creationForm.values.isLiquid,
      containsSoy: creationForm.values.containsSoy,
      animalDerived: creationForm.values.animalDerived,
      restrictToPreparations: creationForm.values.restrictToPreparations,
      containsAlcohol: creationForm.values.containsAlcohol,
      minimumIdealStorageTemperatureInCelsius: creationForm.values.minimumIdealStorageTemperatureInCelsius,
      maximumIdealStorageTemperatureInCelsius: creationForm.values.maximumIdealStorageTemperatureInCelsius,
      slug: creationForm.values.slug,
      shoppingSuggestions: creationForm.values.shoppingSuggestions,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .createValidIngredient(submission)
      .then((result: AxiosResponse<ValidIngredient>) => {
        if (result.data) {
          router.push(`/valid_ingredients/${result.data.id}`);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Create New Valid Ingredient">
      <Container size="xs">
        <form onSubmit={creationForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...creationForm.getInputProps('name')} />
          <TextInput label="Slug" placeholder="thing" {...creationForm.getInputProps('slug')} />
          <TextInput label="Plural Name" placeholder="things" {...creationForm.getInputProps('pluralName')} />
          <TextInput
            label="Description"
            placeholder="stuff about things"
            {...creationForm.getInputProps('description')}
          />
          <TextInput label="Warning" placeholder="warning" {...creationForm.getInputProps('warning')} />
          <NumberInput
            label="Min Storage Temp (C°)"
            {...creationForm.getInputProps('minimumIdealStorageTemperatureInCelsius')}
          />
          <NumberInput
            label="Max Storage Temp (C°)"
            {...creationForm.getInputProps('maximumIdealStorageTemperatureInCelsius')}
          />
          <Switch label="Contains Dairy" {...creationForm.getInputProps('containsDairy')}></Switch>
          <Switch label="Contains Peanut" {...creationForm.getInputProps('containsPeanut')}></Switch>
          <Switch label="Contains TreeNut" {...creationForm.getInputProps('containsTreeNut')}></Switch>
          <Switch label="Contains Egg" {...creationForm.getInputProps('containsEgg')}></Switch>
          <Switch label="Contains Wheat" {...creationForm.getInputProps('containsWheat')}></Switch>
          <Switch label="Contains Shellfish" {...creationForm.getInputProps('containsShellfish')}></Switch>
          <Switch label="Contains Sesame" {...creationForm.getInputProps('containsSesame')}></Switch>
          <Switch label="Contains Fish" {...creationForm.getInputProps('containsFish')}></Switch>
          <Switch label="Contains Gluten" {...creationForm.getInputProps('containsGluten')}></Switch>
          <Switch label="Contains Soy" {...creationForm.getInputProps('containsSoy')}></Switch>
          <Switch label="Contains Alcohol" {...creationForm.getInputProps('containsAlcohol')}></Switch>
          <Switch label="Animal Flesh" {...creationForm.getInputProps('animalFlesh')}></Switch>
          <Switch label="Animal Derived" {...creationForm.getInputProps('animalDerived')}></Switch>
          <Switch label="Measured Volumetrically" {...creationForm.getInputProps('isMeasuredVolumetrically')}></Switch>
          <Switch label="Liquid" {...creationForm.getInputProps('isLiquid')}></Switch>
          <Switch label="Restrict To Preparations" {...creationForm.getInputProps('restrictToPreparations')}></Switch>

          <Group position="center">
            <Button type="submit" mt="sm" fullWidth>
              Submit
            </Button>
          </Group>
        </form>
      </Container>
    </AppLayout>
  );
}
