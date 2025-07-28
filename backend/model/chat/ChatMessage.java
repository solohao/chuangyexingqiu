package com.jd.genie.model.chat;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 聊天消息模型
 */
public class ChatMessage {
    private String id;
    private String type; // 'user', 'ai', 'system', 'agent'
    private String content;
    private LocalDateTime timestamp;
    private String agentId;
    private String agentName;
    private String workflowId;
    private Map<String, Object> metadata;

    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }

    public ChatMessage(String id, String type, String content) {
        this.id = id;
        this.type = type;
        this.content = content;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getAgentId() {
        return agentId;
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    @Override
    public String toString() {
        return "ChatMessage{" +
                "id='" + id + '\'' +
                ", type='" + type + '\'' +
                ", content='" + (content != null && content.length() > 50 ? content.substring(0, 50) + "..." : content) + '\'' +
                ", timestamp=" + timestamp +
                ", agentId='" + agentId + '\'' +
                ", agentName='" + agentName + '\'' +
                ", workflowId='" + workflowId + '\'' +
                '}';
    }
} 