export interface SessionResponse {
  session_id: string;
  schema: {
    columns: {
      name: string;
      dtype: string;
    }[];
    row_count: number;
  };
  version: number;
  history: Array<{
    step: {
      op: string;
      params: any;
    };
    before: any;
    after: any;
    diff: any;
  }>;
}