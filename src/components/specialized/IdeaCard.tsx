import React from 'react';
import { Link } from 'react-router-dom';
import { Idea } from '../../types/community.types';
import { ThumbsUp, ThumbsDown, MessageSquare, Eye, Users, Star } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

interface IdeaCardProps {
  idea: Idea;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  const voteBalance = idea.upvotes - idea.downvotes;
  const rankIcon =
    idea.rank === 1 ? '🥇' :
    idea.rank === 2 ? '🥈' :
    idea.rank === 3 ? '🥉' :
    idea.rank ? `#${idea.rank}` : null;

  return (
    <motion.div
      className="bg-white rounded-lg shadow-card p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5 }}
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors pr-4">
            <Link to={`/community/ideas/${idea.id}`}>{idea.title}</Link>
          </h3>
          {rankIcon && (
            <span className="font-bold text-lg text-yellow-500">{rankIcon}</span>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <img src={idea.author.avatarUrl} alt={idea.author.name} className="w-5 h-5 rounded-full mr-2" />
          <span>{idea.author.name}</span>
          <span className="mx-2">•</span>
          <span>{idea.createdAt}</span>
          <span className="mx-2">•</span>
          <Eye className="w-3 h-3 mr-1" />
          <span>{idea.views}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{idea.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {idea.tags.map(tag => (
            <span key={tag} className="badge badge-outline text-xs">{tag}</span>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-200 pt-3 mt-auto">
        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-sm hover:text-green-500 transition-colors">
              <ThumbsUp className="w-4 h-4 mr-1" /> {idea.upvotes}
            </button>
            <button className="flex items-center text-sm hover:text-red-500 transition-colors">
              <ThumbsDown className="w-4 h-4 mr-1" /> {idea.downvotes}
            </button>
            <Link to={`/community/ideas/${idea.id}#comments`} className="flex items-center text-sm hover:text-blue-500 transition-colors">
              <MessageSquare className="w-4 h-4 mr-1" /> {idea.comments}
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {idea.isLookingForTeammates && (
              <div className="flex items-center text-sm text-blue-500 font-semibold" title="正在寻找队友">
                <Users className="w-4 h-4 mr-1" />
                <span>招募中</span>
              </div>
            )}
            <button className="text-gray-400 hover:text-yellow-500 transition-colors" title="收藏">
              <Star className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IdeaCard;

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};
