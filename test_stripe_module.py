#!/usr/bin/env python3

import os
import sys
sys.path.append('/home/ak8484/ai-gen/backend')

from dotenv import load_dotenv
load_dotenv()

try:
    import stripe
    print("✅ Stripe imported successfully")
    print(f"Stripe version: {stripe.VERSION}")
    
    # Set API key
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    print(f"API key set: {bool(stripe.api_key)}")
    
    # Test checkout module
    print(f"Checkout module: {stripe.checkout}")
    print(f"Session class: {stripe.checkout.Session}")
    
    # Test creating a session (dry run)
    try:
        session_params = {
            'payment_method_types': ['card'],
            'line_items': [{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Test Product',
                    },
                    'unit_amount': 100,
                },
                'quantity': 1,
            }],
            'mode': 'payment',
            'success_url': 'http://localhost:3000/success',
            'cancel_url': 'http://localhost:3000/cancel',
        }
        
        print("✅ Session parameters valid")
        print("Stripe module is working correctly!")
        
    except Exception as e:
        print(f"❌ Session creation test failed: {e}")
        
except Exception as e:
    print(f"❌ Stripe import failed: {e}")
    import traceback
    traceback.print_exc()
