#!/bin/bash

# 创业星球多智能体系统部署脚本

set -e

echo "🚀 开始部署创业星球多智能体系统..."

# 检查环境变量
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ 错误: 请设置 OPENAI_API_KEY 环境变量"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ 错误: 请设置 DB_PASSWORD 环境变量"
    exit 1
fi

# 创建必要的目录
echo "📁 创建部署目录..."
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/redis
mkdir -p ssl

# 构建前端
echo "🔨 构建前端应用..."
cd ../frontend
npm run build
cd ../docker

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose -f docker-compose.prod.yml down

# 清理旧镜像 (可选)
echo "🧹 清理旧镜像..."
docker system prune -f

# 构建并启动服务
echo "🏗️ 构建并启动服务..."
docker-compose -f docker-compose.prod.yml up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🔍 检查服务状态..."
services=("joyagent-backend" "genie-tool" "genie-client" "postgres" "redis")

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "$service.*Up"; then
        echo "✅ $service 运行正常"
    else
        echo "❌ $service 启动失败"
        docker-compose -f docker-compose.prod.yml logs $service
    fi
done

# 显示服务状态
echo "📊 服务状态:"
docker-compose -f docker-compose.prod.yml ps

echo "🎉 部署完成!"
echo ""
echo "📝 访问信息:"
echo "  - 网站: http://your-domain.com"
echo "  - API文档: http://your-domain.com/api/agents/swagger-ui.html"
echo "  - 健康检查: http://your-domain.com/health"
echo ""
echo "📋 管理命令:"
echo "  - 查看日志: docker-compose -f docker-compose.prod.yml logs -f [service]"
echo "  - 重启服务: docker-compose -f docker-compose.prod.yml restart [service]"
echo "  - 停止服务: docker-compose -f docker-compose.prod.yml down"
echo ""
echo "⚠️  注意事项:"
echo "  - 请确保防火墙开放80和443端口"
echo "  - 建议配置SSL证书"
echo "  - 定期备份数据库"