import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Button, Grid, Pagination, Stack, Table, TextInput } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import { formatRelative } from 'date-fns';
import router from 'next/router';
import { IconSearch } from '@tabler/icons';
import { useState, useEffect } from 'react';

import { QueryFilter, ValidIngredientState, ValidIngredientStateList } from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';
import { buildServerSideLogger } from '../../src/logger';

declare interface ValidIngredientStatesPageProps {
  pageLoadValidIngredientStates: ValidIngredientStateList;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidIngredientStatesPageProps>> => {
  const span = serverSideTracer.startSpan('ValidIngredientStatesPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);
  const logger = buildServerSideLogger('ValidIngredientStatesPage');

  // TODO: parse context.query as QueryFilter.
  let props!: GetServerSidePropsResult<ValidIngredientStatesPageProps>;

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  await pfClient
    .getValidIngredientStates(qf)
    .then((res: AxiosResponse<ValidIngredientStateList>) => {
      span.addEvent('valid ingredientStates retrieved');
      const pageLoadValidIngredientStates = res.data;
      props = { props: { pageLoadValidIngredientStates } };
    })
    .catch((error: AxiosError) => {
      span.addEvent('error occurred');
      if (error.response?.status === 401) {
        props = {
          redirect: {
            destination: `/login?dest=${encodeURIComponent(context.resolvedUrl)}`,
            permanent: false,
          },
        };
      }
    });

  span.end();
  return props;
};

function ValidIngredientStatesPage(props: ValidIngredientStatesPageProps) {
  let { pageLoadValidIngredientStates } = props;

  const [validIngredientStates, setValidIngredientStates] =
    useState<ValidIngredientStateList>(pageLoadValidIngredientStates);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const apiClient = buildLocalClient();

    if (search.trim().length < 1) {
      const qf = QueryFilter.deriveFromGetServerSidePropsContext({ search });
      apiClient
        .getValidIngredientStates(qf)
        .then((res: AxiosResponse<ValidIngredientStateList>) => {
          console.log('res', res);
          if (res.data) {
            setValidIngredientStates(res.data);
          }
        })
        .catch((err: AxiosError) => {
          console.error(err);
        });
    } else {
      apiClient
        .searchForValidIngredientStates(search)
        .then((res: AxiosResponse<ValidIngredientState[]>) => {
          console.log('res', res);
          if (res.data) {
            setValidIngredientStates({
              ...QueryFilter.Default(),
              data: res.data,
              filteredCount: res.data.length,
              totalCount: res.data.length,
            });
          }
        })
        .catch((err: AxiosError) => {
          console.error(err);
        });
    }
  }, [search]);

  useEffect(() => {
    const apiClient = buildLocalClient();

    const qf = QueryFilter.deriveFromPage();
    qf.page = validIngredientStates.page;

    apiClient
      .getValidIngredientStates(qf)
      .then((res: AxiosResponse<ValidIngredientStateList>) => {
        console.log('res', res);
        if (res.data) {
          setValidIngredientStates(res.data);
        }
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [validIngredientStates.page]);

  const formatDate = (x: string | undefined): string => {
    return x ? formatRelative(new Date(x), new Date()) : 'never';
  };

  const rows = (validIngredientStates.data || []).map((ingredientState) => (
    <tr
      key={ingredientState.id}
      onClick={() => router.push(`/valid_ingredient_states/${ingredientState.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <td>{ingredientState.id}</td>
      <td>{ingredientState.name}</td>
      <td>{ingredientState.pastTense}</td>
      <td>{ingredientState.slug}</td>
      <td>{formatDate(ingredientState.createdAt)}</td>
      <td>{formatDate(ingredientState.lastUpdatedAt)}</td>
    </tr>
  ));

  return (
    <AppLayout title="Valid IngredientStates">
      <Stack>
        <Grid justify="space-between">
          <Grid.Col md="auto" sm={12}>
            <TextInput
              placeholder="Search..."
              icon={<IconSearch size={14} />}
              onChange={(event) => setSearch(event.target.value || '')}
            />
          </Grid.Col>
          <Grid.Col md="content" sm={12}>
            <Button
              onClick={() => {
                router.push('/valid_ingredient_states/new');
              }}
            >
              Create New
            </Button>
          </Grid.Col>
        </Grid>

        <Table mt="xl" striped highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Past Tense</th>
              <th>Slug</th>
              <th>Created At</th>
              <th>Last Updated At</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>

        <Pagination
          disabled={search.trim().length > 0}
          position="center"
          page={validIngredientStates.page}
          total={Math.ceil(validIngredientStates.totalCount / validIngredientStates.limit)}
          onChange={(value: number) => {
            setValidIngredientStates({ ...validIngredientStates, page: value });
          }}
        />
      </Stack>
    </AppLayout>
  );
}

export default ValidIngredientStatesPage;
