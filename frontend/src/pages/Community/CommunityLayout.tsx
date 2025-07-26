import React, { useState } from 'react';
import { Lightbulb, Wrench, Bot, Milestone, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IdeasTab from './IdeasTab';
import SkillsTab from './SkillsTab';
import FeaturesTab from './FeaturesTab';
import { useUiStore } from '../../store/uiStore';

type CommunityTab = 'ideas' | 'skills' | 'requests' | 'events';

const communityTabs: { id: CommunityTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'ideas', label: '创意市场', icon: Lightbulb },
  { id: 'skills', label: '大师工坊', icon: Wrench },
  { id: 'requests', label: '功能需求', icon: Bot },
  { id: 'events', label: '活动中心', icon: Milestone },
];

const CommunityLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CommunityTab>('ideas');
  const { openPublishModal } = useUiStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'ideas':
        return <IdeasTab />;
      case 'skills':
        return <SkillsTab />;
      case 'requests':
        return <FeaturesTab />;
      case 'events':
        return <div>活动中心正在建设中...</div>;
      default:
        return <IdeasTab />;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">社区广场</h1>
        <button onClick={openPublishModal} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          发布内容
        </button>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {communityTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="inline-block w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CommunityLayout;
