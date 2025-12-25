# 🏥 Medical Decision Support System - Backend

A multi-agent medical decision support system powered by FastAPI and Google Gemini API.

## 🎯 Overview

This backend implements a sophisticated multi-agent AI system that analyzes medical treatment options using:
- **Surgical Planning Agent**: Evaluates surgical feasibility and procedural complexity
- **Chronic Care Agent**: Assesses long-term disease management impact
- **Risk Assessment Agent**: Identifies complications and readmission risks
- **Safety Contraindication Agent**: Flags safety concerns and contraindications

## 🏗️ Architecture

```
backend/
├── main.py                          # FastAPI app & orchestration
├── agents/
│   ├── surgical_agent.py            # Surgical planning analysis
│   ├── chronic_care_agent.py        # Chronic disease management
│   ├── risk_assessment_agent.py     # Risk & complication assessment
│   └── safety_contraindication_agent.py  # Safety flagging (non-overriding)
├── services/
│   └── gemini_client.py             # Reusable Gemini API client
├── models/
│   └── schemas.py                   # Pydantic request/response models
├── utils/
│   └── json_guard.py                # JSON extraction & validation
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment template
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment**
   ```bash
   # Copy template
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   # GEMINI_API_KEY=your_actual_api_key_here
   ```

### Running the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

Server will start at: `http://localhost:8000`

## 📡 API Endpoints

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "message": "All systems operational",
  "timestamp": "2025-12-25T10:30:00"
}
```

### Simulate Treatment
```http
POST /simulate
```

**Request Body:**
```json
{
  "patient_summary": "72-year-old male with hypertension, diabetes, chronic kidney disease stage 3...",
  "treatment_a": "Percutaneous coronary intervention (PCI) with drug-eluting stent",
  "treatment_b": "Conservative medical management with dual antiplatelet therapy",
  "simulation_horizon": 90
}
```

**Response:**
```json
{
  "agents": {
    "surgical_agent": {
      "treatment_a": { ... },
      "treatment_b": { ... }
    },
    "chronic_care_agent": { ... },
    "risk_agent": { ... },
    "safety_agent": { ... }
  },
  "comparison": {
    "treatment_a": {
      "overall_safety_score": 7.5,
      "effectiveness_score": 8.2,
      "patient_burden_score": 6.0,
      "cost_benefit_ratio": "favorable",
      "recommended_priority": 1,
      "summary": "..."
    },
    "treatment_b": { ... }
  },
  "final_notes": "CLINICAL DECISION SUPPORT SUMMARY\n..."
}
```

### Interactive Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

### Test Simulation (PowerShell)
```powershell
$body = @{
    patient_summary = "65-year-old female with atrial fibrillation"
    treatment_a = "Ablation therapy"
    treatment_b = "Rate control medication"
    simulation_horizon = 90
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/simulate -Method Post -Body $body -ContentType "application/json"
```

### Test Simulation (Bash/curl)
```bash
curl -X POST http://localhost:8000/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "patient_summary": "65-year-old female with atrial fibrillation",
    "treatment_a": "Ablation therapy",
    "treatment_b": "Rate control medication",
    "simulation_horizon": 90
  }'
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | - | Your Gemini API key |
| `HOST` | No | 0.0.0.0 | Server host |
| `PORT` | No | 8000 | Server port |
| `LOG_LEVEL` | No | INFO | Logging level |

### CORS Configuration

By default, CORS is configured to allow all origins (`*`) for development. 

**For production**, edit [main.py](main.py#L67):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🏥 Agent Details

### 1. Surgical Planning Agent
- **Purpose**: Evaluate surgical feasibility
- **Outputs**: Invasiveness score, recovery time, procedural complexity, anesthesia risk
- **Location**: [agents/surgical_agent.py](agents/surgical_agent.py)

### 2. Chronic Care Agent
- **Purpose**: Assess long-term disease management
- **Outputs**: Medication burden, lifestyle impact, disease stability, follow-up frequency
- **Location**: [agents/chronic_care_agent.py](agents/chronic_care_agent.py)

### 3. Risk Assessment Agent
- **Purpose**: Identify complications and risks
- **Outputs**: Complication probability, readmission risk, key risk factors, mitigation strategies
- **Location**: [agents/risk_assessment_agent.py](agents/risk_assessment_agent.py)

### 4. Safety Contraindication Agent
- **Purpose**: Flag safety concerns (does NOT override decisions)
- **Outputs**: Safety status, contraindications, severity score, drug interactions, warnings
- **Location**: [agents/safety_contraindication_agent.py](agents/safety_contraindication_agent.py)

**IMPORTANT**: The Safety Agent only FLAGS risks; it does not make final decisions.

## 🛡️ Error Handling

The system implements comprehensive error handling:
- **JSON Parsing**: Multiple fallback strategies for Gemini responses
- **Agent Failures**: Graceful degradation with fallback responses
- **API Errors**: Structured error messages with context
- **Global Exception Handler**: Prevents server crashes

All errors are logged for debugging while returning user-friendly messages.

## 📊 Logging

Logs include:
- Request/response tracking
- Agent execution status
- Gemini API interactions
- Error details with stack traces

Adjust log level in `.env`:
```env
LOG_LEVEL=DEBUG  # DEBUG, INFO, WARNING, ERROR
```

## 🔒 Security Notes

1. **Never commit `.env` file** - Contains sensitive API keys
2. **Use environment variables** - Don't hardcode credentials
3. **Configure CORS properly** - Restrict origins in production
4. **Validate inputs** - Pydantic models enforce validation
5. **Rate limiting** - Consider adding rate limiting for production

## 🚨 Troubleshooting

### "Gemini API key not found"
- Ensure `.env` file exists in `backend/` directory
- Verify `GEMINI_API_KEY` is set correctly
- Check that `.env` is not in `.gitignore` exclusions

### "Empty response from Gemini"
- Verify API key is valid
- Check internet connectivity
- Review Gemini API quotas/limits

### Import errors
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version` (requires 3.9+)

### CORS errors from frontend
- Check `allow_origins` in [main.py](main.py#L67)
- Ensure frontend URL is allowed
- Verify CORS middleware is configured

## 📝 Development

### Adding a New Agent

1. Create agent file in `agents/`
2. Implement class with `analyze()` method
3. Add to `agents/__init__.py`
4. Initialize in `main.py` lifespan
5. Integrate in orchestration flow

### Modifying Response Schema

1. Update models in `models/schemas.py`
2. Adjust agent prompts to match new fields
3. Update `generate_treatment_comparison()` logic
4. Test with `/docs` endpoint

## 📄 License

This is a medical decision support tool. Use responsibly and always consult qualified healthcare professionals.

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Review logs in console
3. Test with `/docs` interactive API
4. Verify Gemini API status

---

**⚠️ MEDICAL DISCLAIMER**: This is an AI-assisted clinical decision support tool. Final treatment decisions MUST be made by qualified healthcare providers considering complete clinical context and patient preferences.
