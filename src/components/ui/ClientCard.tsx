'use client';

import {
  Card as HeroCard,
  CardBody as HeroCardBody,
  CardHeader as HeroCardHeader,
  CardProps,
  CardBodyProps,
  CardHeaderProps,
} from '@heroui/react';

export function Card(props: CardProps) {
  return <HeroCard {...props} />;
}

export function CardBody(props: CardBodyProps) {
  return <HeroCardBody {...props} />;
}

export function CardHeader(props: CardHeaderProps) {
  return <HeroCardHeader {...props} />;
}
