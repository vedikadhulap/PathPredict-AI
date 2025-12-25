import React, { useState } from 'react';

const ExplainabilityPanel = ({ explanation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-300 dark:border-blue-600 overflow-hidden mb-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-100 dark:bg-slate-900/50 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-300 border-b border-blue-300 dark:border-blue-600"
      >
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400">
            Explainable AI Reasoning
          </h2>
        </div>
        <svg
          className={`w-6 h-6 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-6 space-y-6 animate-fade-in">
          {/* Main Reasoning */}
          <div>
            <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-400 mb-4">
              Primary Analysis Factors
            </h3>
            <ul className="space-y-3">
              {explanation.reasoning.map((point, idx) => (
                <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-300 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This explanation represents the model's analytical framework. It is provided for transparency and educational purposes. 
              Clinical decisions should integrate this information with physician expertise, patient preferences, and current medical evidence.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainabilityPanel;
