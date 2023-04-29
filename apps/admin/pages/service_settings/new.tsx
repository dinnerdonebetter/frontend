import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput, Select } from '@mantine/core';
import { z } from 'zod';
import { AxiosResponse } from 'axios';

import { ServiceSetting, ServiceSettingCreationRequestInput } from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient } from '../../src/client';

const serviceSettingCreationFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

export default function ServiceSettingCreator(): JSX.Element {
  const router = useRouter();

  const creationForm = useForm({
    initialValues: {
      name: '',
      type: 'user',
      description: '',
      enumeration: '',
      adminsOnly: false,
    },
    validate: zodResolver(serviceSettingCreationFormSchema),
  });

  const submit = async () => {
    const validation = creationForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ServiceSettingCreationRequestInput({
      name: creationForm.values.name,
      type: creationForm.values.type,
      description: creationForm.values.description,
      enumeration: creationForm.values.enumeration.split(',').map((item) => item.trim()),
      adminsOnly: creationForm.values.adminsOnly,
    });

    const apiClient = buildLocalClient();
    await apiClient
      .createServiceSetting(submission)
      .then((result: AxiosResponse<ServiceSetting>) => {
        if (result.data) {
          router.push(`/service_settings/${result.data.id}`);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Create New Service Setting">
      <Container size="sm">
        <form onSubmit={creationForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...creationForm.getInputProps('name')} />

          <Select
            label="Type"
            required
            onChange={async (item: string) => {
              creationForm.setFieldValue('type', item);
            }}
            value={creationForm.getInputProps('type').value}
            data={['user', 'household', 'membership']}
          />

          <TextInput label="Description" placeholder="thing" {...creationForm.getInputProps('description')} />
          <TextInput label="Default Value" placeholder="thing" {...creationForm.getInputProps('defaultValue')} />
          <TextInput
            label="Enumeration"
            placeholder="things,and,stuff"
            {...creationForm.getInputProps('enumeration')}
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
