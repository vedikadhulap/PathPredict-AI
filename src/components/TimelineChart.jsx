import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const TimelineChart = ({ timelineData, treatmentA, treatmentB, darkMode }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Month {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        📊 Long-Term Outcome Timeline
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Projected health stability trajectory over time
      </p>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="month" 
            label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
            stroke={darkMode ? '#9ca3af' : '#6b7280'}
          />
          <YAxis 
            label={{ value: 'Health Stability Score', angle: -90, position: 'insideLeft' }}
            stroke={darkMode ? '#9ca3af' : '#6b7280'}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="treatmentA" 
            name={treatmentA}
            stroke="#0ea5e9" 
            strokeWidth={3}
            dot={{ fill: '#0ea5e9', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="treatmentB" 
            name={treatmentB}
            stroke="#8b5cf6" 
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          {timelineData.some(d => d.event) && timelineData.map((point, idx) => 
            point.event ? (
              <ReferenceLine 
                key={idx}
                x={point.month} 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                strokeDasharray="3 3"
                label={{ value: point.event, position: 'top', fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>Note:</strong> This timeline represents estimated health stability trends. 
          Individual patient responses may vary. Consult with specialists for personalized care planning.
        </p>
      </div>
    </div>
  );
};

export default TimelineChart;
