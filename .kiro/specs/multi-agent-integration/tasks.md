# 多智能体集成实施计划（修正版）

## 说明
本项目基于后端已有的JoyAgent-JDGenie多智能体框架进行前端集成开发。后端已提供完整的智能体引擎、工具集合和API接口，前端主要负责用户界面和交互体验的实现。

## 后端已有框架能力分析
- **JoyAgent-Core**: Java Spring Boot智能体核心引擎，支持多种智能体模式（React、Plan&Execute）
- **Genie-Tool**: Python FastAPI工具服务，提供代码解释器、报告生成、深度搜索等工具
- **智能体工具集**: 包含文件处理、搜索、代码执行、报告生成、MCP工具等
- **多智能体编排**: 支持DAG执行引擎、上下文管理、流式输出
- **API接口**: `/AutoAgent` 主要接口，支持SSE流式响应
- **现有智能体**: BusinessCanvasAgent、SWOTAnalysisAgent、PolicyMatchingAgent、IncubatorAgent

## 前端需要实现的功能

- [x] 1. 前端智能体适配层
  - ~~创建智能体注册表和基础数据结构~~ (后端已提供)
  - ~~实现基础的智能体接口和通信协议~~ (后端已提供)
  - 创建前端智能体类型定义和接口适配
  - 实现backendApi.service.ts调用后端API
  - _需求: 1.1, 1.5_

- [x] 2. 智能体目录和菜单UI
- [x] 2.1 智能体目录数据映射
  - ~~定义智能体信息模型~~ (后端已提供)
  - 创建前端智能体注册表适配层
  - 实现与后端API的数据映射
  - _需求: 1.1, 1.3_

- [x] 2.2 智能体菜单UI组件
  - 实现始终可见的智能体目录面板（200px高度）
  - 创建分类折叠展开的智能体列表
  - 实现智能体搜索框和实时过滤功能
  - 添加智能体状态指示器
  - 创建智能体详细信息悬浮提示面板
  - 实现响应式设计适配不同屏幕尺寸
  - _需求: 1.1, 1.2, 1.3_

- [ ] 2.3 智能体推荐系统UI
  - 在智能体目录底部添加"📈 智能推荐"区域
  - 实现基于当前项目的智能体匹配推荐UI
  - 添加基于使用历史的智能体推荐UI
  - 显示智能体性能指标UI
  - 创建智能体使用统计面板UI
  - _需求: 1.4, 5.1, 5.4_

- [x] 3. 后端多智能体引擎集成
- [x] 3.1 后端API调用服务
  - ~~实现意图分析模块~~ (后端已提供)
  - ~~构建工作流引擎~~ (后端已提供)  
  - ~~开发响应合成模块~~ (后端已提供)
  - 创建backendApi.service.ts调用后端/AutoAgent接口
  - 实现SSE流式数据处理
  - 添加错误处理和重试机制
  - _需求: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. 直接通信模式UI
- [ ] 4.1 智能体选择和切换UI
  - 实现模式切换组件（编排模式/直接模式切换按钮）
  - 创建智能体目录的双重交互模式UI
  - 实现智能体切换的视觉反馈和动画效果
  - 创建智能体专用聊天界面头部
  - _需求: 4.1, 4.2, 4.3_

- [ ] 4.2 上下文管理UI
  - ~~实现跨智能体的对话上下文保持~~ (后端已提供)
  - ~~创建对话历史存储和检索机制~~ (后端已提供)
  - 实现上下文切换时的UI状态同步
  - 创建对话历史UI展示
  - _需求: 4.4, 4.5_

- [x] 5. 工作流可视化组件
- [x] 5.1 工作流图形化展示
  - 创建嵌入式工作流可视化卡片组件
  - 实现步骤状态图标和进度显示
  - 添加实时进度条和百分比显示
  - 创建智能体调用时间线和耗时统计
  - 实现工作流的暂停、停止、重新执行控制按钮
  - _需求: 3.1, 3.2, 3.3_

- [ ] 5.2 工作流详细视图和错误展示
  - 实现工作流卡片的展开/折叠功能
  - 创建详细日志面板显示每个步骤的输入输出
  - 添加错误状态的友好提示和重试选项
  - 实现工作流性能分析面板
  - 创建工作流调试模式UI
  - _需求: 3.4, 3.5_

- [ ] 6. 错误处理和恢复UI
- [ ] 6.1 API调用错误处理UI
  - ~~实现API调用超时和重试机制~~ (后端已提供)
  - 添加错误信息的用户友好展示UI
  - ~~创建备用智能体选择逻辑~~ (后端已提供)
  - 实现错误状态的UI反馈
  - _需求: 2.5_

