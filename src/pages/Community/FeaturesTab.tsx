import React, { useState } from 'react';
import { Plus, ThumbsUp, MessageCircle, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import CreateRequestForm from '../../components/specialized/CreateRequestForm';
import FeatureRequestCard from '../../components/specialized/FeatureRequestCard';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  author: string;
  votes: number;
  comments: number;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt: string;
  tags: string[];
}

const mockFeatures: FeatureRequest[] = [
  {
    id: '1',
    title: '添加项目协作看板功能',
    description: '希望能够添加类似Trello的看板功能，方便团队协作管理任务',
    author: '张三',
    votes: 23,
    comments: 8,
    status: 'in-progress',
    createdAt: '2024-01-20',
    tags: ['协作', '项目管理']
  },
  {
    id: '2',
    title: '支持视频通话功能',
    description: '在聊天系统中集成视频通话功能，方便远程沟通',
    author: '李四',
    votes: 18,
    comments: 5,
    status: 'pending',
    createdAt: '2024-01-19',
    tags: ['通信', '视频']
  }
];

const FeaturesTab: React.FC = () => {
  const [features, setFeatures] = useState<FeatureRequest[]>(mockFeatures);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const filteredFeatures = features.filter(feature => 
    filter === 'all' || feature.status === filter
  );

  const handleCreateFeature = (data: any) => {
    const newFeature: FeatureRequest = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      author: '当前用户',
      votes: 0,
      comments: 0,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      tags: data.tags || []
    };
    setFeatures(prev => [newFeature, ...prev]);
    setShowCreateModal(false);
  };

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
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>提交需求</span>
        </Button>
      </div>

      {/* 功能需求列表 */}
      <div className="space-y-4">
        {filteredFeatures.map(feature => (
          <FeatureRequestCard
            key={feature.id}
            request={feature}
            onVote={() => {
              setFeatures(prev => prev.map(f => 
                f.id === feature.id ? { ...f, votes: f.votes + 1 } : f
              ));
            }}
          />
        ))}
      </div>

      {/* 创建需求模态框 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="提交功能需求"
      >
        <CreateRequestForm
          onSubmit={handleCreateFeature}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
};

export default FeaturesTab;