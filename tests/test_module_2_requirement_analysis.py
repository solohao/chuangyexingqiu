#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
模块2测试: 需求分析智能体
测试需求分析逻辑、JSON解析、备用分析
"""

import os
import asyncio
import json
import time
from dotenv import load_dotenv
import sys
from pathlib import Path

# 加载环境变量和项目路径
load_dotenv(".env.local")
project_root = Path(__file__).parent.parent / "backend/joyagent-core/src/main/python"
sys.path.insert(0, str(project_root))

from com.startup.agents.RequirementAnalysisAgent import RequirementAnalysisAgent

class RequirementAnalysisTester:
    """需求分析智能体测试器"""
    
    def __init__(self):
        self.test_results = []
        self.agent = RequirementAnalysisAgent()
    
    def log_test(self, test_name, success, message, duration=None):
        """记录测试结果"""
        status = "✅ PASS" if success else "❌ FAIL"
        duration_str = f" ({duration:.2f}s)" if duration else ""
        print(f"{status} {test_name}{duration_str}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "duration": duration
        })
    
    async def test_agent_initialization(self):
        """测试2.1: 智能体初始化"""
        start_time = time.time()
        try:
            if self.agent.name == "requirement_analysis_agent":
                self.log_test("智能体初始化", True, f"名称: {self.agent.name}", time.time() - start_time)
                return True
            else:
                self.log_test("智能体初始化", False, f"名称错误: {self.agent.name}", time.time() - start_time)
                return False
        except Exception as e:
            self.log_test("智能体初始化", False, f"初始化异常: {e}", time.time() - start_time)
            return False
    
    async def test_simple_analysis(self):
        """测试2.2: 简单需求分析"""
        start_time = time.time()
        try:
            parameters = {
                "project_description": "开发一个在线购物网站",
                "analysis_type": "comprehensive"
            }
            
            result = await self.agent.execute(parameters)
            
            if not result.get("success"):
                self.log_test("简单需求分析", False, result.get("error", "执行失败"), time.time() - start_time)
                return False
            
            analysis = result["result"]
            required_keys = ["project_overview", "functional_requirements", "recommendations"]
            
            for key in required_keys:
                if key not in analysis:
                    self.log_test("简单需求分析", False, f"缺少字段: {key}", time.time() - start_time)
                    return False
            
            self.log_test("简单需求分析", True, f"分析完成，包含{len(analysis)}个字段", time.time() - start_time)
            return True
            
        except Exception as e:
            self.log_test("简单需求分析", False, f"分析异常: {e}", time.time() - start_time)
            return False
    
    async def test_complex_analysis(self):
        """测试2.3: 复杂需求分析"""
        start_time = time.time()
        try:
            parameters = {
                "project_description": "我想开发一个基于AI的智能客服系统，能够自动回答用户问题，支持多语言，集成语音识别和自然语言处理，可以学习和优化回答质量，并提供数据分析和报告功能。",
                "analysis_type": "full"
            }
            
            result = await self.agent.execute(parameters)
            
            if not result.get("success"):
                self.log_test("复杂需求分析", False, result.get("error", "执行失败"), time.time() - start_time)
                return False
            
            analysis = result["result"]
            
            # 检查项目分类是否合理
            category = analysis.get("project_overview", {}).get("category", "")
            if "AI" in category or "人工智能" in category or "软件" in category:
                self.log_test("复杂需求分析", True, f"项目分类: {category}", time.time() - start_time)
                return True
            else:
                self.log_test("复杂需求分析", False, f"分类不准确: {category}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("复杂需求分析", False, f"复杂分析异常: {e}", time.time() - start_time)
            return False
    
    async def test_different_analysis_types(self):
        """测试2.4: 不同分析类型"""
        start_time = time.time()
        try:
            test_cases = [
                ("intent", "意图分析"),
                ("complexity", "复杂度分析"),
                ("full", "全面分析")
            ]
            
            for analysis_type, description in test_cases:
                parameters = {
                    "project_description": "开发一个移动应用",
                    "analysis_type": analysis_type
                }
                
                result = await self.agent.execute(parameters)
                
                if not result.get("success"):
                    self.log_test("不同分析类型", False, f"{description}失败: {result.get('error')}", time.time() - start_time)
                    return False
            
            self.log_test("不同分析类型", True, "所有分析类型测试通过", time.time() - start_time)
            return True
            
        except Exception as e:
            self.log_test("不同分析类型", False, f"分析类型测试异常: {e}", time.time() - start_time)
            return False
    
    async def test_edge_cases(self):
        """测试2.5: 边界情况"""
        start_time = time.time()
        try:
            # 测试空描述
            result1 = await self.agent.execute({"project_description": ""})
            if result1.get("success"):
                self.log_test("边界情况", False, "空描述应该失败", time.time() - start_time)
                return False
            
            # 测试缺少参数
            result2 = await self.agent.execute({})
            if result2.get("success"):
                self.log_test("边界情况", False, "缺少参数应该失败", time.time() - start_time)
                return False
            
            # 测试超长描述
            long_description = "开发应用" * 1000
            result3 = await self.agent.execute({"project_description": long_description})
            if not result3.get("success"):
                self.log_test("边界情况", False, f"超长描述处理失败: {result3.get('error')}", time.time() - start_time)
                return False
            
            self.log_test("边界情况", True, "边界情况处理正确", time.time() - start_time)
            return True
            
        except Exception as e:
            self.log_test("边界情况", False, f"边界测试异常: {e}", time.time() - start_time)
            return False
    
    async def test_json_parsing(self):
        """测试2.6: JSON解析能力"""
        start_time = time.time()
        try:
            parameters = {
                "project_description": "开发一个博客系统",
                "analysis_type": "comprehensive"
            }
            
            result = await self.agent.execute(parameters)
            
            if not result.get("success"):
                self.log_test("JSON解析", False, result.get("error"), time.time() - start_time)
                return False
            
            # 验证返回的数据结构
            analysis = result["result"]
            
            # 检查是否为有效的字典结构
            if not isinstance(analysis, dict):
                self.log_test("JSON解析", False, f"返回类型错误: {type(analysis)}", time.time() - start_time)
                return False
            
            # 检查必要字段
            required_fields = ["project_overview", "functional_requirements", "non_functional_requirements"]
            for field in required_fields:
                if field not in analysis:
                    self.log_test("JSON解析", False, f"缺少必要字段: {field}", time.time() - start_time)
                    return False
            
            self.log_test("JSON解析", True, "JSON结构解析正确", time.time() - start_time)
            return True
            
        except Exception as e:
            self.log_test("JSON解析", False, f"JSON解析异常: {e}", time.time() - start_time)
            return False
    
    async def run_all_tests(self):
        """运行所有测试"""
        print("🚀 模块2测试: 需求分析智能体")
        print("=" * 60)
        
        tests = [
            self.test_agent_initialization,
            self.test_simple_analysis,
            self.test_complex_analysis,
            self.test_different_analysis_types,
            self.test_edge_cases,
            self.test_json_parsing
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if await test():
                passed += 1
        
        print("\n" + "=" * 60)
        print(f"📊 测试结果: {passed}/{total} 通过")
        
        if passed == total:
            print("🎉 模块2: 需求分析智能体 - 全部测试通过！")
        else:
            print("⚠️  模块2: 需求分析智能体 - 存在失败的测试")
        
        return passed == total

async def main():
    """主测试函数"""
    tester = RequirementAnalysisTester()
    success = await tester.run_all_tests()
    return success

if __name__ == "__main__":
    asyncio.run(main())