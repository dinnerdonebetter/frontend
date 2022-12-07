import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Button, Grid, Pagination, Stack, Table, TextInput } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import { formatRelative } from 'date-fns';
import router from 'next/router';
import { IconSearch } from '@tabler/icons';
import { useState, useEffect } from 'react';

import { QueryFilter, ValidInstrument, ValidInstrumentList } from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';
import { buildServerSideLogger } from '../../src/logger';

declare interface ValidInstrumentsPageProps {
  pageLoadValidInstruments: ValidInstrumentList;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidInstrumentsPageProps>> => {
  const span = serverSideTracer.startSpan('ValidInstrumentsPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);
  const logger = buildServerSideLogger('ValidInstrumentsPage');

  // TODO: parse context.query as QueryFilter.
  let props!: GetServerSidePropsResult<ValidInstrumentsPageProps>;

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  await pfClient
    .getValidInstruments(qf)
    .then((res: AxiosResponse<ValidInstrumentList>) => {
      span.addEvent('valid instruments retrieved');
      const pageLoadValidInstruments = res.data;
      props = { props: { pageLoadValidInstruments } };
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

function ValidInstrumentsPage(props: ValidInstrumentsPageProps) {
  let { pageLoadValidInstruments } = props;

  const [validInstruments, setValidInstruments] = useState<ValidInstrumentList>(pageLoadValidInstruments);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const apiClient = buildLocalClient();

    if (search.trim().length < 1) {
      const qf = QueryFilter.deriveFromGetServerSidePropsContext({ search });
      apiClient
        .getValidInstruments(qf)
        .then((res: AxiosResponse<ValidInstrumentList>) => {
          console.log('res', res);
          if (res.data) {
            setValidInstruments(res.data);
          }
        })
        .catch((err: AxiosError) => {
          console.error(err);
        });
    } else {
      apiClient
        .searchForValidInstruments(search)
        .then((res: AxiosResponse<ValidInstrument[]>) => {
          console.log('res', res);
          if (res.data) {
            setValidInstruments({
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
    qf.page = validInstruments.page;

    apiClient
      .getValidInstruments(qf)
      .then((res: AxiosResponse<ValidInstrumentList>) => {
        console.log('res', res);
        if (res.data) {
          setValidInstruments(res.data);
        }
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [validInstruments.page]);

  const formatDate = (x: string | undefined): string => {
    return x ? formatRelative(new Date(x), new Date()) : 'never';
  };

  const rows = (validInstruments.data || []).map((instrument) => (
    <tr
      key={instrument.id}
      onClick={() => router.push(`/valid_instruments/${instrument.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <td>{instrument.id}</td>
      <td>{instrument.name}</td>
      <td>{instrument.slug}</td>
      <td>{formatDate(instrument.createdAt)}</td>
      <td>{formatDate(instrument.lastUpdatedAt)}</td>
    </tr>
  ));

  return (
    <AppLayout title="Valid Instruments">
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
                router.push('/valid_instruments/new');
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
          page={validInstruments.page}
          total={Math.ceil(validInstruments.totalCount / validInstruments.limit)}
          onChange={(value: number) => {
            setValidInstruments({ ...validInstruments, page: value });
          }}
        />
      </Stack>
    </AppLayout>
  );
}

export default ValidInstrumentsPage;
