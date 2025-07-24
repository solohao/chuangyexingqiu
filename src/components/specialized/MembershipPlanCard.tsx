import React from 'react';
import { CheckCircle } from 'lucide-react';
import { MembershipPlan } from '../../types/skills.types';

interface MembershipPlanCardProps {
  plan: MembershipPlan;
}

type ColorKey = 'gray' | 'blue' | 'purple' | 'green';

const MembershipPlanCard: React.FC<MembershipPlanCardProps> = ({ plan }) => {
  const { name, price, period, features, color, recommended } = plan;
  
  const colorClasses = {
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      button: 'bg-gray-600 hover:bg-gray-700',
      highlight: 'text-gray-800'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700',
      highlight: 'text-blue-800'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      button: 'bg-purple-600 hover:bg-purple-700',
      highlight: 'text-purple-800'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      button: 'bg-green-600 hover:bg-green-700',
      highlight: 'text-green-800'
    }
  };
  
  const classes = colorClasses[color as ColorKey] || colorClasses.gray;
  
  return (
    <div className={`rounded-lg shadow-sm overflow-hidden ${recommended ? 'ring-2 ring-primary-500 transform scale-105' : 'border'} ${classes.border}`}>
      {recommended && (
        <div className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 text-center">
          推荐方案
        </div>
      )}
      <div className={`p-6 ${classes.bg}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900">¥{price}</span>
          <span className="text-gray-600">/{period === 'monthly' ? '月' : '年'}</span>
        </div>
        <button className={`w-full py-2 text-white rounded-lg mb-6 ${classes.button}`}>
          {price === 0 ? '当前方案' : '升级会员'}
        </button>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className={`w-5 h-5 mr-2 flex-shrink-0 ${classes.highlight}`} />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MembershipPlanCard; 