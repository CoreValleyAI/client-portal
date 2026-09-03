import * as React from 'react';

/** Mono filter/flag token — lighter than Badge, can be selectable or removable. */
export interface TagProps {
  children?: React.ReactNode;
  /** Selected = Hydro outline + tint. @default false */
  selected?: boolean;
  /** Show a × and call this on remove. */
  onRemove?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export function Tag(props: TagProps): JSX.Element;
