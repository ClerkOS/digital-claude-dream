import type { ApiResponse } from '../../types/v2/api';

export type SessionResponse = ApiResponse<{
  session_id: string;
  session: {
    schema: {
      columns: { name: string; dtype: string }[];
      row_count: number;
    };
    version: number;
    history: Array<{
      step: { op: string; params: any };
      before: any;
      after: any;
      diff: any;
    }>;
  };

}>;

export type SessionDataResponse = ApiResponse<{
  session_id: string;
  data: {
    total_rows: number;
    preview_rows: number;
    columns: Array<{ name: string; dtype: string }>;
    rows: Array<Record<string, any>>;
  },

}>