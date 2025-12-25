/**
 * Transform backend API response to frontend-compatible format
 */

export const transformBackendResponse = (backendData) => {
  if (!backendData || !backendData.agents || !backendData.comparison) {
    throw new Error('Invalid backend response structure');
  }

  console.log('🔄 Transforming backend response:', backendData);

  const { agents, comparison, final_notes } = backendData;

  // Log agent data for debugging
  console.log('📊 Agent Outputs:', {
    surgical_a: agents.surgical_agent?.treatment_a,
    surgical_b: agents.surgical_agent?.treatment_b,
    chronic_a: agents.chronic_care_agent?.treatment_a,
    chronic_b: agents.chronic_care_agent?.treatment_b,
    risk_a: agents.risk_agent?.treatment_a,
    risk_b: agents.risk_agent?.treatment_b,
  });

  // Extract agent insights - combine both treatments for comprehensive view
  const agentInsights = {
    surgical: combineInsights(
      agents.surgical_agent?.treatment_a?.insights,
      agents.surgical_agent?.treatment_b?.insights,
      'Surgical analysis'
    ),
    chronic_care: combineInsights(
      agents.chronic_care_agent?.treatment_a?.insights,
      agents.chronic_care_agent?.treatment_b?.insights,
      'Chronic care analysis'
    ),
    risk: combineInsights(
      agents.risk_agent?.treatment_a?.insights,
      agents.risk_agent?.treatment_b?.insights,
      'Risk assessment'
    )
  };

  // Extract outcome metrics for treatment A using REAL agent data
  const surgicalA = agents.surgical_agent?.treatment_a || {};
  const chronicA = agents.chronic_care_agent?.treatment_a || {};
  const riskA = agents.risk_agent?.treatment_a || {};
  const safetyA = agents.safety_agent?.treatment_a || {};

  console.log('📈 Calculating outcome_a from:', { surgicalA, chronicA, riskA, safetyA });

  const outcome_a = {
    quality_of_life: calculateQualityOfLife(surgicalA, chronicA, comparison.treatment_a),
    readmission_risk: mapReadmissionRisk(riskA.readmission_risk) || 
                     (comparison.treatment_a.overall_safety_score >= 7 ? 'Low' :
                      comparison.treatment_a.overall_safety_score >= 4 ? 'Medium' : 'High'),
    confidence: calculateConfidence(safetyA, riskA, comparison.treatment_a),
    uncertainty: calculateUncertainty(riskA, safetyA)
  };

  console.log('✅ outcome_a calculated:', outcome_a);

  // Extract outcome metrics for treatment B using REAL agent data
  const surgicalB = agents.surgical_agent?.treatment_b || {};
  const chronicB = agents.chronic_care_agent?.treatment_b || {};
  const riskB = agents.risk_agent?.treatment_b || {};
  const safetyB = agents.safety_agent?.treatment_b || {};

  console.log('📈 Calculating outcome_b from:', { surgicalB, chronicB, riskB, safetyB });

  const outcome_b = {
    quality_of_life: calculateQualityOfLife(surgicalB, chronicB, comparison.treatment_b),
    readmission_risk: mapReadmissionRisk(riskB.readmission_risk) ||
                     (comparison.treatment_b.overall_safety_score >= 7 ? 'Low' :
                      comparison.treatment_b.overall_safety_score >= 4 ? 'Medium' : 'High'),
    confidence: calculateConfidence(safetyB, riskB, comparison.treatment_b),
    uncertainty: calculateUncertainty(riskB, safetyB)
  };

  console.log('✅ outcome_b calculated:', outcome_b);

  // Generate timeline data for treatment A using REAL recovery and risk data
  const timeline_a = generateTimelineData(
    surgicalA,
    chronicA,
    riskA,
    comparison.treatment_a
  );

  // Generate timeline data for treatment B using REAL recovery and risk data
  const timeline_b = generateTimelineData(
    surgicalB,
    chronicB,
    riskB,
    comparison.treatment_b
  );

  // Generate risk metrics from REAL agent assessments
  const risks = {
    readmission: {
      treatmentA: calculateRiskScore(riskA, 'readmission'),
      treatmentB: calculateRiskScore(riskB, 'readmission')
    },
    complications: {
      treatmentA: calculateRiskScore(riskA, 'complications'),
      treatmentB: calculateRiskScore(riskB, 'complications')
    },
    deterioration: {
      treatmentA: Math.round(comparison.treatment_a.patient_burden_score * 10),
      treatmentB: Math.round(comparison.treatment_b.patient_burden_score * 10)
    }
  };

  // Generate delay impact data
  const delay_impact = {
    risk_increases: [
      { category: 'Readmission', change: Math.abs(risks.readmission.treatmentA - risks.readmission.treatmentB) },
      { category: 'Complications', change: Math.abs(risks.complications.treatmentA - risks.complications.treatmentB) },
      { category: 'Deterioration', change: Math.abs(risks.deterioration.treatmentA - risks.deterioration.treatmentB) }
    ],
    qol_immediate: outcome_a.quality_of_life,
    qol_1month: Math.max(50, outcome_a.quality_of_life - 10),
    qol_3months: Math.max(40, outcome_a.quality_of_life - 20)
  };

  // Extract reasoning from final notes and agent insights
  const reasoning = [
    // Treatment summaries from comparison
    `Treatment A (${comparison.treatment_a.cost_benefit_ratio} cost-benefit): ${comparison.treatment_a.summary}`,
    `Treatment B (${comparison.treatment_b.cost_benefit_ratio} cost-benefit): ${comparison.treatment_b.summary}`,
    
    // Safety warnings if present
    ...(safetyA.identified_contraindications?.length > 0 ? 
        [`Treatment A Safety: ${safetyA.identified_contraindications.slice(0, 2).join('; ')}`] : []),
    ...(safetyB.identified_contraindications?.length > 0 ? 
        [`Treatment B Safety: ${safetyB.identified_contraindications.slice(0, 2).join('; ')}`] : []),
    
    // Extract key points from final notes
    ...extractReasoningPoints(final_notes)
  ].filter(r => r && r.length > 0).slice(0, 5);

  return {
    treatment_a: 'Treatment A',
    treatment_b: 'Treatment B',
    outcome_a,
    outcome_b,
    timeline_a,
    timeline_b,
    risks,
    delay_impact,
    explanation: {
      reasoning,
      agents: agentInsights
    }
  };
};

