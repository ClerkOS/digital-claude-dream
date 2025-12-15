import { ApiResponse } from "../../types/v2/api";

export interface AgentStep {
  step_index: number;
  tool: string;
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

export type AgentResponse = ApiResponse<{
  session_id: string;
  execution: { 
    agent_goal: string;
    execution_status: 'success' | 'failed';
    steps: AgentStep[];
    final_version: number;
  };
  schema: AgentSchema;
}>;

export type SuggestionResponse = ApiResponse<{
  session_id: string;
  execution: {
    status: string;
    steps: AgentStep[];
    final_version: number;
  };
  schema: AgentSchema;
}>;