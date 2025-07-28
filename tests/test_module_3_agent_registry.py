#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
模块3测试: 智能体注册与管理
测试智能体工厂、注册机制、智能体发现
"""

import asyncio
import time
import sys
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent.parent / "backend/joyagent-core/src/main/python"
sys.path.insert(0, str(project_root))

from com.startup.agents.agent_factory import AgentFactory

class AgentRegistryTester:
    """智能体注册系统测试器"""
    
    def __init__(self):
        self.test_results = []
    
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
    
    async def test_factory_initialization(self):
        """测试3.1: 工厂初始化"""
        start_time = time.time()
        try:
            # 检查工厂是否正确初始化
            if hasattr(AgentFactory, '_agents'):
                agent_count = len(AgentFactory._agents)
                self.log_test("工厂初始化", True, f"注册了{agent_count}个智能体", time.time() - start_time)
                return True
            else:
                self.log_test("工厂初始化", False, "智能体注册表未初始化", time.time() - start_time)
                return False
        except Exception as e:
            self.log_test("工厂初始化", False, f"初始化异常: {e}", time.time() - start_time)
            return False
    
    async def test_agent_creation(self):
        """测试3.2: 智能体创建"""
        start_time = time.time()
        try:
            # 测试创建需求分析智能体
            agent = AgentFactory.create_agent("requirement_analysis")
            
            if agent is None:
                self.log_test("智能体创建", False, "需求分析智能体创建失败", time.time() - start_time)
                return False
            
            if agent.name == "requirement_analysis_agent":
                self.log_test("智能体创建", True, f"成功创建: {agent.name}", time.time() - start_time)
                return True
            else:
                self.log_test("智能体创建", False, f"智能体名称错误: {agent.name}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("智能体创建", False, f"创建异常: {e}", time.time() - start_time)
            return False
    
    async def test_all_registered_agents(self):
        """测试3.3: 所有注册的智能体"""
        start_time = time.time()
        try:
            expected_agents = [
                "requirement_analysis",
                "policy_matching", 
                "incubator_recommendation"
            ]
            
            created_agents = []
            failed_agents = []
            
            for agent_type in expected_agents:
                try:
                    agent = AgentFactory.create_agent(agent_type)
                    if agent:
                        created_agents.append(agent_type)
                    else:
                        failed_agents.append(agent_type)
                except Exception as e:
                    failed_agents.append(f"{agent_type}({e})")
            
            if len(failed_agents) == 0:
                self.log_test("所有注册智能体", True, f"成功创建: {', '.join(created_agents)}", time.time() - start_time)
                return True
            else:
                self.log_test("所有注册智能体", False, f"失败: {', '.join(failed_agents)}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("所有注册智能体", False, f"测试异常: {e}", time.time() - start_time)
            return False
    
    async def test_invalid_agent_creation(self):
        """测试3.4: 无效智能体创建"""
        start_time = time.time()
        try:
            # 测试创建不存在的智能体
            agent = AgentFactory.create_agent("non_existent_agent")
            
            if agent is None:
                self.log_test("无效智能体创建", True, "正确返回None", time.time() - start_time)
                return True
            else:
                self.log_test("无效智能体创建", False, "应该返回None但创建了智能体", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("无效智能体创建", True, f"正确抛出异常: {type(e).__name__}", time.time() - start_time)
            return True
    
    async def test_agent_list_retrieval(self):
        """测试3.5: 智能体列表获取"""
        start_time = time.time()
        try:
            # 测试获取可用智能体列表
            available_agents = AgentFactory.get_available_agents()
            
            if isinstance(available_agents, list) and len(available_agents) > 0:
                self.log_test("智能体列表获取", True, f"获取到{len(available_agents)}个智能体", time.time() - start_time)
                return True
            else:
                self.log_test("智能体列表获取", False, f"列表格式错误或为空: {available_agents}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("智能体列表获取", False, f"获取异常: {e}", time.time() - start_time)
            return False
    
    async def test_agent_execution(self):
        """测试3.6: 智能体执行"""
        start_time = time.time()
        try:
            # 创建并执行智能体
            agent = AgentFactory.create_agent("requirement_analysis")
            
            if not agent:
                self.log_test("智能体执行", False, "智能体创建失败", time.time() - start_time)
                return False
            
            parameters = {
                "project_description": "测试项目",
                "analysis_type": "simple"
            }
            
            result = await agent.execute(parameters)
            
            if result and isinstance(result, dict):
                success = result.get("success", False)
                if success:
                    self.log_test("智能体执行", True, "执行成功", time.time() - start_time)
                    return True
                else:
                    self.log_test("智能体执行", False, f"执行失败: {result.get('error')}", time.time() - start_time)
                    return False
            else:
                self.log_test("智能体执行", False, f"返回格式错误: {result}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("智能体执行", False, f"执行异常: {e}", time.time() - start_time)
            return False
    
    async def run_all_tests(self):
        """运行所有测试"""
        print("🚀 模块3测试: 智能体注册与管理")
        print("=" * 60)
        
        tests = [
            self.test_factory_initialization,
            self.test_agent_creation,
            self.test_all_registered_agents,
            self.test_invalid_agent_creation,
            self.test_agent_list_retrieval,
            self.test_agent_execution
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if await test():
                passed += 1
        
        print("\n" + "=" * 60)
        print(f"📊 测试结果: {passed}/{total} 通过")
        
        if passed == total:
            print("🎉 模块3: 智能体注册与管理 - 全部测试通过！")
        else:
            print("⚠️  模块3: 智能体注册与管理 - 存在失败的测试")
        
        return passed == total

async def main():
    """主测试函数"""
    tester = AgentRegistryTester()
    success = await tester.run_all_tests()
    return success

if __name__ == "__main__":
    asyncio.run(main())