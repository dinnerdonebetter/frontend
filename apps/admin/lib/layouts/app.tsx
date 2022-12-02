import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Center,
  Container,
  Footer,
  Grid,
  Group,
  Header,
  Navbar,
  NavLink,
  Text,
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

class AppLayoutProps {
  title: string = 'NO TITLE';
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'xl';
  disableTitlePrefix?: boolean = false;
  children: React.ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  // TODO: how do I know if I'm authed here?

  const { title, containerSize, disableTitlePrefix, children } = props;
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

  const pageTitle = `${disableTitlePrefix ? '' : 'Prixfixe'}${title ? ` - ${title}` : ''}`;

  const header = (
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
  );

  const navBar = (
    <Navbar width={{ base: 200 }} fixed={true} hiddenBreakpoint="xl" hidden={!opened}>
      <Navbar.Section mx="-xs" px="xs" grow>
        <NavLink
          label="Enumerations"
          icon={<IconToolsKitchen size={16} />}
          childrenOffset={28}
          defaultOpened={(router.pathname.match(/^\/(valid_)/g) || []).length > 0}
        >
          <NavLink
            icon={<IconSoup size={16} />}
            label="Ingredients"
            onClick={() => router.push('/valid_ingredients')}
            active={router.pathname.startsWith('/valid_ingredients')}
          />
        </NavLink>
      </Navbar.Section>
    </Navbar>
  );

  const footer = (
    <Footer height={40} mt="lg" p="xs" pt={5} fixed>
      <ActionIcon onClick={() => toggleColorScheme()} sx={{ float: 'left' }} aria-label="toggle color scheme">
        <IconSun />
      </ActionIcon>

      {/* TODO: figure out when to show this, depending on auth status */}
      <Box sx={{ float: 'right' }}>
        <Group>
          <Text weight="300" size="xs" color="tomato" mr="-sm">
            Log off
          </Text>
          <ActionIcon onClick={() => logout()} aria-label="logout">
            <IconLogout color="tomato" />
          </ActionIcon>
        </Group>
      </Box>
    </Footer>
  );

  return (
    <AppShell fixed={false} padding="md" header={header} navbar={navBar} footer={footer}>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Container size={containerSize}>{children}</Container>
    </AppShell>
  );
}
