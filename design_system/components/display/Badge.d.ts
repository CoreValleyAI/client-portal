import * as React from 'react';

/** Small uppercase-mono status pill. Tone maps to the semantic palette. */
export interface BadgeProps {
  children?: React.ReactNode;
  /** @default "neutral" */
  tone?: 'neutral' | 'hydro' | 'success' | 'warning' | 'danger' | 'info';
  /** Show a leading status dot (glows for hydro/success). @default false */
  dot?: boolean;
  style?: React.CSSProperties;
}
export function Badge(props: BadgeProps): JSX.Element;
