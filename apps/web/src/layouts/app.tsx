import {
  ActionIcon,
  AppShell,
  Burger,
  Center,
  Container,
  Footer,
  Grid,
  Header,
  List,
  MediaQuery,
  Navbar,
  useMantineColorScheme,
} from '@mantine/core';
import { IconLogout, IconSun } from '@tabler/icons';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import logo from '../../public/images/header_logo.webp';
import { buildBrowserSideClient } from '../client';

declare interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  const { children } = props;
  const router = useRouter();

  const [opened, setOpened] = useState(false);
  const title = opened ? 'Close' : 'Open';

  const { toggleColorScheme } = useMantineColorScheme();

  const logout = async () => {
    const pfClient = buildBrowserSideClient();

    await axios.post('/api/logout').then(() => {
      console.log('Logged out');
      // router.push('/login')
    });

    console.log('logout button clicked');
  };

  const sidebarRoutes = {
    '/': 'Home',
    '/recipes': 'Recipes',
    '/meals': 'Meals',
    '/meal_plans': 'Meal Plans',
    '/settings/household': 'Household Settings',
    '/settings/user': 'User Settings',
  };

  const sidebarItems = Object.entries(sidebarRoutes).map(([path, label], index: number) => (
    <List.Item key={index}>
      <Link href={path}>{label}</Link>
    </List.Item>
  ));

  return (
    <AppShell
      fixed
      navbarOffsetBreakpoint="xs"
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
        <Navbar width={{ base: 200 }} fixed={true} hiddenBreakpoint="xl" hidden={!opened}>
          <Navbar.Section mx="-xs" px="xs" grow>
            <List icon={<></>}>{sidebarItems}</List>
          </Navbar.Section>
        </Navbar>
      }
      footer={
        <Footer height={50} p="sm">
          <ActionIcon onClick={() => toggleColorScheme()} sx={{ float: 'left' }}>
            <IconSun></IconSun>
          </ActionIcon>

          {/* TODO: figure out when to show this, depending on auth status */}
          <ActionIcon onClick={() => logout()} sx={{ float: 'right' }}>
            <IconLogout color="red" />
          </ActionIcon>
        </Footer>
      }
    >
      <Container size="lg">{children}</Container>
    </AppShell>
  );
}