/**
 * Combine insights from both treatments
 */
const combineInsights = (insightA, insightB, fallback) => {
  if (insightA && insightB) {
    return 'Treatment A: ' + insightA + '\n\nTreatment B: ' + insightB;
  }
  return insightA || insightB || (fallback + ' pending');
};

/**
 * Calculate quality of life from agent data
 */
const calculateQualityOfLife = (surgical, chronic, comparison) => {
  console.log('🧮 QOL Calculation inputs:', { surgical, chronic, comparison });
  
  // Start with effectiveness score
  let qol = (comparison.effectiveness_score || 7.5) * 10;
  
  // Adjust based on invasiveness (higher invasiveness = lower QOL)
  const invasiveness = surgical.invasiveness_score || 5;
  qol -= (invasiveness * 1.2);  // Increased impact
  
  // Adjust based on medication burden (higher burden = lower QOL)
  const medicationBurden = chronic.medication_burden_score || 5;
  qol -= (medicationBurden * 1.0);  // Significant impact
  
  // Adjust based on lifestyle impact
  const lifestyleImpact = {
    'minimal': 8,
    'moderate': 0,
    'significant': -8,
    'severe': -15
  };
  const lifestyleAdjustment = lifestyleImpact[chronic.lifestyle_impact] || 0;
  qol += lifestyleAdjustment;
  
  // Adjust based on disease stability (better stability = better QOL)
  const stabilityBonus = {
    'excellent': 10,
    'good': 5,
    'fair': 0,
    'poor': -10
  };
  const stabilityAdjustment = stabilityBonus[chronic.disease_stability] || 0;
  qol += stabilityAdjustment;
  
  // Adjust based on recovery time (longer recovery = lower initial QOL)
  const recoveryDays = surgical.recovery_time_days || 30;
  if (recoveryDays > 60) {
    qol -= 8;
  } else if (recoveryDays > 30) {
    qol -= 4;
  }
  
  // Clamp to realistic range
  const finalQol = Math.max(40, Math.min(100, Math.round(qol)));
  
  console.log('📊 QOL calculated:', {
    base: comparison.effectiveness_score * 10,
    invasiveness: -invasiveness * 1.2,
    medication: -medicationBurden * 1.0,
    lifestyle: lifestyleAdjustment,
    stability: stabilityAdjustment,
    recovery: recoveryDays > 60 ? -8 : (recoveryDays > 30 ? -4 : 0),
    final: finalQol
  });
  
  return finalQol;
};

/**
 * Map readmission risk to UI format
 */
const mapReadmissionRisk = (riskLevel) => {
  if (!riskLevel) return null;
  const mapping = {
    'low': 'Low',
    'moderate': 'Medium',
    'high': 'High',
    'very-high': 'High'
  };
  return mapping[riskLevel.toLowerCase()] || riskLevel;
};

/**
 * Calculate confidence score based on multiple factors
 */
const calculateConfidence = (safety, risk, comparison) => {
  console.log('🎯 Calculating confidence from:', { safety, risk, comparison });
  
  let confidence = 50; // Base confidence
  
  // Higher safety score = higher confidence
  const safetyScore = safety.severity_score || 5;
  confidence += (10 - safetyScore) * 5;
  
  // Better overall safety = higher confidence
  const overallSafety = comparison.overall_safety_score || 5;
  confidence += (overallSafety - 5) * 4;
  
  // Lower complication probability = higher confidence
  const complicationProb = risk.complication_probability || 0.15;
  confidence -= (complicationProb * 100);
  
  // Strong recommendation = higher confidence
  if (safety.recommendation && safety.recommendation.toLowerCase().includes('recommend')) {
    confidence += 10;
  } else if (safety.recommendation && safety.recommendation.toLowerCase().includes('not recommend')) {
    confidence -= 10;
  }
  
  const finalConfidence = Math.max(0, Math.min(100, Math.round(confidence)));
  console.log('✅ Confidence calculated:', finalConfidence);
  return finalConfidence;
};

