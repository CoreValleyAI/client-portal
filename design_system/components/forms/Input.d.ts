import * as React from 'react';

/** Carbon text field; border lights Hydro on focus. Mono mode for CLI entry. */
export interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  /** @default "text" */
  type?: string;
  /** JetBrains Mono for CLI/code entry. @default false */
  mono?: boolean;
  /** Leading adornment (e.g. an Icon or `$`). */
  prefix?: React.ReactNode;
  disabled?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}
export function Input(props: InputProps): JSX.Element;
