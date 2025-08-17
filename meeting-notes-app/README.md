# AI-Powered Meeting Notes Summarizer

A full-stack web application that uses AI to summarize meeting transcripts and share them via email.

## 🚀 Features

- **Text Upload**: Upload meeting transcripts as text files or paste directly
- **Custom AI Prompts**: Specify custom instructions for summarization (e.g., "Extract action items", "Summarize for executives")
- **AI-Powered Summarization**: Uses Groq API with Mixtral model for intelligent summarization
- **Editable Summaries**: Edit generated summaries before sharing
- **Email Sharing**: Send summaries to multiple recipients via email
- **Persistent Storage**: MongoDB database for storing summaries and sharing history

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Hugging Face API** - Free AI summarization models
- **Nodemailer** - Email sending
- **Multer** - File upload handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Email account with app password (for Gmail)
- No API keys required (uses Hugging Face free inference)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd meeting-notes-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meeting-notes
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🏃 Running the Application

### Start MongoDB
```bash
mongod
```

### Start Backend Server
```bash
cd backend
npm run dev
```

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

## 📝 Usage

1. **Upload Transcript**: Either upload a .txt file or paste meeting notes directly
2. **Add Custom Prompt** (Optional): Specify how you want the summary (e.g., "Extract only action items")
3. **Generate Summary**: Click to generate AI-powered summary
4. **Edit Summary**: Modify the generated summary as needed
5. **Share via Email**: Add recipient emails and send the summary

## 🚀 Deployment

### Backend Deployment (Render/Railway)

1. Set environment variables in deployment platform
2. Update `MONGODB_URI` to use MongoDB Atlas
3. Update `CLIENT_URL` to frontend URL

### Frontend Deployment (Netlify/Vercel)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder
3. Update API URL in frontend to point to deployed backend

### Environment Variables for Production

Backend:
- Use MongoDB Atlas for database
- Use secure email service
- Set proper CORS origin

Frontend:
- Update API_URL to production backend URL

## 🏗️ Architecture

### Backend Architecture
- **RESTful API** design pattern
- **MVC** structure with routes, models, and services
- **Service Layer** for business logic (Groq AI, Email)
- **Error Handling** middleware for graceful error management

### Frontend Architecture
- **Single Page Application** (SPA)
- **Component-based** structure
- **State Management** with React hooks
- **Responsive Design** with custom CSS

### Database Schema
```javascript
Summary {
  originalText: String,
  customPrompt: String,
  generatedSummary: String,
  editedSummary: String,
  createdAt: Date,
  sharedEmails: [{
    email: String,
    sharedAt: Date
  }]
}
```

## 🔒 Security Considerations

- Environment variables for sensitive data
- Input validation and sanitization
- File upload size limits (5MB)
- CORS configuration
- No hardcoded API keys

## 📈 Future Enhancements

- User authentication and authorization
- Support for PDF and Word documents
- Multiple AI model options
- Summary templates
- Batch processing
- Export to different formats
- Real-time collaboration
- Analytics dashboard

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Ensure MongoDB is running locally or check Atlas connection string
2. **Email Not Sending**: Verify email credentials and enable "Less secure app access" for Gmail
3. **Groq API Error**: Check API key validity and rate limits
4. **CORS Issues**: Ensure backend CORS configuration matches frontend URL

## 📄 License

MIT License

## 👥 Author

AI Meeting Notes Summarizer - Built with modern web technologies

---

**Note**: Remember to never commit `.env` files to version control. Always use environment variables for sensitive information.
