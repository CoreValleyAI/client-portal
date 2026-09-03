import React from 'react';

/**
 * Corevalley Terminal — the brand's signature surface. A carbon code window
 * with a prompt, optional title bar, syntax-tinted lines and a blinking block
 * cursor. `lines` is an array of { prompt, text, comment, out }.
 */
export function Terminal({ lines = [], title = '', cursor = true, style = {}, ...rest }) {
  return (
    <div
      style={{
        background: 'var(--carbon-800)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        ...style,
      }}
      {...rest}
    >
      {title ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--carbon-700)' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#2A2F38' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#2A2F38' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#2A2F38' }} />
          <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--mute)', letterSpacing: '0.02em' }}>{title}</span>
        </div>
      ) : null}
      <div style={{ padding: '16px 18px', fontSize: 13.5, lineHeight: 1.9 }}>
        {lines.map((l, i) => {
          const last = i === lines.length - 1;
          if (l.comment) {
            return <div key={i} style={{ color: 'var(--ink-600)' }}># {l.comment}</div>;
          }
          if (l.out !== undefined) {
            return <div key={i} style={{ color: 'var(--ink-400)', whiteSpace: 'pre-wrap' }}>{l.out}</div>;
          }
          return (
            <div key={i} style={{ color: 'var(--ink-200)', whiteSpace: 'pre-wrap' }}>
              <span style={{ color: 'var(--hydro)', marginRight: 8 }}>{l.prompt || '$'}</span>
              {l.text}
              {last && cursor ? <CursorBlink /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CursorBlink() {
  return (
    <>
      <span style={{
        display: 'inline-block', width: 8, height: 16, marginLeft: 4,
        verticalAlign: '-3px', background: 'var(--hydro)',
        boxShadow: '0 0 8px rgba(74,222,128,0.5)',
        animation: 'cvBlink 1s steps(1) infinite',
      }} />
      <style>{'@keyframes cvBlink{50%{opacity:0}}'}</style>
    </>
  );
}
