// Login / access screen for the Corevalley console.
const { Button, Input, Icon, StatBlock } = window.CorevalleyDesignSystem_9d3a1a;

function LoginScreen({ onLogin }) {
  const { Wordmark } = window.CVKit;
  const [email, setEmail] = React.useState('');

  return (
    <div style={{ position: 'relative', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--carbon-900)', overflow: 'hidden' }}>
      {/* ridgeline backdrop */}
      <img src="../../assets/ridgeline.svg" alt="" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', opacity: 0.5, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: 400, padding: '0 24px' }}>
        <div style={{ marginBottom: 28 }}><Wordmark size={26} /></div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: '0 24px 70px rgba(0,0,0,0.7)' }}>
          <div className="cv-label" style={{ marginBottom: 6 }}>Console access</div>
          <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 22, color: 'var(--ink-100)', letterSpacing: '-0.02em', marginBottom: 4 }}>Sign in to corevalley</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13.5, color: 'var(--ink-400)', lineHeight: 1.6, marginBottom: 22 }}>Hydro-powered GPU compute. Use your work email — we’ll match you to an org.</p>

          <div className="cv-label" style={{ marginBottom: 7 }}>Email</div>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" prefix={<Icon name="user" size={15} />} />

          <div style={{ height: 14 }} />
          <Button variant="primary" fullWidth onClick={onLogin} iconRight={<Icon name="arrow-right" size={16} />}>Continue</Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-600)', letterSpacing: '0.1em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          <Button variant="secondary" mono fullWidth onClick={onLogin} iconLeft={<Icon name="terminal" size={15} />}>ssh np-ktm-1.corevalley.ai</Button>
        </div>

        <div style={{ display: 'flex', gap: 26, marginTop: 26, paddingLeft: 4 }}>
          <StatBlock value="~$0.04" label="per kWh" size="sm" />
          <StatBlock value="~0g" label="CO₂ / compute" size="sm" accent />
          <StatBlock value="~40ms" label="to Mumbai" size="sm" />
        </div>
      </div>
    </div>
  );
}

window.CVKit = Object.assign(window.CVKit || {}, { LoginScreen });
