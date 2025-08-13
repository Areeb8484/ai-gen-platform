# Support Chat Widget Feature

## Overview
Added a floating support chat widget to login, signup, and customer dashboard pages that allows users to send help messages directly to the admin email.

## Features
- **Floating Chat Button**: Bottom-right corner with "Need Help?" tooltip
- **Modern Design**: Gradient colors matching the platform theme
- **Email Integration**: Messages sent directly to admin email
- **Form Validation**: Required email and message fields
- **Success Feedback**: Confirmation message after sending
- **Auto-close**: Widget closes automatically after successful submission
- **Responsive**: Works on mobile and desktop

## Implementation

### Frontend Components
- `SupportWidget.tsx` - Main chat widget component
- Added to `LoginPage.tsx`, `RegisterPage.tsx`, and `Dashboard.tsx`
- Uses existing API infrastructure

### Backend Endpoints
- `POST /support/contact` - Handles support message submission
- Validates user input and sends email to admin
- Returns success/error responses

### Email Service
- `send_support_email()` function in `email_service.py`
- Professional HTML email template
- Includes user email, message, page location, and timestamp
- Sent to admin email configured in environment variables

## Usage

### For Users:
1. Click the floating chat button (bottom-right corner)
2. Enter email address and message
3. Click "Send Message"
4. Receive confirmation and automatic widget close
5. Admin will respond via email

### For Admin:
1. Receive support emails with subject "🆘 Support Request from [user_email]"
2. Email includes:
   - User's email address
   - Help message
   - Page where request was sent from
   - Timestamp
3. Reply directly to user's email

## Technical Details

### API Schema
```typescript
interface SupportMessage {
  email: string;
  message: string;
  page?: string;
  timestamp?: string;
}
```

### Environment Variables Required
- `SMTP_SERVER` - Email server
- `SMTP_PORT` - Email server port
- `SMTP_USERNAME` - Email username
- `SMTP_PASSWORD` - Email password
- `ADMIN_EMAIL` - Admin email for receiving support requests

### Styling
- Matches platform's cyan/blue gradient theme
- Glass-morphism effects with backdrop blur
- Dark mode compatible
- Smooth animations and transitions
- Responsive design

## Files Modified/Added

### New Files:
- `frontend/src/components/SupportWidget.tsx` - Chat widget component

### Modified Files:
- `frontend/src/components/LoginPage.tsx` - Added support widget
- `frontend/src/components/RegisterPage.tsx` - Added support widget  
- `frontend/src/components/Dashboard.tsx` - Added support widget
- `backend/main.py` - Added support contact endpoint
- `backend/schemas.py` - Added SupportMessage schema
- `backend/email_service.py` - Added send_support_email function

## Testing
1. Visit login, signup, or dashboard pages
2. Click floating chat button in bottom-right corner
3. Fill out support form and submit
4. Check admin email for support request
5. Verify email contains all user information and message
