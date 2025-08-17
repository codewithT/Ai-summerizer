# Quick Setup Guide

## Prerequisites
- Node.js v14+
- MongoDB installed locally OR MongoDB Atlas account
- Groq API key from https://console.groq.com

## Installation Steps

### 1. Install Dependencies
```bash
# From root directory
npm install
npm run install:all
```

### 2. Configure Environment Variables

#### Backend Configuration
Create `.env` file in `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meeting-notes
GROQ_API_KEY=your_groq_api_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB
```bash
# If using local MongoDB
mongod
```

### 4. Run Application
```bash
# From root directory - runs both frontend and backend
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 5. Access Application
Open browser: http://localhost:5173

## Getting API Keys

### Groq API Key
1. Visit https://console.groq.com
2. Sign up/Login
3. Navigate to API Keys section
4. Create new API key
5. Copy and paste in `.env`

### Gmail App Password (for email)
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account settings
3. Security → 2-Step Verification → App passwords
4. Generate app password for "Mail"
5. Use this password in `.env`

## Testing the Application

1. **Upload Test File**: Create a sample meeting transcript .txt file
2. **Test Summary**: Click "Generate Summary" with default prompt
3. **Custom Prompt**: Try "Extract only action items"
4. **Edit Summary**: Modify the generated text
5. **Email Test**: Add your email and send

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

### Groq API Error
- Verify API key is correct
- Check if you have API credits

### Email Not Sending
- Verify Gmail app password
- Check if "Less secure app access" is enabled
- Try with different email provider

## Production Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.
