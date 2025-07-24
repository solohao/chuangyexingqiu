import React, { useState } from 'react';
import { Wrench, Filter, Search, Crown, PlusCircle } from 'lucide-react';
import SkillCard from '../../components/specialized/SkillCard';
import MembershipPlanCard from '../../components/specialized/MembershipPlanCard';
import CreateSkillForm from '../../components/specialized/CreateSkillForm';
import { mockCategories, mockSkills, membershipPlans } from './mockData';
import { MembershipLevel } from '../../types/skills.types';

const SkillsMarketPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showMembershipPlans, setShowMembershipPlans] = useState(false);
  const [showCreateSkillForm, setShowCreateSkillForm] = useState(false);
  
  // 模拟当前用户的会员等级
  const [currentMembershipLevel] = useState<MembershipLevel>('basic'); // 可以是 'free', 'basic', 'pro', 'enterprise'
  
  // 根据当前选择的分类筛选技能
  const filteredSkills = activeCategory === 'all' 
    ? mockSkills 
    : mockSkills.filter(skill => skill.category === activeCategory);
  
  const handleCreateSkill = () => {
    // 根据会员等级决定是否显示会员计划或直接显示表单
    if (currentMembershipLevel === 'free') {
      setShowMembershipPlans(true);
    } else {
      setShowCreateSkillForm(true);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Wrench className="mr-2 h-8 w-8 text-primary-600" />
            技能市场
          </h1>
          <p className="text-gray-600 mt-2">
            发布您的技能，寻找所需专业人才，促进技能交流与合作
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索技能..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="ml-2 px-4 py-2 flex items-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
            <Filter className="w-5 h-5 mr-2" />
            筛选
          </button>
          <button 
            className="ml-2 px-4 py-2 flex items-center text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
            onClick={handleCreateSkill}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            发布技能
          </button>
        </div>
      </div>
      
      {/* 会员计划部分 */}
      {showMembershipPlans && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-100 to-primary-50 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Crown className="w-6 h-6 text-primary-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">会员计划</h2>
              </div>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowMembershipPlans(false)}
              >
                收起
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              升级会员，解锁更多功能，获取更多曝光机会，提高合作成功率
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {membershipPlans.map((plan) => (
                <MembershipPlanCard key={plan.level} plan={plan} />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 分类筛选部分 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {mockCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === category.id
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
              {category.count && category.id !== 'all' && (
                <span className="ml-1 text-xs bg-white px-1.5 py-0.5 rounded-full">
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* 技能列表部分 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center text-gray-500 py-8">
              未找到相关技能
            </div>
          </div>
        )}
      </div>
      
      {/* 提示信息 */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">技能市场使用提示</h3>
        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
          <li>基础的发帖问答是免费的</li>
          <li>发布需求和技能寻求合作需要升级会员</li>
          <li>专业会员和企业会员可以获得更多曝光和优先推荐</li>
          <li>所有交易请在平台内进行，以获得安全保障</li>
        </ul>
      </div>
      
      {/* 技能发布表单 */}
      {showCreateSkillForm && (
        <CreateSkillForm 
          onClose={() => setShowCreateSkillForm(false)} 
          currentMembershipLevel={currentMembershipLevel}
        />
      )}
    </div>
  );
};

export default SkillsMarketPage; 