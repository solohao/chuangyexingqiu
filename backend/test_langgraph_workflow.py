#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LangGraph工作流测试
验证智能体工作流的功能
"""

import asyncio
import json
from loguru import logger

# 添加路径以便导入模块
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'joyagent-core/src/main/python'))

from com.startup.agents.workflow.StartupWorkflow import startup_workflow


async def test_basic_workflow():
    """测试基本工作流功能"""
    print("🚀 测试基本工作流功能")
    
    try:
        # 测试参数
        user_query = "我想开发一个AI教育平台，请帮我分析一下"
        session_id = "test_session_001"
        request_id = "test_request_001"
        
        print(f"📝 用户查询: {user_query}")
        print(f"🔗 会话ID: {session_id}")
        print(f"🆔 请求ID: {request_id}")
        print("-" * 50)
        
        # 执行工作流
        event_count = 0
        async for event in startup_workflow.execute_workflow(
            user_query=user_query,
            session_id=session_id,
            request_id=request_id,
            is_streaming=True
        ):
            event_count += 1
            event_type = event.get("type", "unknown")
            
            if event_type == "start":
                print(f"🟢 开始: {event.get('content', '')}")
            elif event_type == "progress":
                print(f"🔄 进度: {event.get('content', '')}")
            elif event_type == "stream":
                content = event.get('content', '')
                if len(content) > 100:
                    content = content[:100] + "..."
                print(f"📡 流式: {content}")
            elif event_type == "stream_complete":
                print(f"✅ 完成: {event.get('content', '')}")
            elif event_type == "node_complete":
                node_name = event.get('node', '')
                print(f"🎯 节点完成: {node_name}")
            elif event_type == "workflow_complete":
                print(f"🎉 工作流完成: {event.get('message', '')}")
            elif event_type == "error":
                print(f"❌ 错误: {event.get('error', '')}")
            else:
                print(f"📋 事件: {event_type}")
        
        print(f"\n📊 总共处理了 {event_count} 个事件")
        print("✅ 基本工作流测试完成")
        
    except Exception as e:
        print(f"❌ 基本工作流测试失败: {e}")
        logger.error(f"基本工作流测试失败: {e}")


async def test_workflow_state():
    """测试工作流状态管理"""
    print("\n🔍 测试工作流状态管理")
    
    try:
        session_id = "test_session_002"
        request_id = "test_request_002"
        
        # 启动工作流（不等待完成）
        workflow_task = asyncio.create_task(
            collect_workflow_events(
                startup_workflow.execute_workflow(
                    user_query="请分析我的SWOT",
                    session_id=session_id,
                    request_id=request_id
                )
            )
        )
        
        # 等待一小段时间让工作流开始
        await asyncio.sleep(1)
        
        # 获取工作流状态
        state = await startup_workflow.get_workflow_state(session_id, request_id)
        print(f"📊 当前状态: {state.get('workflow_stage', 'unknown')}")
        print(f"🤖 当前智能体: {state.get('current_agent', 'none')}")
        print(f"✅ 已完成智能体: {state.get('completed_agents', [])}")
        
        # 等待工作流完成
        events = await workflow_task
        print(f"📈 工作流完成，共 {len(events)} 个事件")
        
        # 获取最终状态
        final_state = await startup_workflow.get_workflow_state(session_id, request_id)
        print(f"🏁 最终状态: {final_state.get('workflow_stage', 'unknown')}")
        
        print("✅ 工作流状态测试完成")
        
    except Exception as e:
        print(f"❌ 工作流状态测试失败: {e}")
        logger.error(f"工作流状态测试失败: {e}")


async def test_workflow_visualization():
    """测试工作流可视化"""
    print("\n🎨 测试工作流可视化")
    
    try:
        # 生成工作流图表
        mermaid_graph = startup_workflow.visualize_workflow()
        
        if mermaid_graph and "graph" in mermaid_graph.lower():
            print("✅ 成功生成Mermaid图表")
            print("📊 图表预览:")
            print(mermaid_graph[:200] + "..." if len(mermaid_graph) > 200 else mermaid_graph)
        else:
            print("⚠️ 图表生成可能有问题")
            print(f"📄 输出: {mermaid_graph}")
        
        print("✅ 工作流可视化测试完成")
        
    except Exception as e:
        print(f"❌ 工作流可视化测试失败: {e}")
        logger.error(f"工作流可视化测试失败: {e}")


async def test_multiple_agents():
    """测试多智能体协作"""
    print("\n🤝 测试多智能体协作")
    
    try:
        user_query = "我想创建一个在线教育平台，请帮我做全面分析，包括需求分析、SWOT分析和商业模式画布"
        session_id = "test_session_003"
        request_id = "test_request_003"
        
        print(f"📝 复杂查询: {user_query}")
        print("-" * 50)
        
        completed_agents = set()
        
        async for event in startup_workflow.execute_workflow(
            user_query=user_query,
            session_id=session_id,
            request_id=request_id
        ):
            event_type = event.get("type", "unknown")
            
            if event_type == "node_complete":
                node_name = event.get('node', '')
                if node_name in ['requirement_analysis', 'swot_analysis', 'business_canvas']:
                    completed_agents.add(node_name)
                    print(f"🎯 智能体完成: {node_name} (总计: {len(completed_agents)})")
            
            elif event_type == "workflow_complete":
                print(f"🎉 多智能体协作完成")
                break
        
        print(f"📊 完成的智能体: {completed_agents}")
        print("✅ 多智能体协作测试完成")
        
    except Exception as e:
        print(f"❌ 多智能体协作测试失败: {e}")
        logger.error(f"多智能体协作测试失败: {e}")


async def collect_workflow_events(workflow_generator):
    """收集工作流事件"""
    events = []
    async for event in workflow_generator:
        events.append(event)
    return events


async def main():
    """主测试函数"""
    print("🧪 LangGraph工作流测试开始")
    print("=" * 60)
    
    # 运行所有测试
    await test_basic_workflow()
    await test_workflow_state()
    await test_workflow_visualization()
    await test_multiple_agents()
    
    print("\n" + "=" * 60)
    print("🎉 所有测试完成！")


if __name__ == "__main__":
    # 配置日志
    logger.add("test_langgraph.log", rotation="1 MB")
    
    # 运行测试
    asyncio.run(main())