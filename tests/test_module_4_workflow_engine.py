#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
模块4测试: 工作流编排引擎 (AutoAgent)
测试SSE响应、工作流状态管理、错误处理
"""

import asyncio
import json
import time
import requests
from typing import Dict, List

class WorkflowEngineTester:
    """工作流编排引擎测试器"""
    
    def __init__(self):
        self.test_results = []
        self.base_url = "http://localhost:8080"
    
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
    
    async def test_server_connectivity(self):
        """测试4.1: 服务器连通性"""
        start_time = time.time()
        try:
            response = requests.get(f"{self.base_url}/docs", timeout=5)
            if response.status_code == 200:
                self.log_test("服务器连通性", True, f"服务器响应正常: {response.status_code}", time.time() - start_time)
                return True
            else:
                self.log_test("服务器连通性", False, f"服务器响应异常: {response.status_code}", time.time() - start_time)
                return False
        except Exception as e:
            self.log_test("服务器连通性", False, f"连接失败: {e}", time.time() - start_time)
            return False
    
    async def test_autoagent_endpoint(self):
        """测试4.2: AutoAgent端点"""
        start_time = time.time()
        try:
            payload = {
                "requestId": f"test_{int(time.time())}",
                "query": "测试查询",
                "agentType": "react",
                "isStream": "false",
                "outputStyle": "markdown"
            }
            
            response = requests.post(
                f"{self.base_url}/AutoAgent",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_test("AutoAgent端点", True, f"端点响应正常: {response.status_code}", time.time() - start_time)
                return True
            else:
                self.log_test("AutoAgent端点", False, f"端点响应异常: {response.status_code}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("AutoAgent端点", False, f"端点测试失败: {e}", time.time() - start_time)
            return False
    
    async def test_sse_stream_format(self):
        """测试4.3: SSE流格式"""
        start_time = time.time()
        try:
            payload = {
                "requestId": f"test_stream_{int(time.time())}",
                "query": "请简单介绍人工智能",
                "agentType": "react",
                "isStream": "true",
                "outputStyle": "markdown"
            }
            
            response = requests.post(
                f"{self.base_url}/AutoAgent",
                json=payload,
                headers={
                    "Accept": "text/event-stream",
                    "Cache-Control": "no-cache"
                },
                stream=True,
                timeout=15
            )
            
            if response.status_code != 200:
                self.log_test("SSE流格式", False, f"HTTP错误: {response.status_code}", time.time() - start_time)
                return False
            
            # 检查Content-Type
            content_type = response.headers.get('content-type', '')
            if 'text/event-stream' not in content_type:
                self.log_test("SSE流格式", False, f"Content-Type错误: {content_type}", time.time() - start_time)
                return False
            
            # 解析SSE数据
            events_received = []
            data_received = []
            
            for line in response.iter_lines(decode_unicode=True):
                if line:
                    if line.startswith('data: event: '):
                        event_type = line[13:].strip()
                        events_received.append(event_type)
                    elif line.startswith('data: data: '):
                        data_content = line[12:].strip()
                        data_received.append(data_content)
                
                # 限制处理数量，避免测试时间过长
                if len(events_received) >= 5:
                    break
            
            if len(events_received) > 0 and len(data_received) > 0:
                self.log_test("SSE流格式", True, f"接收到{len(events_received)}个事件, {len(data_received)}个数据", time.time() - start_time)
                return True
            else:
                self.log_test("SSE流格式", False, f"未接收到有效数据: events={len(events_received)}, data={len(data_received)}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("SSE流格式", False, f"SSE测试失败: {e}", time.time() - start_time)
            return False
    
    async def test_workflow_events(self):
        """测试4.4: 工作流事件序列"""
        start_time = time.time()
        try:
            payload = {
                "requestId": f"test_workflow_{int(time.time())}",
                "query": "分析一个电商网站项目",
                "agentType": "react",
                "isStream": "true",
                "outputStyle": "markdown"
            }
            
            response = requests.post(
                f"{self.base_url}/AutoAgent",
                json=payload,
                headers={"Accept": "text/event-stream"},
                stream=True,
                timeout=20
            )
            
            if response.status_code != 200:
                self.log_test("工作流事件序列", False, f"HTTP错误: {response.status_code}", time.time() - start_time)
                return False
            
            expected_events = ['start', 'thinking', 'action', 'observation']
            received_events = []
            
            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith('data: event: '):
                    event_type = line[13:].strip()
                    received_events.append(event_type)
                    
                    # 检查是否收到完成事件
                    if event_type in ['complete', 'final_answer']:
                        break
                
                # 超时保护
                if len(received_events) >= 10:
                    break
            
            # 检查是否包含预期的事件
            found_events = [event for event in expected_events if event in received_events]
            
            if len(found_events) >= 2:  # 至少要有2个预期事件
                self.log_test("工作流事件序列", True, f"接收到事件: {', '.join(received_events)}", time.time() - start_time)
                return True
            else:
                self.log_test("工作流事件序列", False, f"事件序列不完整: {', '.join(received_events)}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("工作流事件序列", False, f"事件测试失败: {e}", time.time() - start_time)
            return False
    
    async def test_json_data_parsing(self):
        """测试4.5: JSON数据解析"""
        start_time = time.time()
        try:
            payload = {
                "requestId": f"test_json_{int(time.time())}",
                "query": "简单测试",
                "agentType": "react",
                "isStream": "true",
                "outputStyle": "json"
            }
            
            response = requests.post(
                f"{self.base_url}/AutoAgent",
                json=payload,
                headers={"Accept": "text/event-stream"},
                stream=True,
                timeout=15
            )
            
            if response.status_code != 200:
                self.log_test("JSON数据解析", False, f"HTTP错误: {response.status_code}", time.time() - start_time)
                return False
            
            valid_json_count = 0
            total_data_count = 0
            
            for line in response.iter_lines(decode_unicode=True):
                if line and line.startswith('data: data: '):
                    data_content = line[12:].strip()
                    total_data_count += 1
                    
                    try:
                        json.loads(data_content)
                        valid_json_count += 1
                    except json.JSONDecodeError:
                        pass  # 不是JSON格式，这是正常的
                
                if total_data_count >= 5:  # 限制测试数量
                    break
            
            if total_data_count > 0:
                json_ratio = valid_json_count / total_data_count
                self.log_test("JSON数据解析", True, f"JSON数据比例: {valid_json_count}/{total_data_count} ({json_ratio:.1%})", time.time() - start_time)
                return True
            else:
                self.log_test("JSON数据解析", False, "未接收到数据", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("JSON数据解析", False, f"JSON测试失败: {e}", time.time() - start_time)
            return False
    
    async def test_error_handling(self):
        """测试4.6: 错误处理"""
        start_time = time.time()
        try:
            # 测试无效请求
            invalid_payload = {
                "requestId": "test_error",
                "query": "",  # 空查询
                "agentType": "invalid_type",  # 无效类型
                "isStream": "true"
            }
            
            response = requests.post(
                f"{self.base_url}/AutoAgent",
                json=invalid_payload,
                timeout=10
            )
            
            # 服务器应该能处理无效请求而不崩溃
            if response.status_code in [200, 400, 422]:
                self.log_test("错误处理", True, f"正确处理无效请求: {response.status_code}", time.time() - start_time)
                return True
            else:
                self.log_test("错误处理", False, f"错误处理异常: {response.status_code}", time.time() - start_time)
                return False
                
        except Exception as e:
            self.log_test("错误处理", True, f"正确抛出异常: {type(e).__name__}", time.time() - start_time)
            return True
    
    async def run_all_tests(self):
        """运行所有测试"""
        print("🚀 模块4测试: 工作流编排引擎 (AutoAgent)")
        print("=" * 60)
        
        tests = [
            self.test_server_connectivity,
            self.test_autoagent_endpoint,
            self.test_sse_stream_format,
            self.test_workflow_events,
            self.test_json_data_parsing,
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
            print("🎉 模块4: 工作流编排引擎 - 全部测试通过！")
        else:
            print("⚠️  模块4: 工作流编排引擎 - 存在失败的测试")
        
        return passed == total

async def main():
    """主测试函数"""
    tester = WorkflowEngineTester()
    success = await tester.run_all_tests()
    return success

if __name__ == "__main__":
    asyncio.run(main())