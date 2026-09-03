// Marketing: value pillars, region list, CTA footer.
const { Button, Icon, StatBlock, Card, Badge } = window.CorevalleyDesignSystem_9d3a1a;

function Pillars() {
  const items = [
    { icon: 'leaf', title: 'Near-zero carbon', body: 'Every instance draws on Himalayan hydroelectricity. ~0g CO₂ per compute — a structural ESG advantage over fossil-powered regional grids.' },
    { icon: 'zap', title: 'Cheap, abundant power', body: 'Hydro at ~$0.04/kWh, wired directly into the datacenter. Lower energy cost flows straight to your training bill.' },
    { icon: 'globe', title: 'At the edge of demand', body: '~40ms to Mumbai. Primary market India, with Southeast Asia a natural adjacency — compute where the AI economy is growing fastest.' },
    { icon: 'cpu', title: 'Built for the heavy jobs', body: 'Training, fine-tuning, batch and async pipelines — H200, H100, A100 and L40S, provisioned from a single CLI call.' },
  ];
  return (
    <section style={{ padding: '72px 40px', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div className="cv-label" style={{ marginBottom: 12 }}>Why corevalley</div>
        <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 38, letterSpacing: '-0.025em', color: 'var(--ink-100)', maxWidth: 620, marginBottom: 44 }}>
          A platform, not a storefront. Green energy and cost, where they win.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {items.map(it => (
            <Card key={it.title} padding={26}>
              <div style={{ display: 'inline-flex', padding: 10, borderRadius: 'var(--radius-md)', background: 'rgba(74,222,128,0.08)', border: '1px solid var(--border-hydro)', marginBottom: 16 }}>
                <Icon name={it.icon} size={20} color="var(--hydro)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', color: 'var(--ink-100)', marginBottom: 8 }}>{it.title}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-400)' }}>{it.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Regions() {
  return (
    <section style={{ padding: '72px 40px', borderTop: '1px solid var(--border-subtle)', background: 'var(--carbon-800)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div className="cv-label" style={{ marginBottom: 12 }}>Regions</div>
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 36, letterSpacing: '-0.025em', color: 'var(--ink-100)', marginBottom: 16 }}>Wired into the Himalayas.</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15, lineHeight: 1.65, color: 'var(--ink-400)', maxWidth: 380 }}>
            Three hydro-fed regions, each metered straight off a run-of-river plant. We make claims we can defend — these are real grids, real latencies.
          </p>
        </div>
        <Card padding={0}>
          {window.CV_DATA.regions.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <Icon name="mountain" size={22} color="var(--hydro)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-100)' }}>{r.id}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12.5, color: 'var(--ink-500)', marginTop: 3 }}>{r.city} · {r.grid} hydro</div>
              </div>
              <Badge tone="neutral">{r.hydro}/kWh</Badge>
              <div style={{ textAlign: 'right', minWidth: 64 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--hydro)' }}>{r.latency}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--mute)', letterSpacing: '0.08em' }}>→ MUMBAI</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}

function CTA() {
  const { Wordmark } = window.CVM;
  return (
    <section style={{ position: 'relative', padding: '88px 40px 72px', borderTop: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      <img src="../../assets/ridgeline.svg" alt="" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 46, letterSpacing: '-0.03em', color: 'var(--ink-100)', marginBottom: 18 }}>
          Spin up hydro-powered GPUs<br />in one command.
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, lineHeight: 1.6, color: 'var(--ink-300)', marginBottom: 30 }}>
          Built for training, fine-tuning, and batch / async AI workloads.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="primary" size="lg" mono iconRight={<Icon name="arrow-right" size={17} />}>get access</Button>
          <Button variant="secondary" size="lg" mono iconLeft={<Icon name="terminal" size={15} />}>read the docs</Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { Wordmark } = window.CVM;
  const groups = [
    { h: 'product', l: ['compute', 'regions', 'pricing', 'status'] },
    { h: 'developers', l: ['docs', 'cli', 'api', 'changelog'] },
    { h: 'company', l: ['about', 'careers', 'contact'] },
  ];
  return (
    <footer style={{ padding: '40px 40px 48px', borderTop: '1px solid var(--border-default)', background: 'var(--carbon-900)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.4fr repeat(3,1fr)', gap: 32 }}>
        <div>
          <Wordmark size={17} />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--mute)', letterSpacing: '0.04em', marginTop: 14 }}>hydro-powered ai compute · np</p>
        </div>
        {groups.map(g => (
          <div key={g.h}>
            <div className="cv-label" style={{ fontSize: 10, marginBottom: 12 }}>{g.h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {g.l.map(x => <a key={x} href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink-400)' }}>{x}</a>)}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}

window.CVM = Object.assign(window.CVM || {}, { Pillars, Regions, CTA, Footer });
