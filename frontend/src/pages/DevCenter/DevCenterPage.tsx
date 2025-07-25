import React, { useState } from 'react';
import { Code, Search, PlusCircle, Zap, CheckCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FeatureRequestCard from '../../components/specialized/FeatureRequestCard';
import { FeatureRequest } from '../../types/devcenter.types';

// 移除内联类型定义
//interface FeatureRequest { ... }

// 模拟数据
const mockFeatureRequests: FeatureRequest[] = [
  {
    id: 'FR001',
    title: '增加项目导出为PDF功能',
    points: 1250,
    status: '开发中',
    submitter: { name: '创新探路者', avatarUrl: '/images/avatar-1.png' },
    createdAt: '2023-10-25',
    description: '希望可以把项目的所有信息，包括创意、成员、进度等，一键导出为PDF，方便线下分享和存档。',
    tags: ['项目管理', '导出功能'],
    commentsCount: 32,
  },
  {
    id: 'FR002',
    title: '优化地图加载速度',
    points: 850,
    status: '待评估',
    submitter: { name: '地图爱好者', avatarUrl: '/images/avatar-2.png' },
    createdAt: '2023-10-22',
    description: '在网络环境较差的情况下，地图加载过慢，影响体验。希望能进行性能优化。',
    tags: ['地图', '性能优化'],
    commentsCount: 18,
  },
  {
    id: 'FR003',
    title: '引入AI智能匹配算法V2',
    points: 2500,
    status: '已完成',
    submitter: { name: '算法工程师', avatarUrl: '/images/avatar-3.png' },
    createdAt: '2023-09-15',
    description: '当前的匹配算法不够精准，建议引入更先进的V2版本，提升用户匹配成功率。',
    tags: ['AI匹配', '算法'],
    commentsCount: 55,
  },
  {
    id: 'FR004',
    title: '提供暗黑模式主题',
    points: 720,
    status: '待评估',
    submitter: { name: '夜猫子开发者', avatarUrl: '/images/avatar-4.png' },
    createdAt: '2023-10-26',
    description: '长时间在白色的背景下编码和查看项目对眼睛不太友好，希望能有一个官方的暗黑模式。',
    tags: ['UI/UX', '主题'],
    commentsCount: 9,
  },
];

// 筛选组件
interface FilterAccordionProps {
  title: string;
  children: React.ReactNode;
}

const FilterAccordion: React.FC<FilterAccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
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

const DevCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('requests');
  
  const tabs = [
    { id: 'requests', name: '功能需求' },
    { id: 'inProgress', name: '开发中' },
    { id: 'completed', name: '已完成' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Code className="mr-2 h-8 w-8 text-primary-600" />
            开发中心
          </h1>
          <p className="text-gray-600 mt-2">
            发布功能需求，跟踪开发进度，促进项目快速迭代
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <button className="px-4 py-2 flex items-center text-white bg-primary-600 hover:bg-primary-700 rounded-lg">
            <PlusCircle className="w-5 h-5 mr-2" />
            发布需求
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.id === 'requests' && <PlusCircle className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'}`} />}
                {tab.id === 'inProgress' && <Zap className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'}`} />}
                {tab.id === 'completed' && <CheckCircle className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'}`} />}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* 左侧筛选区 */}
        <aside className="w-full md:w-1/4 space-y-4">
          <FilterAccordion title="搜索需求">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索需求..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </FilterAccordion>

          <FilterAccordion title="筛选">
            <select className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>热门排序</option>
              <option>最新发布</option>
              <option>最多评论</option>
            </select>
          </FilterAccordion>
          
          <FilterAccordion title="状态">
            <div className="space-y-2 text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span>待评估</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span>开发中</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span>已完成</span>
              </label>
            </div>
          </FilterAccordion>
        </aside>

        {/* 右侧主内容区 */}
        <main className="flex-1">
          {activeTab === 'requests' && (
            <div>
              {/* 开发进度通报 */}
              <section className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">开发进度通报</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-green-50 p-4 rounded-lg"><p className="text-sm text-green-700 font-semibold">已完成</p><p className="text-3xl font-bold text-green-800">12</p></div>
                  <div className="bg-yellow-50 p-4 rounded-lg"><p className="text-sm text-yellow-700 font-semibold">开发中</p><p className="text-3xl font-bold text-yellow-800">5</p></div>
                  <div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm text-blue-700 font-semibold">下周计划</p><p className="text-3xl font-bold text-blue-800">3</p></div>
                </div>
              </section>

              {/* 功能需求列表 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">需求排行榜</h3>
                <div className="space-y-4">
                  {mockFeatureRequests.map((request, index) => (
                    <FeatureRequestCard key={request.id} {...request} rank={index + 1} />
                  ))}
                </div>
              </section>
            </div>
          )}
          
          {activeTab === 'inProgress' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">开发中的功能</h3>
              {mockFeatureRequests
                .filter(request => request.status === '开发中')
                .map((request) => (
                  <FeatureRequestCard key={request.id} {...request} />
                ))}
              {mockFeatureRequests.filter(request => request.status === '开发中').length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  暂无开发中的功能需求
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'completed' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">已完成的功能</h3>
              {mockFeatureRequests
                .filter(request => request.status === '已完成')
                .map((request) => (
                  <FeatureRequestCard key={request.id} {...request} />
                ))}
              {mockFeatureRequests.filter(request => request.status === '已完成').length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  暂无已完成的功能需求
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DevCenterPage; 