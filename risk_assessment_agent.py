"""
Risk Assessment Agent
"""
import logging
from typing import Dict, Any
from services.gemini_client import GeminiClient
from utils.json_guard import safe_get

logger = logging.getLogger(__name__)


class RiskAssessmentAgent:
    """
    Agent responsible for clinical risk assessment and complication analysis.
    """
    
    def __init__(self, gemini_client: GeminiClient):
        """
        Initialize Risk Assessment Agent.
        
        Args:
            gemini_client: Configured Gemini client instance
        """
        self.gemini = gemini_client
        self.agent_name = "Risk Assessment Agent"
    
    def analyze(
        self,
        patient_summary: str,
        treatment_option: str,
        simulation_horizon: int
    ) -> Dict[str, Any]:
        """
        Analyze clinical risks and complications for treatment.
        
        Args:
            patient_summary: Patient clinical summary
            treatment_option: Treatment to analyze
            simulation_horizon: Days to simulate
        
        Returns:
            Risk assessment results
        """
        logger.info(f"{self.agent_name}: Analyzing treatment: {treatment_option}")
        
        prompt = self._build_prompt(patient_summary, treatment_option, simulation_horizon)
        
        response = self.gemini.generate_json_response(
            prompt=prompt,
            system_instruction="You are a clinical risk assessment expert AI assistant."
        )
        
        # Handle error responses
        if safe_get(response, "error"):
            logger.error(f"{self.agent_name}: {response.get('error')}")
            return self._create_fallback_response(treatment_option, error=True)
        
        # Validate required fields
        required_fields = [
            "complication_probability",
            "readmission_risk",
            "uncertainty_level",
            "key_risk_factors",
            "mitigation_strategies",
            "insights"
        ]
        
        if all(field in response for field in required_fields):
            logger.info(f"{self.agent_name}: Analysis completed successfully")
            return response
        
        logger.warning(f"{self.agent_name}: Incomplete response, using fallback")
        return self._create_fallback_response(treatment_option)
    
    def _build_prompt(
        self,
        patient_summary: str,
        treatment_option: str,
        simulation_horizon: int
    ) -> str:
        """Build analysis prompt."""
        return f"""
You are a clinical risk assessment expert. Analyze the risks and potential complications of the following treatment.

PATIENT SUMMARY:
{patient_summary}

TREATMENT OPTION:
{treatment_option}

SIMULATION HORIZON: {simulation_horizon} days

Provide a detailed risk assessment with the following JSON structure:

{{
  "complication_probability": <float 0-1, probability of complications>,
  "readmission_risk": "<low/moderate/high/very-high>",
  "uncertainty_level": "<low/moderate/high>",
  "key_risk_factors": [
    "<risk factor 1>",
    "<risk factor 2>",
    "<risk factor 3>"
  ],
  "mitigation_strategies": [
    "<strategy 1>",
    "<strategy 2>",
    "<strategy 3>"
  ],
  "insights": "<detailed explanation of risk factors, uncertainty sources, and recommendations>"
}}

Consider:
- Patient-specific risk factors (age, comorbidities, frailty)
- Treatment-related complications
- Historical outcomes data
- Drug interactions and adverse effects
- Hospital readmission likelihood
- Uncertainty in diagnosis or prognosis

Respond ONLY with valid JSON.
"""
    
    def _create_fallback_response(self, treatment: str, error: bool = False) -> Dict[str, Any]:
        """Create fallback response when Gemini fails."""
        return {
            "complication_probability": 0.0 if error else 0.25,
            "readmission_risk": "unknown" if error else "moderate",
            "uncertainty_level": "high" if error else "moderate",
            "key_risk_factors": [
                "Unable to assess risk factors - system error" if error else "Standard treatment risks",
                "Manual clinical review required" if error else "Patient-specific factors"
            ],
            "mitigation_strategies": [
                "Consult clinical team immediately" if error else "Standard monitoring protocols",
                "Perform comprehensive risk assessment" if error else "Patient education"
            ],
            "insights": (
                f"Error analyzing risks for {treatment}. Manual review required."
                if error
                else f"Standard risk considerations for {treatment}. Further evaluation recommended."
            )
        }
