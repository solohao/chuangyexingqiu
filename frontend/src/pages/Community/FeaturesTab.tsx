import React, { useState } from 'react';
import { Plus } from 'lucide-react';
// import Button from '../../components/ui/Button';
// import Modal from '../../components/ui/Modal';
import CreateRequestForm from '../../components/specialized/CreateRequestForm';
import FeatureRequestCard from '../../components/specialized/FeatureRequestCard';
import { FeatureRequest } from '../../types/devcenter.types';

// 使用从 devcenter.types 导入的 FeatureRequest 类型

const mockFeatures: FeatureRequest[] = [
  {
    id: '1',
    title: '添加项目协作看板功能',
    description: '希望能够添加类似Trello的看板功能，方便团队协作管理任务',
    points: 23,
    commentsCount: 8,
    status: '开发中',
    createdAt: '2024-01-20',
    tags: ['协作', '项目管理'],
    submitter: { name: '张三', avatarUrl: '/default-avatar.png' }
  },
  {
    id: '2',
    title: '支持视频通话功能',
    description: '在聊天系统中集成视频通话功能，方便远程沟通',
    points: 18,
    commentsCount: 5,
    status: '待评估',
    createdAt: '2024-01-19',
    tags: ['通信', '视频'],
    submitter: { name: '李四', avatarUrl: '/default-avatar.png' }
  }
];

const FeaturesTab: React.FC = () => {
  const [features] = useState<FeatureRequest[]>(mockFeatures);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const statusMap = {
    'all': 'all',
    'pending': '待评估',
    'in-progress': '开发中',
    'completed': '已完成'
  } as const;

  const filteredFeatures = features.filter(feature => 
    filter === 'all' || feature.status === statusMap[filter]
  );

  // const handleCreateFeature = (data: any) => {
  //   const newFeature: FeatureRequest = {
  //     id: Date.now().toString(),
  //     title: data.title,
  //     description: data.description,
  //     author: '当前用户',
  //     votes: 0,
  //     comments: 0,
  //     status: 'pending',
  //     createdAt: new Date().toISOString().split('T')[0],
  //     tags: data.tags || []
  //   };
  //   setFeatures(prev => [newFeature, ...prev]);
  //   setShowCreateModal(false);
  // };

  return (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? '全部' : 
               status === 'pending' ? '待处理' :
               status === 'in-progress' ? '进行中' : '已完成'}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>提交需求</span>
        </button>
      </div>

      {/* 功能需求列表 */}
      <div className="space-y-4">
        {filteredFeatures.map(feature => (
          <FeatureRequestCard
            key={feature.id}
            {...feature}
          />
        ))}
      </div>

      {/* 创建需求模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">提交功能需求</h3>
            <CreateRequestForm
              onClose={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesTab;