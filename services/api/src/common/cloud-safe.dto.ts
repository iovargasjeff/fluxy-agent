export type DatabaseEnvironment = 'development' | 'staging' | 'production' | 'unknown';

export class CloudConnectionProfileDto {
  connectionProfileId!: string;
  engine!: string;
  version?: string;
  environment!: DatabaseEnvironment;
  localOnly!: true;
}

export class CloudSafeArtifactPolicyDto {
  allowsCredentials = false;
  allowsBackups = false;
  allowsDumps = false;
  allowsPrivateQueryResults = false;
  allowsDiagramMetadata = true;
  allowsGeneratedSql = true;
}

