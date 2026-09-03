import * as React from 'react';

/** Square icon-only control — same state model as Button. */
export interface IconButtonProps {
  /** An <Icon /> element. */
  icon: React.ReactNode;
  /** @default "ghost" */
  variant?: 'ghost' | 'surface' | 'primary';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Tooltip / a11y label. */
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}
export function IconButton(props: IconButtonProps): JSX.Element;
