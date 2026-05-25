from sqlalchemy import Column, Integer, String

from app.database import Base

class Waitlist(Base):

    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)

    email = Column(String, unique=True, index=True)

    phone = Column(String)