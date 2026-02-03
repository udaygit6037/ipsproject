/**
 * Resource Card Component
 * Displays mental health resources with interactive features
 */

import React, { useMemo, useState } from 'react';
import { BookOpen, Download, Heart, Share2, Clock, Tag, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';

const ResourceCard = ({ resource }) => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const likeIds = useMemo(
    () => (resource.likes || []).map((like) => (typeof like === 'string' ? like : like?._id)),
    [resource.likes]
  );
  const [likeCount, setLikeCount] = useState(resource.likes?.length || resource.likesCount || 0);
  const [isLiked, setIsLiked] = useState(() => (userId ? likeIds.includes(userId) : false));
  const [likeLoading, setLikeLoading] = useState(false);

  const resourceType = resource.category || 'article';

  const getTypeStyles = () => {
    switch (resourceType) {
      case 'video':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: BookOpen };
      case 'podcast':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: BookOpen };
      case 'guide':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: BookOpen };
      case 'exercise':
        return { bg: 'bg-amber-100', text: 'text-amber-700', icon: BookOpen };
      case 'article':
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: BookOpen };
    }
  };

  const typeStyles = getTypeStyles();
  const TypeIcon = typeStyles.icon;

  const handleLike = async () => {
    if (!userId) {
      alert('Please log in to like resources.');
      return;
    }
    if (likeLoading) return;

    setLikeLoading(true);
    try {
      const response = await api.post(`/resources/${resource._id}/like`);
      const updatedCount = response.data?.data?.likesCount ?? likeCount + (isLiked ? -1 : 1);
      setLikeCount(updatedCount);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to toggle like', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = resource.url || resource.fileUrl || window.location.href;
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Resource link copied to clipboard');
    }
  };

  const handlePrimaryAction = () => {
    const target = resource.url || resource.fileUrl;
    if (target) {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = () => {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const authorName = resource.uploadedBy?.name || 'DPI Counsellor';
  const publishedDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString()
    : 'Just now';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <TypeIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600 capitalize">{resourceType}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{resource.readTime || '5 min read'}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{resource.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resource.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{resource.tags.length - 3} more</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-xs font-semibold">
              {authorName
                .split(' ')
                .map((chunk) => chunk[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <p className="font-medium text-gray-900">{authorName}</p>
              <p className="text-xs text-gray-500">Published {publishedDate}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyles.bg} ${typeStyles.text}`}>
            {resourceType.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          <div className="flex space-x-2">
            {resource.fileUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
            <button
              onClick={handlePrimaryAction}
              className="flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{resourceType === 'video' ? 'Watch' : 'Open resource'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;