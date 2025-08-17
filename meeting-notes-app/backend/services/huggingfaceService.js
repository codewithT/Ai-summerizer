const axios = require('axios');

class HuggingFaceService {
  constructor() {
    this.apiUrl = 'https://api-inference.huggingface.co/models';
    this.models = {
      summarization: 'facebook/bart-large-cnn',
      backup: 'sshleifer/distilbart-cnn-12-6',
      lightweight: 'google/pegasus-xsum',
      // Fallback models that work without auth
      public: 'microsoft/DialoGPT-medium',
      simple: 't5-small'
    };
    this.headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'meeting-notes-app/1.0'
    };
    
    // Add auth header if API key is available and valid
    if (process.env.HUGGINGFACE_API_KEY && 
        process.env.HUGGINGFACE_API_KEY !== 'your_huggingface_token_here' &&
        process.env.HUGGINGFACE_API_KEY.length > 10) {
      this.headers['Authorization'] = `Bearer ${process.env.HUGGINGFACE_API_KEY}`;
      this.hasValidApiKey = true;
    } else {
      this.hasValidApiKey = false;
    }
  }

  // Preprocess text to improve summarization quality
  preprocessText(text) {
    // Remove excessive whitespace and normalize
    let cleaned = text.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long (models have token limits)
    if (cleaned.length > 4000) {
      cleaned = cleaned.substring(0, 4000) + '...';
    }
    
    return cleaned;
  }

  async generateSummary(text, customPrompt) {
    try {
      const cleanedText = this.preprocessText(text);
      
      // Try multiple approaches for better results
      if (customPrompt && customPrompt.trim()) {
        return await this.generateCustomSummary(cleanedText, customPrompt);
      } else {
        return await this.generateStandardSummary(cleanedText);
      }
    } catch (error) {
      console.error('Hugging Face API error:', error);
      return this.fallbackSummary(text, customPrompt);
    }
  }

  async generateStandardSummary(text) {
    // Try models in order of preference - if no valid auth, skip directly to fallback
    if (!this.hasValidApiKey) {
      console.log('No valid Hugging Face API key found, using enhanced fallback');
      return this.enhancedFallback(text);
    }

    const models = [this.models.summarization, this.models.backup, this.models.lightweight];
    
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await axios.post(
          `${this.apiUrl}/${model}`,
          {
            inputs: text,
            parameters: {
              max_length: 300,
              min_length: 50,
              do_sample: false
            },
            options: {
              wait_for_model: true,
              use_cache: true
            }
          },
          {
            headers: this.headers,
            timeout: 60000
          }
        );

        console.log('API Response:', response.status, response.data);

        if (response.data && response.data[0] && response.data[0].summary_text) {
          return this.formatSummary(response.data[0].summary_text);
        }
        
        // Handle different response formats
        if (response.data && typeof response.data === 'string') {
          return this.formatSummary(response.data);
        }
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          const firstResult = response.data[0];
          if (typeof firstResult === 'string') {
            return this.formatSummary(firstResult);
          }
        }
        
      } catch (error) {
        console.error(`Error with model ${model}:`, error.response?.status, error.response?.data || error.message);
        
        // If it's a 401 or 403, skip to fallback immediately
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Authentication error, using enhanced fallback');
          return this.enhancedFallback(text);
        }
        
        if (model === models[models.length - 1]) {
          throw error; // Last model failed
        }
        continue; // Try next model
      }
    }
    
    throw new Error('All summarization models failed');
  }

  async generateCustomSummary(text, customPrompt) {
    // If no valid API key, use enhanced fallback immediately
    if (!this.hasValidApiKey) {
      console.log('No valid Hugging Face API key found, using enhanced fallback for custom summary');
      return this.enhancedFallback(text, customPrompt);
    }

    // Try the same models as standard summarization (prioritize quality first)
    const models = [this.models.summarization, this.models.backup, this.models.lightweight];
    
    for (const model of models) {
      try {
        console.log(`Trying custom summary with model: ${model}`);
        
        const response = await axios.post(
          `${this.apiUrl}/${model}`,
          {
            inputs: text,
            parameters: {
              max_length: 400,
              min_length: 100,
              do_sample: false
            },
            options: {
              wait_for_model: true,
              use_cache: true
            }
          },
          {
            headers: this.headers,
            timeout: 60000
          }
        );

        if (response.data && response.data[0] && response.data[0].summary_text) {
          return this.formatCustomSummary(response.data[0].summary_text, customPrompt);
        }
        
      } catch (error) {
        console.error(`Custom summary error with model ${model}:`, error.response?.status, error.response?.data || error.message);
        
        // If auth error, use enhanced fallback immediately
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Authentication error in custom summary, using enhanced fallback');
          return this.enhancedFallback(text, customPrompt);
        }
        
        continue;
      }
    }
    
    // Fallback to enhanced rule-based extraction
    console.log('Using enhanced fallback for custom summary');
    return this.enhancedFallback(text, customPrompt);
  }

  formatSummary(summary) {
    // Clean and format the summary
    let formatted = summary.trim();
    
    // Remove redundant phrases
    formatted = formatted.replace(/^(Summary:|The summary is:|In summary,?)/i, '').trim();
    
    // Ensure proper capitalization
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
    return formatted;
  }

  formatCustomSummary(summary, customPrompt) {
    let formatted = this.formatSummary(summary);
    
    if (customPrompt.toLowerCase().includes('action')) {
      // Try to structure as action items if not already
      if (!formatted.includes('•') && !formatted.includes('-')) {
        const sentences = formatted.split(/[.!]/).filter(s => s.trim());
        formatted = sentences.map(s => `• ${s.trim()}`).join('\n');
      }
      formatted = `Action Items:\n${formatted}`;
    } else if (customPrompt.toLowerCase().includes('executive')) {
      formatted = `Executive Summary:\n${formatted}`;
    } else if (customPrompt.toLowerCase().includes('bullet')) {
      if (!formatted.includes('•') && !formatted.includes('-')) {
        const sentences = formatted.split(/[.!]/).filter(s => s.trim());
        formatted = sentences.map(s => `• ${s.trim()}`).join('\n');
      }
    }
    
    return formatted;
  }

  enhancedFallback(text, customPrompt) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    if (customPrompt?.toLowerCase().includes('action')) {
      return this.extractActionItems(sentences);
    }
    
    if (customPrompt?.toLowerCase().includes('executive')) {
      return this.createExecutiveSummary(sentences, paragraphs);
    }
    
    if (customPrompt?.toLowerCase().includes('bullet')) {
      return this.createBulletSummary(sentences, paragraphs);
    }
    
    return this.createDefaultSummary(sentences, paragraphs);
  }

  extractActionItems(sentences) {
    const actionItems = [];
    const actionKeywords = /\b(will|should|must|need to|have to|action|task|todo|follow up|assign|responsible|deadline|due|complete|finish|deliver)\b/i;
    
    sentences.forEach(sentence => {
      if (actionKeywords.test(sentence)) {
        actionItems.push(`• ${sentence.trim()}`);
      }
    });
    
    return actionItems.length > 0 ? 
      `Action Items:\n${actionItems.join('\n')}` : 
      'No specific action items found in the text.';
  }

  createExecutiveSummary(sentences, paragraphs) {
    const importantSentences = sentences.filter(sentence => 
      /\b(decision|conclude|important|key|critical|result|outcome|next steps|goal|objective|priority)\b/i.test(sentence)
    ).slice(0, 4);
    
    if (importantSentences.length > 0) {
      return `Executive Summary:\n${importantSentences.map(s => `• ${s.trim()}`).join('\n')}`;
    }
    
    // Fallback to first sentences of each paragraph
    const keyPoints = paragraphs.slice(0, 3).map(p => {
      const firstSentence = p.match(/[^.!?]+[.!?]+/)?.[0];
      return firstSentence ? `• ${firstSentence.trim()}` : null;
    }).filter(Boolean);
    
    return `Executive Summary:\n${keyPoints.join('\n')}`;
  }

  createBulletSummary(sentences, paragraphs) {
    const keyPoints = [];
    
    // Extract one key point per paragraph
    paragraphs.forEach(paragraph => {
      const firstSentence = paragraph.match(/[^.!?]+[.!?]+/)?.[0];
      if (firstSentence && firstSentence.length > 20) {
        keyPoints.push(`• ${firstSentence.trim()}`);
      }
    });
    
    return keyPoints.length > 0 ? 
      `Key Points:\n${keyPoints.slice(0, 6).join('\n')}` : 
      this.createDefaultSummary(sentences, paragraphs);
  }

  createDefaultSummary(sentences, paragraphs) {
    // Take the most informative sentences
    const summary = sentences
      .filter(s => s.length > 30) // Filter out very short sentences
      .slice(0, 4)
      .join(' ');
    
    return `Summary:\n${summary}`;
  }

  fallbackSummary(text, customPrompt) {
    return this.enhancedFallback(text, customPrompt);
  }
}

module.exports = new HuggingFaceService();
