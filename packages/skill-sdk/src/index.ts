export type SkillRiskLevel = 'low' | 'medium' | 'high';

export interface SkillMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  license: 'free';
  category: string;
  engines: string[];
  minEngineVersion?: string;
  maxEngineVersion?: string;
  riskLevel: SkillRiskLevel;
  requiresApproval: boolean;
  requiresBackup: boolean;
  requiresSandbox: boolean;
  defaultEnabled: boolean;
}

