import type { ScanRecord, CommunityReport } from '@/types/threat'

// Define the shape of our in-memory store
interface ThreatStore {
  recentScans: ScanRecord[]
  communityReports: CommunityReport[]
  telemetryStats: {
    interactionsIntercepted: number
    trajectoriesMapped: number
    sentinelNodes: number
  }
}

// Ensure the store is global to survive hot reloads in Next.js dev
const globalForStore = globalThis as unknown as {
  __THREAT_STORE__: ThreatStore | undefined
}

export const threatStore: ThreatStore = globalForStore.__THREAT_STORE__ ?? {
  recentScans: [],
  communityReports: [
    {
      id: 'cr-1',
      entity_type: 'url',
      entity_value: 'netflix-account-verify-now.com',
      threat_type: 'Credential Harvesting',
      reports_count: 1432,
      verified_status: true,
      last_reported_at: new Date().toISOString()
    },
    {
      id: 'cr-2',
      entity_type: 'url',
      entity_value: 'payment-gateway-portal.xyz',
      threat_type: 'Malicious Re-Direct',
      reports_count: 854,
      verified_status: true,
      last_reported_at: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  telemetryStats: {
    interactionsIntercepted: 10420,
    trajectoriesMapped: 8540,
    sentinelNodes: 24600
  }
}

if (process.env.NODE_ENV !== 'production') {
  globalForStore.__THREAT_STORE__ = threatStore
}
