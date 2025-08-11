# 🚀 Deployment Guide: Netlify + Railway

This guide shows how to deploy your AI Generation Platform using **Netlify** for the frontend and **Railway** for the backend.

## 📋 Prerequisites

- GitHub repository: `https://github.com/Areeb8484/ai-gen-platform`
- Stripe account with API keys
- Gmail account with app password for emails

---

## 🎯 Frontend Deployment on Netlify

### Step 1: Connect Repository
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"New site from Git"**
3. Choose **GitHub** and select `Areeb8484/ai-gen-platform`

### Step 2: Configure Build Settings
- **Base directory:** `(leave empty)`
- **Build command:** `cd frontend && npm install && npm run build`
- **Publish directory:** `frontend/build`

### Step 3: Environment Variables
Add these in **Site settings > Environment variables**:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Step 4: Deploy
- Click **"Deploy site"**
- Netlify will build and deploy your frontend
- Note the generated URL (e.g., `https://magical-name-123.netlify.app`)

---

## 🚂 Backend Deployment on Railway

### Step 1: Connect Repository  
1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose `Areeb8484/ai-gen-platform`

### Step 2: Configure Root Directory
- In project settings, set **Root Directory** to `backend`

### Step 3: Add Database
1. In your Railway project, click **"New"**
2. Select **"Database" > "PostgreSQL"**  
3. Railway will provide a `DATABASE_URL` automatically

### Step 4: Environment Variables
Add these in **Variables** section:
```
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
DATABASE_URL=(automatically provided by Railway)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
ADMIN_EMAIL=your-admin@email.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
FRONTEND_URL=https://your-netlify-site.netlify.app
```

### Step 5: Deploy
- Railway will auto-detect Python and deploy
- Note the generated URL (e.g., `https://your-backend-name.railway.app`)

---

## 🔄 Final Configuration

### Update Frontend Environment
1. Go back to **Netlify** > Your site > **Site settings** > **Environment variables**
2. Update `REACT_APP_API_URL` with your Railway backend URL
3. **Redeploy** the frontend

### Test the Connection  
1. Visit your Netlify frontend URL
2. Try registering a new account
3. Test the credit purchase flow
4. Submit an AI request
5. Check admin dashboard

---

## 🔧 Environment Variables Quick Reference

### Netlify (Frontend)
```env
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Railway (Backend)
```env
SECRET_KEY=your-32-char-secret-key
DATABASE_URL=(auto-provided)
STRIPE_SECRET_KEY=sk_test_your_key
ADMIN_EMAIL=admin@example.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com  
SMTP_PASSWORD=your-app-password
FRONTEND_URL=https://your-site.netlify.app
```

---

## 🛠 Troubleshooting

### Frontend Issues
- **Build fails:** Check if `npm install` works in `frontend/` directory
- **Blank page:** Check browser console for API connection errors
- **CORS errors:** Verify `FRONTEND_URL` is set correctly in Railway

### Backend Issues  
- **Database errors:** Check if `DATABASE_URL` is properly set
- **Stripe errors:** Verify Stripe keys are correct test keys
- **Email errors:** Verify Gmail app password is correct

### Common Fixes
1. **Clear browser cache** after environment variable changes
2. **Redeploy both services** after updating URLs
3. **Check logs** in Railway dashboard for backend errors
4. **Test locally first** before deploying

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Frontend at `https://your-site.netlify.app`
- ✅ Backend at `https://your-backend.railway.app`  
- ✅ PostgreSQL database on Railway
- ✅ Automatic deployments on code changes
- ✅ HTTPS encryption on both platforms
- ✅ Global CDN via Netlify

Your AI Generation Platform is now live! 🚀
