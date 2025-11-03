/**
 * Resource Card Component
 * Displays mental health resources with interactive features
 */

import React, { useState } from 'react';
import { BookOpen, Download, Heart, Share2, Clock, Tag } from 'lucide-react';

const ResourceCard = ({ resource }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(resource.likes || 0);

  /**
   * Handle like/unlike action
   */
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  /**
   * Handle resource download
   */
  const handleDownload = () => {
    // In a real app, this would trigger actual download
    alert(`Downloading: ${resource.title}`);
  };

  /**
   * Handle resource sharing
   */
  const handleShare = () => {
    // In a real app, this would open share dialog
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  /**
   * Get type-specific styling
   */
  const getTypeStyles = () => {
    switch (resource.type) {
      case 'article':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          icon: BookOpen
        };
      case 'video':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: BookOpen
        };
      case 'audio':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          icon: BookOpen
        };
      case 'pdf':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-700',
          icon: Download
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: BookOpen
        };
    }
  };

  const typeStyles = getTypeStyles();
  const TypeIcon = typeStyles.icon;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Resource Image */}
      {resource.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={resource.image}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyles.bg} ${typeStyles.text}`}>
              {resource.type.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Resource Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TypeIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600 capitalize">{resource.type}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{resource.readTime || '5 min read'}</span>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {resource.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{resource.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Author and Date */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            {resource.author?.avatar && (
              <img
                src={resource.author.avatar}
                alt={resource.author.name}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span>By {resource.author?.name || 'Anonymous'}</span>
          </div>
          <span>{new Date(resource.publishedAt).toLocaleDateString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="flex space-x-2">
            {resource.type === 'pdf' && (
              <button
                onClick={handleDownload}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              {resource.type === 'video' ? 'Watch' : 'Read More'}
            </button>
          </div>
        </div>

        {/* Progress Bar (for articles/videos) */}
        {resource.progress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{resource.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${resource.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;