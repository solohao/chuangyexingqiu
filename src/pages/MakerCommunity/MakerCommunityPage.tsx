import React, { useState } from 'react';
import { Users, MessageCircle, Calendar, Award, Hash } from 'lucide-react';

const MakerCommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('showcase');
  
  const tabs = [
    { id: 'showcase', name: '创客展示', icon: Users },
    { id: 'discussions', name: '创业讨论', icon: MessageCircle },
    { id: 'events', name: '社区活动', icon: Calendar },
    { id: 'achievements', name: '创业成果', icon: Award },
    { id: 'topics', name: '热门话题', icon: Hash },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="mr-2 h-8 w-8 text-primary-600" />
          创客之家
        </h1>
        <p className="text-gray-600 mt-2">
          连接创业者，分享经验，共同成长的社区平台
        </p>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 flex items-center font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className={`mr-2 h-5 w-5 ${
                  activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'
                }`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'showcase' && (
          <div className="text-center text-gray-500">
            创客展示内容将在这里显示
          </div>
        )}
        
        {activeTab === 'discussions' && (
          <div className="text-center text-gray-500">
            创业讨论内容将在这里显示
          </div>
        )}
        
        {activeTab === 'events' && (
          <div className="text-center text-gray-500">
            社区活动内容将在这里显示
          </div>
        )}
        
        {activeTab === 'achievements' && (
          <div className="text-center text-gray-500">
            创业成果内容将在这里显示
          </div>
        )}
        
        {activeTab === 'topics' && (
          <div className="text-center text-gray-500">
            热门话题内容将在这里显示
          </div>
        )}
      </div>
    </div>
  );
};

export default MakerCommunityPage; 