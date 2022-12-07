import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container, Switch, Autocomplete, Divider, List, Space, Title } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { z } from 'zod';
import { useState } from 'react';
import Link from 'next/link';

import {
  ValidInstrument,
  ValidInstrumentUpdateRequestInput,
  ValidPreparationInstrument,
  ValidPreparationInstrumentList,
} from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { serverSideTracer } from '../../src/tracer';

declare interface ValidInstrumentPageProps {
  pageLoadValidInstrument: ValidInstrument;
  pageLoadPreparationInstruments: ValidPreparationInstrument[];
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

  const pageLoadValidInstrumentPromise = pfClient
    .getValidInstrument(validInstrumentID.toString())
    .then((result: AxiosResponse<ValidInstrument>) => {
      span.addEvent('valid instrument retrieved');
      return result.data;
    });

  const pageLoadPreparationInstrumentsPromise = pfClient
    .validPreparationInstrumentsForInstrumentID(validInstrumentID.toString())
    .then((res: AxiosResponse<ValidPreparationInstrumentList>) => {
      return res.data.data || [];
    });

  const [pageLoadValidInstrument, pageLoadPreparationInstruments] = await Promise.all([
    pageLoadValidInstrumentPromise,
    pageLoadPreparationInstrumentsPromise,
  ]);

  span.end();
  return { props: { pageLoadValidInstrument, pageLoadPreparationInstruments } };
};

const validInstrumentUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

function ValidInstrumentPage(props: ValidInstrumentPageProps) {
  const { pageLoadValidInstrument, pageLoadPreparationInstruments } = props;

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
    <AppLayout title="Valid Instrument">
      <Container size="xs">
        <form onSubmit={updateForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...updateForm.getInputProps('name')} />
          <TextInput label="Plural Name" placeholder="things" {...updateForm.getInputProps('pluralName')} />
          <TextInput label="Slug" placeholder="thing" {...updateForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...updateForm.getInputProps('description')} />

          <Switch
            checked={updateForm.values.displayInSummaryLists}
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