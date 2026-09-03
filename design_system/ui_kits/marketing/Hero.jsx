// Marketing landing sections for corevalley.ai
const { Button, Icon, StatBlock, Terminal, Badge, Card, Tag } = window.CorevalleyDesignSystem_9d3a1a;

function Wordmark({ size = 18, cursor = false, color = 'var(--ink-100)' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.5), lineHeight: 1 }}>
      <img src="../../assets/logo/cv-brandmark.svg" alt="" style={{ height: Math.round(size * 1.5), display: 'block' }} />
      <img src="../../assets/logo/cv-wordmark-green.svg" alt="corevalley" style={{ height: Math.round(size * 0.95), display: 'block' }} />
    </span>
  );
}

function Nav() {
  const links = ['compute', 'regions', 'pricing', 'docs'];
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 28, padding: '16px 40px', background: 'rgba(5,8,13,0.82)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}>
      <Wordmark size={18} />
      <div style={{ display: 'flex', gap: 24, marginLeft: 18 }}>
        {links.map(l => <a key={l} href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-400)', letterSpacing: '0.01em' }}>{l}</a>)}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
        <Button size="sm" variant="ghost" mono>sign in</Button>
        <Button size="sm" variant="primary" mono iconRight={<Icon name="arrow-right" size={15} />}>get access</Button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ position: 'relative', padding: '80px 40px 64px', overflow: 'hidden' }}>
      <img src="../../assets/ridgeline.svg" alt="" style={{ position: 'absolute', left: 0, right: 0, bottom: -20, width: '100%', opacity: 0.35, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'center' }}>
        <div>
          <Badge tone="hydro" dot style={{ marginBottom: 22 }}>hydro grid · live in nepal</Badge>
          <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 58, lineHeight: 1.02, letterSpacing: '-0.03em', color: 'var(--ink-100)', marginBottom: 20 }}>
            Compute that runs on<br />rivers, <span style={{ color: 'var(--hydro)' }}>not coal.</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 17, lineHeight: 1.6, color: 'var(--ink-300)', maxWidth: 480, marginBottom: 30 }}>
            GPU compute powered by Nepal’s hydroelectricity — near-zero carbon, low cost, and positioned at the edge of the world’s fastest-growing AI markets.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="primary" size="lg" mono iconRight={<Icon name="arrow-right" size={17} />}>start deploying</Button>
            <Button variant="secondary" size="lg" mono iconLeft={<Icon name="play" size={15} />}>watch demo</Button>
          </div>
        </div>
        <Terminal title="np-ktm-1.corevalley.ai" lines={[
          { prompt: '$', text: 'corevalley deploy --gpu h200 --count 8 \\' },
          { out: '            --region np-ktm-1' },
          { out: '→ matched hydro grid · Upper Tamakoshi' },
          { out: '→ 8× H200 · ~40ms → mumbai · 0g CO₂ · $0.04/kWh' },
          { comment: 'instance cv-9f3a21 live in 12s' },
          { prompt: '$', text: '' },
        ]} />
      </div>

      <div style={{ position: 'relative', maxWidth: 1120, margin: '56px auto 0', display: 'flex', gap: 56, paddingTop: 32, borderTop: '1px solid var(--border-subtle)' }}>
        <StatBlock value="~$0.04" label="per kWh hydro power" />
        <StatBlock value="~0g" label="carbon per compute" accent />
        <StatBlock value="~40ms" label="latency to Mumbai" />
        <StatBlock value="3" label="himalayan regions" />
      </div>
    </section>
  );
}

window.CVM = Object.assign(window.CVM || {}, { Nav, Hero, Wordmark });
