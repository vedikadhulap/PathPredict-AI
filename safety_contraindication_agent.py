"""
Safety and Contraindication Agent
"""
import logging
from typing import Dict, Any, List
from services.gemini_client import GeminiClient
from utils.json_guard import safe_get

logger = logging.getLogger(__name__)


class SafetyContraindicationAgent:
    """
    Agent responsible for identifying safety issues and contraindications.
    This agent DOES NOT override decisions, only FLAGS potential risks.
    """
    
    def __init__(self, gemini_client: GeminiClient):
        """
        Initialize Safety Contraindication Agent.
        
        Args:
            gemini_client: Configured Gemini client instance
        """
        self.gemini = gemini_client
        self.agent_name = "Safety Contraindication Agent"
    
    def analyze(
        self,
        patient_summary: str,
        treatment_option: str,
        other_agent_outputs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Identify safety concerns and contraindications for treatment.
        
        Args:
            patient_summary: Patient clinical summary with comorbidities
            treatment_option: Recommended treatment path
            other_agent_outputs: Outputs from surgical, chronic care, and risk agents
        
        Returns:
            Safety assessment with contraindications and warnings
        """
        logger.info(f"{self.agent_name}: Analyzing safety for: {treatment_option}")
        
        prompt = self._build_prompt(
            patient_summary,
            treatment_option,
            other_agent_outputs
        )
        
        response = self.gemini.generate_json_response(
            prompt=prompt,
            system_instruction="You are a clinical safety and contraindication expert AI assistant."
        )
        
        # Handle error responses
        if safe_get(response, "error"):
            logger.error(f"{self.agent_name}: {response.get('error')}")
            return self._create_fallback_response(treatment_option, error=True)
        
        # Validate required fields
        required_fields = [
            "safety_status",
            "identified_contraindications",
            "severity_score",
            "drug_interactions",
            "clinical_warnings",
            "recommendations"
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
        other_agent_outputs: Dict[str, Any]
    ) -> str:
        """Build safety analysis prompt."""
        return f"""
You are a clinical safety expert. Analyze the safety and contraindications for the following treatment plan.

IMPORTANT: You are a SAFETY FLAGGING agent, NOT a decision-override agent. 
Your role is to IDENTIFY and FLAG potential risks, contraindications, and safety concerns.
You DO NOT make final treatment decisions.

PATIENT SUMMARY (including comorbidities):
{patient_summary}

RECOMMENDED TREATMENT:
{treatment_option}

OTHER AGENT ASSESSMENTS:
{self._format_agent_outputs(other_agent_outputs)}

Provide a detailed safety assessment with the following JSON structure:

{{
  "safety_status": "<safe | caution | high-risk>",
  "identified_contraindications": [
    "<contraindication 1 with reason>",
    "<contraindication 2 with reason>"
  ],
  "severity_score": <float 0-10, where 10 is most severe>,
  "drug_interactions": [
    "<interaction 1>",
    "<interaction 2>"
  ],
  "clinical_warnings": [
    "<warning 1>",
    "<warning 2>"
  ],
  "recommendations": "<detailed safety recommendations and monitoring requirements>"
}}

Analyze:
- Absolute contraindications (must not proceed)
- Relative contraindications (proceed with caution)
- Drug-drug interactions
- Drug-disease interactions
- Age-related contraindications
- Organ dysfunction contraindications
- Allergy risks
- Monitoring requirements

Respond ONLY with valid JSON.
"""
    
    def _format_agent_outputs(self, outputs: Dict[str, Any]) -> str:
        """Format other agent outputs for context."""
        formatted = []
        
        if "surgical_agent" in outputs:
            formatted.append(f"Surgical: {outputs['surgical_agent']}")
        
        if "chronic_care_agent" in outputs:
            formatted.append(f"Chronic Care: {outputs['chronic_care_agent']}")
        
        if "risk_agent" in outputs:
            formatted.append(f"Risk: {outputs['risk_agent']}")
        
        return "\n".join(formatted) if formatted else "No other agent data available"
    
    def _create_fallback_response(self, treatment: str, error: bool = False) -> Dict[str, Any]:
        """Create fallback response when Gemini fails."""
        return {
            "safety_status": "high-risk" if error else "caution",
            "identified_contraindications": [
                f"Unable to assess contraindications due to system error - {treatment}"
            ] if error else [
                f"Standard safety review required for {treatment}"
            ],
            "severity_score": 8.0 if error else 5.0,
            "drug_interactions": [
                "System error - manual drug interaction check required"
            ] if error else [
                "Standard drug interaction screening recommended"
            ],
            "clinical_warnings": [
                "CRITICAL: Safety assessment failed - manual clinical review REQUIRED before proceeding"
            ] if error else [
                "Standard clinical monitoring recommended"
            ],
            "recommendations": (
                f"URGENT: Safety agent encountered an error analyzing {treatment}. "
                "Do NOT proceed without manual clinical safety review by qualified healthcare provider."
                if error
                else f"Proceed with standard safety monitoring for {treatment}. "
                "Verify patient-specific contraindications before treatment initiation."
            )
        }
