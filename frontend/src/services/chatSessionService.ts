/**
 * 聊天会话服务
 * 负责与后端API交互，实现会话的持久化存储和检索
 */

import { Message, SessionData } from '../types/chat.types';
import { chatHistoryService } from './chatHistoryService';

/**
 * 聊天会话服务类
 */
export class ChatSessionService {
  private static instance: ChatSessionService;
  private apiEndpoint: string;
  
  private constructor() {
    // 根据环境配置API地址，使用Python后端API
    this.apiEndpoint = '/api/chat/sessions'; // 确保与后端路由一致
  }

  public static getInstance(): ChatSessionService {
    if (!ChatSessionService.instance) {
      ChatSessionService.instance = new ChatSessionService();
    }
    return ChatSessionService.instance;
  }

  /**
   * 获取会话列表
   */
  async getSessions(): Promise<SessionData[]> {
    try {
      // 尝试从后端获取会话列表
      const response = await fetch(`${this.apiEndpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`获取会话列表失败: ${response.status}`);
      }

      const sessions = await response.json();
      return sessions;
    } catch (error) {
      console.error('获取会话列表失败，使用本地存储:', error);
      // 如果后端请求失败，回退到本地存储
      return chatHistoryService.getAllSessions();
    }
  }

  /**
   * 获取会话消息
   */
  async getSessionMessages(sessionId: string): Promise<Message[]> {
    try {
      // 尝试从后端获取会话消息
      const response = await fetch(`${this.apiEndpoint}/${sessionId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`获取会话消息失败: ${response.status}`);
      }

      const responseData = await response.json();
      
      // 转换后端消息格式为前端格式
      const messages: Message[] = responseData.data ? responseData.data.map((msg: any) => ({
        id: msg.messageId || msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: this.mapMessageType(msg.role || msg.messageType || msg.type),
        content: msg.content || '',
        timestamp: new Date(msg.timestamp || msg.messageTime || Date.now()),
        agentId: msg.agentId,
        agentName: msg.agentName,
        workflowId: msg.taskId || msg.workflowId
      })) : [];
      
      // 同时更新本地存储，确保离线可用
      chatHistoryService.saveMessages(sessionId, messages);
      
      return messages;
    } catch (error) {
      console.error('获取会话消息失败，使用本地存储:', error);
      // 如果后端请求失败，回退到本地存储
      return chatHistoryService.getMessages(sessionId);
    }
  }

  /**
   * 保存会话消息
   */
  async saveSessionMessages(sessionId: string, messages: Message[], metadata: {
    projectId?: string;
    agentId?: string;
    mode?: 'orchestrated' | 'direct';
  } = {}): Promise<boolean> {
    try {
      // 首先保存到本地存储，确保即使后端请求失败也能保存数据
      chatHistoryService.saveMessages(sessionId, messages, metadata);

      // 转换为后端消息格式 - 适配Python服务
      const backendMessages = messages.map(msg => ({
        role: this.mapRoleType(msg.type),
        content: msg.content,
        messageId: msg.id,
        id: msg.id,
        type: msg.type,
        timestamp: msg.timestamp.toISOString(),
        agentId: msg.agentId,
        agentName: msg.agentName,
        taskId: msg.workflowId,
        workflowId: msg.workflowId
      }));

      // 发送到后端
      const response = await fetch(`${this.apiEndpoint}/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: backendMessages,
          metadata: {
            ...metadata,
            sessionId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`保存会话消息失败: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('保存会话消息到后端失败，已保存到本地存储:', error);
      // 即使后端保存失败，本地存储已经成功，所以返回true
      return true;
    }
  }

  /**
   * 删除会话
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      // 首先从本地存储删除
      chatHistoryService.clearSession(sessionId);

      // 然后尝试从后端删除
      const response = await fetch(`${this.apiEndpoint}/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`删除会话失败: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('从后端删除会话失败，已从本地存储删除:', error);
      // 即使后端删除失败，本地删除已经成功，所以返回true
      return true;
    }
  }

  /**
   * 清空所有会话
   */
  async clearAllSessions(): Promise<boolean> {
    try {
      // 首先从本地存储清空
      chatHistoryService.clearAllSessions();

      // 然后尝试从后端清空
      const response = await fetch(`${this.apiEndpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`清空所有会话失败: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('从后端清空所有会话失败，已从本地存储清空:', error);
      // 即使后端清空失败，本地清空已经成功，所以返回true
      return true;
    }
  }

  /**
   * 创建新会话
   */
  async createSession(metadata: {
    projectId?: string;
    agentId?: string;
    mode?: 'orchestrated' | 'direct';
    title?: string;
  } = {}): Promise<SessionData | null> {
    try {
      // 尝试在后端创建新会话
      const response = await fetch(`${this.apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata)
      });

      if (!response.ok) {
        throw new Error(`创建会话失败: ${response.status}`);
      }

      const session = await response.json();
      return session;
    } catch (error) {
      console.error('创建会话失败，使用本地会话:', error);
      // 如果后端创建失败，创建本地会话ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 创建一个空的会话，并保存到本地存储
      const welcomeMessage: Message = {
        id: `welcome_${Date.now()}`,
        type: 'ai',
        content: '您好！我是创业助手，可以协调多个专业智能体为您服务。请问需要什么帮助？',
        timestamp: new Date()
      };
      
      chatHistoryService.saveMessages(sessionId, [welcomeMessage], metadata);
      
      // 返回本地创建的会话数据
      return {
        id: sessionId,
        messages: [welcomeMessage],
        lastUpdated: new Date().toISOString(),
        ...metadata
      };
    }
  }

  /**
   * 同步本地会话到后端
   * 用于应用启动时，将本地存储的会话同步到后端
   */
  async syncLocalSessionsToBackend(): Promise<boolean> {
    try {
      // 获取本地所有会话
      const localSessions = chatHistoryService.getAllSessions();
      
      if (localSessions.length === 0) {
        return true; // 没有本地会话需要同步
      }
      
      // 获取后端所有会话ID
      const backendSessions = await this.getSessions();
      const backendSessionIds = new Set(backendSessions.map(s => s.id));
      
      // 找出需要同步的会话（本地有但后端没有的会话）
      const sessionsToSync = localSessions.filter(s => !backendSessionIds.has(s.id));
      
      // 同步每个会话
      for (const session of sessionsToSync) {
        const response = await fetch(`${this.apiEndpoint}/${session.id}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(session)
        });
        
        if (!response.ok) {
          console.warn(`同步会话 ${session.id} 失败: ${response.status}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('同步本地会话到后端失败:', error);
      return false;
    }
  }

  /**
   * 映射消息类型到角色类型
   * @private
   */
  private mapRoleType(type: string): string {
    switch (type) {
      case 'user':
        return 'user';
      case 'ai':
        return 'assistant';
      case 'system':
        return 'system';
      case 'agent':
        return 'agent';
      default:
        return 'assistant';
    }
  }

  /**
   * 映射角色类型到消息类型
   * @private
   */
  private mapMessageType(type: string): 'user' | 'ai' | 'system' | 'agent' {
    switch (type) {
      case 'user':
        return 'user';
      case 'assistant':
        return 'ai';
      case 'system':
        return 'system';
      case 'agent':
        return 'agent';
      case 'task':
        return 'system';
      case 'tool':
        return 'agent';
      default:
        return 'ai';
    }
  }
}

// 导出单例实例
export const chatSessionService = ChatSessionService.getInstance(); 