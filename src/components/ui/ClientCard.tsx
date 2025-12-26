'use client';

import {
  Card as HeroCard,
  CardBody as HeroCardBody,
  CardHeader as HeroCardHeader,
  CardProps,
} from '@heroui/react';
import React from 'react';

export function Card(props: CardProps) {
  return <HeroCard {...props} />;
}

export function CardBody(props: React.ComponentProps<typeof HeroCardBody>) {
  return <HeroCardBody {...props} />;
}

export function CardHeader(props: React.ComponentProps<typeof HeroCardHeader>) {
  return <HeroCardHeader {...props} />;
}
