#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
模块1测试: LLM基础服务
测试魔搭API集成、流式响应、错误处理
"""

import os
import asyncio
import time
from dotenv import load_dotenv
import sys
from pathlib import Path

# 加载环境变量和项目路径
load_dotenv(".env.local")
project_root = Path(__file__).parent.parent / "backend/joyagent-core/src/main/python"
sys.path.insert(0, str(project_root))

from com.jd.genie.agent.llm.LLMService import llm_service

class LLMServiceTester:
    """LLM服务测试器"""
    
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
    
    async def test_service_initialization(self):
        """测试1.1: 服务初始化"""
        start_time = time.time()
        try:
            api_key = os.getenv("MODELSCOPE_ACCESS_TOKEN")
            if not api_key:
                self.log_test("服务初始化", False, "环境变量MODELSCOPE_ACCESS_TOKEN未设置")
                return False
            
            if not llm_service.client:
                self.log_test("服务初始化", False, "LLM客户端未正确初始化")
                return False
            
            self.log_test("服务初始化", True, f"API Key: {api_key[:10]}...", time.time() - start_time)
            return True
        except Exception as e:
            self.log_test("服务初始化", False, f"初始化异常: {e}", time.time() - start_time)
            return False
    
    async def test_simple_completion(self):
        """测试1.2: 简单文本生成"""
        start_time = time.time()
        try:
            response = await llm_service.generate_response(
                prompt="1+1等于多少？",
                system_prompt="你是一个数学助手，请简洁回答。",
                temperature=0.1,
                max_tokens=50
            )
            
            if response.startswith("Error:"):
                self.log_test("简单文本生成", False, response, time.time() - start_time)
                return False
            
            if "2" in response:
                self.log_test("简单文本生成", True, f"响应: {response[:50]}...", time.time() - start_time)
                return True
            else:
                self.log_test("简单文本生成", False, f"响应不正确: {response}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("简单文本生成", False, f"生成异常: {e}", time.time() - start_time)
            return False
    
    async def test_stream_completion(self):
        """测试1.3: 流式文本生成"""
        start_time = time.time()
        try:
            chunks = []
            async for chunk in llm_service.generate_response_stream(
                prompt="请简单介绍Python编程语言",
                system_prompt="你是一个编程助手。",
                temperature=0.7,
                max_tokens=200
            ):
                if chunk.startswith("Error:"):
                    self.log_test("流式文本生成", False, chunk, time.time() - start_time)
                    return False
                chunks.append(chunk)
            
            full_response = "".join(chunks)
            if len(chunks) > 1 and "Python" in full_response:
                self.log_test("流式文本生成", True, f"块数: {len(chunks)}, 长度: {len(full_response)}", time.time() - start_time)
                return True
            else:
                self.log_test("流式文本生成", False, f"流式响应异常: 块数={len(chunks)}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("流式文本生成", False, f"流式异常: {e}", time.time() - start_time)
            return False
    
    async def test_chat_completion(self):
        """测试1.4: 聊天完成接口"""
        start_time = time.time()
        try:
            messages = [
                {"role": "system", "content": "你是一个友好的助手。"},
                {"role": "user", "content": "你好，请介绍一下你自己。"}
            ]
            
            result = await llm_service.chat_completion(
                messages=messages,
                temperature=0.7,
                max_tokens=100,
                stream=False
            )
            
            if "error" in result:
                self.log_test("聊天完成接口", False, result["error"], time.time() - start_time)
                return False
            
            if "choices" in result and result["choices"][0]["message"]["content"]:
                content = result["choices"][0]["message"]["content"]
                self.log_test("聊天完成接口", True, f"响应长度: {len(content)}", time.time() - start_time)
                return True
            else:
                self.log_test("聊天完成接口", False, "响应格式错误", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("聊天完成接口", False, f"聊天异常: {e}", time.time() - start_time)
            return False
    
    async def test_error_handling(self):
        """测试1.5: 错误处理"""
        start_time = time.time()
        try:
            # 测试无效模型
            response = await llm_service.generate_response(
                prompt="测试",
                model="invalid-model-name",
                max_tokens=10
            )
            
            if response.startswith("Error:"):
                self.log_test("错误处理", True, "正确处理无效模型错误", time.time() - start_time)
                return True
            else:
                self.log_test("错误处理", False, "未正确处理错误", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("错误处理", True, f"正确抛出异常: {type(e).__name__}", time.time() - start_time)
            return True
    
    async def run_all_tests(self):
        """运行所有测试"""
        print("🚀 模块1测试: LLM基础服务")
        print("=" * 60)
        
        tests = [
            self.test_service_initialization,
            self.test_simple_completion,
            self.test_stream_completion,
            self.test_chat_completion,
            self.test_error_handling
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if await test():
                passed += 1
        
        print("\n" + "=" * 60)
        print(f"📊 测试结果: {passed}/{total} 通过")
        
        if passed == total:
            print("🎉 模块1: LLM基础服务 - 全部测试通过！")
        else:
            print("⚠️  模块1: LLM基础服务 - 存在失败的测试")
        
        return passed == total

async def main():
    """主测试函数"""
    tester = LLMServiceTester()
    success = await tester.run_all_tests()
    return success

if __name__ == "__main__":
    asyncio.run(main())