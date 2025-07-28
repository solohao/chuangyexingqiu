#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试LLM集成
"""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# 添加项目路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# 加载环境变量 - 修正路径到项目根目录
env_root = Path(__file__).parent.parent.parent.parent.parent.parent
print(f"环境变量路径: {env_root}")

# 确保路径正确
if not (env_root / ".env.local").exists():
    # 如果路径不对，尝试从当前工作目录查找
    env_root = Path.cwd()
    print(f"回退到工作目录: {env_root}")

# 先加载.env，再加载.env.local（后者会覆盖前者）
load_dotenv(env_root / ".env")
load_dotenv(env_root / ".env.local", override=True)

# 验证环境变量是否加载成功
api_key = os.getenv("MODELSCOPE_ACCESS_TOKEN")
print(f"环境变量加载结果: {'成功' if api_key else '失败'}")

from com.jd.genie.agent.llm.LLMService import llm_service
from com.startup.agents.agent_factory import AgentFactory


async def test_llm_service():
    """测试LLM服务"""
    print("🧪 测试LLM服务...")
    
    # 检查环境变量
    api_key = os.getenv("MODELSCOPE_ACCESS_TOKEN")
    print(f"API Key: {api_key[:10]}..." if api_key else "未找到API Key")
    
    # 测试简单调用
    try:
        response = await llm_service.generate_response(
            prompt="请回答：1+1等于多少？",
            system_prompt="你是一个数学助手",
            temperature=0.1,
            max_tokens=50
        )
        print(f"LLM响应: {response}")
        return True
    except Exception as e:
        print(f"LLM测试失败: {e}")
        return False


async def test_requirement_analysis_agent():
    """测试需求分析智能体"""
    print("\n🤖 测试需求分析智能体...")
    
    try:
        agent = AgentFactory.create_agent("requirement_analysis")
        if not agent:
            print("智能体创建失败")
            return False
        
        parameters = {
            "project_description": "开发一个AI聊天机器人应用",
            "analysis_type": "comprehensive"
        }
        
        result = await agent.run("请分析这个AI聊天机器人项目", parameters)
        
        if result.get("success"):
            print("✅ 需求分析成功")
            print(f"项目分类: {result['result']['project_overview']['category']}")
            return True
        else:
            print(f"❌ 需求分析失败: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"智能体测试失败: {e}")
        return False


async def main():
    """主测试函数"""
    print("🚀 开始LLM集成测试")
    print("=" * 50)
    
    # 测试LLM服务
    llm_ok = await test_llm_service()
    
    # 测试智能体
    agent_ok = await test_requirement_analysis_agent()
    
    print("\n" + "=" * 50)
    if llm_ok and agent_ok:
        print("🎉 所有测试通过！LLM集成成功")
    else:
        print("❌ 测试失败，需要检查配置")


if __name__ == "__main__":
    asyncio.run(main())