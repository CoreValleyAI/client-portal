import React, { useState } from 'react';

/**
 * Corevalley Button — the brand's primary action control.
 * Variants: primary (Hydro), secondary (Carbon surface), ghost, danger.
 * The terminal feel: tight radius, mono optional, mechanical state changes.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  mono = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  const sizes = {
    sm: { fontSize: 12, padding: '6px 12px', height: 30, gap: 6, icon: 14 },
    md: { fontSize: 14, padding: '9px 16px', height: 38, gap: 8, icon: 16 },
    lg: { fontSize: 15, padding: '12px 22px', height: 46, gap: 9, icon: 18 },
  };
  const s = sizes[size] || sizes.md;

  const palettes = {
    primary: {
      bg: 'var(--hydro)',
      bgHover: 'var(--hydro-dark)',
      bgPress: 'var(--hydro-700)',
      fg: 'var(--carbon-900)',
      border: 'transparent',
      glow: '0 0 0 1px rgba(74,222,128,0.0)',
    },
    secondary: {
      bg: 'var(--carbon-600)',
      bgHover: 'var(--carbon-500)',
      bgPress: 'var(--carbon-400)',
      fg: 'var(--ink-200)',
      border: 'var(--border-default)',
    },
    ghost: {
      bg: 'transparent',
      bgHover: 'var(--carbon-600)',
      bgPress: 'var(--carbon-500)',
      fg: 'var(--ink-300)',
      border: 'transparent',
    },
    danger: {
      bg: 'transparent',
      bgHover: 'rgba(248,113,113,0.12)',
      bgPress: 'rgba(248,113,113,0.20)',
      fg: 'var(--danger)',
      border: 'var(--border-default)',
    },
  };
  const p = palettes[variant] || palettes.primary;

  const bg = disabled ? 'var(--carbon-600)'
    : press ? p.bgPress : hover ? p.bgHover : p.bg;

  const styles = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    height: s.height,
    padding: s.padding,
    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
    fontSize: s.fontSize,
    fontWeight: mono ? 500 : 600,
    letterSpacing: mono ? '0.01em' : '0',
    lineHeight: 1,
    color: disabled ? 'var(--ink-600)' : p.fg,
    background: bg,
    border: `1px solid ${disabled ? 'var(--border-subtle)' : p.border}`,
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 120ms cubic-bezier(0.2,0,0.2,1), transform 120ms cubic-bezier(0.2,0,0.2,1)',
    transform: press && !disabled ? 'translateY(0.5px)' : 'none',
    boxShadow: variant === 'primary' && hover && !disabled ? '0 0 20px rgba(74,222,128,0.30)' : 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={styles}
      {...rest}
    >
      {iconLeft ? <span style={{ display: 'inline-flex', width: s.icon, height: s.icon }}>{iconLeft}</span> : null}
      {children}
      {iconRight ? <span style={{ display: 'inline-flex', width: s.icon, height: s.icon }}>{iconRight}</span> : null}
    </button>
  );
}
