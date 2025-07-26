# MCP连接插件技术规格文档

## 系统架构

### 整体架构图
```
┌─────────────────────────────────────────────────────────────────┐
│                    创业星球平台 (Web)                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   创业Agent     │  │   项目仪表板     │  │   资源匹配       │    │
│  │     系统        │  │                │  │     系统        │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                      MCP Server                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   数据处理       │  │   AI分析引擎     │  │   API网关        │    │
│  │     模块        │  │                │  │                │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   缓存系统       │  │   队列系统       │  │   监控系统       │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼ MCP Protocol
┌─────────────────────────────────────────────────────────────────┐
│                    IDE插件 (VS Code/Cursor)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   数据采集       │  │   UI组件        │  │   本地缓存       │    │
│  │     模块        │  │                │  │                │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   Git集成       │  │   安全模块       │  │   配置管理       │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼ File System Events
┌─────────────────────────────────────────────────────────────────┐
│                      本地开发环境                                 │
│         (项目文件、Git仓库、工作空间配置)                           │
└─────────────────────────────────────────────────────────────────┘
```

## 核心组件设计

### 1. VS Code/Cursor 插件

#### 1.1 插件清单 (package.json)
```json
{
  "name": "startup-planet-connector",
  "displayName": "创业星球连接器",
  "description": "连接本地开发环境与创业星球平台",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "onStartupFinished",
    "workspaceContains:**/.git"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "startupPlanet.connect",
        "title": "连接创业星球"
      },
      {
        "command": "startupPlanet.syncProgress",
        "title": "同步项目进度"
      },
      {
        "command": "startupPlanet.showDashboard",
        "title": "显示项目仪表板"
      }
    ],
    "views": {
      "explorer": [
        {
          "id": "startupPlanetView",
          "name": "创业星球",
          "when": "startupPlanet.connected"
        }
      ]
    },
    "configuration": {
      "title": "创业星球设置",
      "properties": {
        "startupPlanet.apiEndpoint": {
          "type": "string",
          "default": "https://api.startup-planet.com",
          "description": "API端点地址"
        },
        "startupPlanet.autoSync": {
          "type": "boolean",
          "default": true,
          "description": "自动同步开发进度"
        },
        "startupPlanet.privacyMode": {
          "type": "string",
          "enum": ["full", "metadata", "minimal"],
          "default": "metadata",
          "description": "隐私模式设置"
        }
      }
    }
  }
}
```

#### 1.2 核心模块结构
```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { MCPClient } from './mcp/client';
import { DataCollector } from './collectors/dataCollector';
import { UIProvider } from './ui/provider';
import { ConfigManager } from './config/manager';

export class StartupPlanetExtension {
  private mcpClient: MCPClient;
  private dataCollector: DataCollector;
  private uiProvider: UIProvider;
  private configManager: ConfigManager;

  constructor(context: vscode.ExtensionContext) {
    this.configManager = new ConfigManager(context);
    this.mcpClient = new MCPClient(this.configManager);
    this.dataCollector = new DataCollector(this.mcpClient);
    this.uiProvider = new UIProvider(context, this.mcpClient);
  }

  async activate(): Promise<void> {
    await this.initializeConnection();
    this.registerEventListeners();
    this.startDataCollection();
  }

  private async initializeConnection(): Promise<void> {
    // 初始化MCP连接
  }

  private registerEventListeners(): void {
    // 注册文件系统和Git事件监听器
  }

  private startDataCollection(): void {
    // 启动数据收集
  }
}
```

#### 1.3 数据采集模块
```typescript
// src/collectors/dataCollector.ts
export interface DevelopmentMetrics {
  // 代码统计
  linesOfCode: number;
  filesChanged: number;
  commitFrequency: number;
  
  // 工作模式
  workingSessions: WorkingSession[];
  productiveHours: number[];
  breakPatterns: BreakPattern[];
  
  // 技术栈
  technologies: TechnologyUsage[];
  dependencies: DependencyInfo[];
  architecturePatterns: string[];
  
  // 质量指标
  testCoverage: number;
  codeComplexity: ComplexityMetrics;
  technicalDebt: TechnicalDebtInfo;
}

export class DataCollector {
  private fileWatcher: vscode.FileSystemWatcher;
  private gitWatcher: GitWatcher;
  private activityTracker: ActivityTracker;

  constructor(private mcpClient: MCPClient) {
    this.setupWatchers();
  }

  private setupWatchers(): void {
    // 文件变更监听
    this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    this.fileWatcher.onDidChange(this.handleFileChange.bind(this));
    
    // Git事件监听
    this.gitWatcher = new GitWatcher();
    this.gitWatcher.onCommit(this.handleCommit.bind(this));
    
    // 活动跟踪
    this.activityTracker = new ActivityTracker();
    this.activityTracker.onActivity(this.handleActivity.bind(this));
  }

  private async handleFileChange(uri: vscode.Uri): Promise<void> {
    const metrics = await this.analyzeFileChange(uri);
    await this.mcpClient.sendMetrics(metrics);
  }

  private async handleCommit(commit: GitCommit): Promise<void> {
    const analysis = await this.analyzeCommit(commit);
    await this.mcpClient.sendCommitAnalysis(analysis);
  }

  private async handleActivity(activity: UserActivity): Promise<void> {
    const sessionData = await this.analyzeActivity(activity);
    await this.mcpClient.sendActivityData(sessionData);
  }
}
```

