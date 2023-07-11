import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch } from '@mantine/core';
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
      name: '',
      pluralName: '',
      description: '',
      iconPath: '',
      slug: '',
      displayInSummaryLists: true,
      includeInGeneratedInstructions: true,
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
      name: creationForm.values.name,
      pluralName: creationForm.values.pluralName,
      description: creationForm.values.description,
      iconPath: creationForm.values.iconPath,
      slug: creationForm.values.slug,
      displayInSummaryLists: creationForm.values.displayInSummaryLists,
      includeInGeneratedInstructions: creationForm.values.includeInGeneratedInstructions,
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
          <Switch
            checked={creationForm.values.displayInSummaryLists}
            label="Display in Summary Lists"
            {...creationForm.getInputProps('displayInSummaryLists')}
          />

          <Switch
            checked={creationForm.values.includeInGeneratedInstructions}
            label="Include in generated instructions"
            {...creationForm.getInputProps('includeInGeneratedInstructions')}
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
