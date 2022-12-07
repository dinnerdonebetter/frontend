import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import {
  TextInput,
  Button,
  Group,
  Container,
  Switch,
  Text,
  ActionIcon,
  Autocomplete,
  AutocompleteItem,
  Center,
  Divider,
  Grid,
  Pagination,
  Space,
  Table,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  ValidInstrument,
  ValidInstrumentUpdateRequestInput,
  ValidPreparation,
  ValidPreparationInstrument,
  ValidPreparationInstrumentCreationRequestInput,
  ValidPreparationInstrumentList,
} from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { serverSideTracer } from '../../src/tracer';
import apiClient from '@prixfixeco/api-client';
import { IconTrash } from '@tabler/icons';

declare interface ValidInstrumentPageProps {
  pageLoadValidInstrument: ValidInstrument;
  pageLoadPreparationInstruments: ValidPreparationInstrumentList;
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
      return res.data;
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
  const apiClient = buildLocalClient();
  const { pageLoadValidInstrument, pageLoadPreparationInstruments } = props;

  const [validInstrument, setValidInstrument] = useState<ValidInstrument>(pageLoadValidInstrument);
  const [originalValidInstrument, setOriginalValidInstrument] = useState<ValidInstrument>(pageLoadValidInstrument);

  const [newPreparationForInstrumentInput, setNewPreparationForInstrumentInput] =
    useState<ValidPreparationInstrumentCreationRequestInput>(
      new ValidPreparationInstrumentCreationRequestInput({
        validInstrumentID: validInstrument.id,
      }),
    );
  const [preparationQuery, setPreparationQuery] = useState('');
  const [preparationsForInstrument, setPreparationsForInstrument] =
    useState<ValidPreparationInstrumentList>(pageLoadPreparationInstruments);
  const [suggestedPreparations, setSuggestedPreparations] = useState<ValidPreparation[]>([]);

  useEffect(() => {
    if (preparationQuery.length < 2) {
      setSuggestedPreparations([]);
      return;
    }

    const pfClient = buildLocalClient();
    pfClient
      .searchForValidPreparations(preparationQuery)
      .then((res: AxiosResponse<ValidPreparation[]>) => {
        const newSuggestions = (res.data || []).filter((mu: ValidPreparation) => {
          return !(preparationsForInstrument.data || []).some((vimu: ValidPreparationInstrument) => {
            return vimu.instrument.id === mu.id;
          });
        });

        console.log(`found ${newSuggestions.length} suggestions, setting`);
        setSuggestedPreparations(newSuggestions);
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [preparationQuery]);

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
      <Container size="sm">
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

        {/*

        INGREDIENT MEASUREMENT UNITS

        */}

        <Space h="xl" />
        <Divider />
        <Space h="xl" />

        <form>
          <Center>
            <Title order={4}>Preparations</Title>
          </Center>

          {preparationsForInstrument.data && (preparationsForInstrument.data || []).length !== 0 && (
            <>
              <Table mt="xl" withColumnBorders>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Notes</th>
                    <th>
                      <Center>
                        <ThemeIcon variant="outline" color="gray">
                          <IconTrash size="sm" color="gray" />
                        </ThemeIcon>
                      </Center>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(preparationsForInstrument.data || []).map((preparationInstrument: ValidPreparationInstrument) => {
                    return (
                      <tr key={preparationInstrument.id}>
                        <td>
                          <Link href={`/valid_preparations/${preparationInstrument.id}`}>
                            {preparationInstrument.preparation.name}
                          </Link>
                        </td>
                        <td>
                          <Text>{preparationInstrument.notes}</Text>
                        </td>
                        <td>
                          <Center>
                            <ActionIcon
                              variant="outline"
                              aria-label="remove valid preparation measurement unit"
                              onClick={async () => {
                                await apiClient
                                  .deleteValidPreparationInstrument(preparationInstrument.id)
                                  .then(() => {
                                    setPreparationsForInstrument({
                                      ...preparationsForInstrument,
                                      data: preparationsForInstrument.data.filter(
                                        (x: ValidPreparationInstrument) => x.id !== preparationInstrument.id,
                                      ),
                                    });
                                  })
                                  .catch((error) => {
                                    console.error(error);
                                  });
                              }}
                            >
                              <IconTrash size="md" color="tomato" />
                            </ActionIcon>
                          </Center>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <Space h="xs" />

              <Pagination
                disabled={
                  Math.ceil(preparationsForInstrument.totalCount / preparationsForInstrument.limit) <=
                  preparationsForInstrument.page
                }
                position="center"
                page={preparationsForInstrument.page}
                total={Math.ceil(preparationsForInstrument.totalCount / preparationsForInstrument.limit)}
                onChange={(value: number) => {
                  setPreparationsForInstrument({ ...preparationsForInstrument, page: value });
                }}
              />
            </>
          )}

          <Grid>
            <Grid.Col span="auto">
              <Autocomplete
                placeholder="mince"
                label="Preparation"
                value={preparationQuery}
                onChange={setPreparationQuery}
                onItemSubmit={async (item: AutocompleteItem) => {
                  const selectedPreparation = (suggestedPreparations || []).find(
                    (x: ValidPreparation) => x.name === item.value,
                  );

                  if (!selectedPreparation) {
                    console.error(`selectedPreparation not found for item ${item.value}}`);
                    return;
                  }

                  setNewPreparationForInstrumentInput({
                    ...newPreparationForInstrumentInput,
                    validPreparationID: selectedPreparation.id,
                  });
                }}
                data={(suggestedPreparations || []).map((x: ValidPreparation) => {
                  return { value: x.name, label: x.name };
                })}
              />
            </Grid.Col>
            <Grid.Col span="auto">
              <TextInput
                label="Notes"
                value={newPreparationForInstrumentInput.notes}
                onChange={(event) =>
                  setNewPreparationForInstrumentInput({
                    ...newPreparationForInstrumentInput,
                    notes: event.target.value,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Button
                mt="xl"
                disabled={
                  newPreparationForInstrumentInput.validInstrumentID === '' ||
                  newPreparationForInstrumentInput.validPreparationID === ''
                }
                onClick={async () => {
                  await apiClient
                    .createValidPreparationInstrument(newPreparationForInstrumentInput)
                    .then((res: AxiosResponse<ValidPreparationInstrument>) => {
                      // the returned value doesn't have enough information to put it in the list, so we have to fetch it
                      apiClient
                        .getValidPreparationInstrument(res.data.id)
                        .then((res: AxiosResponse<ValidPreparationInstrument>) => {
                          const returnedValue = res.data;

                          setPreparationsForInstrument({
                            ...preparationsForInstrument,
                            data: [...(preparationsForInstrument.data || []), returnedValue],
                          });

                          setNewPreparationForInstrumentInput(
                            new ValidPreparationInstrumentCreationRequestInput({
                              validInstrumentID: validInstrument.id,
                              validPreparationID: '',
                              notes: '',
                            }),
                          );

                          setPreparationQuery('');
                        });
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                }}
              >
                Save
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </Container>
    </AppLayout>
  );
}

export default ValidInstrumentPage;
