#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创业智能体控制器
提供创业相关的智能体API接口
"""

import asyncio
import json
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from loguru import logger

from com.startup.agents.agent_factory import AgentFactory


router = APIRouter()


class AgentAnalysisRequest(BaseModel):
    """智能体分析请求模型"""
    query: str
    project_description: str = ""
    analysis_type: str = "comprehensive"
    project_type: str = ""
    location: str = ""
    project_stage: str = ""
    industry: str = ""
    project_info: str = ""
    business_idea: str = ""


class ApiResponse(BaseModel):
    """API响应模型"""
    success: bool
    data: Dict[str, Any] = {}
    message: str = ""
    error: str = ""


@router.post("/requirement-analysis")
async def analyze_requirement(request: AgentAnalysisRequest):
    """需求分析接口"""
    try:
        print(f"[DEBUG] 收到需求分析请求: {request.query}")
        logger.info(f"收到需求分析请求: {request.query}")
        
        # 创建需求分析智能体
        print(f"[DEBUG] 正在创建需求分析智能体...")
        agent = AgentFactory.create_agent("requirement_analysis")
        if not agent:
            raise HTTPException(status_code=500, detail="需求分析智能体创建失败")
        
        # 准备参数
        parameters = {
            "project_description": request.project_description or request.query,
            "analysis_type": request.analysis_type
        }
        
        # 执行分析
        print(f"[DEBUG] 开始执行智能体分析...")
        result = await agent.run(request.query, parameters)
        print(f"[DEBUG] 智能体分析完成，结果: {result.get('success', False)}")
        
        if result.get("success"):
            return ApiResponse(
                success=True,
                data=result["result"],
                message="需求分析完成"
            )
        else:
            return ApiResponse(
                success=False,
                error=result.get("error", "需求分析失败"),
                message="需求分析失败"
            )
            
    except Exception as e:
        logger.error(f"需求分析接口错误: {e}")
        return ApiResponse(
            success=False,
            error=str(e),
            message="需求分析服务异常"
        )


@router.post("/requirement-analysis-stream")
async def analyze_requirement_stream(request: AgentAnalysisRequest):
    """需求分析流式接口"""
    from fastapi.responses import StreamingResponse
    
    async def generate_stream():
        try:
            logger.info(f"开始流式需求分析: {request.query}")
            
            # 创建智能体
            agent = AgentFactory.create_agent("requirement_analysis")
            if not agent:
                yield f"data: {json.dumps({'type': 'error', 'error': '智能体创建失败'})}\n\n"
                yield "data: [DONE]\n\n"
                return
            
            # 准备参数
            parameters = {
                "project_description": request.project_description or request.query,
                "analysis_type": request.analysis_type
            }
            
            # 检查智能体是否支持流式执行
            if hasattr(agent, 'execute_stream'):
                # 使用流式执行
                async for chunk in agent.execute_stream(parameters):
                    yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
            else:
                # 回退到非流式执行
                yield f"data: {json.dumps({'type': 'start', 'message': '开始需求分析...'})}\n\n"
                
                result = await agent.run(request.query, parameters)
                
                if result.get("success"):
                    yield f"data: {json.dumps({'type': 'result', 'data': result['result']})}\n\n"
                    yield f"data: {json.dumps({'type': 'complete', 'message': '需求分析完成'})}\n\n"
                else:
                    yield f"data: {json.dumps({'type': 'error', 'error': result.get('error', '分析失败')})}\n\n"
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            logger.error(f"流式需求分析错误: {e}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )


@router.post("/policy-matching")
async def match_policy(request: AgentAnalysisRequest):
    """政策匹配接口"""
    try:
        logger.info(f"收到政策匹配请求: {request.query}")
        
        agent = AgentFactory.create_agent("policy_matching")
        if not agent:
            raise HTTPException(status_code=500, detail="政策匹配智能体创建失败")
        
        parameters = {
            "project_type": request.project_type,
            "location": request.location
        }
        
        result = await agent.run(request.query, parameters)
        
        if result.get("success"):
            return ApiResponse(
                success=True,
                data=result["result"],
                message="政策匹配完成"
            )
        else:
            return ApiResponse(
                success=False,
                error=result.get("error", "政策匹配失败"),
                message="政策匹配失败"
            )
            
    except Exception as e:
        logger.error(f"政策匹配接口错误: {e}")
        return ApiResponse(
            success=False,
            error=str(e),
            message="政策匹配服务异常"
        )


@router.post("/incubator-recommendation")
async def recommend_incubator(request: AgentAnalysisRequest):
    """孵化器推荐接口"""
    try:
        logger.info(f"收到孵化器推荐请求: {request.query}")
        
        agent = AgentFactory.create_agent("incubator_recommendation")
        if not agent:
            raise HTTPException(status_code=500, detail="孵化器推荐智能体创建失败")
        
        parameters = {
            "project_stage": request.project_stage,
            "industry": request.industry,
            "location": request.location
        }
        
        result = await agent.run(request.query, parameters)
        
        if result.get("success"):
            return ApiResponse(
                success=True,
                data=result["result"],
                message="孵化器推荐完成"
            )
        else:
            return ApiResponse(
                success=False,
                error=result.get("error", "孵化器推荐失败"),
                message="孵化器推荐失败"
            )
            
    except Exception as e:
        logger.error(f"孵化器推荐接口错误: {e}")
        return ApiResponse(
            success=False,
            error=str(e),
            message="孵化器推荐服务异常"
        )


@router.post("/swot-analysis")
async def analyze_swot(request: AgentAnalysisRequest):
    """SWOT分析接口"""
    try:
        logger.info(f"收到SWOT分析请求: {request.query}")
        
        agent = AgentFactory.create_agent("swot_analysis")
        if not agent:
            raise HTTPException(status_code=500, detail="SWOT分析智能体创建失败")
        
        parameters = {
            "project_info": request.project_info or request.query
        }
        
        result = await agent.run(request.query, parameters)
        
        if result.get("success"):
            return ApiResponse(
                success=True,
                data=result["result"],
                message="SWOT分析完成"
            )
        else:
            return ApiResponse(
                success=False,
                error=result.get("error", "SWOT分析失败"),
                message="SWOT分析失败"
            )
            
    except Exception as e:
        logger.error(f"SWOT分析接口错误: {e}")
        return ApiResponse(
            success=False,
            error=str(e),
            message="SWOT分析服务异常"
        )


@router.post("/business-canvas")
async def generate_business_canvas(request: AgentAnalysisRequest):
    """商业模式画布接口"""
    try:
        logger.info(f"收到商业模式画布请求: {request.query}")
        
        agent = AgentFactory.create_agent("business_canvas")
        if not agent:
            raise HTTPException(status_code=500, detail="商业模式画布智能体创建失败")
        
        parameters = {
            "business_idea": request.business_idea or request.query
        }
        
        result = await agent.run(request.query, parameters)
        
        if result.get("success"):
            return ApiResponse(
                success=True,
                data=result["result"],
                message="商业模式画布生成完成"
            )
        else:
            return ApiResponse(
                success=False,
                error=result.get("error", "商业模式画布生成失败"),
                message="商业模式画布生成失败"
            )
            
    except Exception as e:
        logger.error(f"商业模式画布接口错误: {e}")
        return ApiResponse(
            success=False,
            error=str(e),
            message="商业模式画布服务异常"
        )


@router.post("/business-canvas-stream")
async def generate_business_canvas_stream(request: AgentAnalysisRequest):
    """商业模式画布流式接口"""
    from fastapi.responses import StreamingResponse
    
    async def generate_stream():
        try:
            logger.info(f"开始流式商业模式画布分析: {request.query}")
            
            # 创建智能体
            agent = AgentFactory.create_agent("business_canvas")
            if not agent:
                yield f"data: {json.dumps({'type': 'error', 'error': '智能体创建失败'})}\n\n"
                return
            
            # 发送开始事件
            yield f"data: {json.dumps({'type': 'start', 'message': '开始商业模式画布分析...'})}\n\n"
            
            # 准备参数
            parameters = {
                "business_idea": request.business_idea or request.query
            }
            
            # 执行分析
            result = await agent.run(request.query, parameters)
            
            if result.get("success"):
                # 发送结果
                yield f"data: {json.dumps({'type': 'result', 'data': result['result']})}\n\n"
                yield f"data: {json.dumps({'type': 'complete', 'message': '商业模式画布分析完成'})}\n\n"
            else:
                yield f"data: {json.dumps({'type': 'error', 'error': result.get('error', '分析失败')})}\n\n"
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            logger.error(f"流式商业模式画布分析错误: {e}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )


@router.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok", "service": "startup-agents"}


@router.get("/test-llm")
async def test_llm():
    """测试LLM服务接口"""
    import os
    from com.jd.genie.agent.llm.LLMService import llm_service
    
    try:
        # 检查环境变量
        api_key = os.getenv("MODELSCOPE_ACCESS_TOKEN")
        base_url = os.getenv("MODELSCOPE_DASHSCOPE_URL")
        
        if not api_key:
            return {
                "status": "error",
                "message": "MODELSCOPE_ACCESS_TOKEN not found",
                "env_check": {
                    "api_key": "missing",
                    "base_url": base_url or "missing"
                }
            }
        
        # 测试简单的LLM调用
        response = await llm_service.generate_response(
            prompt="请回答：1+1等于多少？",
            system_prompt="你是一个数学助手",
            temperature=0.1,
            max_tokens=100
        )
        
        return {
            "status": "success",
            "message": "LLM service is working",
            "env_check": {
                "api_key": f"{api_key[:10]}..." if api_key else "missing",
                "base_url": base_url
            },
            "llm_response": response[:200] if len(response) > 200 else response
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"LLM test failed: {str(e)}",
            "env_check": {
                "api_key": f"{api_key[:10]}..." if api_key else "missing",
                "base_url": base_url or "missing"
            }
        }