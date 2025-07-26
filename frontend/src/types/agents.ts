// 基于现有后端架构的智能体前端类型定义
// 导入共享类型
import type { 
  AgentInfo as SharedAgentInfo, 
  AgentCategory as SharedAgentCategory,
  AgentStatus as SharedAgentStatus,
  AgentType,
  AgentConfig,
  AgentMetrics,
  ProjectContext,
  UserPreferences
} from '../../../shared/types/agent.types';

// 前端特定的智能体信息接口（兼容现有代码）
export interface AgentInfo extends Omit<SharedAgentInfo, 'type'> {
    type: AgentType; // 确保type字段必须存在
    isAvailable: boolean; // 兼容现有代码
    icon: string; // 添加图标属性
    color: string; // 添加颜色属性
}

export interface AgentCategory extends SharedAgentCategory {}

// 导入MESSAGE类型定义
import './message';

// 扩展现有的MESSAGE命名空间
declare global {
    namespace MESSAGE {
        interface AgentCatalog {
            agents: AgentInfo[];
            categories: AgentCategory[];
        }

        interface WorkflowVisualization {
            currentWorkflow?: MESSAGE.MultiAgent;
            isVisible: boolean;
            expandedView: boolean;
        }
    }
}

// 智能体分类配置
export const AGENT_CATEGORIES: AgentCategory[] = [
    {
        id: 'business-strategy',
        name: '商业策略',
        description: '商业模式、战略规划、市场分析',
        icon: '💼',
        color: '#3B82F6'
    },
    {
        id: 'market-analysis',
        name: '市场分析',
        description: '市场研究、竞争分析、客户细分',
        icon: '📊',
        color: '#10B981'
    },
    {
        id: 'tech-development',
        name: '技术开发',
        description: '技术栈推荐、架构设计、开发规划',
        icon: '⚙️',
        color: '#6366F1'
    },
    {
        id: 'finance-analysis',
        name: '财务分析',
        description: '财务建模、投资分析、融资策略',
        icon: '💰',
        color: '#EF4444'
    },
    {
        id: 'legal-consulting',
        name: '法律咨询',
        description: '法规合规、知识产权、合同分析',
        icon: '⚖️',
        color: '#8B5CF6'
    },
    {
        id: 'resources',
        name: '资源匹配',
        description: '政策匹配、孵化器推荐、资源对接',
        icon: '🔗',
        color: '#F59E0B'
    }
];

