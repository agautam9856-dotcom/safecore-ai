import { ScanRecord } from './threat'

export type AlertPriority = 'INFO' | 'ATTENTION' | 'HIGH' | 'CRITICAL'
export type AlertType = 'NEW_THREAT' | 'RISK_ESCALATION' | 'RECURRING_THREAT' | 'NEW_CONNECTION' | 'PREDICTION_ALERT' | 'ACTION_REQUIRED' | 'SYSTEM'

export interface SmartAlert {
  id: string
  scanId: string
  type: AlertType
  priority: AlertPriority
  title: string
  summary: string
  whyNow: string[]
  whatChanged?: {
    before: string
    now: string
    riskChange?: string
  }
  actionRecommendation: string
  isRead: boolean
  timestamp: string
  
  // Linkages
  scanRecord?: ScanRecord // Store full record to allow "FOLLOW ALERT"
}
