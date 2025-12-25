"""
Chronic Care Management Agent
"""
import logging
from typing import Dict, Any
from services.gemini_client import GeminiClient
from utils.json_guard import safe_get

logger = logging.getLogger(__name__)


class ChronicCareAgent:
    """
    Agent responsible for long-term chronic disease management analysis.
    """
    
    def __init__(self, gemini_client: GeminiClient):
        """
        Initialize Chronic Care Agent.
        
        Args:
            gemini_client: Configured Gemini client instance
        """
        self.gemini = gemini_client
        self.agent_name = "Chronic Care Agent"
    
    def analyze(
        self,
        patient_summary: str,
        treatment_option: str,
        simulation_horizon: int
    ) -> Dict[str, Any]:
        """
        Analyze long-term chronic care impact of treatment.
        
        Args:
            patient_summary: Patient clinical summary
            treatment_option: Treatment to analyze
            simulation_horizon: Days to simulate
        
        Returns:
            Chronic care analysis results
        """
        logger.info(f"{self.agent_name}: Analyzing treatment: {treatment_option}")
        
        prompt = self._build_prompt(patient_summary, treatment_option, simulation_horizon)
        
        response = self.gemini.generate_json_response(
            prompt=prompt,
            system_instruction="You are a chronic disease management expert AI assistant."
        )
        
        # Handle error responses
        if safe_get(response, "error"):
            logger.error(f"{self.agent_name}: {response.get('error')}")
            return self._create_fallback_response(treatment_option, error=True)
        
        # Validate required fields
        required_fields = [
            "long_term_management",
            "medication_burden_score",
            "lifestyle_impact",
            "disease_stability",
            "follow_up_frequency",
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
You are a chronic disease management expert. Analyze the long-term care implications of the following treatment.

PATIENT SUMMARY:
{patient_summary}

TREATMENT OPTION:
{treatment_option}

SIMULATION HORIZON: {simulation_horizon} days

Provide a detailed chronic care analysis with the following JSON structure:

{{
  "long_term_management": "<description of ongoing care requirements>",
  "medication_burden_score": <float 0-10, where 10 is highest burden>,
  "lifestyle_impact": "<minimal/moderate/significant/severe>",
  "disease_stability": "<excellent/good/fair/poor>",
  "follow_up_frequency": "<daily/weekly/monthly/quarterly>",
  "insights": "<detailed explanation of long-term management considerations, quality of life impact, and sustainability>"
}}

Consider:
- Number and complexity of medications required
- Frequency of monitoring and follow-up visits
- Impact on daily activities and quality of life
- Disease progression control
- Patient adherence challenges
- Caregiver burden

Respond ONLY with valid JSON.
"""
    
    def _create_fallback_response(self, treatment: str, error: bool = False) -> Dict[str, Any]:
        """Create fallback response when Gemini fails."""
        return {
            "long_term_management": "Unknown - requires evaluation" if error else "Standard chronic care protocol",
            "medication_burden_score": 0.0 if error else 5.0,
            "lifestyle_impact": "unknown" if error else "moderate",
            "disease_stability": "unknown" if error else "fair",
            "follow_up_frequency": "unknown" if error else "monthly",
            "insights": (
                f"Error analyzing chronic care impact for {treatment}. Manual review required."
                if error
                else f"Standard chronic care considerations for {treatment}. Further evaluation recommended."
            )
        }