/**
 * Calculate uncertainty level based on risk and safety assessment
 */
const calculateUncertainty = (risk, safety) => {
  console.log('🎲 Calculating uncertainty from:', { risk, safety });
  
  // Start with safety status
  let uncertaintyScore = 0;
  
  if (safety.safety_status === 'safe') {
    uncertaintyScore = 1;
  } else if (safety.safety_status === 'caution') {
    uncertaintyScore = 2;
  } else {
    uncertaintyScore = 3;
  }
  
  // Adjust based on complication probability
  const complicationProb = risk.complication_probability || 0.15;
  if (complicationProb > 0.25) {
    uncertaintyScore += 1;
  } else if (complicationProb < 0.10) {
    uncertaintyScore -= 1;
  }
  
  // Adjust based on readmission risk
  const readmissionRisk = (risk.readmission_risk || '').toLowerCase();
  if (readmissionRisk === 'high' || readmissionRisk === 'very-high') {
    uncertaintyScore += 1;
  } else if (readmissionRisk === 'low') {
    uncertaintyScore -= 1;
  }
  
  // Map to Low/Medium/High
  uncertaintyScore = Math.max(1, Math.min(3, uncertaintyScore));
  const uncertainty = uncertaintyScore === 1 ? 'Low' : uncertaintyScore === 2 ? 'Medium' : 'High';
  
  console.log('✅ Uncertainty calculated:', uncertainty);
  return uncertainty;
};


/**
 * Generate timeline data from REAL agent outputs
 */
const generateTimelineData = (surgical, chronic, risk, comparison) => {
  const timeline = [];
  const months = 18; // Default simulation horizon in months
  
  // Use REAL data from agents
  const recoveryDays = surgical.recovery_time_days || 30;
  const invasiveness = surgical.invasiveness_score || 5;
  const diseaseStability = chronic.disease_stability || 'fair';
  const complicationProb = (risk.complication_probability || 0.25) * 100;
  
  // Initial quality of life based on effectiveness
  const initialQol = comparison.effectiveness_score * 10;
  
  // Stability factor based on chronic care assessment
  const stabilityFactors = {
    'excellent': 1.5,
    'good': 1.0,
    'fair': 0.5,
    'poor': 0.0
  };
  const stabilityFactor = stabilityFactors[diseaseStability] || 0.5;
  
  // Recovery trajectory based on surgical data
  const recoveryMonths = Math.ceil(recoveryDays / 30);
  
  for (let i = 0; i <= months; i += 3) {
    // Calculate score based on recovery phase
    let score;
    if (i < recoveryMonths) {
      // Recovery phase - gradual improvement
      score = initialQol * (0.6 + (i / recoveryMonths) * 0.4);
    } else {
      // Stable phase - influenced by disease stability
      const monthsPastRecovery = i - recoveryMonths;
      score = initialQol + (stabilityFactor * monthsPastRecovery);
    }
    
    // Calculate risk based on complication probability and invasiveness
    const baseRisk = complicationProb;
    const timeRisk = i * (invasiveness * 0.5);
    const risk_value = Math.min(90, baseRisk + timeRisk);
    
    const eventMarkers = {
      3: 'Initial assessment',
      6: 'Recovery checkpoint',
      12: 'Mid-term evaluation',
      18: 'Long-term outcome'
    };

    timeline.push({
      month: i,
      score: Math.max(40, Math.min(100, Math.round(score))),
      risk: Math.max(10, Math.round(risk_value)),
      event: eventMarkers[i] || null
    });
  }
  
  return timeline;
};

/**
 * Calculate risk score from agent data
 */
const calculateRiskScore = (agentData, riskType) => {
  if (!agentData) return 50;
  
  if (riskType === 'readmission') {
    const readmissionMap = { 'low': 25, 'moderate': 50, 'high': 75, 'very-high': 90 };
    return readmissionMap[agentData.readmission_risk?.toLowerCase()] || 50;
  }
  
  if (riskType === 'complications') {
    return Math.round((agentData.complication_probability || 0.5) * 100);
  }
  
  return 50;
};

/**
 * Extract reasoning points from final notes
 */
const extractReasoningPoints = (finalNotes) => {
  if (!finalNotes) return [];
  
  const lines = finalNotes.split('\n').filter(line => 
    line.trim() && 
    !line.includes('====') && 
    !line.includes('CLINICAL') &&
    !line.includes('WARNING') &&
    line.length > 20
  );
  
  return lines
    .slice(0, 3)
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(line => line.length > 0);
};
