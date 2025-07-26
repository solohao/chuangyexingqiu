#!/usr/bin/env python3
"""
魔搭API集成测试脚本
测试JoyAgent与魔搭API的集成情况
"""

import json
import time
from openai import OpenAI

# 配置信息
API_KEY = 
BASE_URL = "https://api-inference.modelscope.cn/v1"

# 测试模型列表
MODELS = [
    "Qwen/Qwen2.5-7B-Instruct",
    "Qwen/Qwen2.5-14B-Instruct", 
    "Qwen/Qwen2.5-Coder-32B-Instruct"
]

def test_model_availability():
    """测试模型可用性"""
    print("🔍 测试模型可用性...")
    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)
    
    for model in MODELS:
        try:
            print(f"  测试模型: {model}")
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "你好"}],
                max_tokens=10,
                stream=False
            )
            print(f"  ✅ {model} - 可用")
            print(f"     响应: {response.choices[0].message.content}")
        except Exception as e:
            print(f"  ❌ {model} - 错误: {str(e)}")
        print()

def test_streaming_output():
    """测试流式输出"""
    print("🌊 测试流式输出...")
    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)
    
    try:
        print("  使用模型: Qwen/Qwen2.5-7B-Instruct")
        print("  问题: 请简单介绍一下人工智能")
        print("  流式响应:")
        print("  " + "-" * 50)
        
        response = client.chat.completions.create(
            model="Qwen/Qwen2.5-7B-Instruct",
            messages=[
                {
                    "role": "system",
                    "content": "你是一个专业的AI助手，请简洁回答问题。"
                },
                {
                    "role": "user", 
                    "content": "请简单介绍一下人工智能"
                }
            ],
            stream=True,
            max_tokens=200,
            temperature=0.7
        )
        
        full_response = ""
        for chunk in response:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                print(content, end='', flush=True)
                full_response += content
        
        print("\n  " + "-" * 50)
        print(f"  ✅ 流式输出测试成功")
        print(f"  📊 总字符数: {len(full_response)}")
        
    except Exception as e:
        print(f"  ❌ 流式输出测试失败: {str(e)}")

def test_code_generation():
    """测试代码生成能力"""
    print("💻 测试代码生成能力...")
    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)
    
    try:
        print("  使用模型: Qwen/Qwen2.5-Coder-32B-Instruct")
        print("  任务: 生成Python快速排序代码")
        
        response = client.chat.completions.create(
            model="Qwen/Qwen2.5-Coder-32B-Instruct",
            messages=[
                {
                    "role": "system",
                    "content": "你是一个专业的编程助手，请生成高质量的代码。"
                },
                {
                    "role": "user",
                    "content": "请用Python实现一个快速排序算法，要求代码简洁且有注释"
                }
            ],
            stream=False,
            max_tokens=500,
            temperature=0.1
        )
        
        code = response.choices[0].message.content
        print("  生成的代码:")
        print("  " + "-" * 50)
        print(code)
        print("  " + "-" * 50)
        print("  ✅ 代码生成测试成功")
        
    except Exception as e:
        print(f"  ❌ 代码生成测试失败: {str(e)}")

def test_startup_consulting():
    """测试创业咨询场景"""
    print("🚀 测试创业咨询场景...")
    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)
    
    try:
        print("  使用模型: Qwen/Qwen2.5-14B-Instruct")
        print("  场景: 创业项目SWOT分析")
        
        response = client.chat.completions.create(
            model="Qwen/Qwen2.5-14B-Instruct",
            messages=[
                {
                    "role": "system",
                    "content": "你是一个专业的创业顾问，擅长商业分析和战略规划。"
                },
                {
                    "role": "user",
                    "content": "我想做一个AI驱动的在线教育平台，请帮我做一个简单的SWOT分析"
                }
            ],
            stream=True,
            max_tokens=800,
            temperature=0.7
        )
        
        print("  SWOT分析结果:")
        print("  " + "-" * 50)
        
        full_response = ""
        for chunk in response:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                print(content, end='', flush=True)
                full_response += content
        
        print("\n  " + "-" * 50)
        print("  ✅ 创业咨询测试成功")
        
    except Exception as e:
        print(f"  ❌ 创业咨询测试失败: {str(e)}")

def test_api_limits():
    """测试API限制"""
    print("⚡ 测试API响应时间...")
    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)
    
    try:
        start_time = time.time()
        
        response = client.chat.completions.create(
            model="Qwen/Qwen2.5-7B-Instruct",
            messages=[{"role": "user", "content": "1+1等于几？"}],
            max_tokens=10,
            stream=False
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        print(f"  📊 响应时间: {response_time:.2f}秒")
        print(f"  📝 响应内容: {response.choices[0].message.content}")
        
        if response_time < 5:
            print("  ✅ 响应时间正常")
        else:
            print("  ⚠️  响应时间较慢")
            
    except Exception as e:
        print(f"  ❌ API限制测试失败: {str(e)}")

def main():
    """主测试函数"""
    print("🧪 魔搭API集成测试开始")
    print("=" * 60)
    print(f"API Token: {API_KEY}")
    print(f"Base URL: {BASE_URL}")
    print("=" * 60)
    print()
    
    # 执行各项测试
    test_model_availability()
    print()
    
    test_streaming_output()
    print()
    
    test_code_generation()
    print()
    
    test_startup_consulting()
    print()
    
    test_api_limits()
    print()
    
    print("🎉 所有测试完成!")
    print("💡 提示: 如果所有测试通过，说明魔搭API集成成功")
    print("📊 建议: 监控每日API使用量，避免超过2000次限制")

if __name__ == "__main__":
    main()