/**
 * Resources Page Component
 * Displays mental health resources with filtering and search functionality
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ResourceCard from '../components/ResourceCard.jsx';
import ResourceUpload from '../components/ResourceUpload.jsx';
import { Search, Filter, BookOpen, Video, FileText, Headphones, Plus, X } from 'lucide-react';
import api from '../utils/api.js';

const topicFilters = [
  { value: 'all', label: 'All focus areas' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'stress', label: 'Stress' },
  { value: 'depression', label: 'Depression' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'burnout', label: 'Burnout' },
  { value: 'mindfulness', label: 'Mindfulness' }
];

const formatFilters = [
  { value: 'all', label: 'All formats', icon: BookOpen },
  { value: 'article', label: 'Articles', icon: FileText },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'podcast', label: 'Podcasts', icon: Headphones },
  { value: 'guide', label: 'Guides', icon: FileText },
  { value: 'exercise', label: 'Exercises', icon: BookOpen }
];

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        setPage(1);

        const params = new URLSearchParams();
        if (selectedFormat !== 'all') params.append('category', selectedFormat);
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        params.append('page', '1');
        params.append('limit', '6');

        const response = await api.get(`/resources?${params.toString()}`);
        const fetchedResources = response.data?.data?.resources || [];
        const totalPages = response.data?.totalPages || 1;
        setResources(fetchedResources);
        setHasMore(1 < totalPages);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [selectedFormat, searchTerm]);

  const loadMoreResources = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const params = new URLSearchParams();
      if (selectedFormat !== 'all') params.append('category', selectedFormat);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('page', nextPage.toString());
      params.append('limit', '6');

      const response = await api.get(`/resources?${params.toString()}`);
      const newResources = response.data?.data?.resources || [];
      const totalPages = response.data?.totalPages || 1;
      
      if (newResources.length > 0) {
        setResources(prev => [...prev, ...newResources]);
        setPage(nextPage);
        setHasMore(nextPage < totalPages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more resources:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredResources = useMemo(() => {
    if (selectedTopic === 'all') return resources;
    return resources.filter((resource) =>
      (resource.tags || []).some((tag) => tag.toLowerCase() === selectedTopic)
    );
  }, [resources, selectedTopic]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTopic('all');
    setSelectedFormat('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />

        <div className="flex-1 ml-64 p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mental Health Resources</h1>
              <p className="text-gray-600 mt-2">
                {user ? `Curated for you, ${user.name?.split(' ')[0] || 'friend'}.` : 'Explore our curated collection to support your wellbeing journey.'}
              </p>
            </div>
            {(user?.role === 'counsellor' || user?.role === 'admin') && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Resource</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {topicFilters.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || selectedTopic !== 'all' || selectedFormat !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {formatFilters.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedFormat === format.value
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{format.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              {loading
                ? 'Loading resources...'
                : `Showing ${filteredResources.length} of ${resources.length} resources`}
              {searchTerm && ` for "${searchTerm}"`}
              {selectedTopic !== 'all' &&
                ` in ${topicFilters.find((topic) => topic.value === selectedTopic)?.label}`}
            </p>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!loading && filteredResources.length > 0 && hasMore && (
            <div className="text-center mt-8">
              <button 
                onClick={loadMoreResources}
                disabled={loadingMore}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading...' : 'Load More Resources'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resource Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ResourceUpload
              onUploadSuccess={(resource) => {
                setShowUploadModal(false);
                // Refresh resources list
                const params = new URLSearchParams();
                if (selectedFormat !== 'all') params.append('category', selectedFormat);
                if (searchTerm.trim()) params.append('search', searchTerm.trim());
                params.append('page', '1');
                params.append('limit', '6');
                api.get(`/resources?${params.toString()}`)
                  .then(response => {
                    const fetchedResources = response.data?.data?.resources || [];
                    setResources(fetchedResources);
                    const totalPages = response.data?.totalPages || 1;
                    setHasMore(1 < totalPages);
                  })
                  .catch(err => console.error('Error refreshing resources:', err));
              }}
              onCancel={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;