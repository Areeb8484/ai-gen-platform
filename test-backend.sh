#!/bin/bash

echo "Testing Backend Configuration..."

cd backend
source venv/bin/activate

echo "Testing imports..."
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
print('✅ Environment loaded')
print(f'Stripe key configured: {bool(os.getenv(\"STRIPE_SECRET_KEY\"))}')
print(f'Secret key configured: {bool(os.getenv(\"SECRET_KEY\"))}')

try:
    import main
    print('✅ Main module imports successfully')
except Exception as e:
    print(f'❌ Import error: {e}')
"

echo "Backend test complete!"
