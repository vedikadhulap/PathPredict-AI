import React from 'react';

const AgentCards = ({ agents }) => {
  const agentConfig = [
    {
      key: 'surgical',
      name: 'Surgical Planner Agent',
      description: 'Analyzes procedural risk, recovery trajectory, and intervention outcomes',
      icon: (
        <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      animation: 'animate-slide-in',
    },
    {
      key: 'chronic_care',
      name: 'Chronic Care Specialist Agent',
      description: 'Evaluates long-term management, medication compliance, and lifestyle factors',
      icon: (
        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      animation: 'animate-slide-in-delay',
    },
    {
      key: 'risk',
      name: 'Risk Assessment Agent',
      description: 'Quantifies complications, readmission probability, and deterioration risk',
      icon: (
        <svg className="w-8 h-8 text-teal-700 dark:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      animation: 'animate-slide-in-delay-2',
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-teal-700 dark:text-teal-400 mb-6">
        Multi-Agent Simulation Analysis
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {agentConfig.map((config) => {
          const agentData = agents?.[config.key] || 'Analyzing...';
          return (
            <div
              key={config.key}
              className={`bg-white dark:bg-slate-800 rounded-lg border-2 border-teal-200 dark:border-teal-700 p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${config.animation}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {config.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-1">
                    {config.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {config.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {agentData}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentCards;
