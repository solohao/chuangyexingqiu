#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI对话工作流响应时间详细分析
分析每个阶段的具体耗时和用户感知
"""

import asyncio
import time
import requests
import json
from dotenv import load_dotenv
import sys
from pathlib import Path

# 加载环境变量和项目路径
load_dotenv(".env.local")
project_root = Path(__file__).parent.parent / "backend/joyagent-core/src/main/python"
sys.path.insert(0, str(project_root))

from com.jd.genie.agent.llm.LLMService import llm_service
from com.startup.agents.RequirementAnalysisAgent import RequirementAnalysisAgent

class ResponseTimeAnalyzer:
    """响应时间分析器"""
    
    def __init__(self):
        self.backend_url = "http://localhost:8080"
        self.stages = []
    
    def log_stage(self, stage_name, duration, description=""):
        """记录阶段时间"""
        self.stages.append({
            "stage": stage_name,
            "duration": duration,
            "description": description
        })
        print(f"⏱️  {stage_name}: {duration:.2f}s {description}")
    
    async def analyze_complete_workflow(self):
        """分析完整工作流的时间分布"""
        print("🔍 AI对话工作流 - 详细时间分析")
        print("=" * 60)
        
        total_start = time.time()
        
        # 阶段1: 用户输入处理 (前端)
        stage1_start = time.time()
        user_input = "我想开发一个AI聊天机器人应用"
        print(f"👤 用户输入: {user_input}")
        stage1_duration = time.time() - stage1_start
        self.log_stage("用户输入处理", stage1_duration, "(前端UI响应)")
        
        # 阶段2: 需求分析 (后端LLM)
        stage2_start = time.time()
        agent = RequirementAnalysisAgent()
        analysis_result = await agent.execute({
            "project_description": user_input,
            "analysis_type": "comprehensive"
        })
        stage2_duration = time.time() - stage2_start
        self.log_stage("需求分析", stage2_duration, "(LLM深度分析)")
        
        # 阶段3: 智能体推荐 (前端逻辑)
        stage3_start = time.time()
        # 模拟智能体推荐逻辑
        recommended_agents = ["business_canvas_agent", "swot_analysis_agent"]
        stage3_duration = time.time() - stage3_start
        self.log_stage("智能体推荐", stage3_duration, "(前端逻辑处理)")
        
        # 阶段4: 工作流执行 (后端SSE)
        stage4_start = time.time()
        workflow_result = await self.simulate_workflow_execution(user_input)
        stage4_duration = time.time() - stage4_start
        self.log_stage("工作流执行", stage4_duration, "(SSE流式响应)")
        
        # 阶段5: 结果展示 (前端)
        stage5_start = time.time()
        # 模拟结果处理和展示
        await asyncio.sleep(0.1)  # 模拟UI更新时间
        stage5_duration = time.time() - stage5_start
        self.log_stage("结果展示", stage5_duration, "(前端UI更新)")
        
        total_duration = time.time() - total_start
        
        print("\n" + "=" * 60)
        print("📊 时间分布分析")
        print("=" * 60)
        
        for stage in self.stages:
            percentage = (stage["duration"] / total_duration) * 100
            bar_length = int(percentage / 2)  # 每2%一个字符
            bar = "█" * bar_length + "░" * (50 - bar_length)
            print(f"{stage['stage']:<15} {stage['duration']:>6.2f}s [{bar}] {percentage:>5.1f}%")
        
        print(f"\n⏱️  总耗时: {total_duration:.2f}s")
        
        return total_duration
    
    async def simulate_workflow_execution(self, user_input):
        """模拟工作流执行，测量SSE响应时间"""
        try:
            payload = {
                "requestId": f"analysis_{int(time.time())}",
                "query": user_input,
                "agentType": "react",
                "isStream": "true",
                "outputStyle": "markdown"
            }
            
            response = requests.post(
                f"{self.backend_url}/AutoAgent",
                json=payload,
                headers={"Accept": "text/event-stream"},
                stream=True,
                timeout=30
            )
            
            if response.status_code != 200:
                return {"status": "failed", "error": f"HTTP {response.status_code}"}
            
            events_received = []
            first_data_time = None
            last_data_time = None
            
            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith('data: event: '):
                    event_type = line[13:].strip()
                    current_time = time.time()
                    
                    if first_data_time is None:
                        first_data_time = current_time
                    last_data_time = current_time
                    
                    events_received.append({
                        "event": event_type,
                        "time": current_time
                    })
                    
                    # 用户感知的关键时间点
                    if event_type == "start":
                        print(f"    📡 首次响应: {current_time - payload['requestId'][9:]} 秒后")
                    elif event_type == "thinking":
                        print(f"    🤔 开始思考: 用户看到AI在思考")
                    elif event_type == "final_answer":
                        print(f"    ✅ 最终答案: 用户看到完整结果")
                    elif event_type == "complete":
                        print(f"    🏁 执行完成: 工作流结束")
                        break
                
                # 限制处理时间，避免测试过长
                if len(events_received) >= 10:
                    break
            
            return {
                "status": "completed",
                "events": events_received,
                "first_response_time": first_data_time,
                "total_stream_time": last_data_time - first_data_time if first_data_time and last_data_time else 0
            }
            
        except Exception as e:
            return {"status": "failed", "error": str(e)}
    
    async def analyze_user_perception(self):
        """分析用户感知的响应时间"""
        print("\n🧠 用户感知分析")
        print("=" * 60)
        
        # 测试即时响应时间
        instant_start = time.time()
        # 模拟前端立即显示"正在分析..."
        instant_duration = time.time() - instant_start
        print(f"⚡ 即时反馈: {instant_duration*1000:.1f}ms (用户看到'正在分析...')")
        
        # 测试首次有意义响应时间
        first_response_start = time.time()
        simple_response = await llm_service.generate_response(
            "简单回答：AI是什么？",
            max_tokens=50
        )
        first_response_duration = time.time() - first_response_start
        print(f"🎯 首次响应: {first_response_duration:.2f}s (用户看到第一个有意义的回答)")
        
        # 测试流式响应的感知
        print(f"📊 流式感知: 用户在{first_response_duration:.1f}s后开始看到内容，然后持续接收更新")
        
        return {
            "instant_feedback": instant_duration,
            "first_meaningful_response": first_response_duration
        }
    
    async def compare_modes(self):
        """比较不同模式的响应时间"""
        print("\n🔄 模式对比分析")
        print("=" * 60)
        
        # 直接模式 (单智能体)
        direct_start = time.time()
        agent = RequirementAnalysisAgent()
        direct_result = await agent.execute({
            "project_description": "简单测试",
            "analysis_type": "simple"
        })
        direct_duration = time.time() - direct_start
        print(f"💬 直接模式: {direct_duration:.2f}s (单智能体对话)")
        
        # 编排模式 (多智能体工作流)
        orchestrated_start = time.time()
        # 模拟完整的编排流程
        await self.analyze_complete_workflow()
        orchestrated_duration = time.time() - orchestrated_start
        print(f"🎯 编排模式: {orchestrated_duration:.2f}s (多智能体协同)")
        
        print(f"\n📈 效率对比:")
        print(f"   直接模式适合: 简单问答、专业咨询")
        print(f"   编排模式适合: 复杂分析、全面评估")
        
        return {
            "direct_mode": direct_duration,
            "orchestrated_mode": orchestrated_duration
        }

async def main():
    """主分析函数"""
    analyzer = ResponseTimeAnalyzer()
    
    print("🎯 AI对话工作流 - 响应时间深度分析")
    print("📋 分析目标: 理解用户实际感知的响应时间")
    print("⏰ 开始时间:", time.strftime("%Y-%m-%d %H:%M:%S"))
    print("\n")
    
    # 完整工作流分析
    total_time = await analyzer.analyze_complete_workflow()
    
    # 用户感知分析
    perception = await analyzer.analyze_user_perception()
    
    # 模式对比
    comparison = await analyzer.compare_modes()
    
    print("\n" + "🎉" + "=" * 60)
    print("💡 关键发现")
    print("=" * 62)
    print(f"1. 用户即时反馈: {perception['instant_feedback']*1000:.1f}ms (几乎瞬间)")
    print(f"2. 首次有意义响应: {perception['first_meaningful_response']:.2f}s (用户开始看到内容)")
    print(f"3. 完整工作流: {total_time:.2f}s (包含深度分析)")
    print(f"4. 直接对话模式: {comparison['direct_mode']:.2f}s (适合快速问答)")
    
    print(f"\n🚀 优化建议:")
    print(f"   • 保持即时反馈 (<100ms)")
    print(f"   • 优化首次响应 (<3s)")
    print(f"   • 流式显示过程 (用户持续看到进展)")
    print(f"   • 根据需求选择模式 (简单用直接，复杂用编排)")
    
    print("\n" + "=" * 62)

if __name__ == "__main__":
    asyncio.run(main())