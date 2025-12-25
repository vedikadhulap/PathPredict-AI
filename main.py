"""
FastAPI Medical Decision Support System
Multi-Agent Orchestration Backend
"""
import os
import logging
from datetime import datetime
from typing import Dict, Any
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import (
    SimulationRequest,
    SimulationResponse,
    HealthResponse,
    ErrorResponse
)
from services import GeminiClient
from agents import (
    SurgicalPlanningAgent,
    ChronicCareAgent,
    RiskAssessmentAgent,
    SafetyContraindicationAgent
)

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
gemini_client: GeminiClient = None
surgical_agent: SurgicalPlanningAgent = None
chronic_care_agent: ChronicCareAgent = None
risk_agent: RiskAssessmentAgent = None
safety_agent: SafetyContraindicationAgent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - startup and shutdown"""
    global gemini_client, surgical_agent, chronic_care_agent, risk_agent, safety_agent
    
    # Startup
    logger.info("🚀 Starting Medical Decision Support System...")
    
    try:
        # Initialize Gemini client
        gemini_client = GeminiClient()
        logger.info("✓ Gemini client initialized")
        
        # Initialize all agents
        surgical_agent = SurgicalPlanningAgent(gemini_client)
        chronic_care_agent = ChronicCareAgent(gemini_client)
        risk_agent = RiskAssessmentAgent(gemini_client)
        safety_agent = SafetyContraindicationAgent(gemini_client)
        
        logger.info("✓ All agents initialized successfully")
        logger.info("🎯 System ready to accept requests")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize system: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Medical Decision Support System...")


# Create FastAPI app
app = FastAPI(
    title="Medical Decision Support API",
    description="Multi-Agent Medical Decision Support System using Gemini AI",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Medical Decision Support API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "simulate": "/simulate (POST)",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify system status.
    
    Returns:
        HealthResponse with system status
    """
    try:
        # Check if agents are initialized
        if not all([surgical_agent, chronic_care_agent, risk_agent, safety_agent]):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Agents not initialized"
            )
        
        # Check Gemini connectivity
        gemini_healthy = gemini_client.check_health()
        
        if not gemini_healthy:
            logger.warning("Gemini API health check failed")
        
        return HealthResponse(
            status="healthy" if gemini_healthy else "degraded",
            message="All systems operational" if gemini_healthy else "Gemini API connectivity issues",
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Health check failed: {str(e)}"
        )


@app.post("/simulate", response_model=SimulationResponse, tags=["Simulation"])
async def simulate_treatment(request: SimulationRequest):
    """
    Run multi-agent medical decision support simulation.
    
    Args:
        request: SimulationRequest with patient data and treatment options
    
    Returns:
        SimulationResponse with agent outputs and comparison
    """
    logger.info(f"📋 New simulation request received")
    logger.info(f"   Patient: {request.patient_summary[:100]}...")
    logger.info(f"   Treatment A: {request.treatment_a}")
    logger.info(f"   Treatment B: {request.treatment_b}")
    logger.info(f"   Horizon: {request.simulation_horizon} days")
    
    try:
        # Orchestrate multi-agent analysis
        result = await orchestrate_agents(
            patient_summary=request.patient_summary,
            treatment_a=request.treatment_a,
            treatment_b=request.treatment_b,
            simulation_horizon=request.simulation_horizon
        )
        
        logger.info("✅ Simulation completed successfully")
        return result
    
    except Exception as e:
        logger.error(f"❌ Simulation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation failed: {str(e)}"
        )


