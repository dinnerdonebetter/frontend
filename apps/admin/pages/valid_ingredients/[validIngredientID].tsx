import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Container } from '@mantine/core';
import { z } from 'zod';

import { ValidIngredient } from '@prixfixeco/models';

import { buildServerSideClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';
import { serverSideTracer } from '../../lib/tracer';

declare interface ValidIngredientPageProps {
  validIngredient: ValidIngredient;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidIngredientPageProps>> => {
  const span = serverSideTracer.startSpan('ValidIngredientPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { validIngredientID } = context.query;
  if (!validIngredientID) {
    throw new Error('valid ingredient ID is somehow missing!');
  }

  const { data: validIngredient } = await pfClient.getValidIngredient(validIngredientID.toString()).then((result) => {
    span.addEvent('valid ingredient retrieved');
    return result;
  });

  span.end();
  return { props: { validIngredient } };
};

function ValidIngredientPage(props: ValidIngredientPageProps) {
  const { validIngredient } = props;

  return (
    <AppLayout title="Valid Ingredients">
      <Container size="xs">
        {validIngredient.name}
        <form></form>
      </Container>
    </AppLayout>
  );
}

export default ValidIngredientPage;
