import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import LearningModule, QuizAttempt, UserProgress, User
from app.schemas.schemas import (
    LearningModuleSummary, LearningModuleDetail, QuizQuestion, QuizSubmitRequest, QuizResultResponse
)
from app.api.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/academy", tags=["Cyber Awareness Academy"])

@router.get("/modules", response_model=List[LearningModuleSummary])
def list_learning_modules(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve all cyber awareness learning modules with personalized progress."""
    modules = db.query(LearningModule).order_by(LearningModule.order_index.asc()).all()
    
    user_progress_map = {}
    if current_user:
        progresses = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).all()
        user_progress_map = {p.module_id: p for p in progresses}

    summaries = []
    for m in modules:
        prog = user_progress_map.get(m.id)
        summaries.append(LearningModuleSummary(
            id=m.id,
            module_key=m.module_key,
            title=m.title,
            category=m.category,
            difficulty=m.difficulty,
            estimated_minutes=m.estimated_minutes,
            order_index=m.order_index,
            overview=m.overview,
            status=prog.status if prog else "not_started",
            best_score=prog.best_score if prog else 0
        ))
    return summaries

@router.get("/modules/{module_id}", response_model=LearningModuleDetail)
def get_module_detail(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve lessons and quiz questions for a specific learning module."""
    module = db.query(LearningModule).filter(LearningModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Learning module not found.")

    raw_questions = json.loads(module.quiz_json or "[]")
    
    # Hide correct_index from client payload to enforce server-side evaluation
    safe_questions = []
    for q in raw_questions:
        safe_questions.append(QuizQuestion(
            id=q["id"],
            question=q["question"],
            scenario_context=q.get("scenario_context"),
            visual_type=q.get("visual_type"),
            visual_payload=q.get("visual_payload"),
            options=q["options"],
            correct_index=-1,  # Redacted for integrity
            explanation="",    # Redacted until submission
            threat_category=q.get("threat_category", "General")
        ))

    status_val = "not_started"
    best_score_val = 0
    if current_user:
        prog = db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.module_id == module.id
        ).first()
        if prog:
            status_val = prog.status
            best_score_val = prog.best_score

    return LearningModuleDetail(
        id=module.id,
        module_key=module.module_key,
        title=module.title,
        category=module.category,
        difficulty=module.difficulty,
        estimated_minutes=module.estimated_minutes,
        order_index=module.order_index,
        overview=module.overview,
        status=status_val,
        best_score=best_score_val,
        content_json=module.content_json,
        questions=safe_questions
    )

@router.post("/quiz/submit", response_model=QuizResultResponse)
def submit_quiz_attempt(
    submission: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Grade quiz submission server-side, record attempt, and update user learning progress."""
    module = db.query(LearningModule).filter(LearningModule.id == submission.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found.")

    questions = json.loads(module.quiz_json or "[]")
    if not questions:
        raise HTTPException(status_code=400, detail="No questions configured for this module.")

    correct_count = 0
    total = len(questions)
    review = []
    weak_categories = []

    for q in questions:
        q_id = q["id"]
        correct_idx = q["correct_index"]
        user_choice = submission.answers.get(q_id, -1)
        is_correct = (user_choice == correct_idx)

        if is_correct:
            correct_count += 1
        else:
            cat = q.get("threat_category", "Cybersecurity")
            if cat not in weak_categories:
                weak_categories.append(cat)

        review.append({
            "question_id": q_id,
            "question": q["question"],
            "options": q["options"],
            "user_choice": user_choice,
            "correct_choice": correct_idx,
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
            "threat_category": q.get("threat_category", "Cybersecurity")
        })

    score_pct = int(round((correct_count / total) * 100))
    passed = (score_pct >= 70)

    # Record attempt
    attempt = QuizAttempt(
        user_id=current_user.id,
        module_id=module.id,
        score=score_pct,
        correct_answers=correct_count,
        total_questions=total,
        passed=passed,
        answers_json=json.dumps(submission.answers),
        completed_at=datetime.now(timezone.utc)
    )
    db.add(attempt)

    # Update or create user progress
    prog = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.module_id == module.id
    ).first()

    if not prog:
        prog = UserProgress(
            user_id=current_user.id,
            module_id=module.id,
            status="completed" if passed else "in_progress",
            best_score=score_pct,
            completed_at=datetime.now(timezone.utc) if passed else None
        )
        db.add(prog)
    else:
        if score_pct > prog.best_score:
            prog.best_score = score_pct
        if passed:
            prog.status = "completed"
            prog.completed_at = datetime.now(timezone.utc)
        elif prog.status != "completed":
            prog.status = "in_progress"

    db.commit()

    if passed:
        feedback = f"Outstanding work! You demonstrated solid mastery of {module.title} with a score of {score_pct}%."
    else:
        feedback = f"You scored {score_pct}%. Passing requirement is 70%. Review topics in {', '.join(weak_categories) if weak_categories else 'the lessons'} and retake the quiz."

    return QuizResultResponse(
        module_id=module.id,
        score=score_pct,
        correct_answers=correct_count,
        total_questions=total,
        passed=passed,
        review=review,
        feedback=feedback
    )
