import React, { useState } from 'react';

/**
 * Corevalley Switch — a mechanical toggle. Off = carbon track; on = Hydro
 * track with a subtle glow. No bounce; a measured slide.
 */
export function Switch({ checked: controlled, defaultChecked = false, onChange, disabled = false, size = 'md', style = {}, ...rest }) {
  const [internal, setInternal] = useState(defaultChecked);
  const checked = controlled === undefined ? internal : controlled;
  const sizes = { sm: { w: 34, h: 20, k: 14 }, md: { w: 42, h: 24, k: 18 } };
  const s = sizes[size] || sizes.md;
  const pad = (s.h - s.k) / 2;

  function toggle() {
    if (disabled) return;
    if (controlled === undefined) setInternal(v => !v);
    onChange && onChange(!checked);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      style={{
        position: 'relative',
        width: s.w,
        height: s.h,
        padding: 0,
        border: `1px solid ${checked ? 'transparent' : 'var(--border-strong)'}`,
        borderRadius: 'var(--radius-pill)',
        background: checked ? 'var(--hydro)' : 'var(--carbon-500)',
        boxShadow: checked ? '0 0 14px rgba(74,222,128,0.35)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 160ms cubic-bezier(0.2,0,0.2,1)',
        ...style,
      }}
      {...rest}
    >
      <span style={{
        position: 'absolute',
        top: pad,
        left: checked ? s.w - s.k - pad - 1 : pad,
        width: s.k,
        height: s.k,
        borderRadius: '50%',
        background: checked ? 'var(--carbon-900)' : 'var(--ink-300)',
        transition: 'left 160ms cubic-bezier(0.2,0,0.2,1)',
      }} />
    </button>
  );
}
