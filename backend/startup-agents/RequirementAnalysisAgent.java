package com.startup.agents;

import com.jd.genie.tool.BaseTool;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 需求分析智能体
 * 基于现有PlanningAgent扩展，通过prompt engineering实现智能需求理解
 */
@Component
public class RequirementAnalysisAgent implements BaseTool {
    
    @Override
    public String getName() {
        return "requirement_analysis_agent";
    }
    
    @Override
    public String getDescription() {
        return "智能需求理解系统，能够分析用户需求的意图、复杂度，并提供澄清建议";
    }
    
    @Override
    public Map<String, Object> toParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("type", "object");
        
        Map<String, Object> properties = new HashMap<>();
        
        // 用户查询参数
        Map<String, Object> queryParam = new HashMap<>();
        queryParam.put("type", "string");
        queryParam.put("description", "用户的原始需求描述");
        properties.put("query", queryParam);
        
        // 分析类型参数
        Map<String, Object> analysisTypeParam = new HashMap<>();
        analysisTypeParam.put("type", "string");
        analysisTypeParam.put("description", "分析类型：intent（意图识别）、complexity（复杂度评估）、clarity（明确度检测）、suggestion（澄清建议）");
        analysisTypeParam.put("enum", new String[]{"intent", "complexity", "clarity", "suggestion", "full"});
        properties.put("analysisType", analysisTypeParam);
        
        params.put("properties", properties);
        params.put("required", new String[]{"query", "analysisType"});
        
