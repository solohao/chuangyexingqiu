package com.jd.genie.controller;

import com.jd.genie.model.chat.ChatMessage;
import com.jd.genie.model.chat.ChatSession;
import com.jd.genie.service.ChatSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 聊天会话控制器
 * 处理会话相关的API请求
 */
@RestController
@RequestMapping("/chat")
public class ChatSessionController {

    private final ChatSessionService chatSessionService;

    @Autowired
    public ChatSessionController(ChatSessionService chatSessionService) {
        this.chatSessionService = chatSessionService;
    }

    /**
     * 获取所有会话
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getAllSessions() {
        return ResponseEntity.ok(chatSessionService.getAllSessions());
    }

    /**
     * 获取指定会话
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ChatSession> getSession(@PathVariable String sessionId) {
        Optional<ChatSession> session = chatSessionService.getSession(sessionId);
        return session.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * 创建新会话
     */
    @PostMapping("/sessions")
    public ResponseEntity<ChatSession> createSession(@RequestBody Map<String, Object> metadata) {
        ChatSession session = chatSessionService.createSession(metadata);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    /**
     * 删除会话
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable String sessionId) {
        boolean deleted = chatSessionService.deleteSession(sessionId);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    /**
     * 清空所有会话
     */
    @DeleteMapping("/sessions")
    public ResponseEntity<Void> clearAllSessions() {
        chatSessionService.clearAllSessions();
        return ResponseEntity.ok().build();
    }

    /**
     * 获取会话消息
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<ChatMessage>> getSessionMessages(@PathVariable String sessionId) {
        Optional<List<ChatMessage>> messages = chatSessionService.getSessionMessages(sessionId);
        return messages.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * 保存会话消息
     */
    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Void> saveSessionMessages(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> payload) {
        
        @SuppressWarnings("unchecked")
        List<ChatMessage> messages = (List<ChatMessage>) payload.get("messages");
        Map<String, Object> metadata = payload.containsKey("metadata") 
                ? (Map<String, Object>) payload.get("metadata") 
                : Map.of();
        
        boolean saved = chatSessionService.saveSessionMessages(sessionId, messages, metadata);
        return saved ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    /**
     * 同步本地会话到后端
     */
    @PostMapping("/sessions/{sessionId}/sync")
    public ResponseEntity<Void> syncSession(
            @PathVariable String sessionId,
            @RequestBody ChatSession session) {
        
        boolean synced = chatSessionService.syncSession(sessionId, session);
        return synced ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }
} 