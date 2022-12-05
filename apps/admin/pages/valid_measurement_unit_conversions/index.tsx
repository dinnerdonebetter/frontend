import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Button, Grid, Pagination, Stack, Table, TextInput } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import { formatRelative } from 'date-fns';

import { QueryFilter, ValidMeasurementUnitConversion, ValidMeasurementUnitConversionList } from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';
import { serverSideTracer } from '../../lib/tracer';
import { buildServerSideLogger } from '../../lib/logger';
import router from 'next/router';
import { IconSearch } from '@tabler/icons';
import { useState, useEffect } from 'react';

declare interface ValidMeasurementUnitConversionsPageProps {
  pageLoadValidMeasurementUnitConversions: ValidMeasurementUnitConversionList;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidMeasurementUnitConversionsPageProps>> => {
  const span = serverSideTracer.startSpan('ValidMeasurementUnitConversionsPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);
  const logger = buildServerSideLogger('ValidMeasurementUnitConversionsPage');

  // TODO: parse context.query as QueryFilter.
  let props!: GetServerSidePropsResult<ValidMeasurementUnitConversionsPageProps>;

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  await pfClient
    .getValidMeasurementUnitConversions(qf)
    .then((res: AxiosResponse<ValidMeasurementUnitConversionList>) => {
      span.addEvent('valid measurementUnitConversions retrieved');
      const pageLoadValidMeasurementUnitConversions = res.data;
      props = { props: { pageLoadValidMeasurementUnitConversions } };
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

function ValidMeasurementUnitConversionsPage(props: ValidMeasurementUnitConversionsPageProps) {
  let { pageLoadValidMeasurementUnitConversions } = props;

  const [validMeasurementUnitConversions, setValidMeasurementUnitConversions] =
    useState<ValidMeasurementUnitConversionList>(pageLoadValidMeasurementUnitConversions);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const apiClient = buildLocalClient();

    if (search.trim().length < 1) {
      const qf = QueryFilter.deriveFromGetServerSidePropsContext({ search });
      apiClient
        .getValidMeasurementUnitConversions(qf)
        .then((res: AxiosResponse<ValidMeasurementUnitConversionList>) => {
          console.log('res', res);
          if (res.data) {
            setValidMeasurementUnitConversions(res.data);
          }
        })
        .catch((err: AxiosError) => {
          console.error(err);
        });
    } else {
      apiClient
        .searchForValidMeasurementUnitConversions(search)
        .then((res: AxiosResponse<ValidMeasurementUnitConversion[]>) => {
          console.log('res', res);
          if (res.data) {
            setValidMeasurementUnitConversions({
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
    qf.page = validMeasurementUnitConversions.page;

    apiClient
      .getValidMeasurementUnitConversions(qf)
      .then((res: AxiosResponse<ValidMeasurementUnitConversionList>) => {
        console.log('res', res);
        if (res.data) {
          setValidMeasurementUnitConversions(res.data);
        }
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [validMeasurementUnitConversions.page]);

  const formatDate = (x: string | undefined): string => {
    return x ? formatRelative(new Date(x), new Date()) : 'never';
  };

  const rows = (validMeasurementUnitConversions.data || []).map((measurementUnitConversion) => (
    <tr
      key={measurementUnitConversion.id}
      onClick={() => router.push(`/valid_measurement_unit_conversions/${measurementUnitConversion.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <td>{measurementUnitConversion.id}</td>
      <td>{measurementUnitConversion.name}</td>
      <td>{measurementUnitConversion.pluralName}</td>
      <td>{measurementUnitConversion.slug}</td>
      <td>{formatDate(measurementUnitConversion.createdAt)}</td>
      <td>{formatDate(measurementUnitConversion.lastUpdatedAt)}</td>
    </tr>
  ));

  return (
    <AppLayout title="Valid MeasurementUnitConversions">
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
                router.push('/valid_measurement_unit_conversions/new');
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
          page={validMeasurementUnitConversions.page}
          total={Math.ceil(validMeasurementUnitConversions.totalCount / validMeasurementUnitConversions.limit)}
          onChange={(value: number) => {
            setValidMeasurementUnitConversions({ ...validMeasurementUnitConversions, page: value });
          }}
        />
      </Stack>
    </AppLayout>
  );
}

export default ValidMeasurementUnitConversionsPage;
