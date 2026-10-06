const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/header.tsx', 'utf8');

const fetchLogic = `const [stats, setStats] = useState({ intercepts: 4892, trajectories: 1420, sentinels: 24600 })

  const fetchTelemetry = () => {
    fetch('/api/threats/telemetry').then(r => r.json()).then(data => {
      setStats({
        intercepts: data.interactionsIntercepted,
        trajectories: data.trajectoriesMapped,
        sentinels: data.sentinelNodes
      })
    }).catch(() => {})
  }

  useEffect(() => {
    setMuted(getAudioMute())
    fetchTelemetry()
    const handleUpdate = () => fetchTelemetry()
    window.addEventListener('threats-updated', handleUpdate)
    return () => window.removeEventListener('threats-updated', handleUpdate)
  }, [])`;

code = code.replace(
  `useEffect(() => {
    setMuted(getAudioMute())
  }, [])`,
  fetchLogic
);

code = code.replace(
  `<AnimatedCounter target={4892} suffix="+" />`,
  `<AnimatedCounter target={stats.intercepts} suffix="+" />`
);
code = code.replace(
  `<AnimatedCounter target={1420} suffix="+" />`,
  `<AnimatedCounter target={stats.trajectories} suffix="+" />`
);
code = code.replace(
  `<AnimatedCounter target={24600} suffix="+" />`,
  `<AnimatedCounter target={stats.sentinels} suffix="+" />`
);

fs.writeFileSync('src/components/dashboard/header.tsx', code);
