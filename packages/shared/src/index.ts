export type RuntimeMode = 'web' | 'desktop-local' | 'desktop-hybrid';

export type DatabaseEnvironment = 'development' | 'staging' | 'production' | 'unknown';

export interface SafeConnectionProfile {
  connectionId: string;
  alias: string;
  engine: string;
  database: string;
  hostMasked: string;
  hasCredentials: boolean;
  environment: DatabaseEnvironment;
}

export interface CloudConnectionProfile {
  connectionProfileId: string;
  engine: string;
  version?: string;
  environment: DatabaseEnvironment;
  localOnly: true;
}

