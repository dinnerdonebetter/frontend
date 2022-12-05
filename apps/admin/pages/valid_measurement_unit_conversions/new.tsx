import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput } from '@mantine/core';
import { z } from 'zod';

import { AppLayout } from '../../lib/layouts';
import { ValidMeasurementUnitConversion, ValidMeasurementUnitConversionCreationRequestInput } from '@prixfixeco/models';
import { AxiosResponse } from 'axios';
import { buildLocalClient } from '../../lib/client';

const validMeasurementUnitConversionCreationFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
  slug: z.string().min(1, 'slug is required').trim(),
});

export default function ValidMeasurementUnitConversionCreator(): JSX.Element {
  const router = useRouter();

  const creationForm = useForm({
    initialValues: {
      name: '',
      description: '',
      volumetric: false,
      universal: false,
      metric: false,
      imperial: false,
      pluralName: '',
      slug: '',
    },
    validate: zodResolver(validMeasurementUnitConversionCreationFormSchema),
  });

  const submit = async () => {
    if (creationForm.validate().hasErrors) {
      return;
    }

    const submission = new ValidMeasurementUnitConversionCreationRequestInput({
      name: creationForm.values.name,
      description: creationForm.values.description,
      volumetric: creationForm.values.volumetric,
      universal: creationForm.values.universal,
      metric: creationForm.values.metric,
      imperial: creationForm.values.imperial,
      pluralName: creationForm.values.pluralName,
      slug: creationForm.values.slug,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .createValidMeasurementUnitConversion(submission)
      .then((result: AxiosResponse<ValidMeasurementUnitConversion>) => {
        if (result.data) {
          router.push(`/valid_measurement_unit_conversions/${result.data.id}`);
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
          <TextInput label="Plural Name" placeholder="things" {...creationForm.getInputProps('pluralName')} />
          <TextInput label="Slug" placeholder="thing" {...creationForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...creationForm.getInputProps('description')} />

          <Switch
            checked={creationForm.values.volumetric}
            label="Volumetric"
            {...creationForm.getInputProps('volumetric')}
          />
          <Switch
            checked={creationForm.values.universal}
            label="Universal"
            {...creationForm.getInputProps('universal')}
          />
          <Switch checked={creationForm.values.metric} label="Metric" {...creationForm.getInputProps('metric')} />
          <Switch checked={creationForm.values.imperial} label="Imperial" {...creationForm.getInputProps('imperial')} />

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
