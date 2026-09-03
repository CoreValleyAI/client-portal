import * as React from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  /** Optional count pill. */
  badge?: React.ReactNode;
}

/** Mono tab row with a Hydro underline on the active tab. */
export interface TabsProps {
  tabs: TabItem[];
  /** Controlled active id. */
  value?: string;
  /** Initial active id when uncontrolled. */
  defaultValue?: string;
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
}
export function Tabs(props: TabsProps): JSX.Element;
