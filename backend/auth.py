from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db, User
import os
import secrets
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(email: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    try:
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            print(f"User not found for email: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting current user for {email}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to verify user credentials"
        )

def generate_reset_token():
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)

def create_reset_token(user: User, db: Session):
    """Create and store a password reset token for the user"""
    try:
        reset_token = generate_reset_token()
        reset_token_expires = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiration
        
        user.reset_token = reset_token
        user.reset_token_expires = reset_token_expires
        db.commit()
        
        return reset_token
    except Exception as e:
        print(f"Error creating reset token for user {user.email}: {e}")
        db.rollback()
        raise

def verify_reset_token(token: str, db: Session):
    """Verify reset token and return user if valid"""
    try:
        user = db.query(User).filter(User.reset_token == token).first()
        
        if not user:
            return None
        
        if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
            # Token has expired, clear it
            user.reset_token = None
            user.reset_token_expires = None
            db.commit()
            return None
        
        return user
    except Exception as e:
        print(f"Error verifying reset token: {e}")
        return None

def clear_reset_token(user: User, db: Session):
    """Clear the reset token after successful password reset"""
    try:
        user.reset_token = None
        user.reset_token_expires = None
        db.commit()
    except Exception as e:
        print(f"Error clearing reset token for user {user.email}: {e}")
        db.rollback()
        raise
