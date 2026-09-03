// Deploy slide-over panel.
const { Button, IconButton, Icon, Tag, Switch, Terminal, Badge } = window.CorevalleyDesignSystem_9d3a1a;

function DeployPanel({ open, onClose }) {
  const [region, setRegion] = React.useState('np-ktm-1');
  const [gpu, setGpu] = React.useState('h200');
  const [count, setCount] = React.useState(8);
  const [spot, setSpot] = React.useState(false);

  const gpuObj = window.CV_DATA.gpus.find(g => g.id === gpu);
  const cmd = `corevalley deploy --gpu ${gpu} --count ${count} --region ${region}` + (spot ? ' --spot' : '');

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: open ? 'auto' : 'none', zIndex: 40 }}>
      {/* scrim */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)', opacity: open ? 1 : 0, transition: 'opacity 240ms cubic-bezier(0.2,0,0.2,1)' }} />
      {/* panel */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 440, background: 'var(--carbon-800)', borderLeft: '1px solid var(--border-default)', boxShadow: '-24px 0 70px rgba(0,0,0,0.6)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 280ms cubic-bezier(0.16,1,0.3,1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <div className="cv-label" style={{ marginBottom: 4 }}>New instance</div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 18, color: 'var(--ink-100)', letterSpacing: '-0.02em' }}>Deploy compute</div>
          </div>
          <IconButton icon={<Icon name="x" size={18} />} title="Close" style={{ marginLeft: 'auto' }} onClick={onClose} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div className="cv-label" style={{ marginBottom: 10 }}>Region</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {window.CV_DATA.regions.map(r => (
                <Tag key={r.id} selected={region === r.id} onClick={() => setRegion(r.id)}>{r.id}</Tag>
              ))}
            </div>
          </div>

          <div>
            <div className="cv-label" style={{ marginBottom: 10 }}>GPU type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {window.CV_DATA.gpus.map(g => {
                const on = gpu === g.id;
                return (
                  <button key={g.id} onClick={() => setGpu(g.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', textAlign: 'left',
                    background: on ? 'rgba(74,222,128,0.08)' : 'var(--carbon-700)',
                    border: '1px solid ' + (on ? 'var(--border-hydro)' : 'var(--border-default)'),
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  }}>
                    <Icon name="cpu" size={18} color={on ? 'var(--hydro)' : 'var(--ink-500)'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-100)' }}>{g.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{g.vram} VRAM</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: on ? 'var(--hydro)' : 'var(--ink-300)' }}>{g.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="cv-label" style={{ marginBottom: 10 }}>Count</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconButton variant="surface" icon={<Icon name="x" size={14} />} title="dec" onClick={() => setCount(c => Math.max(1, c - 1))} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500, color: 'var(--ink-100)', width: 40, textAlign: 'center' }}>{count}</span>
              <IconButton variant="surface" icon={<Icon name="plus" size={14} />} title="inc" onClick={() => setCount(c => Math.min(64, c + 1))} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12.5, color: 'var(--ink-500)', marginLeft: 4 }}>× {gpuObj.name.replace('NVIDIA ', '')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Switch checked={spot} onChange={setSpot} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-200)' }}>spot pricing</div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11.5, color: 'var(--ink-500)' }}>up to 60% cheaper · preemptible</div>
            </div>
          </div>

          <div>
            <div className="cv-label" style={{ marginBottom: 10 }}>Command preview</div>
            <Terminal cursor={false} lines={[{ prompt: '$', text: cmd }]} />
          </div>
        </div>

        <div style={{ padding: 16, borderTop: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--mute)' }}>est. {gpuObj.price.replace('/hr', '')} × {count}/hr</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--hydro)' }}>~${(parseFloat(gpuObj.price.replace(/[$/hr]/g, '')) * count * (spot ? 0.4 : 1)).toFixed(2)}/hr</div>
          </div>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" mono iconLeft={<Icon name="zap" size={15} />} onClick={onClose}>deploy</Button>
        </div>
      </div>
    </div>
  );
}

window.CVKit = Object.assign(window.CVKit || {}, { DeployPanel });
