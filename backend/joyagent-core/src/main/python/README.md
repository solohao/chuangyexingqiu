# JoyAgent-Core Python版本

这是JoyAgent-Core的Python实现版本，包含了创业星球专用的智能体系统。

## 目录结构

```
python/
├── com/
│   └── startup/
│       └── agents/
│           ├── __init__.py              # 包导出
│           ├── base_agent.py            # 智能体基类
│           ├── agent_factory.py         # 智能体工厂
│           ├── RequirementAnalysisAgent.py    # 需求分析智能体
│           ├── PolicyMatchingAgent.py         # 政策匹配智能体
│           ├── IncubatorAgent.py             # 孵化器推荐智能体
│           ├── SWOTAnalysisAgent.py          # SWOT分析智能体
│           └── BusinessCanvasAgent.py        # 商业模式画布智能体
├── test_agents.py                       # 测试文件
└── README.md                           # 本文件
```

## 安装依赖

请使用项目根目录的requirements.txt安装依赖：

```bash
# 从项目根目录运行
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
```

## 使用方法

### 1. 基本使用

```python
import asyncio
from com.startup.agents import AgentFactory

async def main():
    # 创建智能体
    agent = AgentFactory.create_agent("requirement_analysis")
    
    # 执行任务
    result = await agent.run(
        "我想开发一个在线教育平台",
        {"project_description": "面向K12学生的在线教育平台"}
    )
    
    print(result)

asyncio.run(main())
```

### 2. 可用的智能体类型

- `requirement_analysis` - 需求分析智能体
- `policy_matching` - 政策匹配智能体  
- `incubator_recommendation` - 孵化器推荐智能体
- `swot_analysis` - SWOT分析智能体
- `business_canvas` - 商业模式画布智能体

### 3. 运行测试

```bash
cd backend/joyagent-core/src/main/python
python test_agents.py
```

## 智能体接口

所有智能体都继承自`BaseAgent`基类，提供统一的接口：

```python
class BaseAgent(ABC):
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行智能体任务"""
        pass
    
    async def run(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """运行智能体主循环"""
        pass
```

## 返回格式

所有智能体的返回格式统一为：

```python
{
    "success": bool,           # 执行是否成功
    "result": dict,           # 执行结果数据
    "tool": str,              # 工具名称
    "error": str,             # 错误信息（如果有）
    "agent": str              # 智能体名称
}
```

## 扩展开发

要添加新的智能体：

1. 继承`BaseAgent`基类
2. 实现`execute`方法
3. 在`AgentFactory`中注册新的智能体类型

```python
from .base_agent import BaseAgent

class MyCustomAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="my_custom_agent",
            description="我的自定义智能体"
        )
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        # 实现具体逻辑
        return {
            "success": True,
            "result": {"message": "Hello World"},
            "tool": "my_custom_tool"
        }

# 注册到工厂
AgentFactory.register_agent("my_custom", MyCustomAgent)
```