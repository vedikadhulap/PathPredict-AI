import React, { useState } from 'react';

const PatientForm = ({ onSimulate, isLoading }) => {
  const [patientSummary, setPatientSummary] = useState('');
  const [treatmentA, setTreatmentA] = useState('');
  const [treatmentB, setTreatmentB] = useState('');
  const [simulationHorizon, setSimulationHorizon] = useState('90');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate({
      patient_summary: patientSummary,
      treatment_a: treatmentA,
      treatment_b: treatmentB,
      simulation_horizon: parseInt(simulationHorizon)
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-teal-200 dark:border-teal-700 p-6 mb-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in">
      <h2 className="text-2xl font-bold text-teal-700 dark:text-teal-400 mb-6">
        Patient Input Panel
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Medical Summary */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Patient Summary
          </label>
          <textarea
            value={patientSummary}
            onChange={(e) => setPatientSummary(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:text-white resize-none transition-all duration-300 hover:border-teal-400"
            placeholder="Example: 68-year-old male with Type 2 diabetes (HbA1c 8.2%), hypertension (BP 145/92), and early-stage chronic kidney disease (eGFR 55). History of MI 3 years ago. Current medications include metformin, lisinopril, and atorvastatin..."
          />
        </div>

        {/* Treatment Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Treatment Option A
            </label>
            <input
              type="text"
              value={treatmentA}
              onChange={(e) => setTreatmentA(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:text-white transition-all duration-300 hover:border-teal-400"
              placeholder="e.g., Conservative management"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Treatment Option B
            </label>
            <input
              type="text"
              value={treatmentB}
              onChange={(e) => setTreatmentB(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:text-white transition-all duration-300 hover:border-teal-400"
              placeholder="e.g., Surgical intervention"
            />
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Simulation Horizon (Days)
            </label>
            <div className="flex gap-2">
              {['30', '90', '180'].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setSimulationHorizon(days)}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 border-2 transform hover:scale-105 ${
                    simulationHorizon === days
                      ? 'bg-teal-500 text-white border-teal-500 shadow-lg'
                      : 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-600 hover:border-teal-400 hover:shadow-md'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg border-2 border-teal-600 hover:border-teal-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:scale-105 hover:shadow-xl"
          >
            {isLoading ? 'Simulating Care Trajectories...' : 'Simulate Care Trajectories'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
