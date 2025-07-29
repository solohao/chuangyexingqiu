#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试直接模式对话延续
验证智能体在直接模式下的上下文共享和对话延续功能
"""

import asyncio
import sys
import os
from typing import Dict, Any

# 添加路径
sys.path.append(os.path.join(os.path.dirname(__file__), '../../backend/joyagent-core/src/main/python'))

from loguru import logger


async def test_direct_mode_conversation():
    """测试直接模式对话延续"""
    logger.info("=== 测试直接模式对话延续 ===")
    
    # 硬编码API Token用于测试
    os.environ["MODELSCOPE_ACCESS_TOKEN"] = "ms-13ddfa1d-dbf8-405f-b8da-85b23bbc7229"
    
    try:
        from com.startup.agents.DirectModeRouter import direct_mode_router
        
        session_id = "test_conversation_session"
        
        # 第一轮对话：需求分析
        logger.info("=== 第一轮对话：需求分析 ===")
        
        first_query = "我想打造一款创业平台，请你分析"
        
        logger.info(f"用户输入: {first_query}")
        
        first_events = []
        async for event in direct_mode_router.handle_user_query(
            user_query=first_query,
            session_id=session_id,
            is_streaming=True
        ):
            first_events.append(event)
            event_type = event.get("type", "")
            
            if event_type == "routing":
                logger.info(f"路由: {event.get('message', '')}")
            elif event_type == "agent_start":
                logger.info(f"智能体开始: {event.get('agent_display_name', '')}")
            elif event_type == "stream_complete":
                logger.info(f"流式完成: 生成了 {len(event.get('final_content', ''))} 字符")
            elif event_type == "suggestion":
                logger.info(f"建议: {event.get('message', '')}")
                break
            elif event_type == "error":
                logger.error(f"错误: {event.get('error', '')}")
                return False
        
        # 检查会话状态
        session_summary = direct_mode_router.get_session_summary(session_id)
        logger.info(f"第一轮后会话状态: {session_summary}")
        
        if "requirement_analysis_agent" not in session_summary.get("completed_agents", []):
            logger.error("❌ 需求分析智能体未完成")
            return False
        
        logger.info("✅ 第一轮对话完成，需求分析已保存")
        
        # 第二轮对话：继续分析（应该自动选择SWOT分析）
        logger.info("\n=== 第二轮对话：继续分析 ===")
        
        second_query = "请你继续分析"
        
        logger.info(f"用户输入: {second_query}")
        
        second_events = []
        async for event in direct_mode_router.handle_user_query(
            user_query=second_query,
            session_id=session_id,
            is_streaming=True
        ):
            second_events.append(event)
            event_type = event.get("type", "")
            
            if event_type == "routing":
                logger.info(f"路由: {event.get('message', '')}")
                suggested_agent = event.get("suggested_agent", "")
                if suggested_agent != "swot_analysis_agent":
                    logger.warning(f"期望SWOT分析，但建议了: {suggested_agent}")
            elif event_type == "agent_start":
                logger.info(f"智能体开始: {event.get('agent_display_name', '')}")
            elif event_type == "stream_complete":
                final_content = event.get("final_content", "")
                logger.info(f"流式完成: 生成了 {len(final_content)} 字符")
                
                # 检查SWOT内容是否包含创业平台的具体分析
                if "创业平台" in final_content and any(keyword in final_content for keyword in ["优势", "劣势", "机会", "威胁"]):
                    logger.info("✅ SWOT分析包含针对创业平台的具体内容")
                else:
                    logger.warning("⚠️ SWOT分析可能不够具体")
                
            elif event_type == "suggestion" or event_type == "completion":
                logger.info(f"完成: {event.get('message', '')}")
                break
            elif event_type == "error":
                logger.error(f"错误: {event.get('error', '')}")
                return False
        
        # 检查最终会话状态
        final_session_summary = direct_mode_router.get_session_summary(session_id)
        logger.info(f"最终会话状态: {final_session_summary}")
        
        completed_agents = final_session_summary.get("completed_agents", [])
        
        if "requirement_analysis_agent" in completed_agents and "swot_analysis_agent" in completed_agents:
            logger.info("✅ 两个智能体都已完成")
            
            # 测试上下文传递
            logger.info("\n=== 验证上下文传递 ===")
            
            # 检查SWOT分析是否使用了需求分析的结果
            swot_events = [e for e in second_events if e.get("type") == "stream" and e.get("accumulated_content")]
            if swot_events:
                # 检查是否有需求分析的上下文信息
                has_context = any("需求分析" in str(e) or "requirement_analysis" in str(e) for e in second_events)
                if has_context:
                    logger.info("✅ SWOT分析使用了需求分析的上下文")
                else:
                    logger.warning("⚠️ 未检测到明显的上下文传递")
            
            return True
        else:
            logger.error(f"❌ 智能体执行不完整: {completed_agents}")
            return False
        
    except Exception as e:
        logger.error(f"测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_specific_agent_request():
    """测试特定智能体请求"""
    logger.info("\n=== 测试特定智能体请求 ===")
    
    try:
        from com.startup.agents.DirectModeRouter import direct_mode_router
        
        session_id = "test_specific_agent_session"
        
        # 直接请求SWOT分析
        query = "请对我的创业平台项目进行SWOT分析"
        
        logger.info(f"用户输入: {query}")
        
        events = []
        async for event in direct_mode_router.handle_user_query(
            user_query=query,
            session_id=session_id,
            project_description="创业平台项目",
            is_streaming=True
        ):
            events.append(event)
            event_type = event.get("type", "")
            
            if event_type == "routing":
                suggested_agent = event.get("suggested_agent", "")
                logger.info(f"路由结果: {suggested_agent}")
                
                if suggested_agent == "swot_analysis_agent":
                    logger.info("✅ 正确识别了SWOT分析请求")
                else:
                    logger.warning(f"⚠️ 期望SWOT分析，但建议了: {suggested_agent}")
                    
            elif event_type == "stream_complete":
                logger.info(f"分析完成: {len(event.get('final_content', ''))} 字符")
                break
            elif event_type == "error":
                logger.error(f"错误: {event.get('error', '')}")
                return False
        
        return True
        
    except Exception as e:
        logger.error(f"特定智能体测试失败: {e}")
        return False


async def main():
    """主函数"""
    logger.info("开始直接模式对话延续测试...")
    
    # 测试1: 对话延续
    success1 = await test_direct_mode_conversation()
    
    # 测试2: 特定智能体请求
    success2 = await test_specific_agent_request()
    
    if success1 and success2:
        logger.info("🎉 所有测试通过！直接模式对话延续功能正常！")
        return True
    else:
        logger.error("❌ 测试失败！")
        return False


if __name__ == "__main__":
    asyncio.run(main())