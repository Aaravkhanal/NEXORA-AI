import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON
from app.db.session import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Clerk ID
    email = Column(String, unique=True, index=True)
    stripe_customer_id = Column(String, nullable=True)
    subscription_tier = Column(String, default="free")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class JobModel(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=True) # Link to Clerk ID
    company_name = Column(String, index=True)
    website = Column(String, nullable=True)
    status = Column(String, default="pending")
    progress = Column(Integer, default=0)
    current_step = Column(String, default="Initializing...")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    report_id = Column(String, nullable=True)
    error = Column(String, nullable=True)
    data = Column(JSON, nullable=True)

class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=True) # Link to Clerk ID
    company_name = Column(String, index=True)
    website = Column(String, nullable=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    data = Column(JSON, nullable=True)
