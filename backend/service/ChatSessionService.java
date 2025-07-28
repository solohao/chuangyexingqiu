package com.jd.genie.service;

import com.jd.genie.model.chat.ChatMessage;
import com.jd.genie.model.chat.ChatSession;
import com.jd.genie.repository.ChatSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 聊天会话服务
 * 负责会话的存储和检索
 */
@Service
public class ChatSessionService {

    private static final Logger logger = LoggerFactory.getLogger(ChatSessionService.class);
    private final ChatSessionRepository chatSessionRepository;

    @Autowired
    public ChatSessionService(ChatSessionRepository chatSessionRepository) {
        this.chatSessionRepository = chatSessionRepository;
    }

    /**
     * 获取所有会话
     */
    public List<ChatSession> getAllSessions() {
        try {
            return chatSessionRepository.findAll();
        } catch (Exception e) {
            logger.error("获取所有会话失败", e);
            return new ArrayList<>();
        }
    }

    /**
     * 获取指定会话
     */
    public Optional<ChatSession> getSession(String sessionId) {
        try {
            return chatSessionRepository.findById(sessionId);
        } catch (Exception e) {
            logger.error("获取会话失败: {}", sessionId, e);
            return Optional.empty();
        }
    }

    /**
     * 创建新会话
     */
    public ChatSession createSession(Map<String, Object> metadata) {
        try {
            String sessionId = "session_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
            
            ChatSession session = new ChatSession(sessionId);
            
            // 设置元数据
            if (metadata != null) {
                if (metadata.containsKey("projectId")) {
                    session.setProjectId((String) metadata.get("projectId"));
                }
                if (metadata.containsKey("agentId")) {
                    session.setAgentId((String) metadata.get("agentId"));
                }
                if (metadata.containsKey("mode")) {
                    session.setMode((String) metadata.get("mode"));
                }
                if (metadata.containsKey("title")) {
                    session.setTitle((String) metadata.get("title"));
                }
                session.setMetadata(metadata);
            }
            
            // 添加欢迎消息
            ChatMessage welcomeMessage = new ChatMessage(
                    "welcome_" + System.currentTimeMillis(),
                    "ai",
                    "您好！我是创业助手，可以协调多个专业智能体为您服务。请问需要什么帮助？"
            );
            session.addMessage(welcomeMessage);
            
            return chatSessionRepository.save(session);
        } catch (Exception e) {
            logger.error("创建会话失败", e);
            throw new RuntimeException("创建会话失败", e);
        }
    }

    /**
     * 删除会话
     */
    public boolean deleteSession(String sessionId) {
        try {
            if (chatSessionRepository.existsById(sessionId)) {
                chatSessionRepository.deleteById(sessionId);
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.error("删除会话失败: {}", sessionId, e);
            return false;
        }
    }

    /**
     * 清空所有会话
     */
    public void clearAllSessions() {
        try {
            chatSessionRepository.deleteAll();
        } catch (Exception e) {
            logger.error("清空所有会话失败", e);
            throw new RuntimeException("清空所有会话失败", e);
        }
    }

    /**
     * 获取会话消息
     */
    public Optional<List<ChatMessage>> getSessionMessages(String sessionId) {
        try {
            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(sessionId);
            return sessionOpt.map(ChatSession::getMessages);
        } catch (Exception e) {
            logger.error("获取会话消息失败: {}", sessionId, e);
            return Optional.empty();
        }
    }

    /**
     * 保存会话消息
     */
    public boolean saveSessionMessages(String sessionId, List<ChatMessage> messages, Map<String, Object> metadata) {
        try {
            Optional<ChatSession> sessionOpt = chatSessionRepository.findById(sessionId);
            
            if (sessionOpt.isPresent()) {
                ChatSession session = sessionOpt.get();
                session.setMessages(messages);
                session.setLastUpdated(LocalDateTime.now());
                
                // 更新元数据
                if (metadata != null && !metadata.isEmpty()) {
                    if (metadata.containsKey("projectId")) {
                        session.setProjectId((String) metadata.get("projectId"));
                    }
                    if (metadata.containsKey("agentId")) {
                        session.setAgentId((String) metadata.get("agentId"));
                    }
                    if (metadata.containsKey("mode")) {
                        session.setMode((String) metadata.get("mode"));
                    }
                    
                    // 合并元数据
                    Map<String, Object> existingMetadata = session.getMetadata();
                    if (existingMetadata == null) {
                        existingMetadata = new HashMap<>();
                    }
                    existingMetadata.putAll(metadata);
                    session.setMetadata(existingMetadata);
                }
                
                chatSessionRepository.save(session);
                return true;
            } else {
                // 会话不存在，创建新会话
                ChatSession session = new ChatSession(sessionId);
                session.setMessages(messages);
                
                if (metadata != null) {
                    if (metadata.containsKey("projectId")) {
                        session.setProjectId((String) metadata.get("projectId"));
                    }
                    if (metadata.containsKey("agentId")) {
                        session.setAgentId((String) metadata.get("agentId"));
                    }
                    if (metadata.containsKey("mode")) {
                        session.setMode((String) metadata.get("mode"));
                    }
                    session.setMetadata(metadata);
                }
                
                chatSessionRepository.save(session);
                return true;
            }
        } catch (Exception e) {
            logger.error("保存会话消息失败: {}", sessionId, e);
            return false;
        }
    }

    /**
     * 同步会话
     */
    public boolean syncSession(String sessionId, ChatSession session) {
        try {
            // 检查会话ID是否匹配
            if (!sessionId.equals(session.getId())) {
                logger.error("会话ID不匹配: {} vs {}", sessionId, session.getId());
                return false;
            }
            
            // 检查会话是否已存在
            boolean exists = chatSessionRepository.existsById(sessionId);
            if (exists) {
                logger.info("会话已存在，跳过同步: {}", sessionId);
                return true; // 已存在，不需要同步
            }
            
            // 保存会话
            chatSessionRepository.save(session);
            return true;
        } catch (Exception e) {
            logger.error("同步会话失败: {}", sessionId, e);
            return false;
        }
    }
} 