import React, { useState } from 'react';

/**
 * Corevalley Input — a carbon field with a hairline border that lights Hydro
 * on focus. Optional mono mode for CLI/code entry and a leading adornment.
 */
export function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  mono = false,
  prefix = null,
  disabled = false,
  size = 'md',
  style = {},
  inputStyle = {},
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const sizes = { sm: { h: 32, fs: 13, pad: 10 }, md: { h: 40, fs: 14, pad: 12 }, lg: { h: 48, fs: 15, pad: 14 } };
  const s = sizes[size] || sizes.md;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: s.h,
        padding: `0 ${s.pad}px`,
        background: disabled ? 'var(--carbon-700)' : 'var(--surface-input)',
        border: `1px solid ${focus ? 'var(--hydro)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? '0 0 0 3px rgba(74,222,128,0.12)' : 'none',
        transition: 'border-color 120ms cubic-bezier(0.2,0,0.2,1), box-shadow 120ms cubic-bezier(0.2,0,0.2,1)',
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {prefix ? <span style={{ display: 'inline-flex', color: focus ? 'var(--hydro)' : 'var(--mute)', flex: 'none' }}>{prefix}</span> : null}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'var(--ink-100)',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
          fontWeight: mono ? 500 : 400,
          fontSize: s.fs,
          letterSpacing: mono ? '0.01em' : '0',
          ...inputStyle,
        }}
        {...rest}
      />
    </div>
  );
}
