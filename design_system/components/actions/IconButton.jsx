import React, { useState } from 'react';

/**
 * Corevalley IconButton — a square, icon-only control. Same state model as
 * Button: ghost by default, solid Hydro for primary, subtle Carbon surface.
 */
export function IconButton({ icon, variant = 'ghost', size = 'md', disabled = false, onClick, title, style = {}, ...rest }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const sizes = { sm: 30, md: 38, lg: 46 };
  const dim = sizes[size] || sizes.md;

  const pal = {
    ghost:   { bg: 'transparent', bgH: 'var(--carbon-600)', bgP: 'var(--carbon-500)', fg: 'var(--ink-300)', bd: 'transparent' },
    surface: { bg: 'var(--carbon-600)', bgH: 'var(--carbon-500)', bgP: 'var(--carbon-400)', fg: 'var(--ink-200)', bd: 'var(--border-default)' },
    primary: { bg: 'var(--hydro)', bgH: 'var(--hydro-dark)', bgP: 'var(--hydro-700)', fg: 'var(--carbon-900)', bd: 'transparent' },
  };
  const p = pal[variant] || pal.ghost;
  const bg = disabled ? 'transparent' : press ? p.bgP : hover ? p.bgH : p.bg;

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        background: bg,
        color: disabled ? 'var(--ink-600)' : p.fg,
        border: `1px solid ${p.bd}`,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 120ms cubic-bezier(0.2,0,0.2,1)',
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  );
}
