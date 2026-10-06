const fs = require('fs');
function replaceFile(path, target, replacement) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
  }
}

// Fix api route lint errors (unused catches)
replaceFile('src/app/api/analyze/route.ts', '} catch (error) {', '} catch {');
replaceFile('src/app/api/domain-intel/route.ts', '} catch (e) {', '} catch {');
replaceFile('src/app/api/domain-intel/route.ts', '} catch (e) {', '} catch {');
replaceFile('src/app/api/domain-intel/route.ts', '} catch (e) {', '} catch {');
replaceFile('src/app/api/domain-intel/route.ts', '} catch (_error) {', '} catch {');

// Fix page.tsx insights
replaceFile('src/app/insights/page.tsx', 
  "import { SecurityInsights, TimelineEvent } from '@/types/insights'",
  "import { SecurityInsights } from '@/types/insights'");
replaceFile('src/app/insights/page.tsx', 
  "const [scans, setScans] = useState<ScanRecord[]>([])",
  "// const [scans, setScans] = useState<ScanRecord[]>([])");
replaceFile('src/app/insights/page.tsx', 
  "setScans(data)",
  "// setScans(data)");
replaceFile('src/app/insights/page.tsx', 
  "insights.timeline.map((evt, idx) =>",
  "insights.timeline.map((evt) =>");

// Fix command center hero
replaceFile('src/components/dashboard/command-center-hero.tsx',
  "import { ShieldAlert, ShieldCheck, Activity, AlertTriangle } from 'lucide-react'",
  "import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react'");

// Fix url utils
replaceFile('src/lib/url-utils.ts', '} catch (e) {', '} catch {');

