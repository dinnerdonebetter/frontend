import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { TextInput, Button, Group, Container } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/router';

import { OAuth2Client } from '@dinnerdonebetter/models';

import { AppLayout } from '../../../src/layouts';
import { buildLocalClient, buildServerSideClient } from '../../../src/client';
import { serverSideTracer } from '../../../src/tracer';

declare interface OAuth2ClientPageProps {
  pageLoadOAuth2Client: OAuth2Client;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<OAuth2ClientPageProps>> => {
  const span = serverSideTracer.startSpan('OAuth2ClientPage.getServerSideProps');
  const apiClient = buildServerSideClient(context);

  const { OAuth2ClientID } = context.query;
  if (!OAuth2ClientID) {
    throw new Error('valid preparation ID is somehow missing!');
  }

  const pageLoadOAuth2ClientPromise = apiClient
    .getOAuth2Client(OAuth2ClientID.toString())
    .then((result: AxiosResponse<OAuth2Client>) => {
      span.addEvent('valid preparation retrieved');
      return result.data;
    });

  const [pageLoadOAuth2Client] = await Promise.all([pageLoadOAuth2ClientPromise]);

  span.end();
  return {
    props: { pageLoadOAuth2Client },
  };
};

function OAuth2ClientPage(props: OAuth2ClientPageProps) {
  const router = useRouter();

  const apiClient = buildLocalClient();
  const { pageLoadOAuth2Client } = props;

  const [oauth2Client, _setOAuth2Client] = useState<OAuth2Client>(pageLoadOAuth2Client);

  return (
    <AppLayout title="Valid Preparation">
      <Container size="sm">
        <TextInput label="Name" value={oauth2Client.name} />
        <TextInput label="Description" value={oauth2Client.description} />

        <Group position="center">
          <Button
            type="submit"
            color="red"
            fullWidth
            onClick={() => {
              if (confirm('Are you sure you want to delete this valid preparation?')) {
                apiClient.deleteOAuth2Client(oauth2Client.id).then(() => {
                  router.push('/valid_preparations');
                });
              }
            }}
          >
            Delete
          </Button>
        </Group>
      </Container>
    </AppLayout>
  );
}

export default OAuth2ClientPage;
