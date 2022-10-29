import { AppShell, Center, Container, Footer, Grid, Header, MediaQuery } from '@mantine/core';
import Image from 'next/image';
import React from 'react';

import logo from '../../public/images/header_logo.webp';

declare interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  const { children } = props;

  const largeLogoStyle = {
    height: 'auto',
    width: '22vw',
  };

  const smallLogoStyle = {
    height: 'auto',
    width: '9vw',
  };

  return (
    <Container size="xs">
      <AppShell
        padding="md"
        header={
          <Header height={50} p="xs">
            <Grid>
              <Grid.Col span="content">{/* burger nav or something */}</Grid.Col>
              <Grid.Col span="auto">
                <Center>
                  <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                    <Image src={logo} alt="logo" style={smallLogoStyle} priority />
                  </MediaQuery>

                  <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                    <Image src={logo} alt="logo" style={largeLogoStyle} priority />
                  </MediaQuery>
                </Center>
              </Grid.Col>
              <Grid.Col span="content">{/* logout button or something */}</Grid.Col>
            </Grid>
          </Header>
        }
        footer={
          <Footer height={30} p="md">
            {/* footer */}
          </Footer>
        }
      >
        {children}
      </AppShell>
    </Container>
  );
}
