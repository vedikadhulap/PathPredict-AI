import React, { useState, useEffect } from 'react';

const DelayImpact = ({ delayData }) => {
  const [animatedBars, setAnimatedBars] = useState({
    immediate: 0,
    month1: 0,
    month3: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedBars({
        immediate: delayData.qol_immediate,
        month1: delayData.qol_1month,
        month3: delayData.qol_3months,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [delayData]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-200 dark:border-blue-700 p-6 mb-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in">
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">
        Clinical Delay Impact Estimator
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Estimated impact of postponing treatment decision
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Increase */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-400 mb-1">
                Risk Escalation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Per month of treatment delay
              </p>
            </div>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div className="space-y-4">
            {delayData.risk_increases.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    +{item.change}%
                  </span>
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QoL Decline */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-1">
                Quality of Life Impact
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Trajectory shift over time
              </p>
            </div>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Immediate Treatment
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {delayData.qol_immediate}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${animatedBars.immediate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  After 1 Month Delay
                </span>
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {delayData.qol_1month}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${animatedBars.month1}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  After 3 Months Delay
                </span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {delayData.qol_3months}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${animatedBars.month3}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-slate-700">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-semibold">Clinical Note:</span> These projections represent estimated population-level trends. 
          Actual patient-specific outcomes depend on multiple factors including comorbidities, compliance, and individual response patterns.
        </p>
      </div>
    </div>
  );
};

export default DelayImpact;
