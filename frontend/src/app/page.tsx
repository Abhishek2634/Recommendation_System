// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, AlertCircle, ExternalLink } from 'lucide-react';
import { recommendApi, Assessment, RecommendationResponse } from '@/lib/api';

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState('');
  const [apiHealthy, setApiHealthy] = useState(false);

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await recommendApi.health();
      setApiHealthy(true);
    } catch (err) {
      setApiHealthy(false);
      console.error('API health check failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    if (query.trim().length < 5) {
      setError('Query must be at least 5 characters');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const data = await recommendApi.recommend(query, 10);
      setResponse(data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Failed to get recommendations. Please ensure the API is running on http://localhost:8000'
      );
      console.error('Recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Search className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  SHL Assessment Recommender
                </h1>
                <p className="text-sm text-gray-500">
                  Find the perfect assessments for your hiring needs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  apiHealthy ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-600">
                {apiHealthy ? 'API Connected' : 'API Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a job description or query (e.g., 'I need a Java developer with strong problem-solving skills')"
                className="w-full px-6 py-4 pr-14 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none h-32 text-gray-700 bg-white shadow-sm hover:shadow-md transition-shadow"
              />
              <motion.button
                type="submit"
                disabled={loading || !apiHealthy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                title={!apiHealthy ? 'API is not connected' : 'Search'}
              >
                {loading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <Search size={20} />
                )}
              </motion.button>
            </div>

            <div className="flex gap-2">
              <motion.button
                type="submit"
                disabled={loading || !apiHealthy}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Get Recommendations
                  </>
                )}
              </motion.button>
              {query && (
                <motion.button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResponse(null);
                    setError('');
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Clear
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3"
          >
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {response && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Recommended Assessments
              </h2>
              <p className="text-gray-600">
                Found <span className="font-semibold text-indigo-600">{response.count}</span> relevant
                assessments for your query
              </p>
            </div>

            <div className="grid gap-4">
              {response.recommendations.map((assessment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {assessment.assessment_name}
                        </h3>
                      </div>
                      {assessment.test_type && (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0"
                        >
                          {assessment.test_type}
                        </motion.span>
                      )}
                    </div>

                    {assessment.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {assessment.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Relevance Score Bar */}
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${assessment.relevance_score * 100}%` }}
                            transition={{ delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                          {(assessment.relevance_score * 100).toFixed(1)}%
                        </span>
                      </div>

                      <motion.a
                        href={assessment.assessment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ x: 5 }}
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                      >
                        View Details
                        <ExternalLink size={16} />
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!response && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Ready to find assessments?
            </h3>
            <p className="text-gray-500">
              Enter a job description or query above to get started
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>
            SHL Assessment Recommendation System • Powered by{' '}
            <span className="font-semibold">Semantic Search + LLM</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