### 2. MCP Server

#### 2.1 服务器架构
```typescript
// server/src/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export class StartupPlanetMCPServer {
  private server: Server;
  private dataProcessor: DataProcessor;
  private aiAnalyzer: AIAnalyzer;
  private platformConnector: PlatformConnector;

  constructor() {
    this.server = new Server(
      {
        name: "startup-planet-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // 工具处理器
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "sync_development_progress",
          description: "同步开发进度数据",
          inputSchema: {
            type: "object",
            properties: {
              projectId: { type: "string" },
              metrics: { type: "object" },
              timestamp: { type: "string" }
            },
            required: ["projectId", "metrics"]
          }
        },
        {
          name: "analyze_code_quality",
          description: "分析代码质量",
          inputSchema: {
            type: "object",
            properties: {
              codeMetrics: { type: "object" },
              files: { type: "array", items: { type: "string" } }
            },
            required: ["codeMetrics"]
          }
        },
        {
          name: "get_startup_recommendations",
          description: "获取创业建议",
          inputSchema: {
            type: "object",
            properties: {
              projectContext: { type: "object" },
              currentPhase: { type: "string" }
            },
            required: ["projectContext"]
          }
        }
      ]
    }));

    // 资源处理器
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: "startup://project-dashboard",
          name: "项目仪表板",
          description: "实时项目进度和指标"
        },
        {
          uri: "startup://team-analytics",
          name: "团队分析",
          description: "团队协作和效率分析"
        }
      ]
    }));
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
```

#### 2.2 数据处理引擎
```typescript
// server/src/processors/dataProcessor.ts
export class DataProcessor {
  private redis: Redis;
  private queue: Queue;
  private database: Database;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.queue = new Queue('development-data');
    this.database = new Database();
  }

  async processMetrics(data: DevelopmentMetrics): Promise<ProcessedMetrics> {
    // 数据验证
    const validatedData = await this.validateData(data);
    
    // 数据清洗
    const cleanedData = await this.cleanData(validatedData);
    
    // 数据聚合
    const aggregatedData = await this.aggregateData(cleanedData);
    
    // 存储到数据库
    await this.storeData(aggregatedData);
    
    // 触发实时分析
    await this.triggerAnalysis(aggregatedData);
    
    return aggregatedData;
  }

  private async validateData(data: DevelopmentMetrics): Promise<DevelopmentMetrics> {
    // 数据格式验证
    // 敏感信息过滤
    // 完整性检查
    return data;
  }

  private async cleanData(data: DevelopmentMetrics): Promise<DevelopmentMetrics> {
    // 去重
    // 标准化
    // 异常值处理
    return data;
  }

  private async aggregateData(data: DevelopmentMetrics): Promise<ProcessedMetrics> {
    // 时间序列聚合
    // 维度汇总
    // 趋势计算
    return processedData;
  }
}
```

