import React, { useState } from 'react';
import { X, Plus, Info } from 'lucide-react';
import { MembershipLevel } from '../../types/skills.types';

interface CreateSkillFormProps {
  onClose: () => void;
  currentMembershipLevel: MembershipLevel;
}

const CreateSkillForm: React.FC<CreateSkillFormProps> = ({ onClose, currentMembershipLevel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    pricePerHour: '',
  });
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 会员等级限制
  const membershipLimits = {
    free: {
      canPublish: false,
      message: '免费会员不能发布技能，请升级会员'
    },
    basic: {
      canPublish: true,
      maxSkills: 3,
      message: '基础会员最多可发布3个技能'
    },
    pro: {
      canPublish: true,
      maxSkills: Infinity,
      message: '专业会员可无限发布技能'
    },
    enterprise: {
      canPublish: true,
      maxSkills: Infinity,
      message: '企业会员可无限发布技能'
    }
  };

  const currentLimit = membershipLimits[currentMembershipLevel];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入技能标题';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '请输入技能描述';
    }
    
    if (!formData.category) {
      newErrors.category = '请选择技能分类';
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = '请至少添加一个标签';
    }
    
    if (!formData.pricePerHour || isNaN(Number(formData.pricePerHour))) {
      newErrors.pricePerHour = '请输入有效的小时价格';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 处理表单提交
    console.log('提交技能:', formData);
    // 这里可以添加实际的提交逻辑
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">发布技能</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {!currentLimit.canPublish ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">会员等级限制</h3>
                  <p className="text-yellow-700">{currentLimit.message}</p>
                  <button className="mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                    升级会员
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* 会员提示 */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                  {currentLimit.message}
                </div>
                
                {/* 技能标题 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    技能标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：React 前端开发"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                </div>
                
                {/* 技能描述 */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    技能描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="详细描述您的技能，包括专业领域、经验等"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                </div>
                
                {/* 技能分类 */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    技能分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">选择分类</option>
                    <option value="development">开发技能</option>
                    <option value="design">设计技能</option>
                    <option value="marketing">营销技能</option>
                    <option value="business">商业技能</option>
                    <option value="other">其他</option>
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                </div>
                
                {/* 技能标签 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    技能标签 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="添加标签"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {errors.tags && <p className="mt-1 text-sm text-red-500">{errors.tags}</p>}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* 小时价格 */}
                <div>
                  <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700 mb-1">
                    小时价格 (¥) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="pricePerHour"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.pricePerHour ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例如：200"
                  />
                  {errors.pricePerHour && <p className="mt-1 text-sm text-red-500">{errors.pricePerHour}</p>}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    发布技能
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateSkillForm; 