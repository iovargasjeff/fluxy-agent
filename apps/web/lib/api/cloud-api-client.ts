const DEFAULT_API_URL = 'http://localhost:3001';

export interface FluxyCloudClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  tags?: string[];
}

export interface SaveDiagramInput {
  projectId: string;
  name: string;
  sourceCode?: string;
  dialect?: string;
  flowJson?: unknown;
  mermaidString?: string;
  generatedSql?: string;
}

export class FluxyCloudApiClient {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: FluxyCloudClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_FLUXY_API_URL ?? DEFAULT_API_URL;
    this.fetcher = options.fetcher ?? fetch;
  }

  health() {
    return this.get('/health');
  }

  listProjects() {
    return this.get('/projects');
  }

  createProject(input: CreateProjectInput) {
    return this.post('/projects', input);
  }

  getProject(projectId: string) {
    return this.get(`/projects/${projectId}`);
  }

  listProjectDiagrams(projectId: string) {
    return this.get(`/diagrams/project/${projectId}`);
  }

  saveDiagram(input: SaveDiagramInput) {
    return this.post('/diagrams', input);
  }

  getCloudSafeArtifactPolicy() {
    return this.get('/policy/cloud-safe-artifacts');
  }

  private async get(path: string) {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      credentials: 'include',
    });

    return this.parse(response);
  }

  private async post(path: string, body: unknown) {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return this.parse(response);
  }

  private async parse(response: Response) {
    if (!response.ok) {
      throw new Error(`Fluxy API request failed with ${response.status}`);
    }

    return response.json();
  }
}

export const fluxyCloudApi = new FluxyCloudApiClient();

