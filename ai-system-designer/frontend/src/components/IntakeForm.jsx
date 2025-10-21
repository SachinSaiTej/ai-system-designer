import React, { useState } from 'react';

const IntakeForm = ({ onSubmit, loading }) => {
  const [requirements, setRequirements] = useState('');
  const [assumptions, setAssumptions] = useState('{\n  "users": "1000-10000",\n  "region": "US",\n  "budget": "moderate"\n}');
  const [constraints, setConstraints] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Parse assumptions JSON
      let parsedAssumptions = {};
      if (assumptions.trim()) {
        try {
          parsedAssumptions = JSON.parse(assumptions);
        } catch (jsonError) {
          alert('Invalid JSON in assumptions field. Please check your syntax:\n' + jsonError.message);
          return;
        }
      }
      
      // Parse constraints
      const constraintsList = constraints
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);
      
      await onSubmit({
        requirements,
        assumptions: parsedAssumptions,
        constraints: constraintsList
      });
      
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Error submitting form: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Design Requirements</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Requirements */}
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
            Product Requirements *
          </label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Describe your system requirements in detail. For example: 'Build a social media platform that allows users to post photos, follow other users, and see a personalized feed...'"
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
            required
          />
        </div>

        {/* Assumptions */}
        <div>
          <label htmlFor="assumptions" className="block text-sm font-medium text-gray-700 mb-2">
            Assumptions (JSON format)
          </label>
          <textarea
            id="assumptions"
            value={assumptions}
            onChange={(e) => setAssumptions(e.target.value)}
            placeholder='{"users": "1000-10000", "region": "US", "budget": "moderate"}'
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-vertical"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter assumptions as JSON. Include expected user count, region, budget, etc.
          </p>
        </div>

        {/* Constraints */}
        <div>
          <label htmlFor="constraints" className="block text-sm font-medium text-gray-700 mb-2">
            Constraints
          </label>
          <input
            type="text"
            id="constraints"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="low latency, high availability, cost-effective, GDPR compliant"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter constraints separated by commas
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !requirements.trim()}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Design...
            </>
          ) : (
            'Generate System Design'
          )}
        </button>
      </form>
    </div>
  );
};

export default IntakeForm;
