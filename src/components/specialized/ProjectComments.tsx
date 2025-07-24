import React, { useState } from 'react';
import { 
  MessageCircle, 
  ThumbsUp, 
  Reply, 
  MoreHorizontal,
  Send,
  Image,
  Smile
} from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
}

interface ProjectCommentsProps {
  projectId: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const ProjectComments: React.FC<ProjectCommentsProps> = ({
  comments,
  onAddComment,
  onLikeComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      onAddComment(replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString();
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ 
    comment, 
    isReply = false 
  }) => (
    <div className={`${isReply ? 'ml-12' : ''} mb-4`}>
      <div className="flex gap-3">
        <img
          src={comment.userAvatar || `https://ui-avatars.com/api/?name=${comment.userName}&background=random`}
          alt={comment.userName}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">
                {comment.userName}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(comment.createdAt)}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <button
              onClick={() => onLikeComment(comment.id)}
              className={`flex items-center gap-1 hover:text-primary-600 ${
                comment.isLiked ? 'text-primary-600' : ''
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{comment.likes > 0 ? comment.likes : '赞'}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center gap-1 hover:text-primary-600"
              >
                <Reply className="w-3 h-3" />
                <span>回复</span>
              </button>
            )}
            
            <button className="flex items-center gap-1 hover:text-gray-700">
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
          
          {/* 回复输入框 */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`回复 ${comment.userName}...`}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitReply(comment.id);
                  }
                }}
              />
              <button
                onClick={() => handleSubmitReply(comment.id)}
                disabled={!replyContent.trim()}
                className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                回复
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
            </div>
          )}
          
          {/* 回复列表 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          项目讨论 ({comments.length})
        </h3>
      </div>

      {/* 发表评论 */}
      <div className="mb-6">
        <div className="flex gap-3">
          <img
            src="https://ui-avatars.com/api/?name=Current+User&background=random"
            alt="Current User"
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="分享你的想法，提出问题或建议..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
            />
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <Image className="w-4 h-4" />
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/500
                </span>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || newComment.length > 500}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                  发表
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">还没有评论，来发表第一个评论吧！</p>
          </div>
        )}
      </div>

      {/* 加载更多 */}
      {comments.length > 0 && (
        <div className="text-center mt-6">
          <button className="text-sm text-primary-600 hover:text-primary-700">
            加载更多评论
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectComments;