#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速测试脚本 - 验证核心功能是否正常
适用于开发过程中的快速验证
"""

import asyncio
import time
import requests
import sys
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
load_dotenv(".env.local")

# 添加项目路径
project_root = Path(__file__).parent.parent / "backend/joyagent-core/src/main/python"
sys.path.insert(0, str(project_root))

class QuickTester:
    """快速测试器"""
    
    def __init__(self):
        self.backend_url = "http://localhost:8080"
        self.results = []
    
    def log_result(self, test_name, success, message):
        """记录测试结果"""
        status = "✅" if success else "❌"
        print(f"{status} {test_name}: {message}")
        self.results.append({"name": test_name, "success": success})
    
    async def test_llm_basic(self):
        """快速测试LLM基础功能"""
        try:
            from com.jd.genie.agent.llm.LLMService import llm_service
            
            if not llm_service.client:
                self.log_result("LLM服务", False, "客户端未初始化")
                return False
            
            response = await llm_service.generate_response("1+1=?", max_tokens=10)
            
            if "2" in response and not response.startswith("Error"):
                self.log_result("LLM服务", True, "基础调用正常")
                return True
            else:
                self.log_result("LLM服务", False, f"响应异常: {response[:50]}")
                return False
                
        except Exception as e:
            self.log_result("LLM服务", False, f"异常: {e}")
            return False
    
    async def test_requirement_agent(self):
        """快速测试需求分析智能体"""
        try:
            from com.startup.agents.RequirementAnalysisAgent import RequirementAnalysisAgent
            
            agent = RequirementAnalysisAgent()
            result = await agent.execute({
                "project_description": "开发网站",
                "analysis_type": "simple"
            })
            
            if result.get("success") and "project_overview" in result.get("result", {}):
                self.log_result("需求分析智能体", True, "分析功能正常")
                return True
            else:
                self.log_result("需求分析智能体", False, f"分析失败: {result.get('error')}")
                return False
                
        except Exception as e:
            self.log_result("需求分析智能体", False, f"异常: {e}")
            return False
    
    async def test_backend_api(self):
        """快速测试后端API"""
        try:
            # 测试健康检查
            response = requests.get(f"{self.backend_url}/docs", timeout=5)
            
            if response.status_code == 200:
                self.log_result("后端服务", True, "服务运行正常")
                return True
            else:
                self.log_result("后端服务", False, f"服务异常: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("后端服务", False, f"连接失败: {e}")
            return False
    
    async def test_requirement_api(self):
        """快速测试需求分析API"""
        try:
            payload = {
                "query": "快速测试",
                "project_description": "测试项目",
                "analysis_type": "simple"
            }
            
            response = requests.post(
                f"{self.backend_url}/api/startup-agents/requirement-analysis",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    self.log_result("需求分析API", True, "API调用正常")
                    return True
                else:
                    self.log_result("需求分析API", False, f"API返回错误: {result.get('error')}")
                    return False
            else:
                self.log_result("需求分析API", False, f"HTTP错误: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("需求分析API", False, f"API异常: {e}")
            return False
    
    async def test_autoagent_basic(self):
        """快速测试AutoAgent基础功能"""
        try:
            payload = {
                "requestId": f"quick_test_{int(time.time())}",
                "query": "简单测试",
                "agentType": "react",
                "isStream": "false",
                "outputStyle": "text"
            }
            
            response = requests.post(
                f"{self.backend_url}/AutoAgent",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_result("AutoAgent", True, "工作流引擎正常")
                return True
            else:
                self.log_result("AutoAgent", False, f"工作流异常: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("AutoAgent", False, f"工作流异常: {e}")
            return False
    
    async def run_quick_tests(self):
        """运行快速测试"""
        print("🚀 快速测试 - 验证核心功能")
        print("=" * 40)
        
        tests = [
            ("LLM基础服务", self.test_llm_basic),
            ("需求分析智能体", self.test_requirement_agent),
            ("后端服务", self.test_backend_api),
            ("需求分析API", self.test_requirement_api),
            ("AutoAgent引擎", self.test_autoagent_basic)
        ]
        
        start_time = time.time()
        
        for test_name, test_func in tests:
            await test_func()
        
        duration = time.time() - start_time
        
        # 统计结果
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print("\n" + "=" * 40)
        print(f"📊 快速测试完成 ({duration:.1f}s)")
        print(f"✅ 通过: {passed}/{total}")
        
        if passed == total:
            print("🎉 所有核心功能正常！")
            return True
        else:
            print("⚠️  存在问题，建议运行完整测试")
            failed_tests = [r["name"] for r in self.results if not r["success"]]
            print(f"❌ 失败项目: {', '.join(failed_tests)}")
            return False

async def main():
    """主函数"""
    tester = QuickTester()
    success = await tester.run_quick_tests()
    return success

if __name__ == "__main__":
    asyncio.run(main())