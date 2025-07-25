import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import ImageUpload from '../common/ImageUpload';
import TagSelector from '../common/TagSelector';
import { Sparkles } from 'lucide-react';

const CreateIdeaForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tags, setTags] = useState<string[]>([]);

  const popularTags = ['AI', '社交', '电商', '教育', '工具', '游戏', '区块链'];

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="idea-title" className="block text-sm font-medium text-gray-700 mb-1">
          创意标题 <span className="text-red-500">*</span>
        </label>
        <Input id="idea-title" placeholder="一句话描述你的创意，让它闪闪发光" />
      </div>

      <div>
        <label htmlFor="idea-description" className="block text-sm font-medium text-gray-700 mb-1">
          详细描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="idea-description"
          rows={6}
          className="textarea textarea-bordered w-full"
          placeholder="详细说明你的创意是什么，要解决什么问题，目标用户是谁，以及它的独特之处..."
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">支持 Markdown 语法。</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          创意标签
        </label>
        <TagSelector
          selectedTags={tags}
          onChange={setTags}
          popularTags={popularTags}
          placeholder="添加标签，如“AI”、“社交”..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          封面图 (可选)
        </label>
        <ImageUpload onUpload={(url: string) => console.log('Uploaded image url:', url)} />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="ghost" onClick={onClose}>
          取消
        </Button>
        <Button>
          <Sparkles className="w-4 h-4 mr-2" />
          发布创意
        </Button>
      </div>
    </div>
  );
};

export default CreateIdeaForm; 