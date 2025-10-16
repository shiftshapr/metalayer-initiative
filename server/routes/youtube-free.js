const express = require('express');
const puppeteer = require('puppeteer');
const { google } = require('googleapis');
const router = express.Router();

// Free YouTube transcript extraction using multiple methods
async function getYouTubeTranscriptFree(videoId) {
  console.log(`🎬 FREE: Getting transcript for video: ${videoId}`);
  
  try {
    // Method 1: Try direct browser automation (most reliable for free)
    const browserTranscript = await getTranscriptViaBrowser(videoId);
    if (browserTranscript) {
      console.log(`✅ FREE: Got transcript via browser automation`);
      return browserTranscript;
    }
    
    // Method 2: Try YouTube's free timedtext API
    const apiTranscript = await getTranscriptViaAPI(videoId);
    if (apiTranscript) {
      console.log(`✅ FREE: Got transcript via API`);
      return apiTranscript;
    }
    
    // Method 3: Try scraping captions from page
    const scrapedTranscript = await getTranscriptViaScraping(videoId);
    if (scrapedTranscript) {
      console.log(`✅ FREE: Got transcript via scraping`);
      return scrapedTranscript;
    }
    
    console.log(`❌ FREE: No transcript found using any free method`);
    return null;
    
  } catch (error) {
    console.error(`❌ FREE: Error getting transcript:`, error.message);
    return null;
  }
}

// Method 1: Browser automation to access captions directly
async function getTranscriptViaBrowser(videoId) {
  let browser;
  try {
    console.log(`🌐 FREE: Launching browser for video: ${videoId}`);
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to YouTube video
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`🌐 FREE: Navigating to: ${videoUrl}`);
    
    await page.goto(videoUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for video to load
    await page.waitForTimeout(3000);
    
    // Try to click on captions button if available
    try {
      const captionsButton = await page.$('button[aria-label*="Captions"], button[aria-label*="Subtitles"]');
      if (captionsButton) {
        console.log(`🌐 FREE: Found captions button, clicking...`);
        await captionsButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log(`🌐 FREE: Could not click captions button: ${error.message}`);
    }
    
    // Try to extract captions from the page
    const transcript = await page.evaluate(() => {
      // Look for captions in various places
      const captionSelectors = [
        '.ytp-caption-segment',
        '.caption-line',
        '.ytp-caption-window-container .ytp-caption-segment',
        '[data-purpose="captions-text"]',
        '.captions-text'
      ];
      
      for (const selector of captionSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          const text = Array.from(elements).map(el => el.textContent).join(' ');
          if (text.trim().length > 50) {
            return text.trim();
          }
        }
      }
      
      // Try to get captions from YouTube's internal data
      if (window.ytInitialData) {
        try {
          const data = JSON.parse(window.ytInitialData);
          // This is a complex structure, but we can try to find captions
          const captions = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer?.videoActions?.menuRenderer?.topLevelButtons?.[0]?.toggleButtonRenderer?.defaultText?.accessibility?.accessibilityData?.label;
          if (captions) {
            return captions;
          }
        } catch (e) {
          console.log('Could not parse ytInitialData');
        }
      }
      
      return null;
    });
    
    if (transcript && transcript.trim().length > 50) {
      console.log(`✅ FREE: Browser automation successful, transcript length: ${transcript.length}`);
      return transcript;
    }
    
    return null;
    
  } catch (error) {
    console.log(`❌ FREE: Browser automation failed: ${error.message}`);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Method 2: YouTube's free timedtext API
async function getTranscriptViaAPI(videoId) {
  try {
    console.log(`🌐 FREE: Trying YouTube timedtext API for: ${videoId}`);
    
    // Try multiple language options
    const languages = ['en', 'en-US', 'en-GB'];
    
    for (const lang of languages) {
      try {
        const response = await fetch(`https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/xml, text/xml, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.youtube.com/'
          }
        });

        if (response.ok) {
          const xmlText = await response.text();
          console.log(`🌐 FREE: Got response from timedtext API for ${lang}`);
          
          const transcript = parseYouTubeTranscriptXML(xmlText);
          if (transcript && transcript.trim().length > 50) {
            console.log(`✅ FREE: Transcript extracted from timedtext API (${lang})`);
            return transcript;
          }
        }
      } catch (error) {
        console.log(`🌐 FREE: timedtext API failed for ${lang}: ${error.message}`);
      }
    }
    
    return null;
  } catch (error) {
    console.log(`❌ FREE: YouTube timedtext API failed: ${error.message}`);
    return null;
  }
}

// Method 3: Scrape captions from page HTML
async function getTranscriptViaScraping(videoId) {
  try {
    console.log(`🌐 FREE: Scraping captions for: ${videoId}`);
    
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Look for captions in the HTML
      const captionMatches = html.match(/<text[^>]*>([^<]*)<\/text>/g);
      if (captionMatches && captionMatches.length > 0) {
        const transcript = captionMatches
          .map(match => match.replace(/<[^>]*>/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (transcript.length > 50) {
          console.log(`✅ FREE: Scraped transcript from HTML, length: ${transcript.length}`);
          return transcript;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.log(`❌ FREE: Scraping failed: ${error.message}`);
    return null;
  }
}

// Parse YouTube transcript XML
function parseYouTubeTranscriptXML(xmlText) {
  try {
    const textMatches = xmlText.match(/<text[^>]*>([^<]*)<\/text>/g);
    if (textMatches) {
      const transcript = textMatches
        .map(match => match.replace(/<[^>]*>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      return transcript.length > 0 ? transcript : null;
    }
    return null;
  } catch (error) {
    console.log(`❌ FREE: XML parsing failed: ${error.message}`);
    return null;
  }
}

// Get transcript endpoint
router.get('/transcript/:videoId', async (req, res) => {
  const { videoId } = req.params;
  
  console.log(`🎬 FREE: Getting transcript for video: ${videoId}`);
  
  try {
    const transcript = await getYouTubeTranscriptFree(videoId);
    
    if (transcript) {
      console.log(`✅ FREE: Successfully extracted transcript for ${videoId}`);
      res.json({
        success: true,
        videoId: videoId,
        transcript: transcript,
        source: 'free_methods'
      });
    } else {
      console.log(`❌ FREE: No transcript available for ${videoId}`);
      res.json({
        success: false,
        videoId: videoId,
        message: 'No transcript available for this video',
        transcript: null
      });
    }
  } catch (error) {
    console.error(`❌ FREE: Error getting transcript for ${videoId}:`, error);
    res.status(500).json({
      success: false,
      videoId: videoId,
      error: error.message
    });
  }
});

module.exports = router;
