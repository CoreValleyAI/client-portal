// Console kit orchestrator: login -> dashboard with nav + deploy slide-over.
function App() {
  const { LoginScreen, Sidebar, ConsoleHeader, OverviewView, InstancesView, PlaceholderView, DeployPanel } = window.CVKit;
  const [authed, setAuthed] = React.useState(false);
  const [nav, setNav] = React.useState('overview');
  const [deploy, setDeploy] = React.useState(false);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const titles = { overview: 'overview', instances: 'instances', storage: 'storage', regions: 'regions', usage: 'usage', settings: 'settings' };
  let view;
  if (nav === 'overview') view = <OverviewView onDeploy={() => setDeploy(true)} />;
  else if (nav === 'instances') view = <InstancesView onDeploy={() => setDeploy(true)} />;
  else view = <PlaceholderView label={nav} />;

  return (
    <div style={{ position: 'relative', display: 'flex', height: '100%', background: 'var(--carbon-900)' }}>
      <Sidebar active={nav} onNavigate={setNav} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ConsoleHeader title={titles[nav]} onDeploy={() => setDeploy(true)} />
        <div style={{ flex: 1, overflowY: 'auto' }}>{view}</div>
      </div>
      <DeployPanel open={deploy} onClose={() => setDeploy(false)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
