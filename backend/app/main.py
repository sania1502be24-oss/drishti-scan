from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import Base, engine, get_db
from app.services.academy_content import seed_learning_modules
from app.api.routes.auth import router as auth_router
from app.api.routes.scans import router as scans_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.academy import router as academy_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed default educational modules
    db = next(get_db())
    try:
        seed_learning_modules(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Drishti Scan API — See Threats. Secure What Matters. Cybersecurity Assessment & Awareness Platform.",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(scans_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(academy_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """System health check endpoint verifying database connectivity."""
    db_status = "connected"
    try:
        db.execute(Base.metadata.tables["users"].select().limit(1))
    except Exception:
        db_status = "degraded"

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "database": db_status
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Drishti Scan API — See Threats. Secure What Matters.",
        "documentation": "/docs",
        "health": "/api/health"
    }
