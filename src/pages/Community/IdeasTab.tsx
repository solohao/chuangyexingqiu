import React, { useState } from 'react';
import IdeaCard from '../../components/specialized/IdeaCard';
import { Idea } from '../../types/community.types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Flame, Sparkles, Award } from 'lucide-react';

const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'AI驱动的个人理财助手',
    author: { name: '小明', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704a' },
    createdAt: '2天前',
    views: 234,
    comments: 12,
    upvotes: 156,
    downvotes: 12,
    description: '基于机器学习的智能理财建议平台，帮助用户优化投资组合，实现财富增值。',
    tags: ['AI', '金融', '移动应用'],
    isLookingForTeammates: true,
  },
  {
    id: '2',
    title: '基于区块链的版权保护平台',
    author: { name: '创意王', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704b' },
    createdAt: '1周前',
    views: 567,
    comments: 28,
    upvotes: 289,
    downvotes: 23,
    description: '利用区块链技术的不可篡改性，为数字内容创作者提供可靠的版权登记和维权服务。',
    tags: ['区块链', '版权', 'Web3'],
    isLookingForTeammates: true,
  },
  {
    id: '3',
    title: 'VR虚拟购物体验平台',
    author: { name: '设计狮', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704c' },
    createdAt: '3天前',
    views: 445,
    comments: 18,
    upvotes: 178,
    downvotes: 8,
    description: '结合VR技术的在线购物平台，让用户在家就能身临其境地体验商品，提升购物乐趣。',
    tags: ['VR', '电商', '3D技术'],
    isLookingForTeammates: false,
  },
];

type SortKey = 'hot' | 'newest' | 'featured';

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


const IdeasTab: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [activeSort, setActiveSort] = useState<SortKey>('hot');

  const sortOptions: { key: SortKey; label: string; icon: React.ElementType }[] = [
    { key: 'hot', label: '热门', icon: Flame },
    { key: 'newest', label: '最新', icon: Sparkles },
    { key: 'featured', label: '精华', icon: Award },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-1/4 space-y-4">
        <FilterAccordion title="搜索筛选">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索创意..." className="input w-full pl-9 text-sm" />
          </div>
        </FilterAccordion>
        
        <FilterAccordion title="分类">
          <ul className="space-y-2 text-sm">
            <li className="font-semibold text-primary-600 cursor-pointer">全部</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">金融科技</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">电商</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">教育</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">健康</li>
          </ul>
        </FilterAccordion>

        <FilterAccordion title="热度">
          <ul className="space-y-2 text-sm">
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">本周热门</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">本月热门</li>
            <li className="text-gray-600 cursor-pointer hover:text-primary-600">历史热门</li>
          </ul>
        </FilterAccordion>

        <FilterAccordion title="状态">
          <label className="flex items-center text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2" />
            寻找队友
          </label>
        </FilterAccordion>
      </aside>
      <main className="w-full md:w-3/4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center bg-white p-1 rounded-lg shadow-sm border">
            {sortOptions.map(option => (
              <button
                key={option.key}
                onClick={() => setActiveSort(option.key)}
                className={`flex items-center px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                  activeSort === option.key
                    ? 'bg-primary-500 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <option.icon className="w-4 h-4 mr-2" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {ideas.map((idea, index) => (
              <IdeaCard key={idea.id} idea={{ ...idea, rank: index + 1 }} />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default IdeasTab;
