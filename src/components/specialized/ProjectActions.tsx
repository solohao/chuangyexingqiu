import React, { useState } from 'react';
import { 
  Heart, 
  Star, 
  Share2, 
  MessageCircle, 
  UserPlus,
  Flag,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Project } from '../../types/project.types';

interface ProjectActionsProps {
  project: Project;
  isLiked: boolean;
  isBookmarked: boolean;
  isFollowing: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onFollow: () => void;
  onContact: () => void;
  onApply: () => void;
  onReport: () => void;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({
  project,
  isLiked,
  isBookmarked,
  isFollowing,
  onLike,
  onBookmark,
  onFollow,
  onContact,
  onApply,
  onReport
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = `${project.title} - 创业星球`;
    const description = project.description.slice(0, 100) + '...';

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
      case 'wechat':
        // 微信分享逻辑
        break;
      case 'weibo':
        window.open(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&pic=&appkey=`);
        break;
      case 'qq':
        window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`);
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="space-y-4">
      {/* 主要操作按钮 */}
      <div className="space-y-3">
        <button
          onClick={onContact}
          className="w-full btn btn-primary flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          联系创始人
        </button>
        
        <button
          onClick={onApply}
          className="w-full btn btn-secondary flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          申请加入团队
        </button>
      </div>

      {/* 互动操作 */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onLike}
          className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
            isLiked 
              ? 'border-red-200 bg-red-50 text-red-600' 
              : 'border-gray-200 hover:bg-gray-50 text-gray-600'
          }`}
        >
          <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          <span className="text-xs">{isLiked ? '已点赞' : '点赞'}</span>
          <span className="text-xs text-gray-500">{project.likes}</span>
        </button>

        <button
          onClick={onBookmark}
          className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
            isBookmarked 
              ? 'border-blue-200 bg-blue-50 text-blue-600' 
              : 'border-gray-200 hover:bg-gray-50 text-gray-600'
          }`}
        >
          <Star className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
          <span className="text-xs">{isBookmarked ? '已收藏' : '收藏'}</span>
          <span className="text-xs text-gray-500">{project.followers}</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="w-full flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs">分享</span>
          </button>

          {/* 分享菜单 */}
          {showShareMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowShareMenu(false)}
              />
              <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-32">
                <div className="p-2">
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? '已复制' : '复制链接'}</span>
                  </button>
                  <button
                    onClick={() => handleShare('wechat')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded"
                  >
                    <span className="text-green-500">💬</span>
                    <span>微信</span>
                  </button>
                  <button
                    onClick={() => handleShare('weibo')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded"
                  >
                    <span className="text-red-500">🔴</span>
                    <span>微博</span>
                  </button>
                  <button
                    onClick={() => handleShare('qq')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded"
                  >
                    <span className="text-blue-500">🐧</span>
                    <span>QQ</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 关注按钮 */}
      <button
        onClick={onFollow}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
          isFollowing
            ? 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100'
            : 'border-primary-300 bg-primary-50 text-primary-600 hover:bg-primary-100'
        }`}
      >
        <UserPlus className="w-4 h-4" />
        <span>{isFollowing ? '已关注项目' : '关注项目动态'}</span>
      </button>

      {/* 外部链接 */}
      {project.contact.website && (
        <a
          href={project.contact.website}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          <ExternalLink className="w-4 h-4" />
          <span>访问官网</span>
        </a>
      )}

      {project.demoUrl && (
        <a
          href={project.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          <ExternalLink className="w-4 h-4" />
          <span>查看演示</span>
        </a>
      )}

      {/* 举报按钮 */}
      <button
        onClick={onReport}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm text-gray-500 hover:text-red-500"
      >
        <Flag className="w-3 h-3" />
        <span>举报项目</span>
      </button>
    </div>
  );
};

export default ProjectActions;