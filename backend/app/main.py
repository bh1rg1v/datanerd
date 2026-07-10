from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine, Base, SessionLocal
from app.routes import auth, datasets, articles
from app.routes.datasets import seed_default_datasets

app = FastAPI(
    title="Data Nerd API",
    description="Backend API for Data Nerd dataset platform, featuring JWT auth",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize database schemas
Base.metadata.create_all(bind=engine)

# Safely migrate existing database users table to include is_admin column if it doesn't exist
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
except Exception:
    pass

# Seed default datasets if they do not exist
db = SessionLocal()
try:
    seed_default_datasets(db)
finally:
    db.close()

# Register modular routers
app.include_router(auth.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(articles.router, prefix="/api")

@app.get("/")
def home():
    """Base API check."""
    return {"message": "backend running successfully"}