const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/intel-feed.tsx', 'utf8');

const targetEffect = `useEffect(() => {
    getCommunityIntelligence(8).then(setIntel).catch(() => {})
    getRecentScans(6).then(setRecent).catch(() => {})
  }, [])`;

const newEffect = `const fetchData = () => {
    getCommunityIntelligence(8).then(setIntel).catch(() => {})
    getRecentScans(6).then(setRecent).catch(() => {})
  }

  useEffect(() => {
    fetchData()
    const handleUpdate = () => fetchData()
    window.addEventListener('threats-updated', handleUpdate)
    return () => window.removeEventListener('threats-updated', handleUpdate)
  }, [])`;

code = code.replace(targetEffect, newEffect);
fs.writeFileSync('src/components/dashboard/intel-feed.tsx', code);
