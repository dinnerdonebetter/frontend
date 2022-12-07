import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import {
  TextInput,
  Button,
  Group,
  Container,
  Switch,
  NumberInput,
  Autocomplete,
  Divider,
  List,
  Space,
  Title,
} from '@mantine/core';
import { AxiosResponse } from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';

import {
  ValidIngredientPreparation,
  ValidIngredientPreparationList,
  ValidPreparation,
  ValidPreparationInstrument,
  ValidPreparationInstrumentList,
  ValidPreparationUpdateRequestInput,
} from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { serverSideTracer } from '../../src/tracer';

declare interface ValidPreparationPageProps {
  pageLoadValidPreparation: ValidPreparation;
  pageLoadValidPreparationInstruments: ValidPreparationInstrument[];
  pageLoadValidIngredientPreparations: ValidIngredientPreparation[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidPreparationPageProps>> => {
  const span = serverSideTracer.startSpan('ValidPreparationPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { validPreparationID } = context.query;
  if (!validPreparationID) {
    throw new Error('valid preparation ID is somehow missing!');
  }

  const pageLoadValidPreparationPromise = pfClient
    .getValidPreparation(validPreparationID.toString())
    .then((result: AxiosResponse<ValidPreparation>) => {
      span.addEvent('valid preparation retrieved');
      return result.data;
    });

  const pageLoadValidPreparationInstrumentsPromise = pfClient
    .validPreparationInstrumentsForPreparationID(validPreparationID.toString())
    .then((result: AxiosResponse<ValidPreparationInstrumentList>) => {
      span.addEvent('valid preparation retrieved');
      return result.data.data || [];
    });

  const pageLoadValidIngredientPreparationsPromise = pfClient
    .validIngredientPreparationsForPreparationID(validPreparationID.toString())
    .then((result: AxiosResponse<ValidIngredientPreparationList>) => {
      span.addEvent('valid preparation retrieved');
      return result.data.data || [];
    });

  const [pageLoadValidPreparation, pageLoadValidPreparationInstruments, pageLoadValidIngredientPreparations] =
    await Promise.all([
      pageLoadValidPreparationPromise,
      pageLoadValidPreparationInstrumentsPromise,
      pageLoadValidIngredientPreparationsPromise,
    ]);

  span.end();
  return {
    props: { pageLoadValidPreparation, pageLoadValidPreparationInstruments, pageLoadValidIngredientPreparations },
  };
};

const validPreparationUpdateFormSchema = z.object({
  name: z.string().min(1, 'name is required').trim(),
});

function ValidPreparationPage(props: ValidPreparationPageProps) {
  const { pageLoadValidPreparation, pageLoadValidPreparationInstruments, pageLoadValidIngredientPreparations } = props;

  const [validPreparation, setValidPreparation] = useState<ValidPreparation>(pageLoadValidPreparation);
  const [originalValidPreparation, setOriginalValidPreparation] = useState<ValidPreparation>(pageLoadValidPreparation);

  const updateForm = useForm({
    initialValues: validPreparation,
    validate: zodResolver(validPreparationUpdateFormSchema),
  });

  const dataHasChanged = (): boolean => {
    return (
      originalValidPreparation.name !== updateForm.values.name ||
      originalValidPreparation.description !== updateForm.values.description ||
      originalValidPreparation.yieldsNothing !== updateForm.values.yieldsNothing ||
      originalValidPreparation.restrictToIngredients !== updateForm.values.restrictToIngredients ||
      originalValidPreparation.pastTense !== updateForm.values.pastTense ||
      originalValidPreparation.slug !== updateForm.values.slug ||
      originalValidPreparation.minimumIngredientCount !== updateForm.values.minimumIngredientCount ||
      originalValidPreparation.maximumIngredientCount !== updateForm.values.maximumIngredientCount ||
      originalValidPreparation.minimumInstrumentCount !== updateForm.values.minimumInstrumentCount ||
      originalValidPreparation.maximumInstrumentCount !== updateForm.values.maximumInstrumentCount ||
      originalValidPreparation.temperatureRequired !== updateForm.values.temperatureRequired ||
      originalValidPreparation.timeEstimateRequired !== updateForm.values.timeEstimateRequired
    );
  };

  const submit = async () => {
    const validation = updateForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidPreparationUpdateRequestInput({
      name: updateForm.values.name,
      description: updateForm.values.description,
      yieldsNothing: updateForm.values.yieldsNothing,
      restrictToIngredients: updateForm.values.restrictToIngredients,
      pastTense: updateForm.values.pastTense,
      slug: updateForm.values.slug,
      minimumIngredientCount: updateForm.values.minimumIngredientCount,
      maximumIngredientCount: updateForm.values.maximumIngredientCount,
      minimumInstrumentCount: updateForm.values.minimumInstrumentCount,
      maximumInstrumentCount: updateForm.values.maximumInstrumentCount,
      temperatureRequired: updateForm.values.temperatureRequired,
      timeEstimateRequired: updateForm.values.timeEstimateRequired,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .updateValidPreparation(validPreparation.id, submission)
      .then((result: AxiosResponse<ValidPreparation>) => {
        if (result.data) {
          updateForm.setValues(result.data);
          setValidPreparation(result.data);
          setOriginalValidPreparation(result.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="Valid Preparation">
      <Container size="xs">
        <form onSubmit={updateForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...updateForm.getInputProps('name')} />
          <TextInput label="Past Tense" placeholder="thinged" {...updateForm.getInputProps('pastTense')} />
          <TextInput label="Slug" placeholder="thing" {...updateForm.getInputProps('slug')} />
          <TextInput label="Description" placeholder="thing" {...updateForm.getInputProps('description')} />

          <Switch
            checked={updateForm.values.yieldsNothing}
            label="Yields Nothing"
            {...updateForm.getInputProps('yieldsNothing')}
          />
          <Switch
            checked={updateForm.values.restrictToIngredients}
            label="Restrict To Ingredients"
            {...updateForm.getInputProps('restrictToIngredients')}
          />
          <Switch
            checked={updateForm.values.temperatureRequired}
            label="Temperature Required"
            {...updateForm.getInputProps('temperatureRequired')}
          />
          <Switch
            checked={updateForm.values.timeEstimateRequired}
            label="Time Estimate Required"
            {...updateForm.getInputProps('timeEstimateRequired')}
          />

          <NumberInput label="Minimum Ingredient Count" {...updateForm.getInputProps('minimumIngredientCount')} />
          <NumberInput label="Maximum Ingredient Count" {...updateForm.getInputProps('maximumIngredientCount')} />
          <NumberInput label="Minimum Instrument Count" {...updateForm.getInputProps('minimumInstrumentCount')} />
          <NumberInput label="Maximum Instrument Count" {...updateForm.getInputProps('maximumInstrumentCount')} />

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
          <Title order={3}>Instruments</Title>

          <List>
            {(pageLoadValidPreparationInstruments || []).map(
              (validPreparationInstrument: ValidPreparationInstrument) => {
                return (
                  <List.Item key={validPreparationInstrument.id}>
                    <Link href={`/valid_instruments/${validPreparationInstrument.instrument.id}`}>
                      {validPreparationInstrument.instrument.name}
                    </Link>
                  </List.Item>
                );
              },
            )}
          </List>

          <Space h="xs" />

          <Autocomplete placeholder="spatula" label="Instruments" data={[]} />
        </form>

        <Space h="xl" />
        <Divider />
        <Space h="xl" />

        <form>
          <Title order={3}>Ingredients</Title>

          <List>
            {(pageLoadValidIngredientPreparations || []).map(
              (validIngredientPreparation: ValidIngredientPreparation) => {
                return (
                  <List.Item key={validIngredientPreparation.id}>
                    <Link href={`/valid_measurement_units/${validIngredientPreparation.ingredient.id}`}>
                      {validIngredientPreparation.ingredient.name}
                    </Link>
                  </List.Item>
                );
              },
            )}
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

export default ValidPreparationPage;