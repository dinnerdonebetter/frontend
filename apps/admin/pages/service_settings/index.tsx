import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Button, Grid, Pagination, Stack, Table, TextInput } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import { formatRelative } from 'date-fns';
import router from 'next/router';
import { IconSearch } from '@tabler/icons';
import { useState, useEffect } from 'react';

import { QueryFilter, ServiceSetting, QueryFilteredResult } from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';

declare interface ServiceSettingsPageProps {
  pageLoadServiceSettings: QueryFilteredResult<ServiceSetting>;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ServiceSettingsPageProps>> => {
  const span = serverSideTracer.startSpan('ServiceSettingsPage.getServerSideProps');
  const apiClient = buildServerSideClient(context);

  // TODO: parse context.query as QueryFilter.
  let props!: GetServerSidePropsResult<ServiceSettingsPageProps>;

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  await apiClient
    .getServiceSettings(qf)
    .then((res: AxiosResponse<QueryFilteredResult<ServiceSetting>>) => {
      span.addEvent('service settings retrieved');
      const pageLoadServiceSettings = res.data;
      props = { props: { pageLoadServiceSettings } };
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

function ServiceSettingsPage(props: ServiceSettingsPageProps) {
  let { pageLoadServiceSettings } = props;

  const [serviceSettings, setServiceSettings] = useState<QueryFilteredResult<ServiceSetting>>(pageLoadServiceSettings);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const apiClient = buildLocalClient();

    if (search.trim().length < 1) {
      const qf = QueryFilter.deriveFromGetServerSidePropsContext({ search });
      apiClient
        .getServiceSettings(qf)
        .then((res: AxiosResponse<QueryFilteredResult<ServiceSetting>>) => {
          if (res.data) {
            setServiceSettings(res.data);
          }
        })
        .catch((err: AxiosError) => {
          console.error(err);
        });
    } else {
      apiClient
        .searchForServiceSettings(search)
        .then((res: AxiosResponse<ServiceSetting[]>) => {
          if (res.data) {
            setServiceSettings({
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
    qf.page = serviceSettings.page;

    apiClient
      .getServiceSettings(qf)
      .then((res: AxiosResponse<QueryFilteredResult<ServiceSetting>>) => {
        if (res.data) {
          setServiceSettings(res.data);
        }
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [serviceSettings.page]);

  const formatDate = (x: string | undefined): string => {
    return x ? formatRelative(new Date(x), new Date()) : 'never';
  };

  const rows = (serviceSettings.data || []).map((setting) => (
    <tr key={setting.id} onClick={() => router.push(`/service_settings/${setting.id}`)} style={{ cursor: 'pointer' }}>
      <td>{setting.name}</td>
      <td>{formatDate(setting.createdAt)}</td>
      <td>{formatDate(setting.lastUpdatedAt)}</td>
    </tr>
  ));

  return (
    <AppLayout title="Service Settings">
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
                router.push('/service_settings/new');
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
              <th>Created At</th>
              <th>Last Updated At</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>

        <Pagination
          disabled={search.trim().length > 0}
          position="center"
          page={serviceSettings.page}
          total={Math.ceil(serviceSettings.totalCount / serviceSettings.limit)}
          onChange={(value: number) => {
            setServiceSettings({ ...serviceSettings, page: value });
          }}
        />
      </Stack>
    </AppLayout>
  );
}

export default ServiceSettingsPage;