- [ ] 6.2 工作流错误恢复UI
  - ~~实现基础的错误恢复和用户通知~~ (后端已提供)
  - ~~添加工作流中断时的处理逻辑~~ (后端已提供)
  - 创建简单的手动重试选项UI
  - 实现错误恢复的用户界面
  - _需求: 2.5_

- [ ] 7. 用户偏好和学习系统UI
- [ ] 7.1 用户偏好管理UI
  - ~~创建用户偏好数据模型和存储~~ (后端已提供)
  - 实现偏好设置界面和配置选项UI
  - 添加智能体优先级和工作流偏好设置UI
  - _需求: 5.1, 5.2, 6.2, 6.3_

- [ ] 7.2 自适应学习功能UI
  - ~~实现用户行为跟踪和分析~~ (后端已提供)
  - ~~创建基于使用模式的推荐优化~~ (后端已提供)
  - 添加反馈收集UI和学习机制展示
  - _需求: 5.1, 5.3, 5.4_

- [x] 8. 现有AI助手组件集成
- [x] 8.1 重构现有AIAssistant组件
  - 重新设计AI助手面板为四层结构
  - 实现编排模式和直接模式的对话区域内容切换
  - 集成现有AI助手功能到编排智能体中
  - 集成后端/AutoAgent API调用
  - _需求: 1.1, 2.1, 4.1_

- [ ] 8.2 用户界面布局优化
  - 保持三列布局：项目管理器(20%) + 主内容区(55%) + AI助手(25%)
  - 在对话区域集成工作流可视化组件
  - 实现智能体目录的响应式折叠
  - 添加智能体切换的过渡动画和加载状态
  - 优化输入区域的建议提示和快捷操作按钮
  - _需求: 1.1, 3.1_

- [ ] 9. 配置和管理功能UI
- [ ] 9.1 智能体配置界面
  - ~~实现智能体启用/禁用功能~~ (后端已提供)
  - 实现智能体启用/禁用的UI界面
  - 添加智能体参数和设置配置UI
  - 创建智能体性能监控面板UI
  - _需求: 6.1, 6.2_

- [ ] 9.2 工作流模板系统UI
  - ~~实现预定义工作流模板的创建和管理~~ (后端已提供)
  - 添加工作流模板的UI管理界面
  - 创建工作流模板的导入导出UI功能
  - _需求: 6.3, 6.4_

- [ ] 10. 测试和质量保证
- [ ] 10.1 前端单元测试
  - 为UI组件创建测试用例
  - 实现API调用服务的单元测试
  - 添加工作流可视化组件测试
  - _需求: 所有需求的验证_

- [ ] 10.2 集成测试
  - 创建端到端的多智能体工作流UI测试
  - 实现用户界面交互的自动化测试
  - 添加与后端API集成的测试
  - _需求: 所有需求的集成验证_

- [ ] 11. 性能优化和用户体验
- [ ] 11.1 前端性能优化
  - ~~添加智能体响应缓存机制~~ (后端已提供)
  - 实现前端组件的性能优化
  - 创建UI响应性能监控
  - _需求: 系统性能要求_

- [ ] 11.2 用户体验优化
  - 实现响应时间优化和用户反馈UI
  - 添加加载状态和进度指示UI
  - 优化界面响应性和交互流畅度
  - _需求: 用户体验要求_

## 重要说明

### 避免重复开发的原则
1. **后端已提供的功能不再重复开发**：意图分析、工作流引擎、响应合成、智能体管理等核心逻辑
2. **前端专注于UI和用户体验**：可视化、交互、状态管理、用户界面
3. **通过API集成后端能力**：使用backendApi.service.ts调用后端/AutoAgent接口
4. **利用现有工具和智能体**：直接使用后端的代码解释器、报告生成、搜索等工具

### 后端API集成要点
- 主要接口：`POST /AutoAgent` (SSE流式响应)
- 工具服务：`http://localhost:1601/v1/tool/*` (代码解释器、报告生成、深度搜索)
- 智能体类型：基于后端已有的BusinessCanvasAgent、SWOTAnalysisAgent等
- 数据格式：遵循后端AgentRequest和响应格式

### 前端开发重点
1. **用户界面设计**：智能体目录、工作流可视化、模式切换
2. **交互体验优化**：流式数据展示、实时状态更新、错误处理
3. **状态管理**：前端状态与后端数据同步
4. **响应式设计**：适配不同屏幕尺寸和设备