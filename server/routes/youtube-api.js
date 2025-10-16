const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// YouTube API configuration - DISABLED
// const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
// const youtube = google.youtube({
//   version: 'v3',
//   auth: YOUTUBE_API_KEY
// });

// Get transcript using YouTube's official API - DISABLED
async function getYouTubeTranscriptOfficial(videoId) {
  console.log(`🎬 OFFICIAL: YouTube API disabled - returning null for video: ${videoId}`);
  return null;
}

// Parse SRT (SubRip) format content - DISABLED
function parseSRTContent(srtContent) {
  return null;
}

// Get transcript endpoint
router.get('/transcript/:videoId', async (req, res) => {
  const { videoId } = req.params;
  
  console.log(`🎬 OFFICIAL: Getting transcript for video: ${videoId}`);
  
  try {
    const transcript = await getYouTubeTranscriptOfficial(videoId);
    
    if (transcript) {
      console.log(`✅ OFFICIAL: Successfully extracted transcript for ${videoId}`);
      res.json({
        success: true,
        videoId: videoId,
        transcript: transcript,
        source: 'youtube_official_api'
      });
    } else {
      console.log(`❌ OFFICIAL: No transcript available for ${videoId}`);
      res.json({
        success: false,
        videoId: videoId,
        message: 'No transcript available for this video',
        transcript: null
      });
    }
  } catch (error) {
    console.error(`❌ OFFICIAL: Error getting transcript for ${videoId}:`, error);
    res.status(500).json({
      success: false,
      videoId: videoId,
      error: error.message
    });
  }
});

module.exports = router;
