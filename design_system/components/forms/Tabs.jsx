import React, { useState } from 'react';

/**
 * Corevalley Tabs — a row of mono labels with a Hydro underline on the active
 * tab. Controlled or uncontrolled. `tabs` is [{ id, label, badge? }].
 */
export function Tabs({ tabs = [], value: controlled, defaultValue, onChange, style = {}, ...rest }) {
  const [internal, setInternal] = useState(defaultValue ?? (tabs[0] && tabs[0].id));
  const active = controlled === undefined ? internal : controlled;

  function pick(id) {
    if (controlled === undefined) setInternal(id);
    onChange && onChange(id);
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--border-default)',
        ...style,
      }}
      {...rest}
    >
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t.id)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '11px 14px',
              marginBottom: -1,
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${on ? 'var(--hydro)' : 'transparent'}`,
              color: on ? 'var(--ink-100)' : 'var(--mute)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.01em',
              cursor: 'pointer',
              transition: 'color 120ms cubic-bezier(0.2,0,0.2,1)',
            }}
          >
            {t.label}
            {t.badge !== undefined ? (
              <span style={{
                fontSize: 10,
                fontWeight: 500,
                color: on ? 'var(--hydro)' : 'var(--ink-400)',
                background: on ? 'rgba(74,222,128,0.12)' : 'var(--carbon-500)',
                borderRadius: 'var(--radius-pill)',
                padding: '1px 7px',
              }}>{t.badge}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
