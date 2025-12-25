"""
Surgical Planning Agent
"""
import logging
from typing import Dict, Any
from services.gemini_client import GeminiClient
from utils.json_guard import safe_get

logger = logging.getLogger(__name__)


class SurgicalPlanningAgent:
    """
    Agent responsible for surgical feasibility and planning analysis.
    """
    
    def __init__(self, gemini_client: GeminiClient):
        """
        Initialize Surgical Planning Agent.
        
        Args:
            gemini_client: Configured Gemini client instance
        """
        self.gemini = gemini_client
        self.agent_name = "Surgical Planning Agent"
    
    def analyze(
        self,
        patient_summary: str,
        treatment_option: str,
        simulation_horizon: int
    ) -> Dict[str, Any]:
        """
        Analyze surgical feasibility for given treatment.
        
        Args:
            patient_summary: Patient clinical summary
            treatment_option: Treatment to analyze
            simulation_horizon: Days to simulate
        
        Returns:
            Surgical analysis results
        """
        logger.info(f"{self.agent_name}: Analyzing treatment: {treatment_option}")
        
        prompt = self._build_prompt(patient_summary, treatment_option, simulation_horizon)
        
        response = self.gemini.generate_json_response(
            prompt=prompt,
            system_instruction="You are a surgical planning expert AI assistant."
        )
        
        # Handle error responses
        if safe_get(response, "error"):
            logger.error(f"{self.agent_name}: {response.get('error')}")
            return self._create_fallback_response(treatment_option, error=True)
        
        # Validate required fields
        required_fields = [
            "surgical_feasibility",
            "invasiveness_score",
            "recovery_time_days",
            "procedural_complexity",
            "anesthesia_risk",
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
You are a surgical planning expert. Analyze the surgical feasibility of the following treatment.

PATIENT SUMMARY:
{patient_summary}

TREATMENT OPTION:
{treatment_option}

SIMULATION HORIZON: {simulation_horizon} days

Provide a detailed surgical analysis with the following JSON structure:

{{
  "surgical_feasibility": "<high/moderate/low/not-applicable>",
  "invasiveness_score": <float 0-10, where 10 is most invasive>,
  "recovery_time_days": <integer estimated recovery days>,
  "procedural_complexity": "<low/moderate/high/very-high>",
  "anesthesia_risk": "<low/moderate/high>",
  "insights": "<detailed explanation of surgical considerations, techniques, and expected outcomes>"
}}

Consider:
- Patient's age, comorbidities, and overall health status
- Surgical technique requirements
- Expected blood loss and complications
- Post-operative care needs
- Recovery timeline and rehabilitation

Respond ONLY with valid JSON.
"""
    
    def _create_fallback_response(self, treatment: str, error: bool = False) -> Dict[str, Any]:
        """Create fallback response when Gemini fails."""
        return {
            "surgical_feasibility": "unknown" if error else "moderate",
            "invasiveness_score": 0.0 if error else 5.0,
            "recovery_time_days": 0 if error else 30,
            "procedural_complexity": "unknown" if error else "moderate",
            "anesthesia_risk": "unknown" if error else "moderate",
            "insights": (
                f"Error analyzing surgical feasibility for {treatment}. Manual review required."
                if error
                else f"Standard surgical analysis for {treatment}. Further evaluation recommended."
            )
        }
