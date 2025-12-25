import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientForm from './components/PatientForm';
import AgentCards from './components/AgentCards';
import OutcomeCards from './components/OutcomeCards';
import HorizontalTimeline from './components/HorizontalTimeline';
import RiskHeatmap from './components/RiskHeatmap';
import DelayImpact from './components/DelayImpact';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import { transformBackendResponse } from './utils/apiTransform';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
      setBackendStatus(response.data.status === 'healthy' ? 'online' : 'degraded');
    } catch (err) {
      console.warn('Backend health check failed:', err.message);
      setBackendStatus('offline');
    }
  };

  const handleSimulation = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Real API call to FastAPI backend
      const response = await axios.post(`${API_BASE_URL}/simulate`, formData, {
        timeout: 60000, // 60 seconds for AI processing
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Transform backend response to frontend format
      const transformedData = transformBackendResponse(response.data);
      
      // Add treatment names from form
      transformedData.treatment_a = formData.treatment_a;
      transformedData.treatment_b = formData.treatment_b;
      
      setSimulationData(transformedData);
      setBackendStatus('online');
      
    } catch (err) {
      console.error('Backend API error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. The AI analysis is taking longer than expected. Please try again.');
      } else if (err.response) {
        // Backend returned an error
        setError(`Backend error: ${err.response.data?.error || err.response.statusText}`);
      } else if (err.request) {
        // No response received
        setError('Cannot connect to backend. Please ensure the FastAPI server is running on http://localhost:8000');
        setBackendStatus('offline');
      } else {
        setError(`Error: ${err.message}`);
      }
      
      // Optionally fallback to mock data for demo purposes
      if (backendStatus === 'offline') {
        console.log('Using mock data for demonstration');
        const mockData = generateMockData(formData);
        setSimulationData(mockData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (formData) => {
    const horizon = formData.simulation_horizon;
    const timelineA = [];
    const timelineB = [];
    
    // Generate timeline data with risk scores
    for (let i = 0; i <= horizon; i += Math.ceil(horizon / 6)) {
      const eventMarkers = {
        [Math.floor(horizon / 3)]: 'Recovery plateau',
        [Math.floor(horizon * 2 / 3)]: 'Follow-up assessment',
      };

      timelineA.push({
        month: i,
        score: Math.round(75 - (i * 1.5) + Math.random() * 5),
        risk: 45 + (i * 2),
        event: eventMarkers[i] || null,
      });

      timelineB.push({
        month: i,
        score: Math.round(65 + (i * 1.2) + Math.random() * 5),
        risk: 35 + (i * 1.5),
        event: eventMarkers[i] || null,
      });
    }

    return {
      treatment_a: formData.treatment_a,
      treatment_b: formData.treatment_b,
      outcome_a: {
        quality_of_life: 72,
        readmission_risk: 'Medium',
        confidence: 78,
        uncertainty: 'Medium'
      },
      outcome_b: {
        quality_of_life: 85,
        readmission_risk: 'Low',
        confidence: 88,
        uncertainty: 'Low'
      },
      timeline_a: timelineA,
      timeline_b: timelineB,
      risks: {
        readmission: {
          treatmentA: 55,
          treatmentB: 32
        },
        complications: {
          treatmentA: 48,
          treatmentB: 28
        },
        deterioration: {
          treatmentA: 42,
          treatmentB: 25
        }
      },
      delay_impact: {
        risk_increases: [
          { category: 'Readmission', change: 8 },
          { category: 'Complications', change: 12 },
          { category: 'Deterioration', change: 6 }
        ],
        qol_immediate: 85,
        qol_1month: 76,
        qol_3months: 64
      },
      explanation: {
        reasoning: [
          'Patient presents with multiple chronic comorbidities requiring comprehensive long-term management strategy',
          'Treatment B demonstrates superior projected outcomes across quality of life and risk metrics over the simulation horizon',
          'Cardiovascular risk factors indicate that intervention-based approach may yield better long-term stability',
          'Current medication regimen and patient compliance history support structured treatment protocol',
          'Age-adjusted functional status and baseline health metrics favor more aggressive treatment pathway with appropriate monitoring'
        ],
        agents: {
          surgical: 'Procedural intervention carries acceptable risk given patient profile. Expected recovery trajectory aligns with population norms for this demographic cohort.',
          chronic_care: 'Long-term medication adherence and lifestyle modification remain critical success factors. Structured follow-up protocol with quarterly assessments recommended.',
          risk: 'Baseline comorbidity burden elevates overall risk profile. However, delaying definitive treatment introduces compounding deterioration risk across the 12-month horizon.'
        }
      }
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-all duration-500">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b-2 border-teal-500 dark:border-teal-600 shadow-lg animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400">
                PathPredict AI
              </h1>
              <p className="text-sm text-teal-600 dark:text-teal-400 mt-1 font-medium">
                Autonomous Multi-Agent Clinical Trajectory Simulation
              </p>
              {/* Backend Status Indicator */}
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online' ? 'bg-green-500 animate-pulse' :
                  backendStatus === 'degraded' ? 'bg-yellow-500' :
                  backendStatus === 'offline' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {backendStatus === 'online' ? 'AI Backend Connected' :
                   backendStatus === 'degraded' ? 'AI Backend Degraded' :
                   backendStatus === 'offline' ? 'AI Backend Offline' : 'Checking...'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-lg border-2 border-blue-300 dark:border-blue-600 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          <div className="mt-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
            Decision-support only. Not a diagnostic tool.
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PatientForm onSimulate={handleSimulation} isLoading={isLoading} />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 mb-6 animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  System Notice
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
                {backendStatus === 'offline' && (
                  <button
                    onClick={checkBackendHealth}
                    className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:text-red-800 dark:hover:text-red-200"
                  >
                    Retry connection
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {simulationData && (
          <div className="space-y-8 animate-fade-in">
            <AgentCards agents={simulationData.explanation.agents} />
            
            <ExplainabilityPanel explanation={simulationData.explanation} />
            
            <OutcomeCards 
              outcomeA={simulationData.outcome_a}
              outcomeB={simulationData.outcome_b}
              treatmentA={simulationData.treatment_a}
              treatmentB={simulationData.treatment_b}
            />

            <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-200 dark:border-blue-700 p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Treatment Path Comparison
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <HorizontalTimeline 
                  timelineData={simulationData.timeline_a}
                  treatmentName={simulationData.treatment_a}
                  isLeft={true}
                />
                <HorizontalTimeline 
                  timelineData={simulationData.timeline_b}
                  treatmentName={simulationData.treatment_b}
                  isLeft={false}
                />
              </div>
            </div>

            <RiskHeatmap risks={simulationData.risks} />

            <DelayImpact delayData={simulationData.delay_impact} />

            {/* Ethical Guardrails Panel */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-slate-300 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Ethical & Safety Guardrails
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                  <span>This system provides decision-support only and does not make clinical diagnoses</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                  <span>All projections are estimates based on population-level data and statistical modeling</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                  <span>Clinical decisions must integrate physician expertise, patient preferences, and current evidence-based guidelines</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                  <span>Uncertainty levels indicate model confidence and should inform decision-making weight</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {!simulationData && !isLoading && (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-teal-500 dark:text-teal-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
              Enter patient information to simulate long-term outcome trajectories
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            PathPredict AI © 2025 — Clinical Decision-Support Research Tool — For demonstration and educational purposes
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
