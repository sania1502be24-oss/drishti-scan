from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- URL Scanner Schemas ---
class URLScanRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="Target URL to assess")
    save_to_history: Optional[bool] = True

class FindingResponse(BaseModel):
    indicator_key: str
    title: str
    category: str
    severity: str
    score_impact: int
    evidence: str
    explanation: str
    recommendation: str

    model_config = ConfigDict(from_attributes=True)

class SourceResponse(BaseModel):
    source_name: str
    confidence: float
    verdict: str
    details: Optional[str] = None
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)

class URLScanResponse(BaseModel):
    id: Optional[int] = None
    url: str
    normalized_url: str
    hostname: str
    scheme: str
    risk_score: int
    severity_level: str
    is_ip_host: bool
    has_punycode: bool
    entropy: float
    threat_intel_matched: bool
    summary: str
    ai_analysis: Optional[str] = None
    created_at: datetime
    findings: List[FindingResponse] = []
    sources: List[SourceResponse] = []
    recommendations: List[str] = []
    limitations_disclaimer: str

    model_config = ConfigDict(from_attributes=True)

class ScanListItem(BaseModel):
    id: int
    url: str
    hostname: str
    risk_score: int
    severity_level: str
    created_at: datetime
    findings_count: int

    model_config = ConfigDict(from_attributes=True)


# --- Dashboard Schemas ---
class RiskDistribution(BaseModel):
    low: int = 0
    caution: int = 0
    high: int = 0
    critical: int = 0

class DailyTrendItem(BaseModel):
    date: str
    count: int
    avg_score: float

class IndicatorFrequency(BaseModel):
    name: str
    count: int

class DashboardStats(BaseModel):
    total_scans: int
    avg_risk_score: float
    risk_distribution: RiskDistribution
    indicator_frequency: List[IndicatorFrequency]
    daily_trends: List[DailyTrendItem]
    recent_scans: List[ScanListItem]
    academy_progress_percent: float
    quizzes_passed: int
    total_modules: int


# --- Learning & Quiz Schemas ---
class QuizQuestion(BaseModel):
    id: int
    question: str
    scenario_context: Optional[str] = None
    visual_type: Optional[str] = None  # email_header, url_inspect, sms_mock, none
    visual_payload: Optional[Dict[str, Any]] = None
    options: List[str]
    correct_index: int
    explanation: str
    threat_category: str

class LearningModuleSummary(BaseModel):
    id: int
    module_key: str
    title: str
    category: str
    difficulty: str
    estimated_minutes: int
    order_index: int
    overview: str
    status: str = "not_started"
    best_score: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class LearningModuleDetail(LearningModuleSummary):
    content_json: str
    questions: List[QuizQuestion]

class QuizSubmitRequest(BaseModel):
    module_id: int
    answers: Dict[int, int]  # question_id -> selected_option_index

class QuizResultResponse(BaseModel):
    module_id: int
    score: int
    correct_answers: int
    total_questions: int
    passed: bool
    review: List[Dict[str, Any]]
    feedback: str
