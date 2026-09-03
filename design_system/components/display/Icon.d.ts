import * as React from 'react';

/**
 * Thin even-stroke icon from a curated Lucide subset. Default stroke 2px to
 * sit beside JetBrains Mono. Ink by default, Hydro for active/accent.
 */
export interface IconProps {
  /** Lucide icon name from the bundled subset (see ICON_NAMES). */
  name:
    | 'terminal' | 'cpu' | 'server' | 'zap' | 'activity' | 'gauge'
    | 'mountain' | 'leaf' | 'check' | 'x' | 'chevron-down' | 'chevron-right'
    | 'arrow-right' | 'arrow-down' | 'plus' | 'settings' | 'search' | 'menu'
    | 'copy' | 'external-link' | 'play' | 'bell' | 'user' | 'folder'
    | 'box' | 'more-horizontal' | 'circle' | 'globe' | 'database';
  /** px. @default 18 */
  size?: number;
  /** @default "currentColor" */
  color?: string;
  /** @default 2 */
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export function Icon(props: IconProps): JSX.Element | null;
export const ICON_NAMES: string[];
