import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, NumberInput } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { z } from 'zod';

import { AppLayout } from '../../lib/layouts';
import { ValidInstrument, ValidInstrumentUpdateRequestInput } from '@prixfixeco/models';
import { buildLocalClient, buildServerSideClient } from '../../lib/client';
import { serverSideTracer } from '../../lib/tracer';
import { useState } from 'react';

declare interface ValidInstrumentPageProps {
  pageLoadValidInstrument: ValidInstrument;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidInstrumentPageProps>> => {
  const span = serverSideTracer.startSpan('ValidInstrumentPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { validInstrumentID } = context.query;
  if (!validInstrumentID) {
    throw new Error('valid instrument ID is somehow missing!');
  }

  const { data: pageLoadValidInstrument } = await pfClient
    .getValidInstrument(validInstrumentID.toString())
    .then((result) => {
      span.addEvent('valid instrument retrieved');
      return result;
    });

  span.end();
  return { props: { pageLoadValidInstrument } };
};

const validInstrumentUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required'),
});

function ValidInstrumentPage(props: ValidInstrumentPageProps) {
  const { pageLoadValidInstrument } = props;

  const [validInstrument, setValidInstrument] = useState<ValidInstrument>(pageLoadValidInstrument);
  const [originalValidInstrument, setOriginalValidInstrument] = useState<ValidInstrument>(pageLoadValidInstrument);

  const updateForm = useForm({
    initialValues: validInstrument,
    validate: zodResolver(validInstrumentUpdateFormSchema),
  });

  const dataHasChanged = (): boolean => {
    return (
      originalValidInstrument.description !== updateForm.values.description ||
      originalValidInstrument.iconPath !== updateForm.values.iconPath ||
      originalValidInstrument.name !== updateForm.values.name ||
      originalValidInstrument.pluralName !== updateForm.values.pluralName ||
      originalValidInstrument.slug !== updateForm.values.slug ||
      originalValidInstrument.displayInSummaryLists !== updateForm.values.displayInSummaryLists
    );
  };

  const submit = async () => {
    const validation = updateForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidInstrumentUpdateRequestInput({
      name: updateForm.values.name,
      pluralName: updateForm.values.pluralName,
      description: updateForm.values.description,
      iconPath: updateForm.values.iconPath,
      slug: updateForm.values.slug,
      displayInSummaryLists: updateForm.values.displayInSummaryLists,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .updateValidInstrument(validInstrument.id, submission)
      .then((result: AxiosResponse<ValidInstrument>) => {
        if (result.data) {
          updateForm.setValues(result.data);
          setValidInstrument(result.data);
          setOriginalValidInstrument(result.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Create New Valid Instrument">
      <Container size="xs">
        <form onSubmit={updateForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...updateForm.getInputProps('name')} />
          <TextInput label="Plural Name" placeholder="things" {...updateForm.getInputProps('pluralName')} />
          <TextInput label="Slug" placeholder="thing" {...updateForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...updateForm.getInputProps('description')} />

          <Switch
            checked={validInstrument.displayInSummaryLists}
            label="Display in summary lists"
            {...updateForm.getInputProps('displayInSummaryLists')}
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

export default ValidInstrumentPage;
