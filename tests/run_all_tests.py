#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
运行所有模块测试的主脚本
提供完整的测试报告和统计信息
"""

import asyncio
import time
import sys
from pathlib import Path

# 添加测试模块路径
test_dir = Path(__file__).parent
sys.path.insert(0, str(test_dir))

# 导入所有测试模块
from test_module_1_llm_service import main as test_module_1
from test_module_2_requirement_analysis import main as test_module_2
from test_module_3_agent_registry import main as test_module_3
from test_module_4_workflow_engine import main as test_module_4
from test_module_5_frontend_services import main as test_module_5

class TestSuite:
    """测试套件管理器"""
    
    def __init__(self):
        self.modules = [
            {
                "name": "模块1: LLM基础服务",
                "description": "测试魔搭API集成、流式响应、错误处理",
                "test_func": test_module_1,
                "critical": True  # 关键模块，失败会影响其他模块
            },
            {
                "name": "模块2: 需求分析智能体", 
                "description": "测试需求分析逻辑、JSON解析、备用分析",
                "test_func": test_module_2,
                "critical": True
            },
            {
                "name": "模块3: 智能体注册与管理",
                "description": "测试智能体工厂、注册机制、智能体发现", 
                "test_func": test_module_3,
                "critical": True
            },
            {
                "name": "模块4: 工作流编排引擎",
                "description": "测试SSE响应、工作流状态管理、错误处理",
                "test_func": test_module_4,
                "critical": False
            },
            {
                "name": "模块5: 前端服务层",
                "description": "测试API调用、SSE处理、错误处理",
                "test_func": test_module_5,
                "critical": False
            }
        ]
        
        self.results = []
    
    def print_header(self):
        """打印测试套件头部"""
        print("🎯" + "=" * 80)
        print("🚀 AI对话工作流 - 完整模块化测试套件")
        print("📋 测试范围: LLM服务 → 智能体系统 → 工作流引擎 → 前端服务")
        print("⏰ 开始时间:", time.strftime("%Y-%m-%d %H:%M:%S"))
        print("=" * 82)
    
    def print_module_separator(self, module_name, description):
        """打印模块分隔符"""
        print(f"\n{'🔧' * 3} {module_name} {'🔧' * 3}")
        print(f"📝 {description}")
        print("-" * 60)
    
    async def run_module_test(self, module):
        """运行单个模块测试"""
        module_start_time = time.time()
        
        try:
            success = await module["test_func"]()
            duration = time.time() - module_start_time
            
            result = {
                "name": module["name"],
                "success": success,
                "duration": duration,
                "critical": module["critical"],
                "error": None
            }
            
        except Exception as e:
            duration = time.time() - module_start_time
            result = {
                "name": module["name"],
                "success": False,
                "duration": duration,
                "critical": module["critical"],
                "error": str(e)
            }
            
            print(f"❌ 模块测试异常: {e}")
        
        self.results.append(result)
        return result
    
    def print_summary(self):
        """打印测试总结"""
        print("\n" + "🎉" + "=" * 80)
        print("📊 测试总结报告")
        print("=" * 82)
        
        total_modules = len(self.results)
        passed_modules = sum(1 for r in self.results if r["success"])
        failed_modules = total_modules - passed_modules
        
        critical_modules = [r for r in self.results if r["critical"]]
        critical_passed = sum(1 for r in critical_modules if r["success"])
        
        total_duration = sum(r["duration"] for r in self.results)
        
        print(f"📈 总体统计:")
        print(f"   • 总模块数: {total_modules}")
        print(f"   • 通过模块: {passed_modules} ✅")
        print(f"   • 失败模块: {failed_modules} ❌")
        print(f"   • 成功率: {passed_modules/total_modules*100:.1f}%")
        print(f"   • 总耗时: {total_duration:.2f}秒")
        
        print(f"\n🔥 关键模块状态:")
        print(f"   • 关键模块通过: {critical_passed}/{len(critical_modules)}")
        
        if critical_passed == len(critical_modules):
            print("   • 🎯 所有关键模块测试通过！")
        else:
            print("   • ⚠️  存在关键模块失败，可能影响整体功能")
        
        print(f"\n📋 详细结果:")
        for result in self.results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            critical_mark = "🔥" if result["critical"] else "📦"
            duration_str = f"({result['duration']:.2f}s)"
            
            print(f"   {critical_mark} {status} {result['name']} {duration_str}")
            
            if not result["success"] and result["error"]:
                print(f"      💥 错误: {result['error']}")
        
        # 给出建议
        print(f"\n💡 建议:")
        if passed_modules == total_modules:
            print("   🎉 所有模块测试通过！系统运行正常，可以进行前端集成测试。")
        elif critical_passed == len(critical_modules):
            print("   ⚡ 关键模块正常，非关键模块问题不影响核心功能。")
            print("   📝 建议优先修复失败的模块以提升系统稳定性。")
        else:
            print("   🚨 存在关键模块失败，建议优先修复以下问题：")
            failed_critical = [r for r in critical_modules if not r["success"]]
            for failed in failed_critical:
                print(f"      • {failed['name']}: {failed.get('error', '测试失败')}")
        
        print("\n" + "=" * 82)
        
        return passed_modules == total_modules
    
    async def run_all_tests(self):
        """运行所有测试"""
        self.print_header()
        
        overall_success = True
        
        for module in self.modules:
            self.print_module_separator(module["name"], module["description"])
            
            result = await self.run_module_test(module)
            
            if not result["success"]:
                overall_success = False
                
                # 如果关键模块失败，询问是否继续
                if result["critical"]:
                    print(f"\n⚠️  关键模块 '{module['name']}' 测试失败！")
                    print("   这可能影响后续模块的测试结果。")
                    
                    # 在自动化环境中继续执行，在交互环境中可以选择
                    if sys.stdin.isatty():
                        continue_test = input("   是否继续测试其他模块？(y/n): ").lower().strip()
                        if continue_test != 'y':
                            print("   用户选择停止测试。")
                            break
                    else:
                        print("   自动继续测试其他模块...")
        
        # 打印总结
        final_success = self.print_summary()
        
        return final_success

async def main():
    """主函数"""
    suite = TestSuite()
    success = await suite.run_all_tests()
    
    # 设置退出码
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())