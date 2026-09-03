// Console shell: sidebar + header. Composed by App.
const { Icon, IconButton, Input, Badge } = window.CorevalleyDesignSystem_9d3a1a;

function Sidebar({ active, onNavigate }) {
  const { Wordmark } = window.CVKit;
  const nav = window.CV_DATA.nav;
  return (
    <aside style={{ width: 232, flex: 'none', background: 'var(--carbon-800)', borderRight: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', padding: '18px 14px' }}>
      <div style={{ padding: '4px 8px 20px' }}><Wordmark size={17} cursor={false} /></div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map((n) => {
          const on = n.id === active;
          return (
            <button key={n.id} onClick={() => onNavigate(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px',
              background: on ? 'rgba(74,222,128,0.10)' : 'transparent',
              border: '1px solid ' + (on ? 'var(--border-hydro)' : 'transparent'),
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              color: on ? 'var(--hydro)' : 'var(--ink-400)',
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, letterSpacing: '0.01em',
              transition: 'background 120ms, color 120ms', textAlign: 'left',
            }}>
              <Icon name={n.icon} size={16} color={on ? 'var(--hydro)' : 'var(--ink-500)'} />
              {n.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ background: 'var(--carbon-700)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon name="leaf" size={14} color="var(--hydro)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-300)', letterSpacing: '0.04em' }}>hydro grid</span>
            <Badge tone="success" dot style={{ marginLeft: 'auto' }}>live</Badge>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11.5, color: 'var(--ink-500)', lineHeight: 1.5 }}>3 regions online · 0g CO₂ this cycle</div>
        </div>
      </div>
    </aside>
  );
}

function ConsoleHeader({ title, onDeploy }) {
  const { Button } = window.CorevalleyDesignSystem_9d3a1a;
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: '1px solid var(--border-default)', background: 'var(--carbon-900)' }}>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 16, color: 'var(--ink-100)', textTransform: 'lowercase' }}>{title}</h1>
      <div style={{ marginLeft: 'auto', width: 260 }}>
        <Input size="sm" placeholder="search instances…" prefix={<Icon name="search" size={14} />} />
      </div>
      <IconButton size="sm" icon={<Icon name="bell" size={16} />} title="Alerts" />
      <Button size="sm" variant="primary" mono iconLeft={<Icon name="plus" size={15} />} onClick={onDeploy}>deploy</Button>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--carbon-500)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--hydro)' }}>cv</div>
    </header>
  );
}

window.CVKit = Object.assign(window.CVKit || {}, { Sidebar, ConsoleHeader });