async def orchestrate_agents(
    patient_summary: str,
    treatment_a: str,
    treatment_b: str,
    simulation_horizon: int
) -> SimulationResponse:
    """
    Orchestrate all agents to analyze both treatment options.
    
    Args:
        patient_summary: Patient clinical summary
        treatment_a: First treatment option
        treatment_b: Second treatment option
        simulation_horizon: Days to simulate
    
    Returns:
        Complete simulation response
    """
    logger.info("🤖 Orchestrating multi-agent analysis...")
    
    # Analyze Treatment A
    logger.info("🔍 Analyzing Treatment A...")
    surgical_a = surgical_agent.analyze(patient_summary, treatment_a, simulation_horizon)
    chronic_a = chronic_care_agent.analyze(patient_summary, treatment_a, simulation_horizon)
    risk_a = risk_agent.analyze(patient_summary, treatment_a, simulation_horizon)
    
    # Pass Treatment A outputs to safety agent
    safety_a = safety_agent.analyze(
        patient_summary=patient_summary,
        treatment_option=treatment_a,
        other_agent_outputs={
            "surgical_agent": surgical_a,
            "chronic_care_agent": chronic_a,
            "risk_agent": risk_a
        }
    )
    
    # Analyze Treatment B
    logger.info("🔍 Analyzing Treatment B...")
    surgical_b = surgical_agent.analyze(patient_summary, treatment_b, simulation_horizon)
    chronic_b = chronic_care_agent.analyze(patient_summary, treatment_b, simulation_horizon)
    risk_b = risk_agent.analyze(patient_summary, treatment_b, simulation_horizon)
    
    # Pass Treatment B outputs to safety agent
    safety_b = safety_agent.analyze(
        patient_summary=patient_summary,
        treatment_option=treatment_b,
        other_agent_outputs={
            "surgical_agent": surgical_b,
            "chronic_care_agent": chronic_b,
            "risk_agent": risk_b
        }
    )
    
    # Generate comparison
    logger.info("📊 Generating treatment comparison...")
    comparison_a = generate_treatment_comparison(
        surgical=surgical_a,
        chronic=chronic_a,
        risk=risk_a,
        safety=safety_a,
        treatment_name=treatment_a,
        priority=1
    )
    
    comparison_b = generate_treatment_comparison(
        surgical=surgical_b,
        chronic=chronic_b,
        risk=risk_b,
        safety=safety_b,
        treatment_name=treatment_b,
        priority=2
    )
    
    # Generate final notes
    final_notes = generate_final_notes(
        treatment_a=treatment_a,
        treatment_b=treatment_b,
        comparison_a=comparison_a,
        comparison_b=comparison_b,
        safety_a=safety_a,
        safety_b=safety_b
    )
    
    return SimulationResponse(
        agents={
            "surgical_agent": {
                "treatment_a": surgical_a,
                "treatment_b": surgical_b
            },
            "chronic_care_agent": {
                "treatment_a": chronic_a,
                "treatment_b": chronic_b
            },
            "risk_agent": {
                "treatment_a": risk_a,
                "treatment_b": risk_b
            },
            "safety_agent": {
                "treatment_a": safety_a,
                "treatment_b": safety_b
            }
        },
        comparison={
            "treatment_a": comparison_a,
            "treatment_b": comparison_b
        },
        final_notes=final_notes
    )


