#!/bin/bash

# AI Generation Platform - Start Frontend
echo "🚀 Starting AI Generation Platform Frontend..."

cd frontend

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using default configuration."
    echo "Please create .env file with your Stripe keys."
fi

# Start the development server
echo "🌟 Starting React development server on http://localhost:3000"
npm start
