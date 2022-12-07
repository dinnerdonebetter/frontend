import { ActionIcon, Autocomplete, AutocompleteItem, Grid, List, Pagination, Space, Stack, Title } from '@mantine/core';
import { QueryFilteredResult } from '@prixfixeco/models';
import { IconTrash } from '@tabler/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';

declare interface BridgeValue {
  id: string;
  name: string;
}

declare interface EnumerationBridgerProps<BridgeValue> {
  title: string;
  linkPrefix: string;
  searchPlaceholder: string;
  searchLabel: string;
  removalAriaLabel: string;
  bridgedItems: QueryFilteredResult<BridgeValue>;
  searchSuggestions: AutocompleteItem[];
  onPaginationChange(newPage: number): void;
  onSearchChange(value: string): void;
  onBridgedItemRemoval(itemIndex: number): void;
  onSuggestionSelection(item: AutocompleteItem): void;
}

export function EnumerationBridgeManager(props: EnumerationBridgerProps<BridgeValue>) {
  const router = useRouter();
  const {
    title,
    linkPrefix,
    searchPlaceholder,
    searchLabel,
    removalAriaLabel,
    bridgedItems,
    searchSuggestions,
    onPaginationChange,
    onSearchChange,
    onBridgedItemRemoval,
    onSuggestionSelection,
  } = props;

  return (
    <form>
      <Title order={3}>{title}</Title>
      <Stack spacing="xs">
        {(bridgedItems.data || []).map((datum: BridgeValue, datumIndex: number) => (
          <Grid key={datumIndex}>
            <Grid.Col span="auto">
              <Link href={`/${linkPrefix}/${datum.id}`}>{datum.name}</Link>
            </Grid.Col>
            <Grid.Col span="content">
              <ActionIcon
                mt="sm"
                variant="outline"
                size="sm"
                aria-label={removalAriaLabel}
                onClick={() => {
                  onBridgedItemRemoval(datumIndex);
                }}
              >
                <IconTrash size="md" color="tomato" />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        ))}
      </Stack>

      <Space h="md" />

      <Pagination
        disabled={bridgedItems.data.length >= bridgedItems.limit}
        position="center"
        page={bridgedItems.page}
        total={Math.ceil(bridgedItems.totalCount / bridgedItems.limit)}
        onChange={onPaginationChange}
      />

      <Autocomplete
        placeholder={searchPlaceholder}
        label={searchLabel}
        onChange={onSearchChange}
        data={searchSuggestions}
        onItemSubmit={onSuggestionSelection}
      />
    </form>
  );
}
