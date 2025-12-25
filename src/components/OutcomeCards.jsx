import React, { useState, useEffect } from 'react';
import AnimatedCounter from './AnimatedCounter';

const OutcomeCards = ({ outcomeA, outcomeB, treatmentA, treatmentB }) => {
  const [progressA, setProgressA] = useState(0);
  const [progressB, setProgressB] = useState(0);

  useEffect(() => {
    // Animate progress bars
    const timer = setTimeout(() => {
      setProgressA(outcomeA.quality_of_life);
      setProgressB(outcomeB.quality_of_life);
    }, 100);
    return () => clearTimeout(timer);
  }, [outcomeA, outcomeB]);

  const getRiskColor = (risk) => {
    const riskLower = risk?.toLowerCase() || '';
    if (riskLower === 'low') return 'text-green-600 dark:text-green-400 border-green-500';
    if (riskLower === 'medium' || riskLower === 'moderate') return 'text-yellow-600 dark:text-yellow-400 border-yellow-500';
    if (riskLower === 'high') return 'text-red-600 dark:text-red-400 border-red-500';
    return 'text-slate-600 dark:text-slate-400 border-slate-500';
  };

  const OutcomeCard = ({ outcome, treatmentName, isPrimary, progress }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border-2 p-6 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 ${
      isPrimary ? 'border-teal-500' : 'border-blue-300 dark:border-blue-600'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          {treatmentName}
        </h3>
        {isPrimary && (
          <span className="px-3 py-1 border-2 border-teal-500 text-teal-700 dark:text-teal-400 text-xs font-semibold rounded-full">
            RECOMMENDED
          </span>
        )}
      </div>

      <div className="space-y-6 animate-count-up">
        {/* Quality of Life Score */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Quality of Life Score
            </span>
            <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              <AnimatedCounter value={outcome.quality_of_life} />
              <span className="text-lg text-slate-500">/100</span>
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-teal-500 dark:bg-teal-400 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Readmission Risk */}
        <div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-3">
            Readmission Risk
          </span>
          <div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 font-semibold ${getRiskColor(outcome.readmission_risk)}`}>
            {outcome.readmission_risk}
          </div>
        </div>

        {/* Confidence Score */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Confidence Level
            </span>
            <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              <AnimatedCounter value={outcome.confidence} suffix="%" />
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${outcome.confidence}%` }}
            />
          </div>
        </div>

        {/* Uncertainty Indicator */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Uncertainty Level
            </span>
            <span className={`text-sm font-semibold ${getRiskColor(outcome.uncertainty).split(' ')[0]}`}>
              {outcome.uncertainty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Treatment Outcome Comparison
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OutcomeCard 
          outcome={outcomeA} 
          treatmentName={treatmentA} 
          isPrimary={outcomeA.quality_of_life >= outcomeB.quality_of_life}
          progress={progressA}
        />
        <OutcomeCard 
          outcome={outcomeB} 
          treatmentName={treatmentB} 
          isPrimary={outcomeB.quality_of_life > outcomeA.quality_of_life}
          progress={progressB}
        />
      </div>
    </div>
  );
};

export default OutcomeCards;
