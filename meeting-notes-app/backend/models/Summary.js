const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  originalText: {
    type: String,
    required: true
  },
  customPrompt: {
    type: String,
    default: 'Summarize the key points'
  },
  generatedSummary: {
    type: String,
    required: true
  },
  editedSummary: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sharedEmails: [{
    email: String,
    sharedAt: Date
  }]
});

module.exports = mongoose.model('Summary', summarySchema);
