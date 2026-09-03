import * as React from 'react';

/**
 * Hero metric with a mono uppercase label — the brand's data-forward device.
 * One accent (Hydro) figure per cluster; keep the rest Ink.
 */
export interface StatBlockProps {
  /** The figure, e.g. "~40ms" or "~$0.04". */
  value: React.ReactNode;
  /** Uppercase mono label beneath. */
  label: React.ReactNode;
  /** Optional secondary line. */
  sub?: React.ReactNode;
  /** Render the figure in Hydro green with glow. @default false */
  accent?: boolean;
  /** @default "left" */
  align?: 'left' | 'center';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}
export function StatBlock(props: StatBlockProps): JSX.Element;
