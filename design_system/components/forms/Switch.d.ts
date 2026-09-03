import * as React from 'react';

/** Mechanical toggle — off carbon track, on Hydro track with glow. */
export interface SwitchProps {
  /** Controlled state. Omit to use internal state. */
  checked?: boolean;
  /** Initial state when uncontrolled. @default false */
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export function Switch(props: SwitchProps): JSX.Element;
