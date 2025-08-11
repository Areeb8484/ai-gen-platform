#!/bin/bash

# AI Generation Platform - Start Backend
echo "🚀 Starting AI Generation Platform Backend..."

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using default configuration."
    echo "Please create .env file with your configuration."
fi

# Start the server
echo "🌟 Starting FastAPI server on http://localhost:8000"
python main.py
