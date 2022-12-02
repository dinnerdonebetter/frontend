import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Button, Center, Container } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';

import { QueryFilter, ValidIngredient, ValidIngredientList } from '@prixfixeco/models';

import { buildServerSideClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';
import { serverSideTracer } from '../../lib/tracer';
import { buildServerSideLogger } from '../../lib/logger';
import router from 'next/router';

declare interface ValidIngredientsPageProps {
  validIngredients: ValidIngredient[];
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
      const validIngredients = res.data.data;
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

  console.log(JSON.stringify(validIngredients, null, 2));

  return (
    <AppLayout title="Valid Ingredients">
      <Center>
        <Button
          my="lg"
          onClick={() => {
            router.push('/valid_ingredients/new');
          }}
        >
          New Ingredient
        </Button>
      </Center>
      <Container size="xs">{/*  */}</Container>
    </AppLayout>
  );
}

export default ValidIngredientsPage;
