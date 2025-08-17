const express = require('express');
const router = express.Router();
const Summary = require('../models/Summary');
const emailService = require('../services/emailService');

// Send summary via email
router.post('/send', async (req, res) => {
  try {
    const { summaryId, recipients, subject } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients provided' });
    }

    // Fetch the summary
    const summary = await Summary.findById(summaryId);
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    // Use edited summary if available, otherwise use generated summary
    const summaryText = summary.editedSummary || summary.generatedSummary;

    // Send email
    const result = await emailService.sendSummary(recipients, summaryText, subject);

    // Update summary with shared emails
    summary.sharedEmails.push(...recipients.map(email => ({
      email,
      sharedAt: new Date()
    })));
    await summary.save();

    res.json({ success: true, message: 'Email sent successfully', result });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
