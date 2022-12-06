import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Select, Autocomplete, Divider, List, Space, Title } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';

import {
  ValidIngredientState,
  ValidIngredientStateIngredient,
  ValidIngredientStateIngredientList,
  ValidIngredientStateUpdateRequestInput,
} from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { serverSideTracer } from '../../src/tracer';

declare interface ValidIngredientStatePageProps {
  pageLoadValidIngredientState: ValidIngredientState;
  pageLoadValidIngredientStates: ValidIngredientStateIngredient[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidIngredientStatePageProps>> => {
  const span = serverSideTracer.startSpan('ValidIngredientStatePage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { validIngredientStateID } = context.query;
  if (!validIngredientStateID) {
    throw new Error('valid ingredient state ID is somehow missing!');
  }

  const pageLoadValidIngredientStatePromise = pfClient
    .getValidIngredientState(validIngredientStateID.toString())
    .then((result: AxiosResponse<ValidIngredientState>) => {
      span.addEvent('valid ingredient state retrieved');
      return result.data;
    });

  const pageLoadValidIngredientStatesPromise = pfClient
    .validIngredientStateIngredientsForIngredientStateID(validIngredientStateID.toString())
    .then((res: AxiosResponse<ValidIngredientStateIngredientList>) => {
      span.addEvent('valid ingredient states retrieved');
      return res.data.data || [];
    });

  const [pageLoadValidIngredientState, pageLoadValidIngredientStates] = await Promise.all([
    pageLoadValidIngredientStatePromise,
    pageLoadValidIngredientStatesPromise,
  ]);

  span.end();
  return { props: { pageLoadValidIngredientState, pageLoadValidIngredientStates } };
};

const validIngredientStateUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

function ValidIngredientStatePage(props: ValidIngredientStatePageProps) {
  const { pageLoadValidIngredientState, pageLoadValidIngredientStates } = props;

  const [validIngredientState, setValidIngredientState] = useState<ValidIngredientState>(pageLoadValidIngredientState);
  const [originalValidIngredientState, setOriginalValidIngredientState] =
    useState<ValidIngredientState>(pageLoadValidIngredientState);

  const updateForm = useForm({
    initialValues: validIngredientState,
    validate: zodResolver(validIngredientStateUpdateFormSchema),
  });

  const dataHasChanged = (): boolean => {
    return (
      originalValidIngredientState.name !== updateForm.values.name ||
      originalValidIngredientState.description !== updateForm.values.description ||
      originalValidIngredientState.pastTense !== updateForm.values.pastTense ||
      originalValidIngredientState.slug !== updateForm.values.slug ||
      originalValidIngredientState.attributeType !== updateForm.values.attributeType
    );
  };

  const submit = async () => {
    const validation = updateForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidIngredientStateUpdateRequestInput({
      name: updateForm.values.name,
      description: updateForm.values.description,
      pastTense: updateForm.values.pastTense,
      slug: updateForm.values.slug,
      attributeType: updateForm.values.attributeType,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .updateValidIngredientState(validIngredientState.id, submission)
      .then((result: AxiosResponse<ValidIngredientState>) => {
        if (result.data) {
          updateForm.setValues(result.data);
          setValidIngredientState(result.data);
          setOriginalValidIngredientState(result.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Valid Ingredient State">
      <Container size="xs">
        <form onSubmit={updateForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...updateForm.getInputProps('name')} />
          <TextInput label="Plural Name" placeholder="things" {...updateForm.getInputProps('pastTense')} />
          <TextInput label="Slug" placeholder="thing" {...updateForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...updateForm.getInputProps('description')} />

          <Select
            label="Component Type"
            placeholder="Type"
            value={updateForm.values.attributeType}
            data={[
              { value: 'texture', label: 'texture' },
              { value: 'consistency', label: 'consistency' },
              { value: 'color', label: 'color' },
              { value: 'appearance', label: 'appearance' },
              { value: 'odor', label: 'odor' },
              { value: 'taste', label: 'taste' },
              { value: 'sound', label: 'sound' },
              { value: 'other', label: 'other' },
            ]}
            {...updateForm.getInputProps('attributeType')}
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
          <Title order={3}>Ingredients</Title>

          <List>
            {(pageLoadValidIngredientStates || []).map((ingredientStateIngredient: ValidIngredientStateIngredient) => {
              return (
                <List.Item key={ingredientStateIngredient.id}>
                  <Link href={`/valid_ingredients/${ingredientStateIngredient.ingredient.id}`}>
                    {ingredientStateIngredient.ingredient.name}
                  </Link>
                </List.Item>
              );
            })}
          </List>

          <Space h="xs" />

          <Autocomplete placeholder="garlic" label="Ingredient" data={[]} />
        </form>

        <Space h="xl" mb="xl" />
        <Space h="xl" mb="xl" />
      </Container>
    </AppLayout>
  );
}

export default ValidIngredientStatePage;
