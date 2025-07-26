import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Target, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle,
  TrendingUp,
  Users,
  Lightbulb
} from 'lucide-react';
import { requirementAnalysisService, type RequirementAnalysisResult } from '../../services/requirementAnalysisService';

interface RequirementAnalysisProps {
  query: string;
  onAnalysisComplete?: (result: RequirementAnalysisResult) => void;
  onClarificationNeeded?: (questions: any[]) => void;
}

export const RequirementAnalysis: React.FC<RequirementAnalysisProps> = ({
  query,
  onAnalysisComplete,
  onClarificationNeeded
}) => {
  const [analysis, setAnalysis] = useState<RequirementAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim()) {
      analyzeRequirement();
    }
  }, [query]);

  const analyzeRequirement = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await requirementAnalysisService.analyzeRequirement(query, 'full');
      setAnalysis(result);
      
      // 通知父组件分析完成
      onAnalysisComplete?.(result);
      
      // 如果需要澄清，通知父组件
      if (result.clarity?.needsClarification && result.suggestions?.questions) {
        onClarificationNeeded?.(result.suggestions.questions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setLoading(false);
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'simple': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'complex': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getClarityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Brain className="h-5 w-5 text-blue-500 animate-pulse" />
          <span className="text-gray-600">正在分析需求...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Brain className="h-6 w-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">需求分析结果</h3>
      </div>

      {/* 意图分析 */}
      {analysis.intent && (
        <div className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="h-5 w-5 text-green-500" />
            <h4 className="font-medium text-gray-900">意图识别</h4>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              置信度: {Math.round(analysis.intent.confidence * 100)}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">主要目标:</span>
              <p className="text-gray-900 mt-1">{analysis.intent.mainGoal}</p>
            </div>
            <div>
              <span className="text-gray-500">业务领域:</span>
              <p className="text-gray-900 mt-1">{analysis.intent.businessDomain}</p>
            </div>
            <div>
              <span className="text-gray-500">紧急程度:</span>
              <p className="text-gray-900 mt-1">{analysis.intent.urgency}</p>
            </div>
            <div>
              <span className="text-gray-500">预期输出:</span>
              <p className="text-gray-900 mt-1">{analysis.intent.expectedOutput}</p>
            </div>
          </div>
        </div>
      )}

      {/* 复杂度评估 */}
      {analysis.complexity && (
        <div className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h4 className="font-medium text-gray-900">复杂度评估</h4>
            <span className={`text-xs px-2 py-1 rounded ${getComplexityColor(analysis.complexity.level)}`}>
              {analysis.complexity.level}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">预估任务数:</span>
              <p className="text-gray-900 mt-1">{analysis.complexity.taskCount}</p>
            </div>
            <div>
              <span className="text-gray-500">所需智能体:</span>
              <p className="text-gray-900 mt-1">{analysis.complexity.agentCount}</p>
            </div>
            <div>
              <span className="text-gray-500">预估时间:</span>
              <p className="text-gray-900 mt-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {analysis.complexity.estimatedTime}
              </p>
            </div>
            <div>
              <span className="text-gray-500">专业程度:</span>
              <p className="text-gray-900 mt-1">{analysis.complexity.expertiseRequired}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-gray-500 text-sm">评估理由:</span>
            <p className="text-gray-700 text-sm mt-1">{analysis.complexity.reasoning}</p>
          </div>
        </div>
      )}

      {/* 明确度检测 */}
      {analysis.clarity && (
        <div className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <h4 className="font-medium text-gray-900">明确度检测</h4>
            <span className={`text-xs px-2 py-1 rounded ${getClarityColor(analysis.clarity.score)}`}>
              {analysis.clarity.score}分 - {analysis.clarity.level}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">明确的方面:</span>
              <ul className="text-gray-900 mt-1 space-y-1">
                {analysis.clarity.clearAspects.map((aspect, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    {aspect}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-gray-500">需要澄清的方面:</span>
              <ul className="text-gray-900 mt-1 space-y-1">
                {analysis.clarity.unclearAspects.map((aspect, index) => (
                  <li key={index} className="flex items-center">
                    <HelpCircle className="h-3 w-3 text-yellow-500 mr-1" />
                    {aspect}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 澄清建议 */}
      {analysis.suggestions && analysis.clarity?.needsClarification && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <HelpCircle className="h-5 w-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-900">建议澄清的问题</h4>
          </div>
          <div className="space-y-3">
            {analysis.suggestions.questions.map((q, index) => (
              <div key={index} className="bg-white rounded p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {q.category}
                  </span>
                </div>
                <p className="text-gray-900 font-medium">{q.question}</p>
                <p className="text-gray-600 text-sm mt-1">{q.purpose}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-yellow-200">
            <p className="text-yellow-800 text-sm">
              <Lightbulb className="h-4 w-4 inline mr-1" />
              {analysis.suggestions.priority}
            </p>
          </div>
        </div>
      )}

      {/* 推荐智能体 */}
      {analysis.recommendedAgents && analysis.recommendedAgents.length > 0 && (
        <div className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="h-5 w-5 text-purple-500" />
            <h4 className="font-medium text-gray-900">推荐智能体</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.recommendedAgents.map((agent, index) => (
              <span 
                key={index}
                className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full"
              >
                {agent}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 下一步建议 */}
      {analysis.nextSteps && analysis.nextSteps.length > 0 && (
        <div className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <h4 className="font-medium text-gray-900">建议的下一步</h4>
          </div>
          <ol className="space-y-2">
            {analysis.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full min-w-[24px] text-center">
                  {index + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default RequirementAnalysis;