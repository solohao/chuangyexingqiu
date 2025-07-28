package com.jd.genie.controller;

import com.jd.genie.agent.agent.AgentContext;
import com.jd.genie.model.multi.EventMessage;
import com.jd.genie.model.req.AgentRequest;
import com.jd.genie.model.response.AgentResponse;
import com.jd.genie.service.ChatSessionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 聊天会话控制器
 * 处理会话相关的API请求
 */
@RestController
@RequestMapping("/api/chat")
public class ChatSessionController {

    private static final Logger logger = LoggerFactory.getLogger(ChatSessionController.class);
    private final ChatSessionService chatSessionService;

    @Autowired
    public ChatSessionController(ChatSessionService chatSessionService) {
        this.chatSessionService = chatSessionService;
    }

    /**
     * 获取所有会话
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<Map<String, Object>>> getAllSessions() {
        try {
            List<Map<String, Object>> sessions = chatSessionService.getAllSessions();
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            logger.error("获取所有会话失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 获取指定会话
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable String sessionId) {
        try {
            Optional<Map<String, Object>> session = chatSessionService.getSession(sessionId);
            return session.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("获取会话失败: {}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 创建新会话
     */
    @PostMapping("/sessions")
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody Map<String, Object> metadata) {
        try {
            Map<String, Object> session = chatSessionService.createSession(metadata);
            return ResponseEntity.status(HttpStatus.CREATED).body(session);
        } catch (Exception e) {
            logger.error("创建会话失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 删除会话
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable String sessionId) {
        try {
            boolean deleted = chatSessionService.deleteSession(sessionId);
            return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("删除会话失败: {}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 清空所有会话
     */
    @DeleteMapping("/sessions")
    public ResponseEntity<Void> clearAllSessions() {
        try {
            chatSessionService.clearAllSessions();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("清空所有会话失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 获取会话消息
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Map<String, Object>> getSessionMessages(@PathVariable String sessionId) {
        try {
            Optional<List<Map<String, Object>>> messages = chatSessionService.getSessionMessages(sessionId);
            if (messages.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("code", 0);
                response.put("data", messages.get());
                response.put("message", "success");
                response.put("requestId", sessionId);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("获取会话消息失败: {}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 保存会话消息
     */
    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Void> saveSessionMessages(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> payload) {
        
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> messages = (List<Map<String, Object>>) payload.get("messages");
            Map<String, Object> metadata = payload.containsKey("metadata") 
                    ? (Map<String, Object>) payload.get("metadata") 
                    : Map.of();
            
            boolean saved = chatSessionService.saveSessionMessages(sessionId, messages, metadata);
            return saved ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("保存会话消息失败: {}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 同步本地会话到后端
     */
    @PostMapping("/sessions/{sessionId}/sync")
    public ResponseEntity<Void> syncSession(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> session) {
        
        try {
            boolean synced = chatSessionService.syncSession(sessionId, session);
            return synced ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("同步会话失败: {}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 