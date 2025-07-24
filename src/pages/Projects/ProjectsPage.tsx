import React, { useState } from 'react';
import { Briefcase, Filter, Search } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Briefcase className="mr-2 h-8 w-8 text-primary-600" />
            创业项目市场
          </h1>
          <p className="text-gray-600 mt-2">
            发现优质创业项目，寻找合作伙伴，实现创业梦想
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索项目..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="ml-2 px-4 py-2 flex items-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
            <Filter className="w-5 h-5 mr-2" />
            筛选
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-500">项目列表将在这里显示</p>
      </div>
    </div>
  );
};

export default ProjectsPage; 