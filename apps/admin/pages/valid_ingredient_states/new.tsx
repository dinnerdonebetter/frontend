import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Select, Space } from '@mantine/core';
import { z } from 'zod';
import { AxiosResponse } from 'axios';

import {
  ValidIngredientState,
  ValidIngredientStateCreationRequestInput,
  ValidIngredientStateAttributeType,
} from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient } from '../../src/client';

const validIngredientStateCreationFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
  pastTense: z.string().min(1, 'past tense is required').trim(),
  slug: z
    .string()
    .min(1, 'slug is required')
    .trim()
    .regex(new RegExp(/^[a-zA-Z\-]{1,}$/gm), 'must match expected URL slug pattern'),
  attributeType: z.enum([
    'texture',
    'consistency',
    'temperature',
    'color',
    'appearance',
    'odor',
    'taste',
    'sound',
    'other',
  ]),
});

export default function ValidIngredientStateCreator(): JSX.Element {
  const router = useRouter();

  const creationForm = useForm({
    initialValues: {
      pastTense: '',
      description: '',
      name: '',
      slug: '',
      attributeType: 'other',
    },
    validate: zodResolver(validIngredientStateCreationFormSchema),
  });

  const submit = async () => {
    const validation = creationForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidIngredientStateCreationRequestInput({
      name: creationForm.values.name,
      description: creationForm.values.description,
      pastTense: creationForm.values.pastTense,
      slug: creationForm.values.slug,
      attributeType: creationForm.values.attributeType,
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
      <Container size="sm">
        <form onSubmit={creationForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...creationForm.getInputProps('name')} />
          <TextInput label="Past Tense" placeholder="things" {...creationForm.getInputProps('pastTense')} />
          <TextInput label="Slug" placeholder="thing" {...creationForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...creationForm.getInputProps('description')} />

          <Select
            label="Component Type"
            placeholder="Type"
            value={creationForm.values.attributeType}
            onChange={(value: ValidIngredientStateAttributeType) => {
              // dispatchMealUpdate({
              //   type: 'UPDATE_RECIPE_COMPONENT_TYPE',
              //   componentIndex: componentIndex,
              //   componentType: value,
              // })
            }}
            data={[
              { value: 'texture', label: 'texture' },
              { value: 'consistency', label: 'consistency' },
              { value: 'temperature', label: 'temperature' },
              { value: 'color', label: 'color' },
              { value: 'appearance', label: 'appearance' },
              { value: 'odor', label: 'odor' },
              { value: 'taste', label: 'taste' },
              { value: 'sound', label: 'sound' },
              { value: 'other', label: 'other' },
            ]}
            {...creationForm.getInputProps('attributeType')}
          />

          <Group position="center">
            <Button type="submit" mt="sm" fullWidth>
              Submit
            </Button>
          </Group>
        </form>

        <Space h="xl" mb="xl" />
        <Space h="xl" mb="xl" />
      </Container>
    </AppLayout>
  );
}
