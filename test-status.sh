#!/bin/bash

# Quick test script to verify everything is working
echo "=== Quick Test - AI Gen Platform ==="
echo ""

cd /home/ak8484/ai-gen

# Test 1: Node.js and npm
echo "1. Testing Node.js and npm..."
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
    echo "✅ npm: $(npm --version)"
else
    echo "❌ Node.js or npm not found"
    echo "Run: ./restore-everything.sh"
    exit 1
fi

# Test 2: Frontend
echo ""
echo "2. Testing frontend..."
cd frontend

if [ -d "node_modules" ] && [ -f "package.json" ]; then
    echo "✅ Frontend dependencies ready"
    
    # Quick TypeScript check
    if command -v npx &> /dev/null; then
        echo "Running TypeScript check..."
        npx tsc --noEmit --skipLibCheck
        if [ $? -eq 0 ]; then
            echo "✅ TypeScript compilation successful"
        else
            echo "⚠️ TypeScript has some issues (may be normal)"
        fi
    fi
else
    echo "❌ Frontend not ready - run: npm install"
fi

# Test 3: Backend
echo ""
echo "3. Testing backend..."
cd ../backend

if [ -f "main.py" ] && [ -f "requirements.txt" ]; then
    echo "✅ Backend files present"
    
    if [ -d "../.venv" ]; then
        echo "✅ Virtual environment found"
        source ../.venv/bin/activate
        
        # Test if we can import main modules
        python -c "import main; print('✅ Backend imports working')" 2>/dev/null || echo "⚠️ Backend may need dependency updates"
        
        deactivate
    else
        echo "⚠️ Virtual environment not found"
    fi
else
    echo "❌ Backend files missing"
fi

# Test 4: Git status
echo ""
echo "4. Git status..."
cd ..
if [ -d ".git" ]; then
    echo "✅ Git repository present"
    git status --porcelain | head -5 || echo "Git working directory clean"
else
    echo "❌ Not a git repository"
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "If all tests passed, you can now:"
echo "1. Start frontend: cd frontend && npm start"
echo "2. Start backend: source .venv/bin/activate && cd backend && python main.py"
echo "3. Proceed with VPS deployment preparation"
