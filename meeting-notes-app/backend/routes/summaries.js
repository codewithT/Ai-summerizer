const express = require('express');
const router = express.Router();
const multer = require('multer');
const Summary = require('../models/Summary');
const huggingfaceService = require('../services/huggingfaceService');

// Configure multer for text file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept text files and common document formats
    const allowedMimes = ['text/plain', 'application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a text file.'));
    }
  }
});

// Generate summary from text
router.post('/generate', upload.single('transcript'), async (req, res) => {
  try {
    let text = '';
    
    // Handle file upload or direct text input
    if (req.file) {
      text = req.file.buffer.toString('utf-8');
    } else if (req.body.text) {
      text = req.body.text;
    } else {
      return res.status(400).json({ error: 'No text or file provided' });
    }

    const customPrompt = req.body.customPrompt || 'Summarize the key points';

    // Generate summary using Hugging Face
    const generatedSummary = await huggingfaceService.generateSummary(text, customPrompt);

    // Save to database
    const summary = new Summary({
      originalText: text,
      customPrompt: customPrompt,
      generatedSummary: generatedSummary
    });

    await summary.save();

    res.json({
      id: summary._id,
      summary: generatedSummary,
      customPrompt: customPrompt
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Update edited summary
router.put('/:id', async (req, res) => {
  try {
    const { editedSummary } = req.body;
    
    const summary = await Summary.findByIdAndUpdate(
      req.params.id,
      { editedSummary: editedSummary },
      { new: true }
    );

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update summary' });
  }
});

// Get summary by ID
router.get('/:id', async (req, res) => {
  try {
    const summary = await Summary.findById(req.params.id);
    
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Get all summaries
router.get('/', async (req, res) => {
  try {
    const summaries = await Summary.find()
      .sort({ createdAt: -1 })
      .select('customPrompt generatedSummary createdAt');
    
    res.json(summaries);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

module.exports = router;
