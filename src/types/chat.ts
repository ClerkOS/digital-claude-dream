export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  timestamp: string;
  preview: string;
  messages: Message[];
  sessionId?: string;
  suggestions?: Array<{
    issue_type: string;
    description: string;
    suggested_fix: {
      tool: string;
      args: Record<string, any>;
    };
  }>;
  files: {
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  }[];
  lastActivity: string;
}

// Keep Conversation for backward compatibility during transition
export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
  messages: Message[];
}
