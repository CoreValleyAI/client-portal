import React from 'react';

/**
 * Corevalley Badge — a small status pill. Tones map to the semantic palette;
 * default is a quiet neutral. A leading dot is optional for live statuses.
 */
export function Badge({ children, tone = 'neutral', dot = false, style = {}, ...rest }) {
  const tones = {
    neutral: { fg: 'var(--ink-300)', bg: 'var(--carbon-500)', bd: 'var(--border-default)', dot: 'var(--ink-400)' },
    hydro:   { fg: 'var(--hydro)', bg: 'rgba(74,222,128,0.10)', bd: 'var(--border-hydro)', dot: 'var(--hydro)' },
    success: { fg: 'var(--success)', bg: 'rgba(74,222,128,0.10)', bd: 'rgba(74,222,128,0.30)', dot: 'var(--success)' },
    warning: { fg: 'var(--warning)', bg: 'rgba(251,191,36,0.10)', bd: 'rgba(251,191,36,0.30)', dot: 'var(--warning)' },
    danger:  { fg: 'var(--danger)', bg: 'rgba(248,113,113,0.10)', bd: 'rgba(248,113,113,0.30)', dot: 'var(--danger)' },
    info:    { fg: 'var(--info)', bg: 'rgba(56,189,248,0.10)', bd: 'rgba(56,189,248,0.30)', dot: 'var(--info)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: t.fg,
        background: t.bg,
        border: `1px solid ${t.bd}`,
        borderRadius: 'var(--radius-pill)',
        padding: '3px 9px',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {dot ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, boxShadow: tone === 'hydro' || tone === 'success' ? '0 0 6px ' + t.dot : 'none' }} /> : null}
      {children}
    </span>
  );
}
