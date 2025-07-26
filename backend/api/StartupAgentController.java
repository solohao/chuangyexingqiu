package com.startup.api;

import com.jd.genie.service.IGptProcessService;
import com.jd.genie.model.req.GptQueryReq;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.Map;
import java.util.UUID;

/**
 * 创业智能体API控制器
 */
@RestController
@RequestMapping("/api/startup-agents")
@CrossOrigin(origins = "*")
public class StartupAgentController {
    
    @Autowired
    private IGptProcessService gptProcessService;
    
    /**
     * 商业模式画布分析
     */
    @PostMapping("/business-canvas")
    public ResponseEntity<?> analyzeBusinessCanvas(@RequestBody Map<String, Object> request) {
        try {
            String task = (String) request.get("task");
            String requestId = (String) request.getOrDefault("requestId", UUID.randomUUID().toString());
            
            if (task == null || task.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "code", 400,
                    "message", "任务描述不能为空"
                ));
            }
            
            // 构建查询请求，调用商业模式画布智能体
            String query = String.format("使用business_canvas_agent分析以下商业模式：%s", task);
            
            GptQueryReq gptQueryReq = GptQueryReq.builder()
                .query(query)
                .traceId(requestId)
                .user("startup_agent_user")
                .deepThink(0)
                .outputStyle("html")
                .build();
            
            SseEmitter emitter = gptProcessService.queryMultiAgentIncrStream(gptQueryReq);
            
            return ResponseEntity.ok(Map.of(
                "code", 200,
                "data", "商业模式画布分析已启动，请求ID：" + requestId,
                "requestId", requestId,
                "message", "分析中..."
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "code", 500,
                "message", "商业模式画布分析失败：" + e.getMessage()
            ));
        }
    }
    
    /**
     * SWOT分析
     */
    @PostMapping("/swot-analysis")
    public ResponseEntity<?> performSWOTAnalysis(@RequestBody Object request) {
        // TODO: 实现SWOT分析API
        return ResponseEntity.ok().build();
    }
    
    /**
     * 政策匹配
     */
    @PostMapping("/policy-matching")
    public ResponseEntity<?> matchPolicies(@RequestBody Object request) {
        // TODO: 实现政策匹配API
        return ResponseEntity.ok().build();
    }
    
    /**
     * 孵化器推荐
     */
    @PostMapping("/incubator-recommendation")
    public ResponseEntity<?> recommendIncubators(@RequestBody Object request) {
        // TODO: 实现孵化器推荐API
        return ResponseEntity.ok().build();
    }
    
    /**
     * 需求分析
     */
    @PostMapping("/requirement-analysis")
    public ResponseEntity<?> analyzeRequirement(@RequestBody Map<String, Object> request) {
        try {
            String task = (String) request.get("task");
            String analysisType = (String) request.get("analysisType");
            String requestId = (String) request.getOrDefault("requestId", UUID.randomUUID().toString());
            
            if (task == null || task.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "code", 400,
                    "message", "任务描述不能为空"
                ));
            }
            
            // 构建查询请求，调用需求分析智能体
            String query = String.format("使用requirement_analysis_agent分析以下需求，分析类型：%s\n需求内容：%s", 
                analysisType != null ? analysisType : "full", task);
            
            GptQueryReq gptQueryReq = GptQueryReq.builder()
                .query(query)
                .traceId(requestId)
                .user("startup_agent_user")
                .deepThink(0) // 使用react模式
                .outputStyle("html")
                .build();
            
            // 调用JoyAgent-Core服务
            SseEmitter emitter = gptProcessService.queryMultiAgentIncrStream(gptQueryReq);
            
            // 由于这是同步API，我们需要等待结果
            // 这里简化处理，实际应该实现异步处理
            return ResponseEntity.ok(Map.of(
                "code", 200,
                "data", "需求分析已启动，请求ID：" + requestId,
                "requestId", requestId,
                "message", "分析中..."
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "code", 500,
                "message", "需求分析失败：" + e.getMessage()
            ));
        }
    }
}