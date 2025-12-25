import React from 'react';

const RiskHeatmap = ({ risks }) => {
  const getRiskLevel = (score) => {
    if (score >= 70) return { level: 'High', color: 'bg-red-500', borderColor: 'border-red-500' };
    if (score >= 40) return { level: 'Moderate', color: 'bg-yellow-500', borderColor: 'border-yellow-500' };
    return { level: 'Low', color: 'bg-green-500', borderColor: 'border-green-500' };
  };

  const RiskCard = ({ title, scoreA, scoreB, treatmentA, treatmentB }) => {
    const riskA = getRiskLevel(scoreA);
    const riskB = getRiskLevel(scoreB);

    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-300 dark:border-blue-600 p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
        <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-4 text-center">
          {title}
        </h4>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              {treatmentA}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                <div 
                  className={`${riskA.color} h-4 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${scoreA}%` }}
                />
              </div>
              <span className={`text-sm font-bold w-12 text-right ${riskA.color.replace('bg-', 'text-')}`}>
                {scoreA}%
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              {treatmentB}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                <div 
                  className={`${riskB.color} h-4 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${scoreB}%` }}
                />
              </div>
              <span className={`text-sm font-bold w-12 text-right ${riskB.color.replace('bg-', 'text-')}`}>
                {scoreB}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-teal-200 dark:border-teal-700 p-6 mb-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in">
      <h2 className="text-2xl font-bold text-teal-700 dark:text-teal-400 mb-2">
        Healthcare Risk Assessment
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Comparative risk analysis across key health indicators
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RiskCard 
          title="Hospital Readmission"
          scoreA={risks.readmission.treatmentA}
          scoreB={risks.readmission.treatmentB}
          treatmentA="Treatment A"
          treatmentB="Treatment B"
        />
        <RiskCard 
          title="Complications"
          scoreA={risks.complications.treatmentA}
          scoreB={risks.complications.treatmentB}
          treatmentA="Treatment A"
          treatmentB="Treatment B"
        />
        <RiskCard 
          title="Chronic Deterioration"
          scoreA={risks.deterioration.treatmentA}
          scoreB={risks.deterioration.treatmentB}
          treatmentA="Treatment A"
          treatmentB="Treatment B"
        />
      </div>

      <div className="mt-6 flex items-center justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-slate-700 dark:text-slate-300">Low Risk (&lt;40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
          <span className="text-slate-700 dark:text-slate-300">Moderate Risk (40-69%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-slate-700 dark:text-slate-300">High Risk (≥70%)</span>
        </div>
      </div>
    </div>
  );
};

export default RiskHeatmap;
