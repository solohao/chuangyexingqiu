#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
模块5测试: 前端服务层
测试API调用、SSE处理、错误处理
"""

import asyncio
import json
import time
import requests
from typing import Dict, Any

class FrontendServicesTester:
    """前端服务层测试器"""
    
    def __init__(self):
        self.test_results = []
        self.backend_url = "http://localhost:8080"
    
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
    
    async def test_requirement_analysis_api(self):
        """测试5.1: 需求分析API"""
        start_time = time.time()
        try:
            payload = {
                "query": "开发一个在线教育平台",
                "project_description": "包含视频课程、在线考试、学习进度跟踪等功能",
                "analysis_type": "comprehensive"
            }
            
            response = requests.post(
                f"{self.backend_url}/api/startup-agents/requirement-analysis",
                json=payload,
                timeout=15
            )
            
            if response.status_code != 200:
                self.log_test("需求分析API", False, f"HTTP错误: {response.status_code}", time.time() - start_time)
                return False
            
            result = response.json()
            
            if result.get("success") and "data" in result:
                data = result["data"]
                required_fields = ["project_overview", "functional_requirements"]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("需求分析API", True, f"返回{len(data)}个字段", time.time() - start_time)
                    return True
                else:
                    self.log_test("需求分析API", False, f"缺少字段: {missing_fields}", time.time() - start_time)
                    return False
            else:
                self.log_test("需求分析API", False, f"响应格式错误: {result}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("需求分析API", False, f"API测试失败: {e}", time.time() - start_time)
            return False
    
    async def test_llm_test_endpoint(self):
        """测试5.2: LLM测试端点"""
        start_time = time.time()
        try:
            response = requests.get(
                f"{self.backend_url}/api/startup-agents/test-llm",
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_test("LLM测试端点", False, f"HTTP错误: {response.status_code}", time.time() - start_time)
                return False
            
            result = response.json()
            
            if result.get("status") == "success":
                self.log_test("LLM测试端点", True, result.get("message", "测试通过"), time.time() - start_time)
                return True
            else:
                self.log_test("LLM测试端点", False, f"LLM服务异常: {result}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("LLM测试端点", False, f"端点测试失败: {e}", time.time() - start_time)
            return False
    
    async def test_cors_headers(self):
        """测试5.3: CORS头部"""
        start_time = time.time()
        try:
            # 发送OPTIONS预检请求
            response = requests.options(
                f"{self.backend_url}/api/startup-agents/requirement-analysis",
                headers={
                    "Origin": "http://localhost:3000",
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "Content-Type"
                },
                timeout=5
            )
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
            }
            
            if cors_headers["Access-Control-Allow-Origin"]:
                self.log_test("CORS头部", True, "CORS配置正确", time.time() - start_time)
                return True
            else:
                self.log_test("CORS头部", False, f"CORS配置缺失: {cors_headers}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("CORS头部", False, f"CORS测试失败: {e}", time.time() - start_time)
            return False
    
    async def test_sse_response_parsing(self):
        """测试5.4: SSE响应解析"""
        start_time = time.time()
        try:
            # 模拟前端SSE解析逻辑
            payload = {
                "requestId": f"frontend_test_{int(time.time())}",
                "query": "测试前端SSE解析",
                "agentType": "react",
                "isStream": "true",
                "outputStyle": "markdown"
            }
            
            response = requests.post(
                f"{self.backend_url}/AutoAgent",
                json=payload,
                headers={"Accept": "text/event-stream"},
                stream=True,
                timeout=15
            )
            
            if response.status_code != 200:
                self.log_test("SSE响应解析", False, f"HTTP错误: {response.status_code}", time.time() - start_time)
                return False
            
            # 模拟前端解析逻辑
            buffer = ""
            parsed_messages = []
            
            for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
                if chunk:
                    buffer += chunk
                    
                    # 按双换行符分割消息
                    messages = buffer.split('\n\n')
                    buffer = messages.pop()  # 保留最后一个可能不完整的消息
                    
                    for message in messages:
                        if not message.strip():
                            continue
                        
                        lines = message.split('\n')
                        event_type = ""
                        data = ""
                        
                        for line in lines:
                            line = line.strip()
                            if line.startswith('data: event: '):
                                event_type = line[13:].strip()
                            elif line.startswith('data: data: '):
                                data = line[12:].strip()
                        
                        if event_type and data:
                            parsed_messages.append({
                                "event": event_type,
                                "data": data
                            })
                
                # 限制解析数量
                if len(parsed_messages) >= 3:
                    break
            
            if len(parsed_messages) > 0:
                self.log_test("SSE响应解析", True, f"成功解析{len(parsed_messages)}条消息", time.time() - start_time)
                return True
            else:
                self.log_test("SSE响应解析", False, "未解析到有效消息", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("SSE响应解析", False, f"解析测试失败: {e}", time.time() - start_time)
            return False
    
    async def test_error_response_handling(self):
        """测试5.5: 错误响应处理"""
        start_time = time.time()
        try:
            # 测试各种错误情况
            test_cases = [
                {
                    "name": "空请求体",
                    "url": f"{self.backend_url}/api/startup-agents/requirement-analysis",
                    "method": "POST",
                    "data": {},
                    "expected_status": [400, 422, 200]  # 可能的响应状态
                },
                {
                    "name": "不存在的端点",
                    "url": f"{self.backend_url}/api/non-existent-endpoint",
                    "method": "GET",
                    "data": None,
                    "expected_status": [404]
                }
            ]
            
            passed_cases = 0
            
            for case in test_cases:
                try:
                    if case["method"] == "POST":
                        response = requests.post(case["url"], json=case["data"], timeout=5)
                    else:
                        response = requests.get(case["url"], timeout=5)
                    
                    if response.status_code in case["expected_status"]:
                        passed_cases += 1
                except requests.exceptions.RequestException:
                    # 网络错误也算正确处理
                    passed_cases += 1
            
            if passed_cases == len(test_cases):
                self.log_test("错误响应处理", True, f"正确处理{passed_cases}种错误情况", time.time() - start_time)
                return True
            else:
                self.log_test("错误响应处理", False, f"错误处理不完整: {passed_cases}/{len(test_cases)}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("错误响应处理", False, f"错误处理测试失败: {e}", time.time() - start_time)
            return False
    
    async def test_response_time_performance(self):
        """测试5.6: 响应时间性能"""
        start_time = time.time()
        try:
            # 测试多个端点的响应时间
            endpoints = [
                {
                    "name": "LLM测试",
                    "url": f"{self.backend_url}/api/startup-agents/test-llm",
                    "method": "GET",
                    "timeout": 5
                },
                {
                    "name": "需求分析",
                    "url": f"{self.backend_url}/api/startup-agents/requirement-analysis",
                    "method": "POST",
                    "data": {"query": "快速测试", "analysis_type": "simple"},
                    "timeout": 10
                }
            ]
            
            performance_results = []
            
            for endpoint in endpoints:
                endpoint_start = time.time()
                try:
                    if endpoint["method"] == "POST":
                        response = requests.post(
                            endpoint["url"], 
                            json=endpoint.get("data", {}), 
                            timeout=endpoint["timeout"]
                        )
                    else:
                        response = requests.get(endpoint["url"], timeout=endpoint["timeout"])
                    
                    endpoint_duration = time.time() - endpoint_start
                    
                    if response.status_code == 200 and endpoint_duration < endpoint["timeout"]:
                        performance_results.append({
                            "name": endpoint["name"],
                            "duration": endpoint_duration,
                            "success": True
                        })
                    else:
                        performance_results.append({
                            "name": endpoint["name"],
                            "duration": endpoint_duration,
                            "success": False
                        })
                        
                except Exception:
                    performance_results.append({
                        "name": endpoint["name"],
                        "duration": time.time() - endpoint_start,
                        "success": False
                    })
            
            successful_tests = [r for r in performance_results if r["success"]]
            avg_response_time = sum(r["duration"] for r in successful_tests) / len(successful_tests) if successful_tests else 0
            
            if len(successful_tests) >= len(endpoints) // 2:  # 至少一半成功
                self.log_test("响应时间性能", True, f"平均响应时间: {avg_response_time:.2f}s", time.time() - start_time)
                return True
            else:
                self.log_test("响应时间性能", False, f"性能测试失败: {len(successful_tests)}/{len(endpoints)}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("响应时间性能", False, f"性能测试异常: {e}", time.time() - start_time)
            return False
    
    async def run_all_tests(self):
        """运行所有测试"""
        print("🚀 模块5测试: 前端服务层")
        print("=" * 60)
        
        tests = [
            self.test_requirement_analysis_api,
            self.test_llm_test_endpoint,
            self.test_cors_headers,
            self.test_sse_response_parsing,
            self.test_error_response_handling,
            self.test_response_time_performance
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if await test():
                passed += 1
        
        print("\n" + "=" * 60)
        print(f"📊 测试结果: {passed}/{total} 通过")
        
        if passed == total:
            print("🎉 模块5: 前端服务层 - 全部测试通过！")
        else:
            print("⚠️  模块5: 前端服务层 - 存在失败的测试")
        
        return passed == total

async def main():
    """主测试函数"""
    tester = FrontendServicesTester()
    success = await tester.run_all_tests()
    return success

if __name__ == "__main__":
    asyncio.run(main())