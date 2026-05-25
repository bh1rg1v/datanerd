from fastapi import FastAPI, Depends
from app.schemas import WaitlistRequest

from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models import Waitlist

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message" : "backend running successfully"}

@app.post("/waitlist")
def join_waitlist(data: WaitlistRequest, db: Session = Depends(get_db)):

    print(data.email)

    existing_user = db.query(Waitlist).filter(
        Waitlist.email == data.email
    ).first()

    if existing_user:

        return {
            "message": "You are already on waitlist"
        }

    new_user = Waitlist(
        name=data.name,
        email=data.email,
        phone=data.phone
    )

    db.add(new_user)

    db.commit()
    
    db.refresh(new_user)

    return {
        "message" : "successfully joined waitlist",
        "name" : data.name,
        "email" : data.email,
        "phone" : data.phone
    }