from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_gen.db")

# Create engine with SQLite-specific args only when using SQLite
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    credits = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

class AIRequest(Base):
    __tablename__ = "ai_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    request_type = Column(String, nullable=False)  # Text, Image, Code
    model = Column(String, nullable=False)
    prompt = Column(Text, nullable=False)
    delivery_email = Column(String, nullable=False)
    filename = Column(Text, nullable=True)  # JSON array of uploaded filenames
    status = Column(String, default="Pending")  # Pending or Completed
    admin_response = Column(String, nullable=True)
    admin_file = Column(String, nullable=True)  # admin uploaded file
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    stripe_session_id = Column(String, nullable=False)
    credits_purchased = Column(Integer, nullable=False)
    amount_paid = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Ensure columns exist (SQLite migration)
if DATABASE_URL.startswith("sqlite"):
    try:
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        user_columns = [col['name'] for col in inspector.get_columns('users')]
        
        user_migrations = []
        if 'reset_token' not in user_columns:
            user_migrations.append("ALTER TABLE users ADD COLUMN reset_token TEXT;")
        if 'reset_token_expires' not in user_columns:
            user_migrations.append("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME;")
        
        if user_migrations:
            with engine.begin() as conn:
                for stmt in user_migrations:
                    conn.execute(text(stmt))
            print(f"Applied migrations to users: {user_migrations}")

        # Check ai_requests table columns
        ai_request_columns = [col['name'] for col in inspector.get_columns('ai_requests')]

        migrations = []
        if 'status' not in ai_request_columns:
            migrations.append("ALTER TABLE ai_requests ADD COLUMN status TEXT DEFAULT 'Pending';")
        if 'admin_response' not in ai_request_columns:
            migrations.append("ALTER TABLE ai_requests ADD COLUMN admin_response TEXT;")
        if 'admin_file' not in ai_request_columns:
            migrations.append("ALTER TABLE ai_requests ADD COLUMN admin_file TEXT;")
        if 'completed_at' not in ai_request_columns:
            migrations.append("ALTER TABLE ai_requests ADD COLUMN completed_at DATETIME;")
        
        # Check if filename column needs to be expanded to TEXT (for JSON storage)
        filename_col = next((col for col in inspector.get_columns('ai_requests') if col['name'] == 'filename'), None)
        if filename_col and str(filename_col.get('type')).upper() != 'TEXT':
            # SQLite doesn't support ALTER COLUMN, so we'd need to recreate table
            # For now, just log it - new deployments will use TEXT
            print("Note: filename column should be TEXT for JSON storage")

        if migrations:
            with engine.begin() as conn:  # begin() will commit automatically
                for stmt in migrations:
                    conn.execute(text(stmt))
            print(f"Applied migrations to ai_requests: {migrations}")
    except Exception as e:
        # Do not crash app if inspection/migration fails; just log
        print(f"Migration check failed: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
