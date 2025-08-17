import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'https://ai-summerizer-backend-pdzr.onrender.com/api';

function App() {
  const [transcript, setTranscript] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [summaryId, setSummaryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [emailSubject, setEmailSubject] = useState('Meeting Notes Summary');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        setUploadedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setTranscript(e.target.result);
          toast.success('File uploaded successfully!');
        };
        reader.readAsText(file);
      } else {
        toast.error('Please upload a text file (.txt)');
      }
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript.trim()) {
      toast.error('Please provide transcript text or upload a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('transcript', uploadedFile);
      } else {
        formData.append('text', transcript);
      }
      formData.append('customPrompt', customPrompt || 'Summarize the key points');

      const response = await axios.post(`${API_URL}/summaries/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setGeneratedSummary(response.data.summary);
      setEditedSummary(response.data.summary);
      setSummaryId(response.data.id);
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!summaryId) return;

    try {
      await axios.put(`${API_URL}/summaries/${summaryId}`, {
        editedSummary: editedSummary
      });
      toast.success('Summary saved successfully!');
    } catch (error) {
      console.error('Error saving summary:', error);
      toast.error('Failed to save summary');
    }
  };

  const handleAddRecipient = () => {
    const email = emailInput.trim();
    if (email && email.includes('@')) {
      if (!recipients.includes(email)) {
        setRecipients([...recipients, email]);
        setEmailInput('');
      } else {
        toast.warning('Email already added');
      }
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  const handleRemoveRecipient = (email) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSendEmail = async () => {
    if (recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    if (!summaryId) {
      toast.error('Please generate a summary first');
      return;
    }

    setSendingEmail(true);
    try {
      // Save the edited summary first
      await handleSaveSummary();

      // Send email
      await axios.post(`${API_URL}/email/send`, {
        summaryId: summaryId,
        recipients: recipients,
        subject: emailSubject
      });

      toast.success('Email sent successfully!');
      setRecipients([]);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please check your email configuration.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setCustomPrompt('');
    setGeneratedSummary('');
    setEditedSummary('');
    setSummaryId(null);
    setUploadedFile(null);
    setRecipients([]);
    setEmailInput('');
    document.getElementById('file-input').value = '';
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 AI Meeting Notes Summarizer</h1>
        <p>Transform your meeting transcripts into actionable summaries</p>
      </div>

      <div className="main-card">
        {/* Upload Section */}
        <div className="upload-section">
          <h2 className="section-title">1. Upload Transcript</h2>
          <div 
            className={`upload-area ${uploadedFile ? 'active' : ''}`}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              type="file"
              id="file-input"
              className="file-input"
              accept=".txt,text/plain"
              onChange={handleFileUpload}
            />
            <p>📁 Click to upload a text file (.txt)</p>
            {uploadedFile && <p>✅ File: {uploadedFile.name}</p>}
          </div>
          <p style={{ margin: '1rem 0', textAlign: 'center' }}>OR</p>
          <textarea
            className="text-input"
            placeholder="Paste your meeting transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
        </div>

        {/* Custom Prompt Section */}
        <div className="prompt-section">
          <h2 className="section-title">2. Custom Instructions (Optional)</h2>
          <input
            type="text"
            className="prompt-input"
            placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items'"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
        </div>

        {/* Generate Button */}
        <div className="button-group">
          <button 
            className="btn btn-primary" 
            onClick={handleGenerateSummary}
            disabled={loading || !transcript.trim()}
          >
            {loading ? (
              <>Generating<span className="loading"></span></>
            ) : (
              '🚀 Generate Summary'
            )}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleClear}
          >
            Clear All
          </button>
        </div>

        {/* Summary Section */}
        {generatedSummary && (
          <div className="summary-section">
            <h2 className="section-title">3. Generated Summary (Editable)</h2>
            <textarea
              className="summary-textarea"
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              placeholder="Edit your summary here..."
            />
            <button 
              className="btn btn-primary" 
              onClick={handleSaveSummary}
              style={{ marginTop: '1rem' }}
            >
              💾 Save Edits
            </button>

            {/* Email Section */}
            <div className="email-section">
              <h2 className="section-title">4. Share via Email</h2>
              
              <div className="email-input-group">
                <input
                  type="text"
                  className="email-input"
                  placeholder="Email subject..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div className="email-input-group">
                <input
                  type="email"
                  className="email-input"
                  placeholder="Enter recipient email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                />
                <button className="btn btn-secondary" onClick={handleAddRecipient}>
                  Add Recipient
                </button>
              </div>

              {recipients.length > 0 && (
                <div className="email-list">
                  {recipients.map((email, index) => (
                    <div key={index} className="email-tag">
                      <span>{email}</span>
                      <button onClick={() => handleRemoveRecipient(email)}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                className="btn btn-primary" 
                onClick={handleSendEmail}
                disabled={sendingEmail || recipients.length === 0}
              >
                {sendingEmail ? (
                  <>Sending<span className="loading"></span></>
                ) : (
                  '📧 Send Summary'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
