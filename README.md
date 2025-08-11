# AI Generation Platform

A full-stack web application for AI-powered content generation including text, images, and code. Built with React (TypeScript) frontend and FastAPI Python backend.

## 🚀 Features

- **Multi-type AI Generation**: Text, Image, and Code generation requests
- **Credit-based System**: Purchase credits via Stripe integration
- **Admin Dashboard**: Manage requests and submit results
- **Email Notifications**: Automated notifications for users and admins
- **File Upload/Download**: Support for file attachments and admin result files
- **User Authentication**: JWT-based secure authentication
- **Modern UI**: Beautiful Tailwind CSS interface with dark theme

## Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy + SQLite
- JWT Authentication
- Stripe API
- Email (SMTP)

### Frontend  
- React (TypeScript)
- Tailwind CSS
- Axios
- React Router

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your actual values:
# - Stripe keys
# - Email SMTP settings
# - JWT secret key

# Run the server
python main.py
```

The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Edit .env with your Stripe publishable key

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./ai_gen.db
SECRET_KEY=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
ADMIN_EMAIL=work.khan08@gmail.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Credit Packages

- 1 credit = $0.50
- 2 credits = $1.00  
- 15 credits = $5.00

Each AI request consumes 1 credit.

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Credits
- `GET /credits/packages` - Get available credit packages
- `POST /credits/create-checkout-session` - Create Stripe checkout
- `POST /credits/verify-payment` - Verify payment completion

### AI Requests
- `POST /ai/request` - Submit AI generation request
- `GET /ai/requests` - Get user's request history

## Workflow

1. User registers/logs in
2. User purchases credits via Stripe
3. User submits AI request with prompt and optional file
4. System deducts 1 credit and emails admin
5. Admin processes request and sends result to user's delivery email

## Development

### Running Backend
```bash
cd backend
python main.py
```

### Running Frontend
```bash
cd frontend
npm start
```

### Database
SQLite database is automatically created on first run. Tables:
- `users` - User accounts and credit balances
- `ai_requests` - AI generation requests
- `purchases` - Stripe payment records

## Production Deployment

1. Update environment variables for production
2. Set up proper HTTPS certificates
3. Configure production database (PostgreSQL recommended)
4. Set up email service (SendGrid, AWS SES, etc.)
5. Deploy backend to cloud platform (AWS, Google Cloud, etc.)
6. Deploy frontend to CDN (Netlify, Vercel, etc.)

## Support

For issues or questions, contact: work.khan08@gmail.com
