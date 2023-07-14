import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useForm, zodResolver } from '@mantine/form';
import { TextInput, Button, Group, Container } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/router';

import { ValidIngredientGroup, ValidIngredientGroupUpdateRequestInput } from '@dinnerdonebetter/models';

import { AppLayout } from '../../../src/layouts';
import { buildLocalClient, buildServerSideClient } from '../../../src/client';
import { serverSideTracer } from '../../../src/tracer';

declare interface ValidIngredientGroupPageProps {
  pageLoadValidIngredientGroup: ValidIngredientGroup;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ValidIngredientGroupPageProps>> => {
  const span = serverSideTracer.startSpan('ValidIngredientGroupPage.getServerSideProps');
  const apiClient = buildServerSideClient(context);

  const { validIngredientGroupID } = context.query;
  if (!validIngredientGroupID) {
    throw new Error('valid ingredient group ID is somehow missing!');
  }

  const pageLoadValidIngredientGroupPromise = apiClient
    .getValidIngredientGroup(validIngredientGroupID.toString())
    .then((result: AxiosResponse<ValidIngredientGroup>) => {
      span.addEvent('valid ingredient group retrieved');
      return result.data;
    });

  const [pageLoadValidIngredientGroup] = await Promise.all([pageLoadValidIngredientGroupPromise]);

  span.end();
  return {
    props: {
      pageLoadValidIngredientGroup,
    },
  };
};

const validIngredientGroupUpdateFormSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  pluralName: z.string().trim().min(1, 'plural name is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'slug is required')
    .regex(new RegExp(/^[a-zA-Z\-]{1,}$/gm), 'must match expected URL slug pattern'),
});

function ValidIngredientGroupPage(props: ValidIngredientGroupPageProps) {
  const router = useRouter();

  const { pageLoadValidIngredientGroup } = props;

  const apiClient = buildLocalClient();
  const [validIngredientGroup, setValidIngredientGroup] = useState<ValidIngredientGroup>(pageLoadValidIngredientGroup);
  const [originalValidIngredientGroup, setOriginalValidIngredientGroup] =
    useState<ValidIngredientGroup>(pageLoadValidIngredientGroup);

  const updateForm = useForm({
    initialValues: validIngredientGroup,
    validate: zodResolver(validIngredientGroupUpdateFormSchema),
  });

  const dataHasChanged = (): boolean => {
    return (
      originalValidIngredientGroup.name !== updateForm.values.name ||
      originalValidIngredientGroup.description !== updateForm.values.description ||
      originalValidIngredientGroup.slug !== updateForm.values.slug
    );
  };

  const submit = async () => {
    const validation = updateForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    const submission = new ValidIngredientGroupUpdateRequestInput({
      name: updateForm.values.name,
      description: updateForm.values.description,
      slug: updateForm.values.slug,
    });

    await apiClient
      .updateValidIngredientGroup(validIngredientGroup.id, submission)
      .then((result: AxiosResponse<ValidIngredientGroup>) => {
        if (result.data) {
          updateForm.setValues(result.data);
          setValidIngredientGroup(result.data);
          setOriginalValidIngredientGroup(result.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="valid ingredient group">
      <Container size="sm">
        <form onSubmit={updateForm.onSubmit(submit)}>
          <TextInput label="Name" placeholder="thing" {...updateForm.getInputProps('name')} />
          <TextInput label="Slug" placeholder="thing" {...updateForm.getInputProps('slug')} />
          <TextInput
            label="Description"
            placeholder="stuff about things"
            {...updateForm.getInputProps('description')}
          />

          <Group position="center">
            <Button type="submit" mt="sm" fullWidth disabled={!dataHasChanged()}>
              Submit
            </Button>
            <Button
              type="submit"
              color="red"
              fullWidth
              onClick={() => {
                if (confirm('Are you sure you want to delete this valid ingredient group?')) {
                  apiClient.deleteValidIngredientGroup(validIngredientGroup.id).then(() => {
                    router.push('/valid_ingredient_groups');
                  });
                }
              }}
            >
              Delete
            </Button>
          </Group>
        </form>
      </Container>
    </AppLayout>
  );
}

export default ValidIngredientGroupPage;