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

# Database migration - works for both SQLite and PostgreSQL
def migrate_database():
    """Apply database migrations for both SQLite and PostgreSQL"""
    try:
        inspector = inspect(engine)
        
        # Check if tables exist, if not, create_all will handle it
        tables = inspector.get_table_names()
        if not tables:
            print("No tables found, create_all will handle initial table creation")
            return
        
        is_sqlite = DATABASE_URL.startswith("sqlite")
        is_postgresql = DATABASE_URL.startswith("postgresql") or "postgres" in DATABASE_URL.lower()
        
        print(f"Running migrations for database type: {'SQLite' if is_sqlite else 'PostgreSQL' if is_postgresql else 'Unknown'}")
        
        # Migrate users table
        if 'users' in tables:
            user_columns = [col['name'] for col in inspector.get_columns('users')]
            user_migrations = []
            
            if 'reset_token' not in user_columns:
                if is_sqlite:
                    user_migrations.append("ALTER TABLE users ADD COLUMN reset_token TEXT;")
                elif is_postgresql:
                    user_migrations.append("ALTER TABLE users ADD COLUMN reset_token VARCHAR;")
                    
            if 'reset_token_expires' not in user_columns:
                if is_sqlite:
                    user_migrations.append("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME;")
                elif is_postgresql:
                    user_migrations.append("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP;")
            
            if user_migrations:
                with engine.begin() as conn:
                    for stmt in user_migrations:
                        conn.execute(text(stmt))
                print(f"Applied user table migrations: {user_migrations}")

        # Migrate ai_requests table
        if 'ai_requests' in tables:
            ai_request_columns = [col['name'] for col in inspector.get_columns('ai_requests')]
            migrations = []
            
            if 'status' not in ai_request_columns:
                if is_sqlite:
                    migrations.append("ALTER TABLE ai_requests ADD COLUMN status TEXT DEFAULT 'Pending';")
                elif is_postgresql:
                    migrations.append("ALTER TABLE ai_requests ADD COLUMN status VARCHAR DEFAULT 'Pending';")
                    
            if 'admin_response' not in ai_request_columns:
                if is_sqlite:
                    migrations.append("ALTER TABLE ai_requests ADD COLUMN admin_response TEXT;")
                elif is_postgresql:
                    migrations.append("ALTER TABLE ai_requests ADD COLUMN admin_response TEXT;")
                    
            if 'admin_file' not in ai_request_columns:
                if is_sqlite:
                    migrations.append("ALTER TABLE ai_requests ADD COLUMN admin_file TEXT;")
                elif is_postgresql:
                    migrations.append("ALTER TABLE ai_requests ADD COLUMN admin_file VARCHAR;")
                    
            if 'completed_at' not in ai_request_columns:
                if is_sqlite:
                    migrations.append("ALTER TABLE ai_requests ADD COLUMN completed_at DATETIME;")
                elif is_postgresql:
                    migrations.append("ALTER TABLE ai_requests ADD COLUMN completed_at TIMESTAMP;")
            
            # Check if filename column needs to be expanded to TEXT (for JSON storage)
            filename_col = next((col for col in inspector.get_columns('ai_requests') if col['name'] == 'filename'), None)
            if filename_col and str(filename_col.get('type')).upper() not in ['TEXT', 'VARCHAR']:
                print(f"Note: filename column type is {filename_col.get('type')}, should be TEXT/VARCHAR for JSON storage")

            if migrations:
                with engine.begin() as conn:
                    for stmt in migrations:
                        conn.execute(text(stmt))
                print(f"Applied ai_requests table migrations: {migrations}")
                
    except Exception as e:
        # Do not crash app if inspection/migration fails; just log
        print(f"Migration check failed: {e}")
        import traceback
        traceback.print_exc()

# Run migrations after table creation
migrate_database()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
