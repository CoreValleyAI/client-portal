// Console main views: Overview + Instances table.
const { Card, StatBlock, Badge, Tag, Terminal, Icon, Button } = window.CorevalleyDesignSystem_9d3a1a;

function OverviewView({ onDeploy }) {
  const { StatusPill, UtilBar } = window.CVKit;
  const inst = window.CV_DATA.instances;
  const running = inst.filter(i => i.status === 'running').length;
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <Card><StatBlock value={running + ' / ' + inst.length} label="instances running" size="sm" /></Card>
        <Card><StatBlock value="22×" label="GPUs allocated" size="sm" /></Card>
        <Card><StatBlock value="~0g" label="CO₂ this cycle" size="sm" accent /></Card>
        <Card><StatBlock value="$576" label="spend · month-to-date" size="sm" /></Card>
      </div>

      {/* terminal + regions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, alignItems: 'start' }}>
        <Terminal title="np-ktm-1.corevalley.ai — deploy" lines={[
          { prompt: '$', text: 'corevalley deploy --gpu h200 --count 8 --region np-ktm-1' },
          { out: '→ matched hydro grid · Upper Tamakoshi · $0.04/kWh' },
          { out: '→ 8× H200 provisioned · ~40ms → mumbai · 0g CO₂' },
          { comment: 'instance cv-9f3a21 live in 12s' },
          { prompt: '$', text: '' },
        ]} />
        <Card padding={0}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="globe" size={15} color="var(--hydro)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-200)' }}>regions</span>
          </div>
          {window.CV_DATA.regions.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-200)' }}>{r.id}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>{r.city} · {r.grid}</div>
              </div>
              <Badge tone="neutral">{r.hydro}/kWh</Badge>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--hydro)' }}>{r.latency}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function InstancesView({ onDeploy }) {
  const { StatusPill, UtilBar } = window.CVKit;
  const [filter, setFilter] = React.useState('all');
  const all = window.CV_DATA.instances;
  const inst = filter === 'all' ? all : all.filter(i => i.status === filter);
  const cols = ['name', 'gpu', 'region', 'status', 'util', 'uptime', 'cost'];
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {['all', 'running', 'queued', 'stopped'].map(f => (
          <Tag key={f} selected={filter === f} onClick={() => setFilter(f)}>{f}</Tag>
        ))}
        <Button size="sm" variant="primary" mono style={{ marginLeft: 'auto' }} iconLeft={<Icon name="plus" size={15} />} onClick={onDeploy}>deploy</Button>
      </div>

      <Card padding={0}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.1fr 0.9fr 0.9fr', padding: '12px 18px', borderBottom: '1px solid var(--border-default)' }}>
          {cols.map(c => <span key={c} className="cv-label" style={{ fontSize: 10 }}>{c}</span>)}
        </div>
        {inst.map((row, i) => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.1fr 0.9fr 0.9fr', alignItems: 'center', padding: '14px 18px', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-100)' }}>{row.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-600)', marginTop: 2 }}>{row.id}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink-300)' }}>{row.gpu}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink-400)' }}>{row.region}</span>
            <StatusPill status={row.status} />
            <UtilBar value={row.util} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink-400)' }}>{row.uptime}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink-200)' }}>{row.cost}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function PlaceholderView({ label }) {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 0', textAlign: 'center' }}>
          <Icon name="box" size={28} color="var(--ink-600)" />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-400)' }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--ink-600)' }}>This surface isn’t part of the kit demo.</div>
        </div>
      </Card>
    </div>
  );
}

window.CVKit = Object.assign(window.CVKit || {}, { OverviewView, InstancesView, PlaceholderView });
