import React from 'react';
import { Star, Tag, Clock, CheckCircle } from 'lucide-react';
import { Skill } from '../../types/skills.types';
import ImageWithFallback from '../common/ImageWithFallback';

interface SkillCardProps {
  skill: Skill;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const {
    title,
    description,
    provider,
    tags,
    pricePerHour,
    featured,
    verified
  } = skill;

  // 会员等级对应的颜色和标签
  const membershipConfig = {
    free: { color: 'bg-gray-100 text-gray-800', label: '免费会员' },
    basic: { color: 'bg-blue-100 text-blue-800', label: '基础会员' },
    pro: { color: 'bg-purple-100 text-purple-800', label: '专业会员' },
    enterprise: { color: 'bg-green-100 text-green-800', label: '企业会员' }
  };

  const membershipInfo = membershipConfig[provider.membershipLevel];

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${featured ? 'ring-2 ring-primary-500' : ''}`}>
      {featured && (
        <div className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 text-center">
          精选技能
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium">{provider.rating}</span>
            <span className="ml-1 text-xs text-gray-500">({provider.reviewsCount})</span>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <ImageWithFallback 
            src={provider.avatarUrl} 
            alt={provider.name} 
            className="w-8 h-8 rounded-full mr-2" 
          />
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900">{provider.name}</span>
              {verified && (
                <CheckCircle className="w-4 h-4 text-primary-500 ml-1" />
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${membershipInfo.color}`}>
              {membershipInfo.label}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            响应时间: {provider.responseTime}
          </span>
          <span className="font-semibold text-primary-600">¥{pricePerHour}/小时</span>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
          联系提供者
        </button>
      </div>
    </div>
  );
};

export default SkillCard;
