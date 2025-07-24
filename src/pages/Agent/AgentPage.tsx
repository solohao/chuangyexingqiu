import React from 'react';
import { Bot, MessageSquare, Settings } from 'lucide-react';

const AgentPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Bot className="mr-2 h-8 w-8 text-primary-600" />
          创业Agent
        </h1>
        <p className="text-gray-600 mt-2">
          智能助手帮您解决创业过程中的各种问题，提供专业建议
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 h-[600px] flex flex-col">
            <div className="flex-grow overflow-y-auto p-4 bg-gray-50 rounded-lg mb-4">
              <div className="text-center text-gray-500 my-8">
                开始与创业Agent对话，获取专业建议和支持
              </div>
            </div>
            
            <div className="flex items-center">
              <input 
                type="text" 
                placeholder="输入您的问题..." 
                className="flex-grow px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="ml-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Settings className="mr-2 h-5 w-5 text-gray-600" />
              Agent设置
            </h2>
            <div className="space-y-4">
              <p className="text-center text-gray-500">
                Agent设置和选项将在这里显示
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPage; 