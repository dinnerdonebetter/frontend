import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { z } from 'zod';

import { AppLayout } from '../../lib/layouts';
import { ValidMeasurementUnit, ValidMeasurementUnitUpdateRequestInput } from '@prixfixeco/models';
import { buildLocalClient, buildServerSideClient } from '../../lib/client';
import { serverSideTracer } from '../../lib/tracer';
import { useState } from 'react';

declare interface ValidMeasurementUnitPageProps {
  pageLoadValidMeasurementUnit: ValidMeasurementUnit;
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

  const { data: pageLoadValidMeasurementUnit } = await pfClient
    .getValidMeasurementUnit(validMeasurementUnitID.toString())
    .then((result) => {
      span.addEvent('valid measurementUnit retrieved');
      return result;
    });

  span.end();
  return { props: { pageLoadValidMeasurementUnit } };
};

const validMeasurementUnitUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

function ValidMeasurementUnitPage(props: ValidMeasurementUnitPageProps) {
  const { pageLoadValidMeasurementUnit } = props;

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
    <AppLayout title="Create New Valid MeasurementUnit">
      <Container size="xs">
        <form onSubmit={updateForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...updateForm.getInputProps('name')} />
          <TextInput label="Plural Name" placeholder="things" {...updateForm.getInputProps('pluralName')} />
          <TextInput label="Slug" placeholder="thing" {...updateForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...updateForm.getInputProps('description')} />

          <Switch
            checked={validMeasurementUnit.volumetric}
            label="Volumetric"
            {...updateForm.getInputProps('volumetric')}
          />
          <Switch
            checked={validMeasurementUnit.universal}
            label="Universal"
            {...updateForm.getInputProps('universal')}
          />
          <Switch checked={validMeasurementUnit.metric} label="Metric" {...updateForm.getInputProps('metric')} />
          <Switch checked={validMeasurementUnit.imperial} label="Imperial" {...updateForm.getInputProps('imperial')} />

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

export default ValidMeasurementUnitPage;
