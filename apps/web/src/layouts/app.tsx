import {
  ActionIcon,
  AppShell,
  Burger,
  Center,
  Container,
  Footer,
  Grid,
  Header,
  Navbar,
  NavLink,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconHome,
  IconLogout,
  IconNotebook,
  IconSettings,
  IconSoup,
  IconSun,
  IconToolsKitchen,
  IconUser,
} from '@tabler/icons';
import axios from 'axios';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import logo from '../../public/images/header_logo.webp';

declare interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  // TODO: how do I know if I'm authed here?

  const { title, children } = props;
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const navVerb = opened ? 'Close' : 'Open';

  const { toggleColorScheme } = useMantineColorScheme();

  const logout = async () => {
    await axios
      .post('/api/logout')
      .then(() => {
        router.push('/login');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <Head>
        <title>Prixfixe {title ? `- ${title}` : ''}</title>
      </Head>
      <AppShell
        fixed={false}
        padding="md"
        header={
          <Header height={50} p="xs">
            <Grid>
              <Grid.Col span={3}>
                <Burger
                  size="sm"
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  title={`${navVerb} navigation`}
                  aria-label={`${navVerb} navigation`}
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
              <NavLink
                label="Eating"
                icon={<IconToolsKitchen size={16} />}
                childrenOffset={28}
                defaultOpened={(router.pathname.match(/^\/(recipes|meals)/g) || []).length > 0}
              >
                <NavLink
                  icon={<IconNotebook size={16} />}
                  label="Recipes"
                  onClick={() => router.push('/recipes')}
                  active={router.pathname.startsWith('/recipes')}
                />
                <NavLink
                  icon={<IconSoup size={16} />}
                  label="Meals"
                  onClick={() => router.push('/meals')}
                  active={router.pathname.startsWith('/meals')}
                />
              </NavLink>

              <NavLink
                icon={<IconCalendarEvent size={16} />}
                label="Meal Plans"
                onClick={() => router.push('/meal_plans')}
                active={router.pathname.startsWith('/meal_plans')}
              ></NavLink>

              <NavLink
                label="Settings"
                icon={<IconSettings size={16} />}
                childrenOffset={28}
                defaultOpened={(router.pathname.match(/^\/(settings)/g) || []).length > 0}
              >
                <NavLink
                  icon={<IconHome size={16} />}
                  label="Household"
                  onClick={() => router.push('/settings/household')}
                  active={router.pathname.startsWith('/settings/household')}
                />
                <NavLink
                  icon={<IconUser size={16} />}
                  label="User"
                  onClick={() => router.push('/settings/user')}
                  active={router.pathname.startsWith('/settings/user')}
                />
              </NavLink>
            </Navbar.Section>
          </Navbar>
        }
        footer={
          <Footer height={40} p="xs" pt={5} fixed>
            <ActionIcon onClick={() => toggleColorScheme()} sx={{ float: 'left' }} aria-label="toggle color scheme">
              <IconSun></IconSun>
            </ActionIcon>

            {/* TODO: figure out when to show this, depending on auth status */}
            <ActionIcon onClick={() => logout()} sx={{ float: 'right' }} aria-label="logout">
              <IconLogout color="red" />
            </ActionIcon>
          </Footer>
        }
      >
        <Container size="sm">{children}</Container>
      </AppShell>
    </>
  );
}
