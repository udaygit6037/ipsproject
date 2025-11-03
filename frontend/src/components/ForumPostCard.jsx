/**
 * Forum Post Card Component
 * Displays forum posts with interaction features
 */

import React, { useState } from 'react';
import { MessageCircle, Heart, Share2, MoreHorizontal, Flag, Clock } from 'lucide-react';
import { formatDate } from '../utils/helpers.js';

const ForumPostCard = ({ post, onReply, onLike, onReport }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  /**
   * Handle like/unlike action
   */
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    if (onLike) {
      onLike(post.id, !isLiked);
    }
  };

  /**
   * Handle reply action
   */
  const handleReply = () => {
    if (onReply) {
      onReply(post.id);
    }
  };

  /**
   * Handle report action
   */
  const handleReport = () => {
    if (onReport) {
      onReport(post.id);
    }
    setShowMenu(false);
  };

  /**
   * Handle share action
   */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
    setShowMenu(false);
  };

  /**
   * Get category styling
   */
  const getCategoryStyles = (category) => {
    const styles = {
      'anxiety': 'bg-yellow-100 text-yellow-800',
      'depression': 'bg-blue-100 text-blue-800',
      'stress': 'bg-red-100 text-red-800',
      'relationships': 'bg-pink-100 text-pink-800',
      'academic': 'bg-green-100 text-green-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return styles[category] || styles.general;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-medium text-gray-900">{post.author.name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatDate(post.createdAt)}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryStyles(post.category)}`}>
                    {post.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
              <button
                onClick={handleShare}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handleReport}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Title */}
      {post.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {post.title}
        </h3>
      )}

      {/* Post Content */}
      <div className="text-gray-700 mb-4">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 text-sm transition-colors ${
              isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>

          {/* Reply Button */}
          <button
            onClick={handleReply}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.replies?.length || 0} replies</span>
          </button>
        </div>

        {/* View Replies Toggle */}
        {post.replies && post.replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {showReplies ? 'Hide replies' : 'View replies'}
          </button>
        )}
      </div>

      {/* Replies Section */}
      {showReplies && post.replies && post.replies.length > 0 && (
        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
          {post.replies.map((reply) => (
            <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src={reply.author.avatar}
                  alt={reply.author.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-medium text-sm text-gray-900">
                  {reply.author.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(reply.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default ForumPostCard;