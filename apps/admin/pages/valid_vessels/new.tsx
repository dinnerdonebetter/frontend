import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput } from '@mantine/core';
import { z } from 'zod';
import { AxiosResponse } from 'axios';

import { ValidVessel, ValidVesselCreationRequestInput } from '@dinnerdonebetter/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient } from '../../src/client';

const validVesselCreationFormSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  pluralName: z.string().trim().min(1, 'plural name is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'slug is required')
    .regex(new RegExp(/^[a-zA-Z\-]{1,}$/gm), 'must match expected URL slug pattern'),
});

export default function ValidVesselCreator(): JSX.Element {
  const router = useRouter();

  const creationForm = useForm({
    initialValues: {
      capacityUnitID: '',
      iconPath: '',
      pluralName: '',
      description: '',
      name: '',
      slug: '',
      shape: '',
      widthInMillimeters: 0,
      lengthInMillimeters: 0,
      heightInMillimeters: 0,
      capacity: 0,
      includeInGeneratedInstructions: true,
      displayInSummaryLists: true,
      usableForStorage: true,
    },
    validate: zodResolver(validVesselCreationFormSchema),
  });

  const submit = async () => {
    const validation = creationForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidVesselCreationRequestInput({
      capacityUnitID: creationForm.values.capacityUnitID,
      iconPath: creationForm.values.iconPath,
      pluralName: creationForm.values.pluralName,
      description: creationForm.values.description,
      name: creationForm.values.name,
      slug: creationForm.values.slug,
      shape: creationForm.values.shape,
      widthInMillimeters: creationForm.values.widthInMillimeters,
      lengthInMillimeters: creationForm.values.lengthInMillimeters,
      heightInMillimeters: creationForm.values.heightInMillimeters,
      capacity: creationForm.values.capacity,
      includeInGeneratedInstructions: creationForm.values.includeInGeneratedInstructions,
      displayInSummaryLists: creationForm.values.displayInSummaryLists,
      usableForStorage: creationForm.values.usableForStorage,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .createValidVessel(submission)
      .then((result: AxiosResponse<ValidVessel>) => {
        if (result.data) {
          router.push(`/valid_vessels/${result.data.id}`);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Create New Valid Vessel">
      <Container size="sm">
        <form onSubmit={creationForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...creationForm.getInputProps('name')} />
          <TextInput label="Plural Name" placeholder="things" {...creationForm.getInputProps('pluralName')} />
          <TextInput label="Slug" placeholder="thing" {...creationForm.getInputProps('slug')} />
          <TextInput
            label="Description"
            placeholder="stuff about things"
            {...creationForm.getInputProps('description')}
          />
          <TextInput label="Icon path" placeholder="thing" {...creationForm.getInputProps('iconPath')} />

          <TextInput label="Shape" placeholder="thing" {...creationForm.getInputProps('shape')} />

          <NumberInput label="Capacity" {...creationForm.getInputProps('capacity')} />
          <TextInput label="Capacity Unit" placeholder="grams" {...creationForm.getInputProps('capacityUnitID')} />

          <NumberInput label="Width (mm)" {...creationForm.getInputProps('widthInMillimeters')} />
          <NumberInput label="Length (mm)" {...creationForm.getInputProps('lengthInMillimeters')} />
          <NumberInput label="Height (mm)" {...creationForm.getInputProps('heightInMillimeters')} />

          <Switch
            checked={creationForm.values.displayInSummaryLists}
            label="Display in summary lists"
            {...creationForm.getInputProps('displayInSummaryLists')}
          />

          <Switch
            checked={creationForm.values.includeInGeneratedInstructions}
            label="Include in generated instructions"
            {...creationForm.getInputProps('includeInGeneratedInstructions')}
          />

          <Switch
            checked={creationForm.values.usableForStorage}
            label="Usable for storage"
            {...creationForm.getInputProps('usableForStorage')}
          />

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
