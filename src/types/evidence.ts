export type EvidenceType = 'MESSAGE' | 'PHONE' | 'URL' | 'DOMAIN' | 'SIGNAL' | 'PREDICTION'

export interface EvidenceRelationship {
  signal?: string
  threatDna?: string
  attackPathNodeId?: string
  attackPathStage?: string
  nextMovePrediction?: string
  protectionAction?: string
}

export interface EvidenceItem {
  id: string
  type: EvidenceType
  title: string
  content: string
  source: string
  timestamp: string
  relationships: EvidenceRelationship
}
