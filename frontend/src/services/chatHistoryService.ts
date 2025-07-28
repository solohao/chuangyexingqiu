/**
 * 聊天历史服务
 * 负责消息历史的本地存储和检索
 */

import { Message, SessionData } from '../types/chat.types';

/**
 * 聊天历史服务类
 */
export class ChatHistoryService {
  private static instance: ChatHistoryService;
  private storageKey = 'agent_chat_history';
  // 默认保存最近30天的会话
  private expirationDays = 30;
  // 每个会话最多保存100条消息
  private maxMessagesPerSession = 100;

  private constructor() {}

  public static getInstance(): ChatHistoryService {
    if (!ChatHistoryService.instance) {
      ChatHistoryService.instance = new ChatHistoryService();
    }
    return ChatHistoryService.instance;
  }

  /**
   * 保存消息历史
   */
  saveMessages(sessionId: string, messages: Message[], metadata: {
    projectId?: string;
    agentId?: string;
    mode?: 'orchestrated' | 'direct';
  } = {}): void {
    try {
      const allHistory = this.getAllHistory();
      
      // 如果消息超过限制，只保留最新的消息
      const trimmedMessages = messages.length > this.maxMessagesPerSession 
        ? messages.slice(-this.maxMessagesPerSession) 
        : messages;
      
      allHistory[sessionId] = {
        id: sessionId,
        messages: trimmedMessages,
        lastUpdated: new Date().toISOString(),
        projectId: metadata.projectId,
        agentId: metadata.agentId,
        mode: metadata.mode
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(allHistory));
      
      // 清理过期会话
      this.cleanupExpiredSessions();
    } catch (error) {
      console.error('保存消息历史失败:', error);
    }
  }

  /**
   * 获取指定会话的消息历史
   */
  getMessages(sessionId: string): Message[] {
    try {
      const allHistory = this.getAllHistory();
      return allHistory[sessionId]?.messages || [];
    } catch (error) {
      console.error('获取消息历史失败:', error);
      return [];
    }
  }

  /**
   * 获取会话数据
   */
  getSession(sessionId: string): SessionData | null {
    try {
      const allHistory = this.getAllHistory();
      return allHistory[sessionId] || null;
    } catch (error) {
      console.error('获取会话数据失败:', error);
      return null;
    }
  }

  /**
   * 获取项目的最新会话
   */
  getLatestSessionForProject(projectId: string): SessionData | null {
    try {
      const allHistory = this.getAllHistory();
      
      // 筛选该项目的所有会话
      const projectSessions = Object.values(allHistory)
        .filter(session => session.projectId === projectId)
        // 按最后更新时间排序
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      
      return projectSessions.length > 0 ? projectSessions[0] : null;
    } catch (error) {
      console.error('获取项目最新会话失败:', error);
      return null;
    }
  }

  /**
   * 获取所有历史会话
   */
  getAllSessions(): SessionData[] {
    try {
      const allHistory = this.getAllHistory();
      return Object.values(allHistory)
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    } catch (error) {
      console.error('获取所有会话失败:', error);
      return [];
    }
  }

  /**
   * 获取所有历史记录
   */
  private getAllHistory(): Record<string, SessionData> {
    try {
      const historyStr = localStorage.getItem(this.storageKey);
      return historyStr ? JSON.parse(historyStr) : {};
    } catch (error) {
      console.error('解析历史记录失败:', error);
      return {};
    }
  }

  /**
   * 清除指定会话的历史记录
   */
  clearSession(sessionId: string): void {
    try {
      const allHistory = this.getAllHistory();
      delete allHistory[sessionId];
      localStorage.setItem(this.storageKey, JSON.stringify(allHistory));
    } catch (error) {
      console.error('清除会话失败:', error);
    }
  }

  /**
   * 清除所有历史记录
   */
  clearAllSessions(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('清除所有会话失败:', error);
    }
  }

  /**
   * 清理过期会话
   */
  private cleanupExpiredSessions(): void {
    try {
      const allHistory = this.getAllHistory();
      const now = new Date();
      const expirationTime = now.getTime() - (this.expirationDays * 24 * 60 * 60 * 1000);
      
      let changed = false;
      
      // 检查每个会话的最后更新时间
      Object.entries(allHistory).forEach(([sessionId, session]) => {
        const lastUpdated = new Date(session.lastUpdated).getTime();
        if (lastUpdated < expirationTime) {
          delete allHistory[sessionId];
          changed = true;
        }
      });
      
      // 只有在有会话被删除时才更新存储
      if (changed) {
        localStorage.setItem(this.storageKey, JSON.stringify(allHistory));
      }
    } catch (error) {
      console.error('清理过期会话失败:', error);
    }
  }

  /**
   * 设置会话过期天数
   */
  setExpirationDays(days: number): void {
    this.expirationDays = days;
  }

  /**
   * 设置每个会话最大消息数
   */
  setMaxMessagesPerSession(count: number): void {
    this.maxMessagesPerSession = count;
  }
}

// 导出单例实例
export const chatHistoryService = ChatHistoryService.getInstance(); 