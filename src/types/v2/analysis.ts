import { ApiResponse } from "../../types/v2/api";
export interface SuggestionFix {
  tool: string;
  args: Record<string, any>;
}

export interface Suggestion {
  issue_type: string;
  description: string;
  suggested_fix: SuggestionFix;
}

export type AnalysisResponse = ApiResponse<{
  session_id: string;
  analysis: {
    suggestion_count: number;
    suggestions: Suggestion[];
  };
}>;