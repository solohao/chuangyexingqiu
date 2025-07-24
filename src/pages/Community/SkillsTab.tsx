import React, { useState } from 'react';
import SkillCard from '../../components/specialized/SkillCard';
import { SkillService } from '../../types/community.types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

const mockSkills: SkillService[] = [
  {
    id: 'skill-1',
    provider: { name: '李工', avatarUrl: 'https://i.pravatar.cc/150?u=skill1' },
    title: 'React专家',
    rating: 4.9,
    reviewsCount: 128,
    location: '深圳',
    pricePerDay: 500,
    tags: ['React', 'TypeScript', 'Next.js'],
    description: '5年前端开发经验，精通React生态，擅长复杂交互和高性能应用开发。提供组件开发、性能优化和技术咨询服务。',
    portfolioUrl: '#',
  },
  {
    id: 'skill-2',
    provider: { name: '王设计师', avatarUrl: 'https://i.pravatar.cc/150?u=skill2' },
    title: 'UI/UX全栈设计师',
    rating: 4.8,
    reviewsCount: 89,
    location: '北京',
    pricePerDay: 800,
    tags: ['Figma', 'Sketch', '用户研究', '原型设计'],
    description: '专注B端产品设计，有多个成功案例。从用户研究到界面交付，提供全流程设计服务。',
    portfolioUrl: '#',
  },
  {
    id: 'skill-3',
    provider: { name: '张大牛', avatarUrl: 'https://i.pravatar.cc/150?u=skill3' },
    title: '全栈工程师',
    rating: 5.0,
    reviewsCount: 156,
    location: '上海',
    pricePerDay: 1200,
    tags: ['Vue', 'Node.js', 'Docker', 'AWS'],
    description: '10年全栈开发经验，技术栈全面，精通后端架构设计与部署，擅长高并发系统。提供定制化开发解决方案。',
    portfolioUrl: '#',
  },
];

interface FilterAccordionProps {
  title: string;
  children: React.ReactNode;
}

const FilterAccordion: React.FC<FilterAccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center font-semibold text-gray-700 hover:text-gray-900 mb-3">
        {title}
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SkillsTab: React.FC = () => {
  const [skills] = useState<SkillService[]>(mockSkills);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 space-y-4">
        <FilterAccordion title="搜索服务">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索技能或服务..." className="input w-full pl-9 text-sm" />
          </div>
        </FilterAccordion>
        
        <FilterAccordion title="技能分类">
          <ul className="space-y-2 text-sm">
            <li className="font-semibold text-primary-600 cursor-pointer">全部</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">前端开发</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">后端开发</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">UI/UX设计</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">项目管理</li>
          </ul>
        </FilterAccordion>

        <FilterAccordion title="价格范围">
          <div className="flex items-center gap-2 text-sm">
            <input type="number" placeholder="最小" className="input w-1/2" />
            <span>-</span>
            <input type="number" placeholder="最大" className="input w-1/2" />
          </div>
        </FilterAccordion>

        <FilterAccordion title="评分">
          <ul className="space-y-2 text-sm">
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">4.5星及以上</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">4星及以上</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">3星及以上</li>
          </ul>
        </FilterAccordion>
        <button className="btn btn-primary w-full">应用筛选</button>
      </aside>
      <main className="w-full md:w-3/4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">技能服务列表 ({skills.length}条)</h2>
          <button className="btn btn-secondary">+ 发布我的技能</button>
        </div>
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {skills.map((service) => (
              <SkillCard key={service.id} skill={{
                ...service,
                pricePerHour: service.pricePerDay / 8, // 假设一天8小时
                featured: false,
                verified: service.rating > 4.5,
                category: service.tags[0] || 'other',
                provider: {
                  ...service.provider,
                  id: service.id,
                  rating: service.rating,
                  reviewsCount: service.reviewsCount,
                  membershipLevel: 'free' as const,
                  responseRate: 95,
                  responseTime: '2小时内'
                }
              }} />
            ))}
          </AnimatePresence>
        </motion.div>
        <div className="flex justify-center mt-6">
          <button className="btn btn-outline">加载更多...</button>
        </div>
      </main>
    </div>
  );
};

export default SkillsTab;
