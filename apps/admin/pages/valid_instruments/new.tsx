import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput } from '@mantine/core';
import { z } from 'zod';

import { AppLayout } from '../../lib/layouts';
import { ValidInstrument, ValidInstrumentCreationRequestInput } from '@prixfixeco/models';
import { AxiosResponse } from 'axios';
import { buildLocalClient } from '../../lib/client';

const validInstrumentCreationFormSchema = z.object({
  name: z.string().min(1, 'name is required'),
  slug: z.string().min(1, 'slug is required'),
});

export default function ValidInstrumentCreator(): JSX.Element {
  const router = useRouter();

  const creationForm = useForm({
    initialValues: {
      name: '',
      pluralName: '',
      description: '',
      iconPath: '',
      slug: '',
      displayInSummaryLists: false,
    },
    validate: zodResolver(validInstrumentCreationFormSchema),
  });

  const submit = async () => {
    if (creationForm.validate().hasErrors) {
      return;
    }

    const submission = new ValidInstrumentCreationRequestInput({
      name: creationForm.values.name,
      pluralName: creationForm.values.pluralName,
      description: creationForm.values.description,
      iconPath: creationForm.values.iconPath,
      slug: creationForm.values.slug,
      displayInSummaryLists: creationForm.values.displayInSummaryLists,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .createValidInstrument(submission)
      .then((result: AxiosResponse<ValidInstrument>) => {
        if (result.data) {
          router.push(`/valid_instruments/${result.data.id}`);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Create New Valid Instrument">
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
          <Switch label="Display in Summary Lists" {...creationForm.getInputProps('displayInSummaryLists')}></Switch>

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