#### 2.3 AI分析引擎
```typescript
// server/src/analyzers/aiAnalyzer.ts
export class AIAnalyzer {
  private llmClient: LLMClient;
  private ruleEngine: RuleEngine;
  private patternMatcher: PatternMatcher;

  constructor() {
    this.llmClient = new LLMClient();
    this.ruleEngine = new RuleEngine();
    this.patternMatcher = new PatternMatcher();
  }

  async analyzeStartupProgress(
    metrics: ProcessedMetrics,
    context: ProjectContext
  ): Promise<StartupAnalysis> {
    
    // 进度分析
    const progressAnalysis = await this.analyzeProgress(metrics);
    
    // 风险评估
    const riskAssessment = await this.assessRisks(metrics, context);
    
    // 建议生成
    const recommendations = await this.generateRecommendations(
      progressAnalysis,
      riskAssessment,
      context
    );
    
    // 资源匹配
    const resourceMatches = await this.matchResources(recommendations, context);
    
    return {
      progressAnalysis,
      riskAssessment,
      recommendations,
      resourceMatches,
      timestamp: new Date()
    };
  }

  private async analyzeProgress(metrics: ProcessedMetrics): Promise<ProgressAnalysis> {
    const prompt = `
      基于以下开发指标分析项目进度：
      - 代码行数变化：${metrics.codeLines}
      - 提交频率：${metrics.commitFrequency}
      - 功能完成度：${metrics.featureCompletion}
      - 测试覆盖率：${metrics.testCoverage}
      
      请分析：
      1. 当前开发阶段
      2. 进度健康度
      3. 预计里程碑时间
      4. 潜在瓶颈
    `;

    const analysis = await this.llmClient.analyze(prompt);
    return this.parseProgressAnalysis(analysis);
  }

  private async generateRecommendations(
    progress: ProgressAnalysis,
    risks: RiskAssessment,
    context: ProjectContext
  ): Promise<Recommendation[]> {
    
    const recommendations: Recommendation[] = [];
    
    // 技术建议
    if (progress.codeQuality < 0.7) {
      recommendations.push({
        type: 'technical',
        priority: 'high',
        title: '代码质量改进',
        description: '建议进行代码重构和增加测试覆盖',
        actionItems: [
          '设置代码质量门禁',
          '增加单元测试',
          '进行代码审查'
        ],
        resources: await this.findTechnicalExperts(context.technologies)
      });
    }
    
    // 资源建议
    if (risks.timelineRisk > 0.6) {
      recommendations.push({
        type: 'resource',
        priority: 'medium',
        title: '团队扩充建议',
        description: '当前进度存在延期风险，建议增加开发资源',
        actionItems: [
          '招聘新的开发人员',
          '外包部分功能开发',
          '重新评估功能优先级'
        ],
        resources: await this.findDevelopmentResources(context)
      });
    }
    
    // 商业建议
    if (progress.stage === 'mvp' && progress.completion > 0.8) {
      recommendations.push({
        type: 'business',
        priority: 'high',
        title: '市场验证准备',
        description: 'MVP即将完成，建议开始市场验证准备',
        actionItems: [
          '准备用户测试',
          '制定市场推广策略',
          '寻找早期用户'
        ],
        resources: await this.findMarketingResources(context)
      });
    }
    
    return recommendations;
  }
}
```

## 数据模型设计

### 1. 开发指标数据结构
```typescript
interface DevelopmentMetrics {
  projectId: string;
  timestamp: Date;
  userId: string;
  
  // 代码指标
  codeMetrics: {
    totalLines: number;
    linesAdded: number;
    linesDeleted: number;
    filesModified: string[];
    complexity: {
      cyclomatic: number;
      cognitive: number;
      halstead: HalsteadMetrics;
    };
  };
  
  // Git指标
  gitMetrics: {
    commits: GitCommit[];
    branches: string[];
    mergeRequests: number;
    codeReviews: number;
  };
  
  // 工作模式指标
  workMetrics: {
    sessionDuration: number;
    productiveTime: number;
    breakFrequency: number;
    focusScore: number;
  };
  
  // 技术栈指标
  techMetrics: {
    languages: LanguageUsage[];
    frameworks: FrameworkUsage[];
    libraries: LibraryUsage[];
    tools: ToolUsage[];
  };
  
  // 质量指标
  qualityMetrics: {
    testCoverage: number;
    bugDensity: number;
    securityIssues: number;
    performanceMetrics: PerformanceMetrics;
  };
}

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
  filesChanged: string[];
  linesAdded: number;
  linesDeleted: number;
  type: 'feature' | 'fix' | 'refactor' | 'docs' | 'test';
}

interface LanguageUsage {
  language: string;
  linesOfCode: number;
  percentage: number;
  files: number;
}

interface FrameworkUsage {
  name: string;
  version: string;
  usage: 'primary' | 'secondary' | 'testing';
  complexity: number;
}
```

### 2. 分析结果数据结构
```typescript
interface StartupAnalysis {
  projectId: string;
  timestamp: Date;
  version: string;
  
  // 进度分析
  progressAnalysis: {
    currentPhase: 'concept' | 'prototype' | 'mvp' | 'beta' | 'production';
    completion: number; // 0-1
    velocity: VelocityMetrics;
    milestones: Milestone[];
    timeline: TimelineProjection;
  };
  
  // 风险评估
  riskAssessment: {
    overall: number; // 0-1
    technical: TechnicalRisk;
    timeline: TimelineRisk;
    resource: ResourceRisk;
    market: MarketRisk;
  };
  
  // 建议
  recommendations: Recommendation[];
  
  // 资源匹配
  resourceMatches: ResourceMatch[];
  
  // 预测
  predictions: {
    nextMilestone: Date;
    launchDate: Date;
    resourceNeeds: ResourceProjection[];
    successProbability: number;
  };
}

interface Recommendation {
  id: string;
  type: 'technical' | 'resource' | 'business' | 'process';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: number; // 0-1
  effort: number; // 0-1
  actionItems: string[];
  resources: ResourceMatch[];
  deadline?: Date;
  dependencies?: string[];
}

interface ResourceMatch {
  type: 'expert' | 'service' | 'tool' | 'funding';
  id: string;
  name: string;
  description: string;
  matchScore: number; // 0-1
  availability: boolean;
  cost?: number;
  contactInfo?: ContactInfo;
}
```

