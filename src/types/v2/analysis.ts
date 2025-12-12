export interface SuggestionFix {
  tool: string;
  args: Record<string, any>;
}

export interface Suggestion {
  issue_type: string;
  description: string;
  suggested_fix: SuggestionFix;
}

export interface AnalysisResponse {
  session_id: string;
  suggestions: Suggestion[];
  suggestion_count: number;
}