import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Button, Grid, Pagination, Stack, Table, TextInput } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import { formatRelative } from 'date-fns';
import router from 'next/router';
import { IconSearch } from '@tabler/icons';
import { useState, useEffect } from 'react';

import { QueryFilter, ValidMeasurementUnit, QueryFilteredResult } from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';
import { buildServerSideLogger } from '../../src/logger';

declare interface ValidMeasurementUnitsPageProps {
  pageLoadValidMeasurementUnits: QueryFilteredResult<ValidMeasurementUnit>;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidMeasurementUnitsPageProps>> => {
  const span = serverSideTracer.startSpan('ValidMeasurementUnitsPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);
  const logger = buildServerSideLogger('ValidMeasurementUnitsPage');

  // TODO: parse context.query as QueryFilter.
  let props!: GetServerSidePropsResult<ValidMeasurementUnitsPageProps>;

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  await pfClient
    .getValidMeasurementUnits(qf)
    .then((res: AxiosResponse<QueryFilteredResult<ValidMeasurementUnit>>) => {
      span.addEvent('valid measurement units retrieved');
      const pageLoadValidMeasurementUnits = res.data;
      props = { props: { pageLoadValidMeasurementUnits } };
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

function ValidMeasurementUnitsPage(props: ValidMeasurementUnitsPageProps) {
  let { pageLoadValidMeasurementUnits } = props;

  const [validMeasurementUnits, setValidMeasurementUnits] =
    useState<QueryFilteredResult<ValidMeasurementUnit>>(pageLoadValidMeasurementUnits);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const apiClient = buildLocalClient();

    if (search.trim().length < 1) {
      const qf = QueryFilter.deriveFromGetServerSidePropsContext({ search });
      apiClient
        .getValidMeasurementUnits(qf)
        .then((res: AxiosResponse<QueryFilteredResult<ValidMeasurementUnit>>) => {
          if (res.data) {
            setValidMeasurementUnits(res.data);
          }
        })
        .catch((err: AxiosError) => {
          console.error(err);
        });
    } else {
      apiClient
        .searchForValidMeasurementUnits(search)
        .then((res: AxiosResponse<ValidMeasurementUnit[]>) => {
          if (res.data) {
            setValidMeasurementUnits({
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
    qf.page = validMeasurementUnits.page;

    apiClient
      .getValidMeasurementUnits(qf)
      .then((res: AxiosResponse<QueryFilteredResult<ValidMeasurementUnit>>) => {
        if (res.data) {
          setValidMeasurementUnits(res.data);
        }
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [validMeasurementUnits.page]);

  const formatDate = (x: string | undefined): string => {
    return x ? formatRelative(new Date(x), new Date()) : 'never';
  };

  const rows = (validMeasurementUnits.data || []).map((measurementUnit) => (
    <tr
      key={measurementUnit.id}
      onClick={() => router.push(`/valid_measurement_units/${measurementUnit.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <td>{measurementUnit.name}</td>
      <td>{measurementUnit.pluralName}</td>
      <td>{measurementUnit.slug}</td>
      <td>{formatDate(measurementUnit.createdAt)}</td>
      <td>{formatDate(measurementUnit.lastUpdatedAt)}</td>
    </tr>
  ));

  return (
    <AppLayout title="Valid Measurement Units">
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
                router.push('/valid_measurement_units/new');
              }}
            >
              Create New
            </Button>
          </Grid.Col>
        </Grid>

        <Table mt="xl" striped highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th>Name</th>
              <th>Plural Name</th>
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
          page={validMeasurementUnits.page}
          total={Math.ceil(validMeasurementUnits.totalCount / validMeasurementUnits.limit)}
          onChange={(value: number) => {
            setValidMeasurementUnits({ ...validMeasurementUnits, page: value });
          }}
        />
      </Stack>
    </AppLayout>
  );
}

export default ValidMeasurementUnitsPage;
