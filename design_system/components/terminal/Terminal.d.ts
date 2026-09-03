import * as React from 'react';

export interface TerminalLine {
  /** Prompt glyph for a command line. @default "$" */
  prompt?: string;
  /** Command text (rendered after the prompt). */
  text?: string;
  /** Render as a dimmed comment line (prefixed with #). */
  comment?: string;
  /** Render as program output (no prompt, muted). */
  out?: string;
}

/**
 * The brand's signature terminal surface — a carbon code window with prompt
 * lines, optional title bar, and a blinking block cursor on the last line.
 */
export interface TerminalProps {
  lines?: TerminalLine[];
  /** Optional window title-bar label. */
  title?: string;
  /** Blink a block cursor on the last line. @default true */
  cursor?: boolean;
  style?: React.CSSProperties;
}
export function Terminal(props: TerminalProps): JSX.Element;
