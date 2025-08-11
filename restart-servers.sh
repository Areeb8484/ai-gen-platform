#!/bin/bash

echo "🔄 Restarting AI Generation Platform..."

# Kill existing processes
echo "Stopping existing servers..."
pkill -f "python main.py" 2>/dev/null
pkill -f "npm start" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

sleep 2

echo "Starting backend..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

cd ..
sleep 3

echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "✅ Servers restarted!"
echo "🌐 Frontend: http://localhost:3000"
echo "📖 Backend: http://localhost:8000"
echo "🔧 Debug Stripe: http://localhost:8000/debug/stripe"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
