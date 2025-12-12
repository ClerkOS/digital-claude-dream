export interface AgentStep {
  step_index: number;
  op: string;
  status: 'success' | 'failed';
  version: number;
  diff: Record<string, any>;
}

export interface AgentSchemaColumn {
  name: string;
  dtype: string;
}

export interface AgentSchema {
  columns: AgentSchemaColumn[];
  row_count: number;
}

export interface AgentResponse {
  agent_goal: string;
  execution_status: 'success' | 'failed';
  steps: AgentStep[];
  final_version: number;
  schema: AgentSchema;
}