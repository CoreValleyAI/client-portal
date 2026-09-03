import React from 'react';

/**
 * Corevalley StatBlock — a single hero figure with a mono uppercase label.
 * The brand's data-forward device (~$0.04/kWh, ~40ms, ~0g). One Hydro figure
 * per cluster; keep the rest Ink.
 */
export function StatBlock({ value, label, sub, accent = false, align = 'left', size = 'md', style = {}, ...rest }) {
  const sizes = { sm: 28, md: 42, lg: 56 };
  const fs = sizes[size] || sizes.md;
  return (
    <div style={{ textAlign: align, ...style }} {...rest}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: fs,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: accent ? 'var(--hydro)' : 'var(--ink-100)',
          textShadow: accent ? '0 0 28px rgba(74,222,128,0.30)' : 'none',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--mute)',
          marginTop: 10,
        }}
      >
        {label}
      </div>
      {sub ? (
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--ink-400)', marginTop: 6 }}>{sub}</div>
      ) : null}
    </div>
  );
}
