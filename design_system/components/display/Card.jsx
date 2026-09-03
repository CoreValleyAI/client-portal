import React, { useState } from 'react';

/**
 * Corevalley Card — a raised Carbon surface with a hairline border. Optional
 * Hydro accent edge (left) for highlighted/active cards, and hover lift.
 */
export function Card({
  children,
  accent = false,
  interactive = false,
  padding = 20,
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--surface-card)',
        border: `1px solid ${hover && interactive ? 'var(--border-strong)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: hover && interactive ? '0 12px 40px rgba(0,0,0,0.6)' : '0 1px 2px rgba(0,0,0,0.4)',
        transition: 'border-color 160ms cubic-bezier(0.2,0,0.2,1), box-shadow 160ms cubic-bezier(0.2,0,0.2,1), transform 160ms cubic-bezier(0.2,0,0.2,1)',
        transform: hover && interactive ? 'translateY(-1px)' : 'none',
        cursor: interactive ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {accent ? (
        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--hydro)', boxShadow: '0 0 12px rgba(74,222,128,0.5)' }} />
      ) : null}
      {children}
    </div>
  );
}
