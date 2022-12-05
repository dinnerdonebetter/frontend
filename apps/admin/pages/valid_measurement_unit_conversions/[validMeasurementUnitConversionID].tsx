import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { z } from 'zod';

import { AppLayout } from '../../lib/layouts';
import { ValidMeasurementUnitConversion, ValidMeasurementUnitConversionUpdateRequestInput } from '@prixfixeco/models';
import { buildLocalClient, buildServerSideClient } from '../../lib/client';
import { serverSideTracer } from '../../lib/tracer';
import { useState } from 'react';

declare interface ValidMeasurementUnitConversionPageProps {
  pageLoadValidMeasurementUnitConversion: ValidMeasurementUnitConversion;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidMeasurementUnitConversionPageProps>> => {
  const span = serverSideTracer.startSpan('ValidMeasurementUnitConversionPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { validMeasurementUnitConversionID } = context.query;
  if (!validMeasurementUnitConversionID) {
    throw new Error('valid measurementUnitConversion ID is somehow missing!');
  }

  const { data: pageLoadValidMeasurementUnitConversion } = await pfClient
    .getValidMeasurementUnitConversion(validMeasurementUnitConversionID.toString())
    .then((result) => {
      span.addEvent('valid measurementUnitConversion retrieved');
      return result;
    });

  span.end();
  return { props: { pageLoadValidMeasurementUnitConversion } };
};

const validMeasurementUnitConversionUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

function ValidMeasurementUnitConversionPage(props: ValidMeasurementUnitConversionPageProps) {
  const { pageLoadValidMeasurementUnitConversion } = props;

  const [validMeasurementUnitConversion, setValidMeasurementUnitConversion] = useState<ValidMeasurementUnitConversion>(
    pageLoadValidMeasurementUnitConversion,
  );
  const [originalValidMeasurementUnitConversion, setOriginalValidMeasurementUnitConversion] =
    useState<ValidMeasurementUnitConversion>(pageLoadValidMeasurementUnitConversion);

  const updateForm = useForm({
    initialValues: validMeasurementUnitConversion,
    validate: zodResolver(validMeasurementUnitConversionUpdateFormSchema),
  });

  const dataHasChanged = (): boolean => {
    return (
      originalValidMeasurementUnitConversion.name !== updateForm.values.name ||
      originalValidMeasurementUnitConversion.description !== updateForm.values.description ||
      originalValidMeasurementUnitConversion.pluralName !== updateForm.values.pluralName ||
      originalValidMeasurementUnitConversion.slug !== updateForm.values.slug
    );
  };

  const submit = async () => {
    const validation = updateForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidMeasurementUnitConversionUpdateRequestInput({
      name: updateForm.values.name,
      description: updateForm.values.description,
      pluralName: updateForm.values.pluralName,
      slug: updateForm.values.slug,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .updateValidMeasurementUnitConversion(validMeasurementUnitConversion.id, submission)
      .then((result: AxiosResponse<ValidMeasurementUnitConversion>) => {
        if (result.data) {
          updateForm.setValues(result.data);
          setValidMeasurementUnitConversion(result.data);
          setOriginalValidMeasurementUnitConversion(result.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Create New Valid MeasurementUnitConversion">
      <Container size="xs">
        <form onSubmit={updateForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...updateForm.getInputProps('name')} />
          <TextInput label="Plural Name" placeholder="things" {...updateForm.getInputProps('pluralName')} />
          <TextInput label="Slug" placeholder="thing" {...updateForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...updateForm.getInputProps('description')} />

          <Switch
            checked={validMeasurementUnitConversion.volumetric}
            label="Volumetric"
            {...updateForm.getInputProps('volumetric')}
          />
          <Switch
            checked={validMeasurementUnitConversion.universal}
            label="Universal"
            {...updateForm.getInputProps('universal')}
          />
          <Switch
            checked={validMeasurementUnitConversion.metric}
            label="Metric"
            {...updateForm.getInputProps('metric')}
          />
          <Switch
            checked={validMeasurementUnitConversion.imperial}
            label="Imperial"
            {...updateForm.getInputProps('imperial')}
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

export default ValidMeasurementUnitConversionPage;
