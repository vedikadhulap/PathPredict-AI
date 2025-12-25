import React, { useState, useEffect } from 'react';

const HorizontalTimeline = ({ timelineData, treatmentName, isLeft }) => {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    // Animate steps sequentially
    if (timelineData && timelineData.length > 0) {
      setVisibleSteps(0);
      const timer = setInterval(() => {
        setVisibleSteps(prev => {
          if (prev >= timelineData.length) {
            clearInterval(timer);
            return prev;
          }
          return prev + 1;
        });
      }, 150);
      return () => clearInterval(timer);
    }
  }, [timelineData]);

  const getRiskColor = (score) => {
    if (score < 40) return 'bg-green-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskBorder = (score) => {
    if (score < 40) return 'border-green-500';
    if (score < 70) return 'border-yellow-500';
    return 'border-red-500';
  };

  if (!timelineData || timelineData.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isLeft ? 'bg-teal-500' : 'bg-blue-500'}`} />
        {treatmentName}
      </h3>
      
      <div className="relative">
        {/* Timeline track */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700" />
        
        {/* Timeline steps */}
        <div className="flex justify-between items-start relative">
          {timelineData.map((step, index) => {
            const isVisible = index < visibleSteps;
            const riskScore = step.risk || 30;
            
            return (
              <div
                key={index}
                className={`flex flex-col items-center transition-all duration-500 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Event label */}
                <div className="mb-3 text-center min-h-12">
                  {step.event && (
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 max-w-24">
                      {step.event}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {step.month}m
                  </div>
                </div>
                
                {/* Node */}
                <div className={`w-8 h-8 rounded-full border-4 ${getRiskBorder(riskScore)} bg-white dark:bg-slate-800 z-10 transition-all duration-300 hover:scale-125 hover:shadow-lg cursor-pointer`}>
                  <div className={`w-full h-full rounded-full ${getRiskColor(riskScore)} opacity-75`} />
                </div>
                
                {/* Score */}
                <div className="mt-3 text-center">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {step.score || step.treatmentA || step.treatmentB || 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    stability
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Risk legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Low Risk
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          Medium Risk
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          High Risk
        </div>
      </div>
    </div>
  );
};

export default HorizontalTimeline;
