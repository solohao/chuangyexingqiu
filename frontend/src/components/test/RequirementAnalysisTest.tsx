import React, { useState } from 'react';
import { RequirementAnalysis } from '../specialized/RequirementAnalysis';
import { useRequirementAnalysis } from '../../hooks/useRequirementAnalysis';

/**
 * 需求分析测试组件
 */
export const RequirementAnalysisTest: React.FC = () => {
  const [testQuery, setTestQuery] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const {
    analysis,
    loading,
    error,
    analyzeRequirement,
    checkNeedsClarification,
    getComplexityLevel,
    recommendAgents,
    reset
  } = useRequirementAnalysis();

  const handleTest = async () => {
    if (!testQuery.trim()) return;
    
    setShowAnalysis(true);
    await analyzeRequirement(testQuery, 'full');
  };

  const handleReset = () => {
    setShowAnalysis(false);
    setTestQuery('');
    reset();
  };

  const testQueries = [
    '我想创建一个SaaS产品，需要制定商业计划',
    '帮我分析竞争对手和市场机会',
    '我的创业项目需要融资，请帮我准备材料',
    '分析我的商业模式是否可行',
    '我想参加创业比赛，需要什么准备？'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">需求分析功能测试</h2>
        
        {/* 输入区域 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入测试需求：
            </label>
            <textarea
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="请输入您的需求..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          
          {/* 快速测试按钮 */}
          <div>
            <p className="text-sm text-gray-600 mb-2">或选择预设测试用例：</p>
            <div className="flex flex-wrap gap-2">
              {testQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => setTestQuery(query)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  {query.substring(0, 20)}...
                </button>
              ))}
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={!testQuery.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '分析中...' : '开始分析'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 错误显示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 分析结果 */}
      {showAnalysis && testQuery && (
        <RequirementAnalysis
          query={testQuery}
          onAnalysisComplete={(result) => {
            console.log('分析完成:', result);
          }}
          onClarificationNeeded={(questions) => {
            console.log('需要澄清:', questions);
          }}
        />
      )}

      {/* 调试信息 */}
      {analysis && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">调试信息</h3>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RequirementAnalysisTest;