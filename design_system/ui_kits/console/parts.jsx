// Shared bits for the console kit. Exports to window for cross-file use.
const { Icon } = window.CorevalleyDesignSystem_9d3a1a;

/** The corevalley logo lockup: gradient cloud/CV mark + green wordmark. */
function Wordmark({ size = 18, cursor = true, color = 'var(--ink-100)' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.5), lineHeight: 1 }}>
      <img src="../../assets/logo/cv-brandmark.svg" alt="" style={{ height: Math.round(size * 1.5), display: 'block' }} />
      <img src="../../assets/logo/cv-wordmark-green.svg" alt="corevalley" style={{ height: Math.round(size * 0.95), display: 'block' }} />
    </span>
  );
}

/** Status dot + label used in tables. */
function StatusPill({ status }) {
  const map = {
    running: { c: 'var(--hydro)', glow: true },
    queued:  { c: 'var(--info)', glow: false },
    stopped: { c: 'var(--mute)', glow: false },
  };
  const s = map[status] || map.stopped;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 12, color: s.c }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.c, boxShadow: s.glow ? '0 0 7px ' + s.c : 'none' }} />
      {status}
    </span>
  );
}

/** Thin utilization meter. */
function UtilBar({ value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 64, height: 5, background: 'var(--carbon-500)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: value + '%', height: '100%', background: value > 0 ? 'var(--hydro)' : 'transparent', boxShadow: value > 60 ? '0 0 8px rgba(74,222,128,0.5)' : 'none' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--mute)', width: 32 }}>{value}%</span>
    </div>
  );
}

window.CVKit = Object.assign(window.CVKit || {}, { Wordmark, StatusPill, UtilBar });
