from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Article, User
from app.schemas import ArticleCreate, ArticleResponse
from app.auth import get_current_admin

router = APIRouter(tags=["Articles"])

@router.post("/articles", status_code=status.HTTP_201_CREATED, response_model=ArticleResponse)
def add_article(
    article: ArticleCreate, 
    db: Session = Depends(get_db), 
    admin_user: User = Depends(get_current_admin)
):
    """Register a new article profile. Requires admin permissions."""
    existing = db.query(Article).filter(Article.id == article.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article unique ID/slug already exists"
        )
    
    new_article = Article(
        id=article.id,
        title=article.title,
        content=article.content
    )
    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    return new_article

@router.get("/articles", response_model=list[ArticleResponse])
def get_articles(db: Session = Depends(get_db)):
    """Retrieve all articles metadata (sorted latest first)."""
    return db.query(Article).order_by(Article.created_at.desc()).all()

@router.get("/articles/{id}", response_model=ArticleResponse)
def get_article(id: str, db: Session = Depends(get_db)):
    """Retrieve detailed content for a specific article."""
    article = db.query(Article).filter(Article.id == id).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    return article
