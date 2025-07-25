# 魔搭ModelScope API-Inference集成指南

## 📋 API信息

- **API Token**: `ms-13ddfa1d-dbf8-405f-b8da-85b23bbc7229`
- **Base URL**: `https://api-inference.modelscope.cn/v1`
- **每日额度**: 2000次调用
- **兼容性**: OpenAI API完全兼容
- **流式支持**: ✅ 完全支持

## 🎯 模型选择策略

### 推荐模型配置

| 功能场景 | 推荐模型 | 原因 | Token消耗 |
|---------|----------|------|-----------|
| 任务规划 | Qwen/Qwen2.5-7B-Instruct | 快速响应，规划能力强 | 低 |
| 复杂推理 | Qwen/Qwen2.5-14B-Instruct | 推理能力强，适合复杂任务 | 中 |
| 代码生成 | Qwen/Qwen2.5-Coder-32B-Instruct | 专业代码模型 | 高 |
| 深度思考 | deepseek-ai/DeepSeek-V3 | 推理能力最强 | 高 |

### 成本优化建议

1. **日常对话**: 使用 `Qwen/Qwen2.5-7B-Instruct`
2. **报告生成**: 使用 `Qwen/Qwen2.5-14B-Instruct`
3. **代码任务**: 使用 `Qwen/Qwen2.5-Coder-32B-Instruct`
4. **复杂分析**: 谨慎使用 `deepseek-ai/DeepSeek-V3`

## 🔧 配置文件详解

### 1. Java后端配置 (application-modelscope.yml)

```yaml
llm:
  default:
    base_url: 'https://api-inference.modelscope.cn/v1'
    apikey: 'ms-13ddfa1d-dbf8-405f-b8da-85b23bbc7229'
    interface_url: '/chat/completions'
    model: 'Qwen/Qwen2.5-7B-Instruct'
    stream: true

autobots:
  autoagent:
    planner:
      model_name: 'Qwen/Qwen2.5-7B-Instruct'  # 快速规划
    executor:
      model_name: 'Qwen/Qwen2.5-14B-Instruct' # 强力执行
    react:
      model_name: 'Qwen/Qwen2.5-7B-Instruct'  # 快速对话
```

### 2. Python工具服务配置 (.env)

```bash
# 魔搭API配置
OPENAI_API_KEY=ms-13ddfa1d-dbf8-405f-b8da-85b23bbc7229
OPENAI_BASE_URL=https://api-inference.modelscope.cn/v1

# 模型分配
DEFAULT_MODEL=Qwen/Qwen2.5-7B-Instruct
SEARCH_REASONING_MODEL=Qwen/Qwen2.5-14B-Instruct
REPORT_MODEL=Qwen/Qwen2.5-14B-Instruct
CODE_INTEPRETER_MODEL=Qwen/Qwen2.5-Coder-32B-Instruct
```

## 🚀 启动配置

### 1. 使用魔搭配置启动

```bash
# Java后端
cd backend/joyagent-core
./mvnw spring-boot:run -Dspring-boot.run.profiles=modelscope

# 或者使用环境变量
export SPRING_PROFILES_ACTIVE=modelscope
export MODELSCOPE_ACCESS_TOKEN=ms-13ddfa1d-dbf8-405f-b8da-85b23bbc7229
./mvnw spring-boot:run
```

### 2. Python服务启动

```bash
# 工具服务
cd backend/genie-tool
python server.py

# 客户端服务
cd backend/genie-client
python server.py
```

## 📊 使用限制与监控

### 每日额度管理

```bash
# 创建简单的额度监控脚本
cat > monitor_usage.sh << 'EOF'
#!/bin/bash
echo "魔搭API使用情况监控"
echo "当前时间: $(date)"
echo "剩余额度: 请查看魔搭控制台"
echo "建议: 优先使用7B模型节省额度"
EOF

chmod +x monitor_usage.sh
```

### 模型限制说明

- **通用模型**: 每日2000次总额度
- **特殊模型**: 如DeepSeek-R1可能有单独限制(200次/天)
- **并发限制**: 平台动态调整，建议单并发使用

## 🔄 流式输出测试

### 测试脚本

```python
# test_modelscope_streaming.py
from openai import OpenAI

client = OpenAI(
    api_key="ms-13ddfa1d-dbf8-405f-b8da-85b23bbc7229",
    base_url="https://api-inference.modelscope.cn/v1"
)

response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[
        {
            'role': 'system',
            'content': '你是一个专业的创业顾问助手。'
        },
        {
            'role': 'user',
            'content': '请帮我分析一下共享办公空间的商业模式'
        }
    ],
    stream=True,
    max_tokens=1000,
    temperature=0.7
)

print("流式输出测试:")
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end='', flush=True)
print("\n\n测试完成!")
```

## 🛠️ 故障排除

### 常见问题

1. **401 Unauthorized**
   - 检查API Token是否正确
   - 确认账号已绑定阿里云

2. **429 Rate Limited**
   - 检查是否超过每日2000次限制
   - 降低并发请求数量

3. **模型不可用**
   - 某些模型可能临时下线
   - 切换到备用模型

### 错误处理配置

```yaml
# application-modelscope.yml 添加
resilience4j:
  retry:
    instances:
      modelscope-api:
        max-attempts: 3
        wait-duration: 1s
        exponential-backoff-multiplier: 2
```

## 📈 性能优化建议

### 1. 模型选择优化

```yaml
# 根据任务复杂度选择模型
simple_tasks: Qwen/Qwen2.5-7B-Instruct     # 节省额度
complex_tasks: Qwen/Qwen2.5-14B-Instruct   # 平衡性能
code_tasks: Qwen/Qwen2.5-Coder-32B-Instruct # 专业能力
```

### 2. 请求参数优化

```yaml
# 针对不同场景的参数设置
quick_response:
  max_tokens: 500
  temperature: 0.3

creative_writing:
  max_tokens: 2000
  temperature: 0.8

code_generation:
  max_tokens: 1500
  temperature: 0.1
```

## ✅ 验证清单

- [ ] API Token配置正确
- [ ] Base URL指向魔搭API
- [ ] 模型名称使用ModelScope格式
- [ ] 流式输出正常工作
- [ ] 错误处理机制完善
- [ ] 额度监控到位

## 🎉 部署完成

配置完成后，你的JoyAgent系统将：

1. ✅ 使用魔搭免费API (每日2000次)
2. ✅ 支持完整的流式输出
3. ✅ 智能分配不同模型处理不同任务
4. ✅ 优化成本和性能平衡

现在可以启动系统并开始测试创业AI助手功能了！