        return params;
    }
    
    @Override
    public Object execute(Object input) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> inputMap = (Map<String, Object>) input;
            String query = (String) inputMap.get("query");
            String analysisType = (String) inputMap.get("analysisType");
            
            return analyzeRequirement(query, analysisType);
            
        } catch (Exception e) {
            return "需求分析失败：" + e.getMessage();
        }
    }
    
    /**
     * 分析用户需求
     */
    private String analyzeRequirement(String query, String analysisType) {
        switch (analysisType) {
            case "intent":
                return analyzeIntent(query);
            case "complexity":
                return analyzeComplexity(query);
            case "clarity":
                return analyzeClarity(query);
            case "suggestion":
                return generateClarificationSuggestions(query);
            case "full":
                return performFullAnalysis(query);
            default:
                return "不支持的分析类型：" + analysisType;
        }
    }
    
    /**
     * 意图识别分析
     */
    private String analyzeIntent(String query) {
        // 通过prompt engineering实现意图识别
        String analysisPrompt = String.format("""
            请分析以下用户需求的核心意图：
            
            用户需求："%s"
            
            请从以下维度分析：
            1. 主要目标：用户想要达成什么目标？
            2. 业务领域：属于哪个业务领域（创业指导、政策咨询、比赛辅导等）？
            3. 紧急程度：是否有时间要求？
            4. 预期输出：用户期望得到什么形式的结果？
            
            请以JSON格式返回分析结果：
            {
                "mainGoal": "主要目标",
                "businessDomain": "业务领域",
                "urgency": "紧急程度",
                "expectedOutput": "预期输出",
                "confidence": "置信度(0-1)"
            }
            """, query);
        
        // TODO: 这里应该调用LLM进行真正的分析
        // 可以通过AgentContext获取LLM实例进行调用
        // 暂时返回基于关键词的简单分析
        return analyzeIntentByKeywords(query);
    }
    
    /**
     * 基于关键词的简单意图分析
     */
    private String analyzeIntentByKeywords(String query) {
        String queryLower = query.toLowerCase();
        String mainGoal = "需求分析";
        String businessDomain = "创业指导";
        String urgency = "中等";
        String expectedOutput = "分析报告";
        double confidence = 0.7;
        
        // 简单的关键词匹配
        if (queryLower.contains("商业模式") || queryLower.contains("画布")) {
            mainGoal = "商业模式分析";
            businessDomain = "商业策略";
            confidence = 0.9;
        } else if (queryLower.contains("swot") || queryLower.contains("优势") || queryLower.contains("劣势")) {
            mainGoal = "SWOT分析";
            businessDomain = "战略分析";
            confidence = 0.85;
        } else if (queryLower.contains("政策") || queryLower.contains("补贴")) {
            mainGoal = "政策咨询";
            businessDomain = "政策指导";
            confidence = 0.8;
        } else if (queryLower.contains("融资") || queryLower.contains("投资")) {
            mainGoal = "融资指导";
            businessDomain = "投融资";
            confidence = 0.85;
        } else if (queryLower.contains("紧急") || queryLower.contains("急需")) {
            urgency = "高";
        }
        
        return String.format("""
            {
                "mainGoal": "%s",
                "businessDomain": "%s",
                "urgency": "%s",
                "expectedOutput": "%s",
                "confidence": %.2f
            }
            """, mainGoal, businessDomain, urgency, expectedOutput, confidence);
    }
    
    /**
     * 复杂度评估
     */
    private String analyzeComplexity(String query) {
        String analysisPrompt = String.format("""
            请评估以下需求的复杂度：
            
            用户需求："%s"
            
            评估维度：
            1. 任务数量：需要多少个子任务？
            2. 专业程度：需要多深的专业知识？
            3. 协作需求：是否需要多个智能体协作？
            4. 时间估算：预计完成时间？
            
            复杂度等级：
            - 简单(simple)：单一任务，基础知识，1个智能体，<30分钟
            - 中等(medium)：2-3个任务，专业知识，2-3个智能体，30分钟-2小时
            - 复杂(complex)：>3个任务，深度专业知识，>3个智能体，>2小时
            
            请以JSON格式返回：
            {
                "level": "复杂度等级",
                "taskCount": "预估任务数",
                "expertiseRequired": "所需专业程度",
                "agentCount": "需要的智能体数量",
                "estimatedTime": "预估时间",
                "reasoning": "评估理由"
            }
            """, query);
        
        // 模拟复杂度分析结果
        return String.format("""
            {
                "level": "medium",
                "taskCount": "2-3个",
                "expertiseRequired": "中等专业知识",
                "agentCount": "2-3个智能体",
                "estimatedTime": "1-2小时",
                "reasoning": "需求'%s'涉及多个方面，需要专业分析"
            }
            """, query);
    }
    
    /**
     * 明确度检测
     */
    private String analyzeClarity(String query) {
        String analysisPrompt = String.format("""
            请检测以下需求的明确度：
            
            用户需求："%s"
            
            检测维度：
            1. 目标明确性：目标是否清晰？
            2. 范围界定：范围是否明确？
            3. 约束条件：是否提及限制条件？
            4. 成功标准：是否有明确的成功标准？
            
            明确度评分：0-100分
            - 90-100：非常明确，可直接执行
            - 70-89：基本明确，需少量澄清
            - 50-69：部分明确，需要澄清
            - <50：不够明确，需要大量澄清
            
            请以JSON格式返回：
            {
                "score": "明确度评分",
                "level": "明确度等级",
                "clearAspects": ["明确的方面"],
                "unclearAspects": ["不明确的方面"],
                "needsClarification": true/false
            }
            """, query);
        
        // 模拟明确度分析结果
        return String.format("""
            {
                "score": 75,
                "level": "基本明确",
                "clearAspects": ["基本目标明确"],
                "unclearAspects": ["具体要求", "时间限制"],
                "needsClarification": true
            }
            """);
    }
    
    /**
     * 生成澄清建议
     */
    private String generateClarificationSuggestions(String query) {
        String analysisPrompt = String.format("""
            基于以下用户需求，生成澄清问题：
            
            用户需求："%s"
            
            请生成3-5个澄清问题，帮助更好地理解用户需求：
            1. 针对目标的澄清
            2. 针对范围的澄清
            3. 针对约束的澄清
            4. 针对期望的澄清
            
            问题应该：
            - 具体且有针对性
            - 易于理解和回答
            - 有助于明确需求
            
            请以JSON格式返回：
            {
                "questions": [
                    {
                        "category": "问题类别",
                        "question": "具体问题",
                        "purpose": "问题目的"
                    }
                ],
                "priority": "优先级排序"
            }
            """, query);
        
        // 模拟澄清建议
        return """
            {
                "questions": [
                    {
                        "category": "目标澄清",
                        "question": "您希望通过这个需求达成什么具体目标？",
                        "purpose": "明确核心目标"
                    },
                    {
                        "category": "范围界定",
                        "question": "这个需求的范围是什么？有哪些不包含在内？",
                        "purpose": "界定工作范围"
                    },
                    {
                        "category": "时间约束",
                        "question": "您希望什么时候完成？有截止时间吗？",
                        "purpose": "了解时间要求"
                    }
                ],
                "priority": "建议按目标→范围→时间的顺序澄清"
            }
            """;
    }
    
    /**
     * 完整分析
     */
    private String performFullAnalysis(String query) {
        return String.format("""
            {
                "query": "%s",
                "intent": %s,
                "complexity": %s,
                "clarity": %s,
                "suggestions": %s,
                "recommendedAgents": [
                    "business_canvas_agent",
                    "swot_analysis_agent"
                ],
                "nextSteps": [
                    "澄清具体需求",
                    "选择合适的智能体",
                    "开始执行分析"
                ]
            }
            """, 
            query,
            analyzeIntent(query),
            analyzeComplexity(query),
            analyzeClarity(query),
            generateClarificationSuggestions(query)
        );
    }
}