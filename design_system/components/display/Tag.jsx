import React, { useState } from 'react';

/**
 * Corevalley Tag — a removable / selectable mono token. Lighter than Badge;
 * used for filters, CLI flags, region chips. Optional remove (×) affordance.
 */
export function Tag({ children, selected = false, onRemove, onClick, style = {}, ...rest }) {
  const [hover, setHover] = useState(false);
  const clickable = !!onClick;
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        fontWeight: 500,
        color: selected ? 'var(--hydro)' : 'var(--ink-300)',
        background: selected ? 'rgba(74,222,128,0.10)' : (hover && clickable ? 'var(--carbon-500)' : 'var(--carbon-600)'),
        border: `1px solid ${selected ? 'var(--border-hydro)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '5px 10px',
        lineHeight: 1.2,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background 120ms cubic-bezier(0.2,0,0.2,1)',
        ...style,
      }}
      {...rest}
    >
      {children}
      {onRemove ? (
        <span
          onClick={(e) => { e.stopPropagation(); onRemove(e); }}
          style={{ display: 'inline-flex', cursor: 'pointer', opacity: 0.6, fontSize: 14, lineHeight: 1 }}
        >×</span>
      ) : null}
    </span>
  );
}
