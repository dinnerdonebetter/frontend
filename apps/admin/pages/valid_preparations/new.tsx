import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput } from '@mantine/core';
import { z } from 'zod';
import { AxiosResponse } from 'axios';

import { ValidPreparation, ValidPreparationCreationRequestInput } from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient } from '../../src/client';

const validPreparationCreationFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
  pastTense: z.string().min(1, 'past tense is required').trim(),
  slug: z
    .string()
    .min(1, 'slug is required')
    .trim()
    .regex(new RegExp(/^[a-zA-Z\-]{1,}$/gm), 'must match expected URL slug pattern'),
});

export default function ValidPreparationCreator(): JSX.Element {
  const router = useRouter();

  const creationForm = useForm({
    initialValues: {
      name: '',
      description: '',
      yieldsNothing: false,
      restrictToIngredients: true,
      pastTense: '',
      slug: '',
      minimumIngredientCount: 1,
      maximumIngredientCount: undefined,
      minimumInstrumentCount: 1,
      maximumInstrumentCount: undefined,
      temperatureRequired: false,
      timeEstimateRequired: false,
      consumesVessel: false,
      onlyForVessels: false,
      minimumVesselCount: 1,
      universal: false,
      maximumVesselCount: undefined,
    },
    validate: zodResolver(validPreparationCreationFormSchema),
  });

  const submit = async () => {
    const validation = creationForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidPreparationCreationRequestInput({
      name: creationForm.values.name,
      description: creationForm.values.description,
      yieldsNothing: creationForm.values.yieldsNothing,
      restrictToIngredients: creationForm.values.restrictToIngredients,
      pastTense: creationForm.values.pastTense,
      slug: creationForm.values.slug,
      minimumIngredientCount: creationForm.values.minimumIngredientCount,
      maximumIngredientCount: creationForm.values.maximumIngredientCount,
      minimumInstrumentCount: creationForm.values.minimumInstrumentCount,
      maximumInstrumentCount: creationForm.values.maximumInstrumentCount,
      temperatureRequired: creationForm.values.temperatureRequired,
      timeEstimateRequired: creationForm.values.timeEstimateRequired,
      consumesVessel: creationForm.values.consumesVessel,
      onlyForVessels: creationForm.values.onlyForVessels,
      minimumVesselCount: creationForm.values.minimumVesselCount,
      maximumVesselCount: creationForm.values.maximumVesselCount,
      universal: creationForm.values.universal,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .createValidPreparation(submission)
      .then((result: AxiosResponse<ValidPreparation>) => {
        if (result.data) {
          router.push(`/valid_preparations/${result.data.id}`);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Create New Valid Preparation">
      <Container size="sm">
        <form onSubmit={creationForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...creationForm.getInputProps('name')} />
          <TextInput label="Past Tense" placeholder="thinged" {...creationForm.getInputProps('pastTense')} />
          <TextInput label="Slug" placeholder="thing" {...creationForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...creationForm.getInputProps('description')} />

          <Switch
            checked={creationForm.values.yieldsNothing}
            label="Yields Nothing"
            {...creationForm.getInputProps('yieldsNothing')}
          />
          <Switch
            checked={creationForm.values.restrictToIngredients}
            label="Restrict To Ingredients"
            {...creationForm.getInputProps('restrictToIngredients')}
          />
          <Switch
            checked={creationForm.values.temperatureRequired}
            label="Temperature Required"
            {...creationForm.getInputProps('temperatureRequired')}
          />
          <Switch
            checked={creationForm.values.timeEstimateRequired}
            label="Time Estimate Required"
            {...creationForm.getInputProps('timeEstimateRequired')}
          />
          <Switch
            checked={creationForm.values.universal}
            label="Universal"
            {...creationForm.getInputProps('universal')}
          />

          <NumberInput label="Minimum Ingredient Count" {...creationForm.getInputProps('minimumIngredientCount')} />
          <NumberInput label="Maximum Ingredient Count" {...creationForm.getInputProps('maximumIngredientCount')} />
          <NumberInput label="Minimum Instrument Count" {...creationForm.getInputProps('minimumInstrumentCount')} />
          <NumberInput label="Maximum Instrument Count" {...creationForm.getInputProps('maximumInstrumentCount')} />

          <Switch
            checked={creationForm.values.consumesVessel}
            label="Consumes Vessel"
            {...creationForm.getInputProps('consumesVessel')}
          />
          <Switch
            checked={creationForm.values.onlyForVessels}
            label="Only For Vessels"
            {...creationForm.getInputProps('onlyForVessels')}
          />
          <NumberInput label="Minimum Vessel Count" {...creationForm.getInputProps('minimumVesselCount')} />
          <NumberInput label="Maximum Vessel Count" {...creationForm.getInputProps('maximumVesselCount')} />

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
