import React, { useState } from 'react';
import axios from 'axios';
import IntakeForm from './components/IntakeForm';
import DesignCard from './components/DesignCard';
import HistoryView from './components/HistoryView';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [currentDesign, setCurrentDesign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateDesign = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/generate_design`, formData);
      setCurrentDesign(response.data);
      
    } catch (err) {
      let errorMessage = 'Failed to generate design.';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to backend server. Please make sure the backend is running on http://localhost:8000';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error generating design:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDesign = (design) => {
    setCurrentDesign(design);
    setActiveTab('generate'); // Switch to generate tab to show the design
  };

  const handleExplainDesign = (design) => {
    // Future functionality - could integrate with another AI service for explanations
    alert('Explain functionality coming soon! This will provide detailed explanations of the design decisions.');
  };

  const TabButton = ({ id, label, isActive, onClick, icon }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-6 py-3 font-medium text-sm rounded-lg transition duration-200 ${
        isActive
          ? 'bg-primary-600 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h1 className="ml-3 text-xl font-bold text-gray-900">AI System Designer</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Design better systems with AI assistance
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <TabButton
              id="generate"
              label="Generate Design"
              isActive={activeTab === 'generate'}
              onClick={setActiveTab}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            />
            <TabButton
              id="history"
              label="Design History"
              isActive={activeTab === 'history'}
              onClick={setActiveTab}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {activeTab === 'generate' ? (
            <>
              {/* Left Column - Form */}
              <div>
                <IntakeForm onSubmit={handleGenerateDesign} loading={loading} />
              </div>
              
              {/* Right Column - Design Result */}
              <div>
                <DesignCard design={currentDesign} onExplain={handleExplainDesign} />
              </div>
            </>
          ) : (
            /* History Tab - Full Width */
            <div className="lg:col-span-2">
              <HistoryView onSelectDesign={handleSelectDesign} />
            </div>
          )}
        </div>

        {/* Quick Start Guide */}
        {activeTab === 'generate' && !currentDesign && (
          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Quick Start Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Define Requirements</h4>
                  <p className="text-blue-700">Describe your system's functionality, features, and business goals in detail.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Set Assumptions</h4>
                  <p className="text-blue-700">Specify expected user count, regions, budget, and other key assumptions as JSON.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Add Constraints</h4>
                  <p className="text-blue-700">List any technical, business, or regulatory constraints that must be considered.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>AI System Designer - Generate high-level system architectures with AI assistance</p>
            <p className="mt-1">Built with FastAPI, React, and Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
