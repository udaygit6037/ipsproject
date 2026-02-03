/**
 * Forum Page Component
 * Community forum for students to share experiences and support each other
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ForumPostCard from '../components/ForumPostCard.jsx';
import { Plus, Search, Filter, MessageSquare, TrendingUp, Users } from 'lucide-react';
import api from '../utils/api.js';

const Forum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPostsCount, setTotalPostsCount] = useState(0);
  const [forumStats, setForumStats] = useState({
    totalPosts: 0,
    activeMembers: 0,
    postsThisWeek: 0
  });
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    isAnonymous: false,
    tagsText: ''
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'stress', label: 'Stress' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'academic', label: 'Academic' },
    { value: 'general', label: 'General Support' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'replies', label: 'Most Replies' }
  ];

  /**
   * Load forum statistics
   */
  useEffect(() => {
    const fetchForumStats = async () => {
      try {
        const response = await api.get('/forum/stats');
        if (response.data.success) {
          setForumStats(response.data.data.stats);
        }
      } catch (error) {
        console.error('Error fetching forum stats:', error);
        // Don't show error to user, just use defaults
      }
    };

    fetchForumStats();
  }, []);

  /**
   * Load posts on component mount
   */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (searchTerm) params.append('search', searchTerm);
        if (sortBy) params.append('sortBy', sortBy);
        params.append('page', '1');
        params.append('limit', '5');

        const response = await api.get(`/forum?${params.toString()}`);
        const fetchedPosts = response.data.data.posts;
        const totalPages = response.data.totalPages || 1;
        const total = response.data.total || 0;
        setPage(1);
        setHasMore(1 < totalPages);
        setTotalPostsCount(total);

        // Enhance posts with like metadata for the current user
        const enhancedPosts = fetchedPosts.map(post => {
          const likesArray = Array.isArray(post.likes) ? post.likes : [];
          const isLiked = user ? likesArray.some(id => id === user.id) : false;
          return {
            ...post,
            likesCount: likesArray.length,
            isLiked
          };
        });

        setPosts(enhancedPosts);
        setFilteredPosts(enhancedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, searchTerm, sortBy, user]);

  /**
   * Handle post like
   */
  const handleLike = async (postId, isLiked) => {
    try {
      const response = await api.post(`/forum/${postId}/like`);
      const likesCount = response.data?.data?.likesCount ?? 0;

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
                ...post,
                likesCount,
                isLiked
              }
            : post
        )
      );

      setFilteredPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
                ...post,
                likesCount,
                isLiked
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };


  /**
   * Handle post reply
   */
  const handleReply = (postId) => {
    // In a real app, this would open a reply modal
    alert(`Reply to post ${postId} - This would open a reply modal`);
  };

  /**
   * Handle post report
   */
  const handleReport = (postId) => {
    // In a real app, this would open a report modal
    alert(`Report post ${postId} - This would open a report modal`);
  };

  /**
   * Load more posts (pagination)
   */
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', nextPage.toString());
      params.append('limit', '5');

      const response = await api.get(`/forum?${params.toString()}`);
      const newPosts = response.data.data.posts;
      const totalPages = response.data.totalPages || 1;

      if (newPosts.length > 0) {
        const enhancedPosts = newPosts.map(post => {
          const likesArray = Array.isArray(post.likes) ? post.likes : [];
          const isLiked = user ? likesArray.some(id => id === user.id) : false;
          return {
            ...post,
            likesCount: likesArray.length,
            isLiked
          };
        });

        setPosts(prev => [...prev, ...enhancedPosts]);
        setFilteredPosts(prev => [...prev, ...enhancedPosts]);
        setPage(nextPage);
        setHasMore(nextPage < totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('recent');
  };

  /**
   * Handle new post field changes
   */
  const handleNewPostChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (createError) setCreateError(null);
  };

  /**
   * Submit new post to backend
   */
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      setCreateError('Please fill in title, content, and category.');
      return;
    }

    const tags = newPost.tagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      setCreating(true);
      setCreateError(null);

      const response = await api.post('/forum', {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
        isAnonymous: newPost.isAnonymous,
        tags
      });

      const created = response.data?.data?.post;
      if (created) {
        const likesArray = Array.isArray(created.likes) ? created.likes : [];
        const enhanced = {
          ...created,
          likesCount: likesArray.length,
          isLiked: false
        };
        setPosts(prev => [enhanced, ...prev]);
        setFilteredPosts(prev => [enhanced, ...prev]);
        
        // Refresh forum stats after creating a post
        const statsResponse = await api.get('/forum/stats');
        if (statsResponse.data.success) {
          setForumStats(statsResponse.data.data.stats);
        }
      }

      // Reset form and close modal
      setNewPost({
        title: '',
        content: '',
        category: 'general',
        isAnonymous: false,
        tagsText: ''
      });
      setShowNewPostModal(false);
    } catch (err) {
      console.error('Error creating post:', err);
      setCreateError(
        err.response?.data?.message || 'Failed to create post. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
                <p className="text-gray-600 mt-2">
                  Connect with peers, share experiences, and find support in our safe community space.
                </p>
              </div>
              <button
                onClick={() => setShowNewPostModal(true)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </button>
            </div>
          </div>

          {/* Forum Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{forumStats.totalPosts || totalPostsCount || posts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">{forumStats.activeMembers || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{forumStats.postsThisWeek || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              {(searchTerm || selectedCategory !== 'all' || sortBy !== 'recent') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              {loading ? 'Loading posts...' : `Showing ${filteredPosts.length} of ${posts.length} posts`}
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
            </p>
          </div>

          {/* Forum Posts */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map(post => (
                <ForumPostCard
                  key={post._id || post.id}
                  post={post}
                  onLike={handleLike}
                  onReply={handleReply}
                  onReport={handleReport}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters, or be the first to start a discussion!
              </p>
              <button
                onClick={() => setShowNewPostModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create New Post
              </button>
            </div>
          )}

          {/* Load More Button */}
          {!loading && filteredPosts.length > 0 && hasMore && (
            <div className="text-center mt-8">
              <button 
                onClick={loadMorePosts}
                disabled={loadingMore}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Post Modal Placeholder */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Post</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={newPost.title}
                  onChange={handleNewPostChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="What's on your mind?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={newPost.category}
                  onChange={handleNewPostChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {categories
                    .filter(c => c.value !== 'all')
                    .map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  rows="4"
                  value={newPost.content}
                  onChange={handleNewPostChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Share your experience or question..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tagsText"
                  value={newPost.tagsText}
                  onChange={handleNewPostChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="exam, anxiety, coping"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isAnonymous"
                  type="checkbox"
                  name="isAnonymous"
                  checked={newPost.isAnonymous}
                  onChange={handleNewPostChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="isAnonymous"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Post as anonymous
                </label>
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {creating ? 'Posting...' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;