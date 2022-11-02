import {
  ActionIcon,
  AppShell,
  Burger,
  Center,
  ColorScheme,
  Container,
  Footer,
  Grid,
  Header,
  List,
  MediaQuery,
  Navbar,
  ScrollArea,
  Space,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { IconSun } from '@tabler/icons';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import logo from '../../public/images/header_logo.webp';

declare interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  const { children } = props;

  const [opened, setOpened] = useState(false);
  const title = opened ? 'Close' : 'Open';

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      padding="md"
      header={
        <Header height={50} p="xs">
          <Grid>
            <Grid.Col span={3}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                title={`${title} navigation`}
                aria-label={`${title} navigation`}
              />
            </Grid.Col>

            <Grid.Col span="auto">
              <Center>
                <Image
                  src={logo}
                  alt="logo"
                  priority
                  style={{
                    height: 'auto',
                    width: '6rem',
                  }}
                />
              </Center>
            </Grid.Col>

            <Grid.Col span={3}>{/*  */}</Grid.Col>
          </Grid>
        </Header>
      }
      navbar={
        <Navbar
          width={{
            // When viewport is larger than theme.breakpoints.sm, Navbar width will be 300
            sm: 300,

            // When viewport is larger than theme.breakpoints.lg, Navbar width will be 400
            lg: 400,

            // When other breakpoints do not match base width is used, defaults to 100%
            base: 100,
          }}
          fixed={true}
          hidden={!opened}
        >
          <Navbar.Section mt="xs" ml="sm">
            {/*  */}
          </Navbar.Section>

          <Navbar.Section mx="-xs" px="xs" grow>
            <List icon={<></>}>
              <List.Item key="1">
                <Link href={'/'}>Home</Link>
              </List.Item>
              <List.Item key="2">
                <Link href={'/recipes'}>Recipes</Link>
              </List.Item>
              <List.Item key="3">
                <Link href={'/meals'}>Meals</Link>
              </List.Item>
              <List.Item key="4">
                <Link href={'/meal_plans'}>Meal Plans</Link>
              </List.Item>
              <List.Item key="5">
                <Link href={'/settings/household'}>Household Settings</Link>
              </List.Item>
              <List.Item key="6">
                <Link href={'/settings/user'}>User Settings</Link>
              </List.Item>
            </List>
          </Navbar.Section>
        </Navbar>
      }
      footer={
        <Footer height={50} p="sm">
          <UnstyledButton onClick={() => toggleColorScheme()} sx={{ float: 'left' }}>
            <ActionIcon>
              <IconSun></IconSun>
            </ActionIcon>
          </UnstyledButton>
        </Footer>
      }
    >
      <Container size="lg">{children}</Container>
    </AppShell>
  );
}
