import { invoke } from '@tauri-apps/api/core';
import type { DatabaseConnection } from '@/lib/store/useConnectionStore';
import type { FlowJson } from '@/lib/flow-types';
import { serializeSchema, type EditorDialect } from '@/lib/editor-schema';

let API_ROOT = 'http://127.0.0.1:8000';
let API_BASE = `${API_ROOT}/api/v1`;

type JsonObject = Record<string, unknown>;

export interface ProjectResponse {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  is_public: boolean;
  share_access: 'view' | 'edit';
}

interface DiagramResponse {
  id: number;
  project_id: number;
  name: string;
  schema_json: string | null;
  sql_content: string;
  active_dialect: EditorDialect;
  source_database?: string | null;
  selected_tables_json?: string;
  last_synced_at?: string | null;
}

export interface DiagramData {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  flowJson: FlowJson;
  sourceCode: string;
  dialect: EditorDialect;
  isPublic: boolean;
  shareAccess: 'view' | 'edit';
  sourceDatabase?: string | null;
  lastSyncedAt?: string | null;
}

export interface VersionSummary {
  id: string;
  versionNumber: number;
  message: string;
  userId: string;
  createdAt: string;
  authorName: string;
}

export interface VersionDetail extends VersionSummary {
  flowJson: FlowJson;
  sqlContent: string;
  activeDialect: EditorDialect;
  snapshots: Record<EditorDialect, string>;
}

interface VersionWire {
  id: number;
  version_number: number;
  message: string;
  created_at: string;
  flow_json?: FlowJson;
  sql_content?: string;
  active_dialect?: EditorDialect;
  snapshots?: Record<EditorDialect, string>;
}

export async function initApiClient() {
  try {
    const port = await invoke<number>('get_sidecar_port');
    API_ROOT = `http://127.0.0.1:${port}`;
    API_BASE = `${API_ROOT}/api/v1`;
  } catch {
    // Browser development uses the conventional local backend port.
  }
}

export async function healthCheck() {
  const response = await fetch(`${API_ROOT}/health`);
  if (!response.ok) {
    throw new Error(`Backend health check failed (${response.status})`);
  }
  return response.json() as Promise<{ status: string; message?: string }>;
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const request = () => fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

  let response: Response;
  try {
    response = await request();
  } catch {
    // Recover when the WebView retained the development port or the sidecar
    // needed a little longer to become reachable.
    await initApiClient();
    await waitForBackend();
    response = await request();
  }

  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try {
      const body = await response.json() as { detail?: string; message?: string };
      message = body.detail || body.message || message;
    } catch {
      // Keep the status-based message for non-JSON responses.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function waitForBackend() {
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    try {
      await healthCheck();
      return;
    } catch {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }
  }
  throw new Error('El backend local no está disponible. Reinicia Fluxy Desktop e intenta nuevamente.');
}

function parseFlow(value: string | null): FlowJson {
  if (!value) return { nodes: [], edges: [] };
  try {
    return JSON.parse(value) as FlowJson;
  } catch {
    return { nodes: [], edges: [] };
  }
}

function mapVersion(version: VersionWire): VersionSummary {
  return {
    id: String(version.id),
    versionNumber: version.version_number,
    message: version.message,
    userId: 'local-user',
    createdAt: version.created_at,
    authorName: 'Usuario Local',
  };
}

function mapVersionDetail(version: VersionWire): VersionDetail {
  return {
    ...mapVersion(version),
    flowJson: version.flow_json ?? { nodes: [], edges: [] },
    sqlContent: version.sql_content ?? '',
    activeDialect: version.active_dialect ?? 'postgresql',
    snapshots: version.snapshots ?? {
      postgresql: '',
      mysql: '',
      sqlserver: '',
      json: '',
    },
  };
}

export const projectsAPI = {
  list: () => apiCall<ProjectResponse[]>('/projects'),
  get: (id: string) => apiCall<ProjectResponse>(`/projects/${id}`),
  create: (data: { name: string; description?: string }) =>
    apiCall<ProjectResponse>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; description?: string }) =>
    apiCall<ProjectResponse>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<{ ok: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  restore: (id: string) => apiCall<ProjectResponse>(`/projects/${id}/restore`, { method: 'POST' }),
  permanentlyDelete: (id: string) =>
    apiCall<{ ok: boolean }>(`/projects/${id}/permanent`, { method: 'DELETE' }),
  togglePublic: (id: string, isPublic: boolean, access = 'view') =>
    apiCall<ProjectResponse>(
      `/projects/${id}/sharing?is_public=${isPublic}&access=${encodeURIComponent(access)}`,
      { method: 'PATCH' },
    ),
};

