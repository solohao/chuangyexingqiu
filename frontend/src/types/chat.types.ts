/**
 * 聊天相关类型定义
 */

/**
 * 消息接口
 */
export interface Message {
  id: string;
  type: 'user' | 'ai' | 'system' | 'agent';
  content: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  workflowId?: string;
}

/**
 * 会话数据接口
 */
export interface SessionData {
  id: string;
  messages: Message[];
  lastUpdated: string;
  projectId?: string;
  agentId?: string;
  mode?: 'orchestrated' | 'direct';
}

/**
 * 聊天模式
 */
export type ChatMode = 'orchestrated' | 'direct'; 