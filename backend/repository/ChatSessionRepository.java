package com.jd.genie.repository;

import com.jd.genie.model.chat.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 聊天会话存储库
 */
@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    
    /**
     * 根据项目ID查找会话
     */
    List<ChatSession> findByProjectId(String projectId);
    
    /**
     * 根据智能体ID查找会话
     */
    List<ChatSession> findByAgentId(String agentId);
    
    /**
     * 根据模式查找会话
     */
    List<ChatSession> findByMode(String mode);
    
    /**
     * 根据项目ID和模式查找会话
     */
    List<ChatSession> findByProjectIdAndMode(String projectId, String mode);
} 