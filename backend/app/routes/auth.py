from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(tags=["Authentication"])

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_pwd = hash_password(user.password)
    new_user = User(
        name=user.name, 
        email=user.email, 
        hashed_password=hashed_pwd, 
        is_admin=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Auto-generate token on signup
    token_data = {"user_id": new_user.id, "email": new_user.email, "is_admin": new_user.is_admin}
    token = create_access_token(data=token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "is_admin": new_user.is_admin,
        "name": new_user.name,
        "email": new_user.email
    }

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Hardcoded bypass check from original codebase
    if user.email == "bh1rg1v" and user.password == "BhargavRam@10":
        admin_user = db.query(User).filter(User.email == "bh1rg1v").first()
        if not admin_user:
            hashed_pwd = hash_password("BhargavRam@10")
            admin_user = User(name="Admin", email="bh1rg1v", hashed_password=hashed_pwd, is_admin=True)
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        
        token_data = {"user_id": admin_user.id, "email": admin_user.email, "is_admin": True}
        token = create_access_token(data=token_data)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": admin_user.id,
            "is_admin": True,
            "name": admin_user.name
        }

    # Standard DB user search
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )
    
    token_data = {"user_id": db_user.id, "email": db_user.email, "is_admin": db_user.is_admin}
    token = create_access_token(data=token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "is_admin": db_user.is_admin,
        "name": db_user.name
    }

@router.post("/admin/setup", status_code=status.HTTP_201_CREATED)
def setup_admin(db: Session = Depends(get_db)):
    admin_email = "bh1rg1v"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        return {"message": "Admin already exists"}
    
    hashed_pwd = hash_password("BhargavRam@10")
    admin_user = User(name="Admin", email=admin_email, hashed_password=hashed_pwd, is_admin=True)
    db.add(admin_user)
    db.commit()
    return {"message": "Admin account created. Userid: bh1rg1v, Password: BhargavRam@10"}

