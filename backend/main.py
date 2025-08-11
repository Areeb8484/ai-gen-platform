from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta
import stripe
import os
import aiofiles
from typing import Optional
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from database import get_db, User, AIRequest, Purchase
from schemas import UserCreate, UserLogin, Token, User as UserSchema, AIRequestCreate, AIRequestResponse, CreditPackage, StripeSessionCreate, RequestStatusUpdate
from auth import verify_password, get_password_hash, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from email_service import send_ai_request_email

app = FastAPI(title="AI Generation Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Validate Stripe configuration
print(f"Stripe module: {stripe}")
print(f"Stripe checkout: {stripe.checkout}")
print(f"Stripe Session: {stripe.checkout.Session}")

if not stripe.api_key:
    print("WARNING: STRIPE_SECRET_KEY not found in environment variables")
else:
    print(f"Stripe configured with key: {stripe.api_key[:7]}...")

# Admin configuration
ADMIN_EMAIL = "work.khan08@gmail.com"

def is_admin(user: User) -> bool:
    """Check if user has admin privileges"""
    return user.email == ADMIN_EMAIL

# Credit packages
CREDIT_PACKAGES = {
    1: {"price": 0.50, "stripe_price_id": "price_1_credit"},
    2: {"price": 1.00, "stripe_price_id": "price_2_credits"},
    15: {"price": 5.00, "stripe_price_id": "price_15_credits"}
}

@app.get("/")
async def root():
    return {"message": "AI Generation Platform API"}

# Authentication endpoints
@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        credits=0  # Start with 0 credits
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    # Authenticate user
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/auth/admin-status")
async def get_admin_status(
    current_user: User = Depends(get_current_user)
):
    """Check if current user has admin privileges"""
    return {"is_admin": is_admin(current_user)}

# Credit system endpoints
@app.get("/credits/packages")
async def get_credit_packages():
    packages = []
    for credits, info in CREDIT_PACKAGES.items():
        packages.append({
            "credits": credits,
            "price": info["price"],
            "price_id": info["stripe_price_id"]
        })
    return packages

@app.get("/debug/stripe")
async def debug_stripe():
    """Debug endpoint to check Stripe configuration"""
    return {
        "stripe_configured": bool(stripe.api_key),
        "api_key_prefix": stripe.api_key[:7] + "..." if stripe.api_key else None,
        "frontend_url": FRONTEND_URL
    }

@app.post("/credits/create-checkout-session")
async def create_checkout_session(
    session_data: StripeSessionCreate,
    current_user: User = Depends(get_current_user)
):
    print(f"Creating checkout session for user {current_user.email}, credits: {session_data.credits}")
    
    credits = session_data.credits
    
    if credits not in CREDIT_PACKAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credit package"
        )
    
    package = CREDIT_PACKAGES[credits]
    
    if not stripe.api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe not configured. Please contact support."
        )
    
    try:
        # Debug: Check if stripe module is properly imported
        print(f"Stripe module type: {type(stripe)}")
        print(f"Stripe api_key set: {bool(stripe.api_key)}")
        
        # Try importing stripe differently if needed
        try:
            import stripe as stripe_lib
            stripe_lib.api_key = os.getenv("STRIPE_SECRET_KEY")
            checkout_module = stripe_lib.checkout
            SessionClass = checkout_module.Session
        except Exception as import_error:
            print(f"Alternative import failed: {import_error}")
            # Fall back to original
            checkout_module = stripe.checkout
            SessionClass = checkout_module.Session
        
        print(f"Using Session class: {SessionClass}")
        
        checkout_session = SessionClass.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'{credits} Credits',
                        'description': f'AI Generation Platform Credits',
                    },
                    'unit_amount': int(package["price"] * 100),  # Convert to cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{FRONTEND_URL}/dashboard',
            metadata={
                'user_id': str(current_user.id),
                'credits': str(credits)
            }
        )
        
        print(f"Checkout session created successfully: {checkout_session.id}")
        return {"checkout_url": checkout_session.url}
        
    except stripe.error.InvalidRequestError as e:
        print(f"Stripe Invalid Request Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request to Stripe: {str(e)}"
        )
    except stripe.error.AuthenticationError as e:
        print(f"Stripe Authentication Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe authentication failed. Please contact support."
        )
    except stripe.error.StripeError as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment service error: {str(e)}"
        )
    except Exception as e:
        print(f"General error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )

@app.post("/credits/verify-payment")
async def verify_payment(session_id: str, db: Session = Depends(get_db)):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == 'paid':
            user_id = int(session.metadata['user_id'])
            credits = int(session.metadata['credits'])
            
            # Check if purchase already recorded
            existing_purchase = db.query(Purchase).filter(
                Purchase.stripe_session_id == session_id
            ).first()
            
            if existing_purchase:
                return {"message": "Payment already processed"}
            
            # Add credits to user
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.credits += credits
                
                # Record purchase
                purchase = Purchase(
                    user_id=user_id,
                    stripe_session_id=session_id,
                    credits_purchased=credits,
                    amount_paid=session.amount_total / 100  # Convert from cents
                )
                db.add(purchase)
                db.commit()
                
                return {"message": "Credits added successfully", "new_balance": user.credits}
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment not completed"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# AI request endpoints
@app.post("/ai/request", response_model=AIRequestResponse)
async def submit_ai_request(
    request_type: str = Form(...),
    model: str = Form(...),
    prompt: str = Form(...),
    delivery_email: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has credits
    if current_user.credits < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient credits"
        )
    
    # Validate request type
    if request_type not in ["Text", "Image", "Code"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request type"
        )
    
    filename = None
    file_path = None
    
    # Handle file upload
    if file:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        
        filename = file.filename
        file_path = f"uploads/{current_user.id}_{filename}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
    
    # Create AI request record
    ai_request = AIRequest(
        user_id=current_user.id,
        request_type=request_type,
        model=model,
        prompt=prompt,
        delivery_email=delivery_email,
        filename=filename
    )
    
    db.add(ai_request)
    
    # Deduct credit
    current_user.credits -= 1
    
    db.commit()
    db.refresh(ai_request)
    
    # Send email to admin
    email_sent = send_ai_request_email(
        user_email=current_user.email,
        request_type=request_type,
        model=model,
        prompt=prompt,
        delivery_email=delivery_email,
        file_path=file_path
    )
    
    if not email_sent:
        # Note: We don't fail the request if email fails, just log it
        print("Warning: Failed to send admin notification email")
    
    return ai_request

@app.get("/ai/requests")
async def get_user_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's AI requests with status"""
    requests = db.query(AIRequest).filter(
        AIRequest.user_id == current_user.id
    ).order_by(AIRequest.created_at.desc()).all()
    result = []
    for req in requests:
        result.append({
            "id": req.id,
            "request_type": req.request_type,
            "model": req.model,
            "prompt": req.prompt,
            "delivery_email": req.delivery_email,
            "filename": req.filename,
            "created_at": req.created_at,
            "status": req.status
        })
    return result

@app.get("/admin/requests")
async def get_all_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to get all requests - restricted to admin email"""
    # Check if user is admin
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    
    requests = db.query(AIRequest).order_by(AIRequest.created_at.desc()).all()
    
    # Add user email to each request
    result = []
    for request in requests:
        user = db.query(User).filter(User.id == request.user_id).first()
        request_dict = {
            "id": request.id,
            "request_type": request.request_type,
            "model": request.model,
            "prompt": request.prompt,
            "delivery_email": request.delivery_email,
            "filename": request.filename,
            "created_at": request.created_at,
            "status": request.status,
            "user_email": user.email if user else "Unknown"
        }
        result.append(request_dict)
    
    return result

@app.put("/admin/requests/{request_id}/status")  # allow PUT method
@app.post("/admin/requests/{request_id}/status")  # allow POST method (used by frontend)
async def update_request_status(
    request_id: int,
    status_update: RequestStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin can update the status of an AI request"""
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    req = db.query(AIRequest).filter(AIRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    new_status = status_update.status
    if new_status not in ["Pending", "Completed"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
    req.status = new_status
    db.commit()
    return {"id": req.id, "status": req.status}

@app.get("/debug/email")
async def debug_email(
    current_user: User = Depends(get_current_user)
):
    """Debug endpoint to test email sending"""
    success = send_ai_request_email(
        user_email=current_user.email,
        request_type="Debug",
        model="DebugModel",
        prompt="This is a test email",
        delivery_email=current_user.email,
        file_path=None
    )
    return {"email_sent": success}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
