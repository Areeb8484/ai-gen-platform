# 🔧 Stripe "NoneType" Error - Final Fix

## 🚨 **Problem:**
Error: `'NoneType' object has no attribute 'Session'`

This happens because the Stripe module is not properly initialized or imported.

## ✅ **Complete Fix:**

### **Step 1: Stop All Servers**
```bash
pkill -f "python main.py"
pkill -f "npm start"
```

### **Step 2: Fix Backend Dependencies**
```bash
cd /home/ak8484/ai-gen/backend
source venv/bin/activate
pip uninstall stripe -y
pip install stripe==8.2.0
```

### **Step 3: Verify Environment Variables**
Check that your `.env` files have:

**Backend (.env):**
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

**Frontend (.env):**
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### **Step 4: Test Stripe Module**
```bash
cd /home/ak8484/ai-gen/backend
source venv/bin/activate
python -c "
import stripe
print('Stripe version:', stripe.VERSION)
print('Checkout:', stripe.checkout)
print('Session:', stripe.checkout.Session)
"
```

### **Step 5: Start Backend**
```bash
cd /home/ak8484/ai-gen/backend
source venv/bin/activate
python main.py
```

**Expected output:**
```
Stripe module: <module 'stripe' from '...'>
Stripe checkout: <module 'stripe.checkout' from '...'>
Stripe Session: <class 'stripe.checkout.Session'>
Stripe configured with key: sk_test...
```

### **Step 6: Start Frontend**
```bash
cd /home/ak8484/ai-gen/frontend
npm start
```

### **Step 7: Test Buy Credits**
1. Go to http://localhost:3000/dashboard
2. Click "Buy Now" 
3. Should redirect to Stripe checkout

## 🐛 **If Still Not Working:**

### **Quick Debug:**
1. **Check backend logs** when clicking buy button
2. **Visit debug endpoint:** http://localhost:8000/debug/stripe
3. **Check browser console** (F12) for frontend errors

### **Alternative: Use Test Mode**
If live keys aren't working, temporarily use test keys:

**Backend (.env):**
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

**Frontend (.env):**
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=k_test_your_stripe_publishable_key_here
```

## 🎯 **Root Cause:**
The error occurs because:
1. Stripe module import conflict
2. API key not properly set before using Session
3. Module not fully initialized

The fixes above address all these issues! 🚀
