# 🤝 贡献指南

欢迎参与创业星球项目的开发！我们非常欢迎各种形式的贡献，包括但不限于代码贡献、文档改进、bug报告、功能建议等。

## 📋 贡献方式

### 🐛 报告Bug
如果您发现了bug，请通过以下方式报告：

1. **检查现有Issue** - 确保该bug尚未被报告
2. **创建详细的Bug报告** - 使用Issue模板提供完整信息
3. **提供复现步骤** - 让我们能够重现问题

### 💡 功能建议
我们欢迎新功能的建议：

1. **查看产品路线图** - 确保功能符合项目方向
2. **使用功能请求模板** - 详细描述功能需求和价值
3. **参与讨论** - 在Issue中与团队和社区讨论

### 💻 代码贡献
参与代码开发的完整流程：

1. **Fork项目** - 创建您自己的项目副本
2. **创建功能分支** - 从`develop`分支创建新分支
3. **编写代码** - 遵循我们的编码规范
4. **编写测试** - 确保代码质量
5. **提交PR** - 使用我们的PR模板

## 🚀 开发环境搭建

### 系统要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git >= 2.30.0

### 环境搭建步骤

```bash
# 1. Fork并克隆项目
git clone https://github.com/your-username/startup-planet.git
cd startup-planet

# 2. 添加上游仓库
git remote add upstream https://github.com/startup-planet/startup-planet.git

# 3. 安装依赖
npm install

# 4. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，填入必要的配置

# 5. 启动开发服务器
npm run dev

# 6. 运行测试
npm test
```

### 开发工具配置

#### VSCode推荐插件
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

#### 必需的开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Husky** - Git钩子管理
- **Commitizen** - 规范化提交信息

## 📝 编码规范

### TypeScript规范

#### 1. 类型定义
```typescript
// ✅ 推荐 - 明确的类型定义
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

// ❌ 避免 - 使用any类型
const user: any = getData();
```

#### 2. 函数定义
```typescript
// ✅ 推荐 - 清晰的函数签名
async function createProject(
  data: CreateProjectRequest
): Promise<Project | null> {
  // 实现逻辑
}

// ❌ 避免 - 模糊的参数类型
function createProject(data: any): any {
  // 实现逻辑
}
```

#### 3. 组件定义
```typescript
// ✅ 推荐 - 使用接口定义Props
interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  className
}) => {
  // 组件实现
};
```

### React组件规范

#### 1. 组件结构
```typescript
// 推荐的组件文件结构
import React, { useState, useEffect, useCallback } from 'react';
import { SomeExternalLibrary } from 'external-lib';

import { InternalComponent } from '../components';
import { useCustomHook } from '../hooks';
import { utilityFunction } from '../utils';

import type { ComponentProps } from './types';

// 接口定义
interface ProjectCardProps {
  // props定义
}

// 主组件
export const ProjectCard: React.FC<ProjectCardProps> = (props) => {
  // 状态定义
  const [state, setState] = useState();
  
  // 自定义Hook
  const customData = useCustomHook();
  
  // useEffect
  useEffect(() => {
    // 副作用逻辑
  }, []);
  
  // 事件处理器
  const handleClick = useCallback(() => {
    // 处理逻辑
  }, []);
  
  // 渲染逻辑
  return (
    <div>
      {/* JSX内容 */}
    </div>
  );
};
```

#### 2. 自定义Hook规范
```typescript
// ✅ 推荐 - 清晰的Hook定义
export function useProjectData(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject(projectId)
      .then(setProject)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  return { project, loading, error };
}
```

### 样式规范

#### 1. TailwindCSS使用
```typescript
// ✅ 推荐 - 语义化类名组合
const buttonClasses = clsx(
  'inline-flex items-center justify-center',
  'px-4 py-2 text-sm font-medium',
  'border border-transparent rounded-md',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
    'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
  }
);

// ❌ 避免 - 过长的内联类名
<button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700">
```

#### 2. CSS模块化
```scss
// styles/components/ProjectCard.module.scss
.container {
  @apply bg-white rounded-lg shadow-md p-6;
  
  &:hover {
    @apply shadow-lg transform scale-105;
    transition: all 0.2s ease-in-out;
  }
}

.title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}
```

## 🔧 Git工作流

### 分支策略
我们使用Git Flow工作流：

```
main (生产环境)
  ↑
develop (开发环境)
  ↑
feature/xxx (功能分支)
hotfix/xxx (热修复分支)
release/xxx (发布分支)
```

### 分支命名规范
```bash
# 功能分支
feature/add-map-integration
feature/user-authentication

# 修复分支
fix/map-loading-bug
fix/login-validation

# 热修复分支
hotfix/critical-security-patch

# 发布分支
release/v1.0.0
```

