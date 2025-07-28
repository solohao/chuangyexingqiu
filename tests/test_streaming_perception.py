#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试流式响应的用户感知
模拟用户实际看到内容的时间点
"""

import asyncio
import time
import sys
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量和项目路径
load_dotenv(".env.local")
project_root = Path(__file__).parent.parent / "backend/joyagent-core/src/main/python"
sys.path.insert(0, str(project_root))

from com.jd.genie.agent.llm.LLMService import llm_service

async def test_streaming_perception():
    """测试流式响应的用户感知"""
    print("📱 流式响应用户感知测试")
    print("=" * 50)
    
    query = "请简单介绍一下人工智能的发展历程"
    print(f"👤 用户问题: {query}")
    print(f"⏰ 开始时间: {time.strftime('%H:%M:%S')}")
    print("\n🤖 AI回答过程:")
    print("-" * 30)
    
    start_time = time.time()
    first_chunk_time = None
    meaningful_content_time = None
    chunk_count = 0
    total_content = ""
    
    async for chunk in llm_service.generate_response_stream(
        prompt=query,
        system_prompt="你是一个专业的AI助手，请用简洁明了的语言回答问题。",
        temperature=0.7,
        max_tokens=300
    ):
        current_time = time.time()
        elapsed = current_time - start_time
        
        if chunk and not chunk.startswith("Error:"):
            chunk_count += 1
            total_content += chunk
            
            # 记录首个数据块时间
            if first_chunk_time is None:
                first_chunk_time = elapsed
                print(f"⚡ 首个数据块: {elapsed:.2f}s")
            
            # 记录有意义内容时间（超过10个字符）
            if meaningful_content_time is None and len(total_content.strip()) >= 10:
                meaningful_content_time = elapsed
                print(f"📝 有意义内容: {elapsed:.2f}s")
            
            # 实时显示内容（模拟用户看到的效果）
            print(chunk, end='', flush=True)
            
            # 模拟用户阅读时间
            await asyncio.sleep(0.01)
    
    total_time = time.time() - start_time
    
    print(f"\n\n" + "-" * 30)
    print("📊 感知分析结果:")
    print(f"   ⚡ 首次响应: {first_chunk_time:.2f}s (用户看到AI开始回答)")
    print(f"   📝 有意义内容: {meaningful_content_time:.2f}s (用户开始理解内容)")
    print(f"   🏁 完整回答: {total_time:.2f}s (用户看到完整答案)")
    print(f"   📦 数据块数: {chunk_count} (流式更新次数)")
    print(f"   📏 内容长度: {len(total_content)} 字符")
    
    # 计算用户感知的"等待时间"
    perceived_wait = meaningful_content_time if meaningful_content_time else first_chunk_time
    print(f"\n💡 用户感知等待时间: {perceived_wait:.2f}s")
    
    if perceived_wait < 2:
        print("   ✅ 响应速度优秀 (<2s)")
    elif perceived_wait < 5:
        print("   ⚡ 响应速度良好 (2-5s)")
    else:
        print("   ⚠️  响应速度需要优化 (>5s)")

async def compare_response_modes():
    """比较不同响应模式的用户感知"""
    print("\n🔄 响应模式对比")
    print("=" * 50)
    
    query = "什么是机器学习？"
    
    # 测试非流式响应
    print("1️⃣ 非流式响应:")
    start_time = time.time()
    non_stream_response = await llm_service.generate_response(
        prompt=query,
        max_tokens=100
    )
    non_stream_time = time.time() - start_time
    print(f"   ⏱️  总时间: {non_stream_time:.2f}s")
    print(f"   👤 用户感知: 等待{non_stream_time:.2f}s后看到完整答案")
    
    # 测试流式响应
    print("\n2️⃣ 流式响应:")
    start_time = time.time()
    first_chunk_time = None
    chunk_count = 0
    
    async for chunk in llm_service.generate_response_stream(
        prompt=query,
        max_tokens=100
    ):
        if chunk and not chunk.startswith("Error:"):
            chunk_count += 1
            if first_chunk_time is None:
                first_chunk_time = time.time() - start_time
    
    stream_total_time = time.time() - start_time
    print(f"   ⏱️  首次响应: {first_chunk_time:.2f}s")
    print(f"   ⏱️  总时间: {stream_total_time:.2f}s")
    print(f"   👤 用户感知: {first_chunk_time:.2f}s后开始看到内容，持续更新")
    
    # 感知优势分析
    print(f"\n📈 流式响应优势:")
    if first_chunk_time < non_stream_time:
        improvement = ((non_stream_time - first_chunk_time) / non_stream_time) * 100
        print(f"   ⚡ 感知速度提升: {improvement:.1f}%")
        print(f"   🎯 用户体验: 更快的反馈，更好的交互感")
    
    print(f"   📊 数据块数: {chunk_count} (渐进式内容展示)")

async def main():
    """主测试函数"""
    await test_streaming_perception()
    await compare_response_modes()
    
    print("\n" + "🎉" + "=" * 50)
    print("💡 关键洞察")
    print("=" * 52)
    print("1. 流式响应让用户在1-2秒内就能看到AI开始回答")
    print("2. 用户不需要等待完整的15-18秒，而是持续看到进展")
    print("3. 心理感知：'AI正在思考并回答'而不是'AI没有响应'")
    print("4. 18秒的总时间被分解为多个短暂的等待期")
    print("\n🚀 用户体验优化:")
    print("   • 即时反馈 (0.1s): 显示'正在分析...'")
    print("   • 快速首响 (1-2s): 开始显示分析内容")
    print("   • 流式更新: 持续显示分析进展")
    print("   • 阶段提示: 告知用户当前处理阶段")

if __name__ == "__main__":
    asyncio.run(main())