import { useState, useCallback } from 'react';
import { 
  requirementAnalysisService, 
  type RequirementAnalysisResult, 
  type AnalysisType 
} from '../services/requirementAnalysisService';

export interface UseRequirementAnalysisReturn {
  analysis: RequirementAnalysisResult | null;
  loading: boolean;
  error: string | null;
  analyzeRequirement: (query: string, type?: AnalysisType) => Promise<void>;
  checkNeedsClarification: (query: string) => Promise<boolean>;
  getComplexityLevel: (query: string) => Promise<'simple' | 'medium' | 'complex'>;
  recommendAgents: (query: string) => Promise<string[]>;
  reset: () => void;
}

/**
 * 需求分析Hook
 */
export const useRequirementAnalysis = (): UseRequirementAnalysisReturn => {
  const [analysis, setAnalysis] = useState<RequirementAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeRequirement = useCallback(async (query: string, type: AnalysisType = 'full') => {
    if (!query.trim()) {
      setError('请输入需求描述');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await requirementAnalysisService.analyzeRequirement(query, type);
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '需求分析失败';
      setError(errorMessage);
      console.error('需求分析错误:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkNeedsClarification = useCallback(async (query: string): Promise<boolean> => {
    try {
      return await requirementAnalysisService.needsClarification(query);
    } catch (err) {
      console.error('检查澄清需求失败:', err);
      return false;
    }
  }, []);

  const getComplexityLevel = useCallback(async (query: string): Promise<'simple' | 'medium' | 'complex'> => {
    try {
      return await requirementAnalysisService.getComplexityLevel(query);
    } catch (err) {
      console.error('获取复杂度失败:', err);
      return 'medium';
    }
  }, []);

  const recommendAgents = useCallback(async (query: string): Promise<string[]> => {
    try {
      return await requirementAnalysisService.recommendAgents(query);
    } catch (err) {
      console.error('推荐智能体失败:', err);
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    analysis,
    loading,
    error,
    analyzeRequirement,
    checkNeedsClarification,
    getComplexityLevel,
    recommendAgents,
    reset
  };
};

export default useRequirementAnalysis;