def generate_treatment_comparison(
    surgical: Dict[str, Any],
    chronic: Dict[str, Any],
    risk: Dict[str, Any],
    safety: Dict[str, Any],
    treatment_name: str,
    priority: int
) -> Dict[str, Any]:
    """
    Generate comparison metrics for a treatment option.
    
    Args:
        surgical: Surgical agent output
        chronic: Chronic care agent output
        risk: Risk agent output
        safety: Safety agent output
        treatment_name: Name of treatment
        priority: Priority ranking (1 or 2)
    
    Returns:
        Treatment comparison dictionary
    """
    # Calculate overall safety score (inverse of severity)
    safety_score = max(0, 10 - safety.get("severity_score", 5))
    
    # Calculate effectiveness (based on feasibility and stability)
    effectiveness_score = 7.0  # Default moderate
    if surgical.get("surgical_feasibility") == "high":
        effectiveness_score += 1.5
    if chronic.get("disease_stability") == "excellent":
        effectiveness_score += 1.5
    effectiveness_score = min(10, effectiveness_score)
    
    # Calculate patient burden (combination of invasiveness and medication burden)
    invasiveness = surgical.get("invasiveness_score", 5)
    medication_burden = chronic.get("medication_burden_score", 5)
    patient_burden_score = (invasiveness + medication_burden) / 2
    
    # Determine cost-benefit ratio
    if effectiveness_score > 7 and patient_burden_score < 5:
        cost_benefit = "favorable"
    elif effectiveness_score < 5 or patient_burden_score > 7:
        cost_benefit = "unfavorable"
    else:
        cost_benefit = "moderate"
    
    # Generate summary
    summary = (
        f"{treatment_name}: "
        f"Safety {safety.get('safety_status', 'unknown')}, "
        f"Effectiveness {effectiveness_score:.1f}/10, "
        f"Burden {patient_burden_score:.1f}/10. "
        f"{safety.get('recommendations', '')[:100]}..."
    )
    
    return {
        "overall_safety_score": round(safety_score, 2),
        "effectiveness_score": round(effectiveness_score, 2),
        "patient_burden_score": round(patient_burden_score, 2),
        "cost_benefit_ratio": cost_benefit,
        "recommended_priority": priority,
        "summary": summary
    }


def generate_final_notes(
    treatment_a: str,
    treatment_b: str,
    comparison_a: Dict[str, Any],
    comparison_b: Dict[str, Any],
    safety_a: Dict[str, Any],
    safety_b: Dict[str, Any]
) -> str:
    """
    Generate final clinical notes and recommendations.
    
    Args:
        treatment_a: Name of treatment A
        treatment_b: Name of treatment B
        comparison_a: Comparison data for treatment A
        comparison_b: Comparison data for treatment B
        safety_a: Safety assessment for treatment A
        safety_b: Safety assessment for treatment B
    
    Returns:
        Final notes string
    """
    notes = []
    
    notes.append("CLINICAL DECISION SUPPORT SUMMARY")
    notes.append("=" * 60)
    notes.append("")
    
    # Safety warnings
    if safety_a.get("safety_status") == "high-risk":
        notes.append(f"⚠️ WARNING: {treatment_a} flagged as HIGH RISK")
        notes.append(f"   Contraindications: {', '.join(safety_a.get('identified_contraindications', [])[:3])}")
        notes.append("")
    
    if safety_b.get("safety_status") == "high-risk":
        notes.append(f"⚠️ WARNING: {treatment_b} flagged as HIGH RISK")
        notes.append(f"   Contraindications: {', '.join(safety_b.get('identified_contraindications', [])[:3])}")
        notes.append("")
    
    # Comparison summary
    notes.append("TREATMENT COMPARISON:")
    notes.append(f"  {treatment_a}:")
    notes.append(f"    - Safety: {comparison_a['overall_safety_score']}/10")
    notes.append(f"    - Effectiveness: {comparison_a['effectiveness_score']}/10")
    notes.append(f"    - Patient Burden: {comparison_a['patient_burden_score']}/10")
    notes.append("")
    notes.append(f"  {treatment_b}:")
    notes.append(f"    - Safety: {comparison_b['overall_safety_score']}/10")
    notes.append(f"    - Effectiveness: {comparison_b['effectiveness_score']}/10")
    notes.append(f"    - Patient Burden: {comparison_b['patient_burden_score']}/10")
    notes.append("")
    
    # Recommendation
    notes.append("RECOMMENDATION:")
    notes.append("This is an AI-assisted clinical decision support tool.")
    notes.append("Final treatment decisions MUST be made by qualified healthcare providers")
    notes.append("considering the complete clinical context and patient preferences.")
    notes.append("")
    notes.append("All identified contraindications and safety warnings should be")
    notes.append("thoroughly reviewed before proceeding with any treatment.")
    
    return "\n".join(notes)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler to prevent server crashes"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="Internal server error",
            detail=str(exc),
            timestamp=datetime.now().isoformat()
        ).dict()
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