## API接口设计

### 1. MCP工具接口
```typescript
// 同步开发进度
interface SyncProgressTool {
  name: "sync_development_progress";
  input: {
    projectId: string;
    metrics: DevelopmentMetrics;
    timestamp: string;
    options?: {
      skipAnalysis?: boolean;
      batchMode?: boolean;
    };
  };
  output: {
    success: boolean;
    analysisId?: string;
    recommendations?: Recommendation[];
    errors?: string[];
  };
}

// 获取创业建议
interface GetRecommendationsTool {
  name: "get_startup_recommendations";
  input: {
    projectId: string;
    context?: ProjectContext;
    focusArea?: 'technical' | 'business' | 'resource' | 'all';
  };
  output: {
    recommendations: Recommendation[];
    analysis: StartupAnalysis;
    nextSteps: string[];
  };
}

// 分析代码质量
interface AnalyzeCodeQualityTool {
  name: "analyze_code_quality";
  input: {
    projectId: string;
    codeMetrics: CodeMetrics;
    files?: string[];
    analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
  };
  output: {
    qualityScore: number;
    issues: QualityIssue[];
    recommendations: TechnicalRecommendation[];
    trends: QualityTrend[];
  };
}
```

### 2. REST API接口
```typescript
// 项目仪表板数据
GET /api/v1/projects/{projectId}/dashboard
Response: {
  project: ProjectInfo;
  metrics: DashboardMetrics;
  timeline: TimelineData;
  team: TeamMetrics;
  recent_activity: Activity[];
}

// 团队分析数据
GET /api/v1/projects/{projectId}/team-analytics
Response: {
  team_size: number;
  collaboration_score: number;
  productivity_trends: ProductivityTrend[];
  skill_distribution: SkillDistribution;
  work_patterns: WorkPattern[];
}

// 实时指标推送
WebSocket /ws/projects/{projectId}/metrics
Message: {
  type: 'metric_update' | 'analysis_complete' | 'recommendation';
  data: MetricUpdate | AnalysisResult | Recommendation;
  timestamp: string;
}
```

## 安全与隐私设计

### 1. 数据安全
```typescript
interface SecurityConfig {
  // 数据加密
  encryption: {
    algorithm: 'AES-256-GCM';
    keyRotation: '30d';
    transitEncryption: true;
    storageEncryption: true;
  };
  
  // 访问控制
  access: {
    authentication: 'OAuth2' | 'JWT';
    authorization: 'RBAC';
    sessionTimeout: '24h';
    multiFactorAuth: boolean;
  };
  
  // 数据处理
  dataProcessing: {
    anonymization: boolean;
    retention: '2y';
    deletion: 'automatic';
    audit: boolean;
  };
}
```

### 2. 隐私保护
```typescript
interface PrivacySettings {
  // 数据收集级别
  dataCollection: {
    level: 'minimal' | 'metadata' | 'full';
    codeContent: boolean;
    personalInfo: boolean;
    workingHours: boolean;
  };
  
  // 数据共享
  dataSharing: {
    anonymousAnalytics: boolean;
    teamVisibility: boolean;
    platformAnalytics: boolean;
    thirdPartyIntegration: boolean;
  };
  
  // 用户控制
  userControl: {
    dataExport: boolean;
    dataDeletion: boolean;
    consentManagement: boolean;
    transparencyReport: boolean;
  };
}
```

## 部署与运维

### 1. 部署架构
```yaml
# docker-compose.yml
version: '3.8'
services:
  mcp-server:
    image: startup-planet/mcp-server:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://user:pass@postgres:5432/startup_planet
    depends_on:
      - redis
      - postgres
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=startup_planet
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

### 2. 监控配置
```typescript
interface MonitoringConfig {
  metrics: {
    system: SystemMetrics;
    application: ApplicationMetrics;
    business: BusinessMetrics;
  };
  
  alerts: {
    performance: PerformanceAlert[];
    errors: ErrorAlert[];
    security: SecurityAlert[];
  };
  
  logging: {
    level: 'info' | 'debug' | 'warn' | 'error';
    format: 'json' | 'structured';
    retention: '30d';
    sampling: 0.1;
  };
}
```

这个技术规格文档提供了MCP连接插件系统的完整技术实现方案。接下来我们可以基于这些规格开始具体的开发工作。您希望先从哪个组件开始实现？ 