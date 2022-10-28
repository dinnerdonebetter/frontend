import { Container } from '@mantine/core';
import React from 'react';

declare interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  const { children } = props;

  return <Container size="xs">{children}</Container>;
}
