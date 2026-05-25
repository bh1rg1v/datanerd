from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

import os

load_dotenv

DATABASE_URL = "postgresql://neondb_owner:npg_UHuS86FbitQe@ep-delicate-dew-ap6r7ir7-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
print(DATABASE_URL)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():

    db = SessionLocal()

    try:
        yield db
    
    finally:
        db.close()