export const diagramsAPI = {
  listByProject: (projectId: string) =>
    apiCall<DiagramResponse[]>(`/diagrams?projectId=${projectId}`),
  load: async (projectId: string): Promise<DiagramData | null> => {
    const [project, diagrams] = await Promise.all([
      projectsAPI.get(projectId),
      apiCall<DiagramResponse[]>(`/diagrams?projectId=${projectId}`),
    ]);
    const diagram = diagrams[0];
    if (!diagram) {
      return {
        id: projectId,
        projectId,
        projectName: project.name,
        name: 'Diagrama Principal',
        flowJson: { nodes: [], edges: [] },
        sourceCode: '',
        dialect: 'postgresql',
        isPublic: project.is_public,
        shareAccess: project.share_access,
      };
    }

    return {
      id: String(diagram.id),
      projectId: String(diagram.project_id),
      projectName: project.name,
      name: diagram.name,
      flowJson: parseFlow(diagram.schema_json),
      sourceCode: diagram.sql_content,
      dialect: diagram.active_dialect,
      isPublic: project.is_public,
      shareAccess: project.share_access,
      sourceDatabase: diagram.source_database,
      lastSyncedAt: diagram.last_synced_at,
    };
  },
  create: (data: JsonObject) =>
    apiCall<DiagramResponse>('/diagrams', { method: 'POST', body: JSON.stringify(data) }),
  generate: (projectId: string, payload: JsonObject & { connection: DatabaseConnection }) =>
    apiCall<DiagramResponse>(`/diagrams/generate?projectId=${projectId}`, {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        connection: mapConnectionForGenerator(payload.connection),
      }),
    }),
  saveDiagramByProject: async (
    projectId: string,
    flowJson: FlowJson,
    options: { name?: string; sqlContent?: string; activeDialect?: EditorDialect } = {},
  ) => {
    const diagrams = await apiCall<DiagramResponse[]>(`/diagrams?projectId=${projectId}`);
    const diagram = diagrams[0];
    const activeDialect = options.activeDialect ?? 'postgresql';
    const sqlContent =
      options.sqlContent ?? serializeSchema(flowJson.nodes ?? [], activeDialect, flowJson.edges ?? []);

    if (!diagram) {
      return apiCall<DiagramResponse>('/diagrams', {
        method: 'POST',
        body: JSON.stringify({
          project_id: Number(projectId),
          name: options.name ?? 'Diagrama Principal',
          schema_json: JSON.stringify(flowJson),
          sql_content: sqlContent,
          active_dialect: activeDialect,
        }),
      });
    }

    return apiCall<DiagramResponse>(`/diagrams/${diagram.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: options.name,
        schema_json: JSON.stringify(flowJson),
        sql_content: sqlContent,
        active_dialect: activeDialect,
      }),
    });
  },
  saveLayoutByProject: async (projectId: string, flowJson: FlowJson) =>
    diagramsAPI.saveDiagramByProject(projectId, flowJson),
  refreshByProject: async (projectId: string, connection: DatabaseConnection) => {
    const diagrams = await apiCall<DiagramResponse[]>(`/diagrams?projectId=${projectId}`);
    const diagram = diagrams[0];
    if (!diagram) throw new Error('Diagram not found');
    const refreshed = await apiCall<DiagramResponse>(`/diagrams/${diagram.id}/refresh`, {
      method: 'POST',
      body: JSON.stringify({ connection: mapConnectionForGenerator(connection) }),
    });
    return {
      flowJson: parseFlow(refreshed.schema_json),
      sourceCode: refreshed.sql_content,
      dialect: refreshed.active_dialect,
      sourceDatabase: refreshed.source_database,
      lastSyncedAt: refreshed.last_synced_at,
    };
  },
  previewTable: (
    projectId: string,
    tableName: string,
    connection: DatabaseConnection,
    page = 1,
    pageSize = 25,
  ) =>
    apiCall<{
      table_name: string;
      columns: string[];
      rows: unknown[][];
      page: number;
      page_size: number;
      total_rows: number;
      total_pages: number;
    }>(`/projects/${projectId}/tables/${encodeURIComponent(tableName)}/rows`, {
      method: 'POST',
      body: JSON.stringify({
        connection: mapConnectionForGenerator(connection),
        page,
        page_size: pageSize,
      }),
    }),
};

export const versionsAPI = {
  listByProject: async (projectId: string) => {
    const versions = await apiCall<VersionWire[]>(`/versions?projectId=${projectId}`);
    return versions.map(mapVersion);
  },
  create: async (
    projectId: string,
    data: {
      message: string;
      flowJson: FlowJson;
      sqlContent: string;
      activeDialect: string;
      snapshots: Record<string, string>;
    },
  ) => {
    const version = await apiCall<VersionWire>('/versions', {
      method: 'POST',
      body: JSON.stringify({
        project_id: Number(projectId),
        message: data.message,
        flow_json: data.flowJson,
        sql_content: data.sqlContent,
        active_dialect: data.activeDialect,
        snapshots: data.snapshots,
      }),
    });
    return mapVersionDetail(version);
  },
  delete: (id: string) => apiCall<{ ok: boolean }>(`/versions/${id}`, { method: 'DELETE' }),
  detail: async (id: string) => mapVersionDetail(await apiCall<VersionWire>(`/versions/${id}`)),
  restore: async (id: string) =>
    mapVersionDetail(await apiCall<VersionWire>(`/versions/${id}/restore`, { method: 'POST' })),
};

const mapConnectionForGenerator = (config: DatabaseConnection) => ({
  host: config.host || 'localhost',
  puerto: Number.parseInt(config.port || '5432', 10),
  usuario: config.username || 'postgres',
  password: config.password || '',
  nombre_bd: config.database || '',
  motor: config.engine || 'postgresql',
});

export const generatorAPI = {
  testConnection: (config: DatabaseConnection) =>
    apiCall<JsonObject>('/connect/test', {
      method: 'POST',
      body: JSON.stringify(mapConnectionForGenerator(config)),
    }),
  getSchema: (config: DatabaseConnection) =>
    apiCall<{ tables: Array<string | { name: string }> }>('/connect/schema', {
      method: 'POST',
      body: JSON.stringify(mapConnectionForGenerator(config)),
    }),
  listTableRows: (config: DatabaseConnection, tableName: string, page = 1, pageSize = 25) =>
    apiCall<{
      table_name: string;
      columns: string[];
      rows: unknown[][];
      page: number;
      page_size: number;
      total_rows: number;
      total_pages: number;
    }>('/connect/table-rows', {
      method: 'POST',
      body: JSON.stringify({
        connection: mapConnectionForGenerator(config),
        table_name: tableName,
        page,
        page_size: pageSize,
      }),
    }),
  generatePreview: (payload: JsonObject) =>
    apiCall<JsonObject>('/generate/preview', { method: 'POST', body: JSON.stringify(payload) }),
  exportData: (payload: JsonObject) =>
    apiCall<JsonObject>('/generate/export', { method: 'POST', body: JSON.stringify(payload) }),
  insertData: (payload: JsonObject & { connection: DatabaseConnection }) =>
    apiCall<JsonObject>('/connect/insert', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        connection: mapConnectionForGenerator(payload.connection),
      }),
    }),
};

const mapConnectionForAnalyzer = (config: DatabaseConnection) => ({
  engine: config.engine || 'postgresql',
  host: config.host || 'localhost',
  port: Number.parseInt(config.port || '5432', 10),
  username: config.username || 'postgres',
  password: config.password || '',
  database: config.database || '',
});

export const analyzerAPI = {
  getEngineInfo: (payload: JsonObject & { connection: DatabaseConnection }) =>
    apiCall<JsonObject>('/analyzer/metrics', {
      method: 'POST',
      body: JSON.stringify({ ...payload, connection: mapConnectionForAnalyzer(payload.connection) }),
    }),
  explain: (payload: { connection: DatabaseConnection; query: string }) =>
    apiCall<JsonObject>('/analyzer/explain', {
      method: 'POST',
      body: JSON.stringify({ ...payload, connection: mapConnectionForAnalyzer(payload.connection) }),
    }),
  aiAnalyze: (payload: JsonObject) =>
    apiCall<JsonObject>('/analyzer/ai', { method: 'POST', body: JSON.stringify(payload) }),
  listProviders: () => apiCall<{
    providers: Array<{ id: string; name: string; provider: string; protocol: string; base_url: string; model: string; has_api_key: boolean }>;
    presets: Array<{ id: string; name: string; protocol: string; base_url: string; model: string }>;
  }>('/analyzer/providers'),
  createProvider: (payload: JsonObject) =>
    apiCall<{ id: string; name: string }>('/analyzer/providers', { method: 'POST', body: JSON.stringify(payload) }),
  updateProvider: (id: string, payload: JsonObject) =>
    apiCall<{ id: string; name: string }>(`/analyzer/providers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProvider: (id: string) =>
    apiCall<{ ok: boolean }>(`/analyzer/providers/${id}`, { method: 'DELETE' }),
  testProvider: (id: string) =>
    apiCall<{ success: boolean }>(`/analyzer/providers/${id}/test`, { method: 'POST' }),
  getSlowQueries: (payload: JsonObject & { connection: DatabaseConnection }) =>
    apiCall<JsonObject[]>('/analyzer/slow-queries', {
      method: 'POST',
      body: JSON.stringify({ ...payload, connection: mapConnectionForAnalyzer(payload.connection) }),
    }),
};

export interface SavedConnection {
  connection_id: string;
  alias: string;
  engine: string;
  database: string;
  host: string;
  host_masked: string;
  port: number;
  username: string;
  has_credentials: boolean;
  environment: string;
  created_at: string;
}

export const connectorAPI = {
  listSaved: () => apiCall<SavedConnection[]>('/connect/saved'),
  deleteSaved: (id: string) => apiCall<{ message: string }>(`/connect/saved/${id}`, { method: 'DELETE' }),
};

export interface SkillStoreItem {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  category: string;
  engines: string[];
  tags: string[];
  risk_level: string;
  requires_approval: boolean;
  requires_backup: boolean;
  requires_sandbox: boolean;
  installed: boolean;
  enabled: boolean;
}

export const skillsAPI = {
  list: () => apiCall<SkillStoreItem[]>('/skills'),
  install: (skillId: string) =>
    apiCall<SkillStoreItem>('/skills/install', {
      method: 'POST',
      body: JSON.stringify({ skill_id: skillId }),
    }),
  setEnabled: (skillId: string, enabled: boolean) =>
    apiCall<SkillStoreItem>(`/skills/${skillId}/enabled`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),
};
