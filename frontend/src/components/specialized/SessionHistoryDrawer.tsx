import React from 'react';
import { X, Clock, Trash2 } from 'lucide-react';
import { chatHistoryService } from '../../services/chatHistoryService';
import { chatSessionService } from '../../services/chatSessionService';
import { type SessionData } from '../../types/chat.types';
import './SessionHistoryDrawer.css';

interface SessionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  currentSessionId: string;
}

const SessionHistoryDrawer: React.FC<SessionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectSession,
  currentSessionId
}) => {
  const [sessions, setSessions] = React.useState<SessionData[]>([]);
  const [filter, setFilter] = React.useState('all');

  // 加载会话
  React.useEffect(() => {
    if (isOpen) {
      const loadSessions = async () => {
        try {
          // 尝试从后端加载会话
          const backendSessions = await chatSessionService.getSessions();
          setSessions(backendSessions);
        } catch (error) {
          console.error('从后端加载会话失败，使用本地存储:', error);
          // 如果后端请求失败，回退到本地存储
          const localSessions = chatHistoryService.getAllSessions();
          setSessions(localSessions);
        }
      };
      
      loadSessions();
    }
  }, [isOpen]);

  // 删除会话
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除此会话吗？')) {
      try {
        // 尝试从后端删除会话
        await chatSessionService.deleteSession(sessionId);
        setSessions(sessions.filter(session => session.id !== sessionId));
      } catch (error) {
        console.error('从后端删除会话失败，使用本地存储:', error);
        // 如果后端请求失败，回退到本地存储
        chatHistoryService.clearSession(sessionId);
        setSessions(sessions.filter(session => session.id !== sessionId));
      }
    }
  };

  // 清空所有会话
  const handleClearAllSessions = async () => {
    if (window.confirm('确定要清空所有历史会话吗？此操作不可撤销。')) {
      try {
        // 尝试从后端清空所有会话
        await chatSessionService.clearAllSessions();
        setSessions([]);
      } catch (error) {
        console.error('从后端清空所有会话失败，使用本地存储:', error);
        // 如果后端请求失败，回退到本地存储
        chatHistoryService.clearAllSessions();
        setSessions([]);
      }
    }
  };

  // 过滤会话
  const filteredSessions = React.useMemo(() => {
    if (filter === 'all') return sessions;
    return sessions.filter(session => session.mode === filter);
  }, [sessions, filter]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // 获取会话预览
  const getSessionPreview = (session: SessionData) => {
    if (!session.messages || session.messages.length === 0) {
      return '空会话';
    }

    // 查找最近的用户消息
    const lastUserMessage = [...session.messages]
      .reverse()
      .find(msg => msg.type === 'user');
    
    if (lastUserMessage) {
      return lastUserMessage.content.length > 50
        ? `${lastUserMessage.content.substring(0, 50)}...`
        : lastUserMessage.content;
    }

    // 如果没有用户消息，返回最后一条消息
    const lastMessage = session.messages[session.messages.length - 1];
    return lastMessage.content.length > 50
      ? `${lastMessage.content.substring(0, 50)}...`
      : lastMessage.content;
  };

  if (!isOpen) return null;

  return (
    <div className="session-history-drawer">
      <div className="session-history-header">
        <h2>历史会话</h2>
        <button className="close-button" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="session-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
        <button
          className={`filter-btn ${filter === 'orchestrated' ? 'active' : ''}`}
          onClick={() => setFilter('orchestrated')}
        >
          编排模式
        </button>
        <button
          className={`filter-btn ${filter === 'direct' ? 'active' : ''}`}
          onClick={() => setFilter('direct')}
        >
          直接模式
        </button>
      </div>

      <div className="sessions-list">
        {filteredSessions.length === 0 ? (
          <div className="no-sessions">
            <p>没有找到历史会话</p>
          </div>
        ) : (
          filteredSessions.map(session => (
            <div
              key={session.id}
              className={`session-item ${session.id === currentSessionId ? 'current' : ''}`}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="session-info">
                <div className="session-mode">
                  {session.mode === 'orchestrated' ? '编排模式' : '直接模式'}
                  {session.agentId && (
                    <span className="session-agent">
                      {' '}• {session.agentId.replace(/_agent$/, '')}
                    </span>
                  )}
                </div>
                <div className="session-preview">{getSessionPreview(session)}</div>
                <div className="session-time">
                  <Clock size={14} />
                  <span>{formatDate(session.lastUpdated)}</span>
                </div>
              </div>
              <button
                className="delete-session"
                onClick={(e) => handleDeleteSession(session.id, e)}
                title="删除会话"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {sessions.length > 0 && (
        <div className="sessions-actions">
          <button className="clear-all-btn" onClick={handleClearAllSessions}>
            清空所有历史会话
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionHistoryDrawer; 