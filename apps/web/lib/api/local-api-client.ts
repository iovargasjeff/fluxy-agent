import { getLocalSidecarBaseUrl } from '@/lib/runtime';

export interface LocalApiClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export interface LocalConnectionRequest {
  host: string;
  puerto: number;
  usuario: string;
  password: string;
  nombre_bd: string;
  motor?: string;
}

export interface SavedConnectionProfile {
  connection_id: string;
  alias?: string;
  engine: string;
  database: string;
  host_masked: string;
  port: number;
  username?: string;
  has_credentials: boolean;
  environment: 'development' | 'staging' | 'production' | 'unknown';
  created_at: string;
}

export class FluxyLocalApiClient {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: LocalApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? getLocalSidecarBaseUrl();
    this.fetcher = options.fetcher ?? fetch;
  }

  health() {
    return this.get('/health');
  }

  testConnection(input: LocalConnectionRequest) {
    return this.post('/api/v1/connect/test', input);
  }

  inspectSchema(input: LocalConnectionRequest) {
    return this.post('/api/v1/connect/schema', input);
  }

  listSavedConnections(): Promise<SavedConnectionProfile[]> {
    return this.get('/api/v1/connect/saved') as Promise<SavedConnectionProfile[]>;
  }

  getDatabaseProfile(connectionNumericId: number) {
    return this.get(`/api/v1/connect/saved/${connectionNumericId}/profile`);
  }

  checkPolicy(input: {
    operation: string;
    environment?: SavedConnectionProfile['environment'];
    has_backup?: boolean;
    has_sandbox?: boolean;
    human_approved?: boolean;
  }) {
    return this.post('/api/v1/connect/policy/check', input);
  }

  generatePreview(input: unknown) {
    return this.post('/api/v1/generate/preview', input);
  }

  exportSyntheticData(input: unknown) {
    return this.post('/api/v1/generate/export', input);
  }

  listSkills() {
    return this.get('/api/v1/skills');
  }

  resolveSkills(input: unknown) {
    return this.post('/api/v1/skills/resolve', input);
  }

  runSkill(input: unknown) {
    return this.post('/api/v1/skills/run', input);
  }

  getPostgresqlSafetyTools() {
    return this.get('/api/v1/safety/postgresql/tools');
  }

  createPostgresqlBackup(input: unknown) {
    return this.post('/api/v1/safety/postgresql/backup', input);
  }

  createPostgresqlSandbox(input: unknown) {
    return this.post('/api/v1/safety/postgresql/sandbox', input);
  }

  private async get(path: string) {
    const response = await this.fetcher(`${this.baseUrl}${path}`);
    return this.parse(response);
  }

  private async post(path: string, body: unknown) {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return this.parse(response);
  }

  private async parse(response: Response) {
    if (!response.ok) {
      throw new Error(`Fluxy local API request failed with ${response.status}`);
    }

    return response.json();
  }
}

export const fluxyLocalApi = new FluxyLocalApiClient();
