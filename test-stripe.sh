#!/bin/bash

echo "🔧 Testing Stripe Configuration..."

cd backend
source venv/bin/activate

echo "Testing Stripe import and API key..."
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

print('Environment variables loaded:')
stripe_key = os.getenv('STRIPE_SECRET_KEY')
print(f'STRIPE_SECRET_KEY: {stripe_key[:15] if stripe_key else \"NOT FOUND\"}...')

try:
    import stripe
    stripe.api_key = stripe_key
    print('✅ Stripe module imported successfully')
    
    # Test basic Stripe functionality
    if stripe_key:
        print('Testing Stripe API connection...')
        try:
            # This should work if the key is valid
            stripe.Product.list(limit=1)
            print('✅ Stripe API connection successful')
        except stripe.error.AuthenticationError as e:
            print(f'❌ Stripe authentication failed: {e}')
        except Exception as e:
            print(f'⚠️ Stripe API test failed: {e}')
    else:
        print('❌ No Stripe API key found')
        
except Exception as e:
    print(f'❌ Stripe import failed: {e}')
"

echo "Stripe test complete!"
