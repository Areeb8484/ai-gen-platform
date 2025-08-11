#!/bin/bash

# AI Gen Platform - Complete Restoration Script
echo "=== AI Gen Platform - Complete Restoration ==="
echo ""

cd /home/ak8484/ai-gen

# Step 1: Install Node.js and npm if not present
echo "Step 1: Checking Node.js installation..."

if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js..."
    
    # Try multiple installation methods
    echo "Trying apt installation..."
    sudo apt update
    sudo apt install -y nodejs npm
    
    # If that fails, try snap
    if ! command -v node &> /dev/null; then
        echo "Trying snap installation..."
        sudo snap install node --classic
    fi
    
    # If that fails, try NodeSource
    if ! command -v node &> /dev/null; then
        echo "Trying NodeSource installation..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
else
    echo "Node.js found: $(node --version)"
    echo "npm found: $(npm --version)"
fi

# Step 2: Clean up empty files
echo ""
echo "Step 2: Cleaning up empty files..."
for file in CLOUD_DEPLOY.md DEPLOYMENT_GUIDE.md deploy.sh docker-compose.yml docker-deploy.sh final-frontend-fix.sh quick-fix.sh verify-frontend.sh modal_replacement.txt; do
    if [ -f "$file" ] && [ ! -s "$file" ]; then
        echo "Removing empty file: $file"
        rm -f "$file"
    fi
done

# Step 3: Check frontend status
echo ""
echo "Step 3: Checking frontend status..."
cd frontend

if [ -f "package.json" ]; then
    echo "Frontend package.json found"
    
    # Install frontend dependencies
    echo "Installing frontend dependencies..."
    if command -v npm &> /dev/null; then
        npm install
        if [ $? -eq 0 ]; then
            echo "✅ Frontend dependencies installed successfully"
        else
            echo "❌ Frontend dependency installation failed"
        fi
    else
        echo "❌ npm not available"
    fi
else
    echo "❌ Frontend package.json not found"
fi

# Step 4: Check backend status
echo ""
echo "Step 4: Checking backend status..."
cd ../backend

if [ -f "requirements.txt" ]; then
    echo "Backend requirements.txt found"
    
    # Check if virtual environment exists
    if [ -d "../.venv" ]; then
        echo "Virtual environment found"
        source ../.venv/bin/activate
        echo "Installing backend dependencies..."
        pip install -r requirements.txt
        if [ $? -eq 0 ]; then
            echo "✅ Backend dependencies installed successfully"
        else
            echo "❌ Backend dependency installation failed"
        fi
        deactivate
    else
        echo "⚠️ Virtual environment not found"
    fi
else
    echo "❌ Backend requirements.txt not found"
fi

# Step 5: Test everything
echo ""
echo "Step 5: Testing installations..."
cd ..

echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
echo "npm: $(npm --version 2>/dev/null || echo 'Not installed')"

if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "Python: $(python --version 2>/dev/null || echo 'Not available')"
    echo "pip: $(pip --version 2>/dev/null || echo 'Not available')"
    deactivate
fi

# Step 6: Create a simple .gitignore
echo ""
echo "Step 6: Creating basic .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.venv/
__pycache__/

# Environment files
.env
*.env

# Build outputs
/frontend/build/
/frontend/dist/

# Logs
*.log
npm-debug.log*

# Database
*.db
*.sqlite

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF

echo ""
echo "=== Restoration Summary ==="
echo "✅ Empty files cleaned up"
echo "✅ Basic .gitignore created"

if command -v node &> /dev/null; then
    echo "✅ Node.js restored: $(node --version)"
    echo "✅ npm available: $(npm --version)"
    
    if [ -d "frontend/node_modules" ]; then
        echo "✅ Frontend dependencies ready"
    else
        echo "⚠️ Frontend dependencies may need installation"
    fi
else
    echo "❌ Node.js installation failed"
fi

if [ -d ".venv" ]; then
    echo "✅ Python virtual environment available"
else
    echo "⚠️ Python virtual environment missing"
fi

echo ""
echo "=== Next Steps for VPS Deployment ==="
echo "1. Test frontend: cd frontend && npm start"
echo "2. Test backend: source .venv/bin/activate && cd backend && python main.py"
echo "3. Set up your DigitalOcean VPS"
echo "4. Deploy using standard VPS deployment methods"
echo ""
echo "=== Restoration Complete ==="
