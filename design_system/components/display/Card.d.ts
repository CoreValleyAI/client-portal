import * as React from 'react';

/**
 * Raised Carbon surface with a hairline border. Optional Hydro accent edge
 * and hover lift for interactive cards.
 */
export interface CardProps {
  children?: React.ReactNode;
  /** Hydro accent edge on the left. @default false */
  accent?: boolean;
  /** Hover lift + pointer. @default false */
  interactive?: boolean;
  /** Inner padding in px. @default 20 */
  padding?: number;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export function Card(props: CardProps): JSX.Element;
