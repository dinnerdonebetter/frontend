import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput, Select } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { z } from 'zod';

import { AppLayout } from '../../lib/layouts';
import {
  ValidIngredientState,
  ValidIngredientStateAttributeType,
  ValidIngredientStateUpdateRequestInput,
} from '@prixfixeco/models';
import { buildLocalClient, buildServerSideClient } from '../../lib/client';
import { serverSideTracer } from '../../lib/tracer';
import { useState } from 'react';

declare interface ValidIngredientStatePageProps {
  pageLoadValidIngredientState: ValidIngredientState;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidIngredientStatePageProps>> => {
  const span = serverSideTracer.startSpan('ValidIngredientStatePage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { validIngredientStateID } = context.query;
  if (!validIngredientStateID) {
    throw new Error('valid ingredientState ID is somehow missing!');
  }

  const { data: pageLoadValidIngredientState } = await pfClient
    .getValidIngredientState(validIngredientStateID.toString())
    .then((result) => {
      span.addEvent('valid ingredientState retrieved');
      return result;
    });

  span.end();
  return { props: { pageLoadValidIngredientState } };
};

const validIngredientStateUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

function ValidIngredientStatePage(props: ValidIngredientStatePageProps) {
  const { pageLoadValidIngredientState } = props;

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
    <AppLayout title="Create New Valid Ingredient State">
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
      </Container>
    </AppLayout>
  );
}

export default ValidIngredientStatePage;
