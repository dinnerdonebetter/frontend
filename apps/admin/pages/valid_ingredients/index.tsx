import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Button, Grid, Pagination, Stack, Table, TextInput } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import { formatRelative } from 'date-fns';

import { QueryFilter, ValidIngredient, ValidIngredientList } from '@prixfixeco/models';

import { buildBrowserSideClient, buildServerSideClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';
import { serverSideTracer } from '../../lib/tracer';
import { buildServerSideLogger } from '../../lib/logger';
import router from 'next/router';
import { IconSearch } from '@tabler/icons';
import { useState, useEffect } from 'react';

declare interface ValidIngredientsPageProps {
  validIngredients: ValidIngredientList;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidIngredientsPageProps>> => {
  const span = serverSideTracer.startSpan('ValidIngredientsPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);
  const logger = buildServerSideLogger('ValidIngredientsPage');

  // TODO: parse context.query as QueryFilter.
  let props!: GetServerSidePropsResult<ValidIngredientsPageProps>;

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  await pfClient
    .getValidIngredients(qf)
    .then((res: AxiosResponse<ValidIngredientList>) => {
      span.addEvent('valid ingredients retrieved');
      const validIngredients = res.data;
      props = { props: { validIngredients } };
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

function ValidIngredientsPage(props: ValidIngredientsPageProps) {
  const { validIngredients } = props;

  const [search, setSearch] = useState('');

  useEffect(() => {
    console.log('search', search);

    const apiClient = buildBrowserSideClient();
    const qf = QueryFilter.deriveFromGetServerSidePropsContext({ search });
    apiClient
      .getValidIngredients(qf)
      .then((res: AxiosResponse<ValidIngredientList>) => {
        console.log('res', res);
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [search]);

  const formatDate = (x: string | undefined): string => {
    return x ? formatRelative(new Date(x), new Date()) : 'never';
  };

  const rows = (validIngredients.data || []).map((ingredient) => (
    <tr
      key={ingredient.id}
      onClick={() => router.push(`/valid_ingredients/${ingredient.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <td>{ingredient.id}</td>
      <td>{ingredient.name}</td>
      <td>{ingredient.slug}</td>
      <td>{formatDate(ingredient.createdAt)}</td>
      <td>{formatDate(ingredient.lastUpdatedAt)}</td>
    </tr>
  ));

  return (
    <AppLayout title="Valid Ingredients">
      <Stack>
        <Table mt="xl" striped highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Created At</th>
              <th>Last Updated At</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
        <Grid justify="space-between">
          <Grid.Col md="content" sm={12}>
            <TextInput
              placeholder="Search..."
              icon={<IconSearch size={14} />}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Grid.Col>
          <Grid.Col md="auto" sm={12}>
            <Pagination
              position="center"
              page={validIngredients.page}
              total={validIngredients.totalCount / validIngredients.limit}
              onChange={(value: number) => {
                console.log(value);
              }}
            />
          </Grid.Col>
          <Grid.Col md="content" sm={12}>
            <Button
              onClick={() => {
                router.push('/valid_ingredients/new');
              }}
            >
              Create New
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>
    </AppLayout>
  );
}

export default ValidIngredientsPage;
