import React, { useState } from 'react';

const DesignCard = ({ design, onExplain }) => {
  const [expandedSections, setExpandedSections] = useState({
    components: true,
    capacity: false,
    tradeoffs: false,
    patterns: false,
    nfr: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!design) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No design generated yet. Fill out the form to create your first system design.</p>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const SectionHeader = ({ title, isExpanded, onToggle, icon }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition duration-200"
    >
      <div className="flex items-center">
        {icon}
        <h3 className="text-lg font-semibold text-gray-800 ml-2">{title}</h3>
      </div>
      <svg
        className={`w-5 h-5 text-gray-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Design</h2>
          <p className="text-sm text-gray-500">Generated: {formatTimestamp(design.timestamp)}</p>
          {design.version > 1 && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
              Version {design.version}
            </span>
          )}
        </div>
        <button
          onClick={() => onExplain && onExplain(design)}
          className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-md transition duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Explain This
        </button>
      </div>

      {/* Requirements Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Requirements</h3>
        <p className="text-blue-700 text-sm">{design.requirements}</p>
      </div>

      {/* Design Sections */}
      <div className="space-y-4">
        {/* Components */}
        <div>
          <SectionHeader
            title="System Components"
            isExpanded={expandedSections.components}
            onToggle={() => toggleSection('components')}
            icon={
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          {expandedSections.components && design.design.components && (
            <div className="mt-3 space-y-3">
              {design.design.components.map((component, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{component.name}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {component.technology}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{component.type}</p>
                  <div className="text-sm text-gray-700">
                    <strong>Responsibilities:</strong>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {component.responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Capacity Estimations */}
        {design.design.capacity_estimations && (
          <div>
            <SectionHeader
              title="Capacity Estimations"
              isExpanded={expandedSections.capacity}
              onToggle={() => toggleSection('capacity')}
              icon={
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            {expandedSections.capacity && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(design.design.capacity_estimations).map(([key, value]) => (
                  <div key={key} className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-800 capitalize">
                      {key.replace('_', ' ')}
                    </div>
                    <div className="text-green-700">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tradeoffs */}
        {design.design.tradeoffs && (
          <div>
            <SectionHeader
              title="Design Tradeoffs"
              isExpanded={expandedSections.tradeoffs}
              onToggle={() => toggleSection('tradeoffs')}
              icon={
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
            />
            {expandedSections.tradeoffs && (
              <div className="mt-3 space-y-2">
                {design.design.tradeoffs.map((tradeoff, index) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-yellow-800 text-sm">{tradeoff}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Architecture Patterns */}
        {design.design.architecture_patterns && (
          <div>
            <SectionHeader
              title="Architecture Patterns"
              isExpanded={expandedSections.patterns}
              onToggle={() => toggleSection('patterns')}
              icon={
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />
            {expandedSections.patterns && (
              <div className="mt-3 flex flex-wrap gap-2">
                {design.design.architecture_patterns.map((pattern, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Non-Functional Requirements */}
        {design.design.non_functional_requirements && (
          <div>
            <SectionHeader
              title="Non-Functional Requirements"
              isExpanded={expandedSections.nfr}
              onToggle={() => toggleSection('nfr')}
              icon={
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />
            {expandedSections.nfr && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(design.design.non_functional_requirements).map(([key, value]) => (
                  <div key={key} className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-red-800 capitalize">
                      {key.replace('_', ' ')}
                    </div>
                    <div className="text-red-700">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignCard;
