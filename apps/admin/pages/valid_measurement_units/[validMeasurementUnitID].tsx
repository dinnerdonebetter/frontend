import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, Autocomplete, Divider, List, Space, Title } from '@mantine/core';
import { useState } from 'react';
import Link from 'next/link';
import { AxiosResponse } from 'axios';
import { z } from 'zod';

import {
  ValidIngredientMeasurementUnit,
  ValidIngredientMeasurementUnitList,
  ValidMeasurementUnit,
  ValidMeasurementUnitUpdateRequestInput,
} from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { serverSideTracer } from '../../src/tracer';

declare interface ValidMeasurementUnitPageProps {
  pageLoadValidMeasurementUnit: ValidMeasurementUnit;
  pageLoadValidIngredientMeasurementUnits: ValidIngredientMeasurementUnit[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidMeasurementUnitPageProps>> => {
  const span = serverSideTracer.startSpan('ValidMeasurementUnitPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { validMeasurementUnitID } = context.query;
  if (!validMeasurementUnitID) {
    throw new Error('valid measurementUnit ID is somehow missing!');
  }

  const pageLoadValidMeasurementUnitPromise = pfClient
    .getValidMeasurementUnit(validMeasurementUnitID.toString())
    .then((result: AxiosResponse<ValidMeasurementUnit>) => {
      span.addEvent('valid measurement unit retrieved');
      return result.data;
    });

  const pageLoadValidIngredientMeasurementUnitsPromise = pfClient
    .validIngredientMeasurementUnitsForMeasurementUnitID(validMeasurementUnitID.toString())
    .then((res: AxiosResponse<ValidIngredientMeasurementUnitList>) => {
      span.addEvent('valid ingredient measurement units retrieved');
      return res.data.data || [];
    });

  const [pageLoadValidMeasurementUnit, pageLoadValidIngredientMeasurementUnits] = await Promise.all([
    pageLoadValidMeasurementUnitPromise,
    pageLoadValidIngredientMeasurementUnitsPromise,
  ]);

  span.end();
  return { props: { pageLoadValidMeasurementUnit, pageLoadValidIngredientMeasurementUnits } };
};

const validMeasurementUnitUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

function ValidMeasurementUnitPage(props: ValidMeasurementUnitPageProps) {
  const { pageLoadValidMeasurementUnit, pageLoadValidIngredientMeasurementUnits } = props;

  const [validMeasurementUnit, setValidMeasurementUnit] = useState<ValidMeasurementUnit>(pageLoadValidMeasurementUnit);
  const [originalValidMeasurementUnit, setOriginalValidMeasurementUnit] =
    useState<ValidMeasurementUnit>(pageLoadValidMeasurementUnit);

  const updateForm = useForm({
    initialValues: validMeasurementUnit,
    validate: zodResolver(validMeasurementUnitUpdateFormSchema),
  });

  const dataHasChanged = (): boolean => {
    return (
      originalValidMeasurementUnit.name !== updateForm.values.name ||
      originalValidMeasurementUnit.description !== updateForm.values.description ||
      originalValidMeasurementUnit.pluralName !== updateForm.values.pluralName ||
      originalValidMeasurementUnit.slug !== updateForm.values.slug
    );
  };

  const submit = async () => {
    const validation = updateForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidMeasurementUnitUpdateRequestInput({
      name: updateForm.values.name,
      description: updateForm.values.description,
      pluralName: updateForm.values.pluralName,
      slug: updateForm.values.slug,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .updateValidMeasurementUnit(validMeasurementUnit.id, submission)
      .then((result: AxiosResponse<ValidMeasurementUnit>) => {
        if (result.data) {
          updateForm.setValues(result.data);
          setValidMeasurementUnit(result.data);
          setOriginalValidMeasurementUnit(result.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Valid MeasurementUnit">
      <Container size="xs">
        <form onSubmit={updateForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...updateForm.getInputProps('name')} />
          <TextInput label="Plural Name" placeholder="things" {...updateForm.getInputProps('pluralName')} />
          <TextInput label="Slug" placeholder="thing" {...updateForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...updateForm.getInputProps('description')} />

          <Switch
            checked={updateForm.values.volumetric}
            label="Volumetric"
            {...updateForm.getInputProps('volumetric')}
          />
          <Switch checked={updateForm.values.universal} label="Universal" {...updateForm.getInputProps('universal')} />
          <Switch checked={updateForm.values.metric} label="Metric" {...updateForm.getInputProps('metric')} />
          <Switch checked={updateForm.values.imperial} label="Imperial" {...updateForm.getInputProps('imperial')} />

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
            {(pageLoadValidIngredientMeasurementUnits || []).map(
              (validIngredientMeasurementUnit: ValidIngredientMeasurementUnit) => {
                return (
                  <List.Item key={validIngredientMeasurementUnit.id}>
                    <Link href={`/valid_ingredients/${validIngredientMeasurementUnit.ingredient.id}`}>
                      {validIngredientMeasurementUnit.ingredient.name}
                    </Link>
                  </List.Item>
                );
              },
            )}
          </List>

          <Space h="xs" />

          <Autocomplete placeholder="fragrant" label="Ingredient State" data={[]} />
        </form>

        <Space h="xl" mb="xl" />
        <Space h="xl" mb="xl" />
      </Container>
    </AppLayout>
  );
}

export default ValidMeasurementUnitPage;