// 基于后端智能体的配置
export const AVAILABLE_AGENTS: AgentInfo[] = [
    // 商业策略智能体
    {
        id: 'business_canvas_agent',
        name: '商业模式画布',
        description: '引导完成九大要素分析：客户细分、价值主张、渠道通路等',
        type: 'business-strategy',
        category: AGENT_CATEGORIES.find(c => c.id === 'business-strategy')!,
        capabilities: ['商业模式设计', '价值主张分析', '客户细分', '收入模式'],
        status: 'available',
        averageResponseTime: 3000,
        successRate: 0.95,
        userRating: 4.8,
        usageCount: 1250,
        lastUsed: new Date('2024-01-15'),
        isRecommended: true,
        isPopular: true,
        tags: ['商业模式', '画布', '策略'],
        examples: ['帮我分析我的SaaS产品的商业模式', '我想了解我的客户细分'],
        isAvailable: true,
        icon: '🎯',
        color: '#3B82F6'
    },
    {
        id: 'swot_analysis_agent',
        name: 'SWOT分析',
        description: '全面分析项目的优势、劣势、机会和威胁',
        type: 'market-analysis',
        category: AGENT_CATEGORIES.find(c => c.id === 'market-analysis')!,
        capabilities: ['优势分析', '劣势识别', '机会发现', '威胁评估'],
        status: 'available',
        averageResponseTime: 2500,
        successRate: 0.92,
        userRating: 4.6,
        usageCount: 980,
        lastUsed: new Date('2024-01-14'),
        isRecommended: true,
        isPopular: false,
        tags: ['SWOT', '分析', '评估'],
        examples: ['分析我的创业项目的SWOT', '评估我们的竞争优势'],
        isAvailable: true,
        icon: '⚖️',
        color: '#10B981'
    },
    {
        id: 'policy_matching_agent',
        name: '政策匹配',
        description: '智能匹配适合的政策支持和补贴机会',
        type: 'legal-consulting',
        category: AGENT_CATEGORIES.find(c => c.id === 'resources')!,
        capabilities: ['政策解读', '补贴申请', '合规检查', '资质评估'],
        status: 'available',
        averageResponseTime: 4000,
        successRate: 0.88,
        userRating: 4.4,
        usageCount: 750,
        lastUsed: new Date('2024-01-13'),
        isRecommended: false,
        isPopular: true,
        tags: ['政策', '补贴', '合规'],
        examples: ['查找适合我的创业补贴政策', '了解高新技术企业认定条件'],
        isAvailable: true,
        icon: '📜',
        color: '#8B5CF6'
    },
    {
        id: 'incubator_agent',
        name: '孵化器推荐',
        description: '根据项目特点智能推荐合适的孵化器',
        type: 'business-strategy',
        category: AGENT_CATEGORIES.find(c => c.id === 'resources')!,
        capabilities: ['孵化器匹配', '申请指导', '资源对接', '发展建议'],
        status: 'available',
        averageResponseTime: 3500,
        successRate: 0.90,
        userRating: 4.5,
        usageCount: 620,
        lastUsed: new Date('2024-01-12'),
        isRecommended: false,
        isPopular: false,
        tags: ['孵化器', '加速器', '投资'],
        examples: ['推荐适合AI项目的孵化器', '如何申请知名加速器'],
        isAvailable: true,
        icon: '🏢',
        color: '#8B5CF6'
    },
    // 新增智能体
    {
        id: 'market_research_agent',
        name: '市场研究',
        description: '深度市场调研、行业分析、竞争对手研究',
        type: 'market-analysis',
        category: AGENT_CATEGORIES.find(c => c.id === 'market-analysis')!,
        capabilities: ['市场规模分析', '竞争对手研究', '行业趋势', '用户调研'],
        status: 'available',
        averageResponseTime: 5000,
        successRate: 0.87,
        userRating: 4.3,
        usageCount: 450,
        isRecommended: false,
        isPopular: false,
        tags: ['市场', '调研', '竞争'],
        examples: ['分析AI教育市场规模', '研究主要竞争对手'],
        isAvailable: true,
        icon: '🔍',
        color: '#10B981'
    },
    {
        id: 'tech_stack_agent',
        name: '技术栈推荐',
        description: '根据项目需求推荐最适合的技术栈和架构',
        type: 'tech-development',
        category: AGENT_CATEGORIES.find(c => c.id === 'tech-development')!,
        capabilities: ['技术选型', '架构设计', '性能优化', '技术风险评估'],
        status: 'available',
        averageResponseTime: 3800,
        successRate: 0.93,
        userRating: 4.7,
        usageCount: 820,
        isRecommended: true,
        isPopular: false,
        tags: ['技术', '架构', '开发'],
        examples: ['推荐适合电商平台的技术栈', '设计微服务架构'],
        isAvailable: true,
        icon: '⚙️',
        color: '#6366F1'
    },
    {
        id: 'financial_model_agent',
        name: '财务建模',
        description: '创建财务模型、投资回报分析、融资规划',
        type: 'finance-analysis',
        category: AGENT_CATEGORIES.find(c => c.id === 'finance-analysis')!,
        capabilities: ['财务预测', '投资分析', '成本核算', '融资策略'],
        status: 'available',
        averageResponseTime: 4500,
        successRate: 0.89,
        userRating: 4.2,
        usageCount: 380,
        isRecommended: false,
        isPopular: false,
        tags: ['财务', '建模', '投资'],
        examples: ['制作3年财务预测模型', '分析投资回报率'],
        isAvailable: true,
        icon: '💰',
        color: '#EF4444'
    }
];

// 智能体交互模式
export type AgentMode = 'orchestrated' | 'direct';

// 智能体状态
export type AgentStatus = 'available' | 'busy' | 'offline';

export interface AgentInteractionState {
    mode: AgentMode;
    selectedAgentId?: string;
    showAgentMenu: boolean;
    showWorkflowVisualization: boolean;
    expandedWorkflowView: boolean;
}