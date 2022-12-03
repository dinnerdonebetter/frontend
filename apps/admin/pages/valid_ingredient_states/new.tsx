import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput } from '@mantine/core';
import { z } from 'zod';

import { AppLayout } from '../../lib/layouts';
import { ValidIngredientState, ValidIngredientStateCreationRequestInput } from '@prixfixeco/models';
import { AxiosResponse } from 'axios';
import { buildLocalClient } from '../../lib/client';

const validIngredientStateCreationFormSchema = z.object({
  name: z.string().min(1, 'name is required'),
  slug: z.string().min(1, 'slug is required'),
});

export default function ValidIngredientStateCreator(): JSX.Element {
  const router = useRouter();

  const creationForm = useForm({
    initialValues: {
      pastTense: '',
      description: '',
      name: '',
      slug: '',
    },
    validate: zodResolver(validIngredientStateCreationFormSchema),
  });

  const submit = async () => {
    if (creationForm.validate().hasErrors) {
      return;
    }

    const submission = new ValidIngredientStateCreationRequestInput({
      name: creationForm.values.name,
      description: creationForm.values.description,
      pastTense: creationForm.values.pastTense,
      slug: creationForm.values.slug,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .createValidIngredientState(submission)
      .then((result: AxiosResponse<ValidIngredientState>) => {
        if (result.data) {
          router.push(`/valid_ingredient_states/${result.data.id}`);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Create New Valid Measurement Unit">
      <Container size="xs">
        <form onSubmit={creationForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...creationForm.getInputProps('name')} />
          <TextInput label="Past Tense" placeholder="things" {...creationForm.getInputProps('pastTense')} />
          <TextInput label="Slug" placeholder="thing" {...creationForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...creationForm.getInputProps('description')} />

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