### 提交信息规范
我们使用[Conventional Commits](https://www.conventionalcommits.org/)规范：

```bash
# 功能添加
feat: add user authentication system
feat(map): integrate Amap API for location services

# 修复bug
fix: resolve login validation issue
fix(ui): correct button alignment on mobile

# 文档更新
docs: update API documentation
docs(readme): add setup instructions

# 样式调整
style: format code with prettier
style(ui): adjust spacing in navigation

# 重构
refactor: extract user service logic
refactor(hooks): optimize useAuth hook

# 性能优化
perf: optimize map rendering performance
perf(api): reduce database query time

# 测试
test: add unit tests for auth service
test(e2e): add login flow tests

# 构建相关
build: update webpack configuration
build(deps): bump react version to 18.2.0

# CI/CD
ci: add automated testing workflow
ci(deploy): configure production deployment
```

### 提交流程
```bash
# 1. 创建并切换到新分支
git checkout -b feature/new-feature

# 2. 进行开发工作
# ... 编写代码 ...

# 3. 添加并提交更改
git add .
git commit -m "feat: add new amazing feature"

# 4. 推送到远程分支
git push origin feature/new-feature

# 5. 创建Pull Request
# 通过GitHub界面创建PR
```

## 📋 Pull Request流程

### PR创建前检查清单
- [ ] 代码符合项目编码规范
- [ ] 已添加必要的测试用例
- [ ] 测试用例全部通过
- [ ] 已更新相关文档
- [ ] 提交信息符合规范
- [ ] 分支与`develop`保持同步

### PR模板
```markdown
## 📋 变更描述
简要描述此PR的变更内容

## 🎯 变更类型
- [ ] 新功能 (feature)
- [ ] 修复bug (fix)
- [ ] 文档更新 (docs)
- [ ] 样式调整 (style)
- [ ] 重构 (refactor)
- [ ] 性能优化 (perf)
- [ ] 测试 (test)

## 🧪 测试
描述已进行的测试：
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试完成

## 📷 截图
如果涉及UI变更，请提供截图

## 📝 额外说明
其他需要说明的内容
```

### 代码审查规范

#### 审查者职责
- **及时响应** - 48小时内完成审查
- **建设性反馈** - 提供具体的改进建议
- **知识分享** - 分享最佳实践和经验
- **质量把关** - 确保代码质量和项目标准

#### 常见审查要点
1. **代码质量**
   - 逻辑清晰，易于理解
   - 无明显性能问题
   - 错误处理完善

2. **安全性**
   - 无SQL注入等安全漏洞
   - 敏感信息未泄露
   - 权限检查完备

3. **可维护性**
   - 代码结构清晰
   - 命名规范一致
   - 注释适当且有意义

4. **测试覆盖**
   - 关键逻辑有测试覆盖
   - 边界条件已考虑
   - 测试用例有意义

## 🧪 测试规范

### 测试层次
1. **单元测试** - 测试独立函数和组件
2. **集成测试** - 测试组件间交互
3. **端到端测试** - 测试完整用户流程

### 测试文件结构
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
```

### 测试示例
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
  });
});
```

## 📚 文档贡献

### 文档类型
- **API文档** - 接口说明和示例
- **组件文档** - 组件使用指南
- **教程文档** - 步骤化指导
- **架构文档** - 系统设计说明

### 文档写作规范
1. **结构清晰** - 使用合适的标题层级
2. **内容完整** - 包含必要的示例和说明
3. **语言简洁** - 避免冗余和歧义
4. **更新及时** - 与代码变更保持同步

## 🎖️ 贡献者识别

### 贡献类型
我们使用[All Contributors](https://allcontributors.org/)规范识别贡献：

- 💻 代码贡献
- 📖 文档贡献
- 🐛 Bug报告
- 💡 想法建议
- 🎨 设计贡献
- 📋 项目管理
- 👀 代码审查
- 🧪 测试贡献

### 成为核心贡献者
满足以下条件的贡献者可申请成为核心团队成员：
- 至少3个月的活跃贡献
- 10+ PR被合并
- 参与项目决策讨论
- 帮助其他贡献者

## 🆘 获取帮助

### 沟通渠道
- **GitHub Discussions** - 技术讨论和问答
- **GitHub Issues** - Bug报告和功能建议
- **微信群** - 实时交流 (联系管理员邀请)
- **邮件** - contribute@startupplanet.com

### 常见问题
1. **如何选择第一个贡献？**
   - 查找标记为`good first issue`的Issue
   - 从文档改进开始
   - 修复简单的UI问题

2. **PR被拒绝了怎么办？**
   - 仔细阅读审查意见
   - 修改后重新提交
   - 在评论中询问具体问题

3. **如何跟上项目进展？**
   - Watch项目仓库
   - 订阅项目邮件列表
   - 参与每周社区会议

## 📄 行为准则

我们承诺为所有人提供无骚扰的参与体验，请遵守我们的[行为准则](./CODE_OF_CONDUCT.md)。

## 📞 联系我们

- **项目负责人**: maintainer@startupplanet.com
- **技术问题**: tech@startupplanet.com
- **社区管理**: community@startupplanet.com

---

感谢您考虑为创业星球项目做出贡献！每一个贡献都让这个项目变得更好。💙

**最后更新**: 2024-01-26 