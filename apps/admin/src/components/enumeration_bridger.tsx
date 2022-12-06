import { Autocomplete, List, Space, Title } from '@mantine/core';

import Link from 'next/link';
import ValidMeasurementUnitsPage from '../../pages/valid_measurement_units';

declare interface BridgeValue {
  id: string;
  link: string;
  name: string;
}

declare interface EnumerationBridgerProps<BridgeValue> {
  title: string;
  searchPlaceholder: string;
  searchLabel: string;
  data: BridgeValue[];
}

function EnumerationBridger(props: EnumerationBridgerProps<BridgeValue>) {
  return (
    <form>
      <Title order={3}>{props.title}</Title>

      <List>
        {(props.data || []).map((datum: BridgeValue) => {
          return (
            <List.Item key={datum.id}>
              <Link href={datum.link}>{datum.name}</Link>
            </List.Item>
          );
        })}
      </List>

      <Space h="xs" />

      <Autocomplete placeholder={props.searchPlaceholder} label={props.searchLabel} data={[]} />
    </form>
  );
}

export default ValidMeasurementUnitsPage;
