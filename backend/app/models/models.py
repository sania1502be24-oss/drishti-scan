from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    role = Column(String(50), default="user", nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="user")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    url = Column(Text, nullable=False)
    normalized_url = Column(Text, nullable=False)
    hostname = Column(String(255), index=True, nullable=False)
    scheme = Column(String(20), nullable=False)
    risk_score = Column(Integer, nullable=False)  # 0 to 100
    severity_level = Column(String(30), nullable=False)  # Lower observed risk, Caution, High risk, Very high risk
    is_ip_host = Column(Boolean, default=False, nullable=False)
    has_punycode = Column(Boolean, default=False, nullable=False)
    entropy = Column(Float, default=0.0, nullable=False)
    threat_intel_matched = Column(Boolean, default=False, nullable=False)
    summary = Column(Text, nullable=False)
    ai_analysis = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, index=True, nullable=False)

    user = relationship("User", back_populates="scans")
    findings = relationship("ScanFinding", back_populates="scan", cascade="all, delete-orphan")
    sources = relationship("ScanSource", back_populates="scan", cascade="all, delete-orphan")


class ScanFinding(Base):
    __tablename__ = "scan_findings"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    indicator_key = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # lexical, structure, brand, reputation, security
    severity = Column(String(30), nullable=False)  # low, medium, high, critical
    score_impact = Column(Integer, default=0, nullable=False)
    evidence = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)

    scan = relationship("Scan", back_populates="findings")


class ScanSource(Base):
    __tablename__ = "scan_sources"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    source_name = Column(String(100), nullable=False)
    confidence = Column(Float, default=1.0, nullable=False)
    verdict = Column(String(50), nullable=False)  # clean, suspicious, malicious, unknown
    details = Column(Text, nullable=True)
    last_updated = Column(DateTime, default=utcnow, nullable=False)

    scan = relationship("Scan", back_populates="sources")


class LearningModule(Base):
    __tablename__ = "learning_modules"

    id = Column(Integer, primary_key=True, index=True)
    module_key = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    difficulty = Column(String(50), default="Beginner", nullable=False)
    estimated_minutes = Column(Integer, default=5, nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    overview = Column(Text, nullable=False)
    content_json = Column(Text, nullable=False)  # JSON lessons array
    quiz_json = Column(Text, nullable=False)     # JSON questions array

    attempts = relationship("QuizAttempt", back_populates="module", cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="module", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(Integer, ForeignKey("learning_modules.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False)  # 0 to 100
    correct_answers = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    passed = Column(Boolean, default=False, nullable=False)
    answers_json = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=utcnow, index=True, nullable=False)

    user = relationship("User", back_populates="quiz_attempts")
    module = relationship("LearningModule", back_populates="attempts")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(Integer, ForeignKey("learning_modules.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="not_started", nullable=False)  # not_started, in_progress, completed
    best_score = Column(Integer, default=0, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="progress")
    module = relationship("LearningModule", back_populates="progress")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, index=True, nullable=False)

    user = relationship("User", back_populates="audit_events")
