import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HistoryView = ({ onSelectDesign }) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDesigns, setExpandedDesigns] = useState(new Set());

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/list_designs');
      setDesigns(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch designs. Make sure the backend is running.');
      console.error('Error fetching designs:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (designId) => {
    const newExpanded = new Set(expandedDesigns);
    if (newExpanded.has(designId)) {
      newExpanded.delete(designId);
    } else {
      newExpanded.add(designId);
    }
    setExpandedDesigns(newExpanded);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading design history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium mb-2">Error Loading Designs</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDesigns}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium mb-2">No Designs Yet</p>
          <p className="text-sm text-gray-600">Create your first system design to see it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Design History</h2>
        <button
          onClick={fetchDesigns}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {designs.map((design) => {
          const isExpanded = expandedDesigns.has(design.id);
          
          return (
            <div key={design.id} className="border border-gray-200 rounded-lg hover:shadow-md transition duration-200">
              {/* Design Header */}
              <div className="p-4 cursor-pointer" onClick={() => toggleExpanded(design.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Design #{design.id.slice(-8)}
                      </h3>
                      {design.version > 1 && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          v{design.version}
                        </span>
                      )}
                      {design.parent_id && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Updated
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {truncateText(design.requirements)}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatTimestamp(design.timestamp)}</span>
                      <span>{design.constraints.length} constraints</span>
                      <span>{design.design.components?.length || 0} components</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDesign && onSelectDesign(design);
                      }}
                      className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1 rounded text-sm transition duration-200"
                    >
                      View
                    </button>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="mt-4 space-y-4">
                    {/* Full Requirements */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Requirements</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{design.requirements}</p>
                    </div>

                    {/* Assumptions */}
                    {Object.keys(design.assumptions).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Assumptions</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(design.assumptions, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Constraints */}
                    {design.constraints.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Constraints</h4>
                        <div className="flex flex-wrap gap-2">
                          {design.constraints.map((constraint, index) => (
                            <span
                              key={index}
                              className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm"
                            >
                              {constraint}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Components Summary */}
                    {design.design.components && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Components</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {design.design.components.map((component, index) => (
                            <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                              <div className="font-medium text-blue-800">{component.name}</div>
                              <div className="text-blue-600 text-xs">{component.technology}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryView;
