import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import TagSelector from '../common/TagSelector';
import { Bot, GitMerge, Coins } from 'lucide-react';

const CreateRequestForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tags, setTags] = useState<string[]>([]);

  const popularTags = ['UI/UX', '性能优化', '新功能', 'Bug修复', 'AI匹配', '数据统计'];
  const featureModules = ['地图功能', '社区广场', '个人中心', '项目管理', 'AI匹配', '其他'];

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="request-title" className="block text-sm font-medium text-gray-700 mb-1">
          需求标题 <span className="text-red-500">*</span>
        </label>
        <Input id="request-title" placeholder="简要描述你希望实现的功能或改进" />
      </div>

      <div>
        <label htmlFor="request-description" className="block text-sm font-medium text-gray-700 mb-1">
          详细描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="request-description"
          rows={6}
          className="textarea textarea-bordered w-full"
          placeholder="详细说明这个需求的背景、要解决的问题以及建议的实现方式..."
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">清晰的描述有助于社区和开发者更好地理解你的想法。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="request-points" className="block text-sm font-medium text-gray-700 mb-1">
            悬赏积分 (可选)
          </label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input id="request-points" type="number" placeholder="0" className="pl-10" />
          </div>
        </div>
        <div>
          <label htmlFor="request-module" className="block text-sm font-medium text-gray-700 mb-1">
            关联模块 (可选)
          </label>
           <div className="relative">
            <GitMerge className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select id="request-module" className="select select-bordered w-full pl-10">
              <option disabled selected>选择关联的功能模块</option>
              {featureModules.map(module => (
                <option key={module}>{module}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          需求标签
        </label>
        <TagSelector
          selectedTags={tags}
          onChange={setTags}
          popularTags={popularTags}
          placeholder="添加标签, 如“UI/UX”..."
        />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="ghost" onClick={onClose}>
          取消
        </Button>
        <Button>
          <Bot className="w-4 h-4 mr-2" />
          提交需求
        </Button>
      </div>
    </div>
  );
};

export default CreateRequestForm; 