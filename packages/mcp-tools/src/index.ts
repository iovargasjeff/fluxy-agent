export const FLUXY_MCP_TOOLS = [
  'fluxy_list_connections',
  'fluxy_get_database_profile',
  'fluxy_list_skills',
  'fluxy_run_skill',
  'fluxy_get_skill_status',
  'fluxy_get_artifact',
  'fluxy_request_approval',
] as const;

export type FluxyMcpTool = (typeof FLUXY_MCP_TOOLS)[number];

