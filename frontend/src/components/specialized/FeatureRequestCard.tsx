import React from 'react';
import { MessageSquare, Zap, CheckCircle, Clock } from 'lucide-react';
import { FeatureRequest } from '../../types/devcenter.types';
import { motion } from 'framer-motion';

export interface FeatureRequestCardProps extends FeatureRequest {
  rank?: number;
}

const FeatureRequestCard: React.FC<FeatureRequestCardProps> = ({
  rank,
  title,
  points,
  status,
  submitter,
  createdAt,
  description,
  tags,
  commentsCount,
}) => {
  const statusConfig = {
    '待评估': { icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100' },
    '开发中': { icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    '已完成': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100' },
    '已拒绝': { icon: CheckCircle, color: 'text-red-500', bgColor: 'bg-red-100' },
  };

  const currentStatus = statusConfig[status] || statusConfig['待评估'];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      className="bg-white p-5 rounded-lg shadow-sm border flex flex-col md:flex-row items-start hover:shadow-md transition-shadow duration-300"
    >
      {rank && (
        <div className="flex-shrink-0 mr-4 mb-4 md:mb-0 text-center">
          <span
            className={`text-2xl font-bold ${
              rank <= 3 ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            {rank}
          </span>
          <p className="text-xs text-gray-500">排名</p>
        </div>
      )}
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">{title}</h3>
          <span className="text-lg font-bold text-primary-500">
            {points} 积分
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-500">
          <div className="flex items-center mb-2 sm:mb-0">
            <img
              src={submitter.avatarUrl}
              alt={submitter.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span>{submitter.name}</span>
            <span className="mx-2">·</span>
            <span>{createdAt}</span>
          </div>
          <div className="flex items-center">
            <span
              className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${currentStatus.bgColor} ${currentStatus.color}`}
            >
              <currentStatus.icon className="w-4 h-4 mr-1" />
              {status}
            </span>
            <span className="flex items-center ml-4">
              <MessageSquare className="w-4 h-4 mr-1" />
              {commentsCount}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureRequestCard;
