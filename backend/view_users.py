#!/usr/bin/env python3
"""
Simple script to view all registered users in the AI Gen Platform
Run this from the backend directory: python view_users.py
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import User, AIRequest, Purchase
import os
from dotenv import load_dotenv

load_dotenv()

def view_all_users():
    """Display all registered users"""
    
    # Create database connection
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_gen.db")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    
    try:
        # Get all users
        users = db.query(User).all()
        
        print("=" * 60)
        print("🚀 AI GEN PLATFORM - REGISTERED USERS")
        print("=" * 60)
        print(f"Total Users: {len(users)}")
        print("=" * 60)
        
        if not users:
            print("📭 No users registered yet.")
            return
        
        for i, user in enumerate(users, 1):
            print(f"\n👤 User #{i}")
            print(f"   📧 Email: {user.email}")
            print(f"   🆔 ID: {user.id}")
            print(f"   💰 Credits: {user.credits}")
            print(f"   📅 Joined: {user.created_at.strftime('%B %d, %Y at %I:%M %p')}")
            
            # Get user's AI requests
            requests = db.query(AIRequest).filter(AIRequest.user_id == user.id).all()
            print(f"   🤖 AI Requests: {len(requests)}")
            
            # Get user's purchases
            purchases = db.query(Purchase).filter(Purchase.user_id == user.id).all()
            total_spent = sum(p.amount_paid for p in purchases)
            print(f"   💳 Purchases: {len(purchases)} (${total_spent:.2f} total)")
            
            print("-" * 40)
        
        print(f"\n📊 SUMMARY:")
        print(f"   Total Users: {len(users)}")
        print(f"   Total AI Requests: {db.query(AIRequest).count()}")
        print(f"   Total Purchases: {db.query(Purchase).count()}")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    view_all_users()
