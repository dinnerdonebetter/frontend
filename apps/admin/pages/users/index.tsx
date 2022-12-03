import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Button, Grid, Pagination, Stack, Table, TextInput } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import { formatRelative } from 'date-fns';

import { QueryFilter, User, UserList } from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';
import { serverSideTracer } from '../../lib/tracer';
import { buildServerSideLogger } from '../../lib/logger';
import router from 'next/router';
import { IconSearch } from '@tabler/icons';
import { useState, useEffect } from 'react';

declare interface UsersPageProps {
  pageLoadUsers: UserList;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<UsersPageProps>> => {
  const span = serverSideTracer.startSpan('UsersPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);
  const logger = buildServerSideLogger('UsersPage');

  // TODO: parse context.query as QueryFilter.
  let props!: GetServerSidePropsResult<UsersPageProps>;

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  await pfClient
    .getUsers(qf)
    .then((res: AxiosResponse<UserList>) => {
      span.addEvent('users retrieved');
      const pageLoadUsers = res.data;
      props = { props: { pageLoadUsers } };
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

function UsersPage(props: UsersPageProps) {
  let { pageLoadUsers } = props;

  const [users, setUsers] = useState<UserList>(pageLoadUsers);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const apiClient = buildLocalClient();

    if (search.trim().length < 1) {
      const qf = QueryFilter.deriveFromGetServerSidePropsContext({ search });
      apiClient
        .getUsers(qf)
        .then((res: AxiosResponse<UserList>) => {
          console.log('res', res);
          if (res.data) {
            setUsers(res.data);
          }
        })
        .catch((err: AxiosError) => {
          console.error(err);
        });
    } else {
      apiClient
        .searchForUsers(search)
        .then((res: AxiosResponse<User[]>) => {
          console.log('res', res);
          if (res.data) {
            setUsers({
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
    qf.page = users.page;

    apiClient
      .getUsers(qf)
      .then((res: AxiosResponse<UserList>) => {
        console.log('res', res);
        if (res.data) {
          setUsers(res.data);
        }
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  }, [users.page]);

  const formatDate = (x: string | undefined): string => {
    return x ? formatRelative(new Date(x), new Date()) : 'never';
  };

  const rows = (users.data || []).map((preparation) => (
    <tr key={preparation.id} style={{ cursor: 'pointer' }}>
      <td>{preparation.id}</td>
      <td>{preparation.username}</td>
      <td>{formatDate(preparation.createdAt)}</td>
      <td>{formatDate(preparation.lastUpdatedAt)}</td>
    </tr>
  ));

  return (
    <AppLayout title="Valid Preparations">
      <Stack>
        <Grid justify="space-between">
          <Grid.Col md="auto" sm={12}>
            <TextInput
              placeholder="Search..."
              icon={<IconSearch size={14} />}
              onChange={(event) => setSearch(event.target.value || '')}
            />
          </Grid.Col>
        </Grid>

        <Table mt="xl" striped highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Created At</th>
              <th>Last Updated At</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>

        <Pagination
          disabled={search.trim().length > 0}
          position="center"
          page={users.page}
          total={Math.ceil(users.totalCount / users.limit)}
          onChange={(value: number) => {
            setUsers({ ...users, page: value });
          }}
        />
      </Stack>
    </AppLayout>
  );
}

export default UsersPage;
