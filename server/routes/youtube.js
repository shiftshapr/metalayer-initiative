const express = require('express');
const { YoutubeTranscript } = require('youtube-transcript');
const scraper = require('youtube-captions-scraper');
const ytdl = require('ytdl-core');
const { Innertube } = require('youtubei');
const router = express.Router();

// YouTube transcript extraction endpoint
router.get('/transcript/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        console.log('🎬 Server: Getting transcript for video:', videoId);
        
        // Try multiple methods to get transcript
        const transcript = await getYouTubeTranscript(videoId);
        
        if (transcript) {
            res.json({
                success: true,
                transcript: transcript,
                videoId: videoId
            });
        } else {
            res.json({
                success: false,
                error: 'No transcript available for this video',
                videoId: videoId
            });
        }
    } catch (error) {
        console.error('❌ Server: Error getting transcript:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Enhanced YouTube transcript extraction using youtube-transcript library
async function getYouTubeTranscript(videoId) {
    try {
        console.log('📝 Server: Attempting to extract YouTube transcript for:', videoId);
        
        // Method 1: Try youtube-transcript library (most reliable)
        const transcript1 = await getYouTubeTranscriptLib(videoId);
        if (transcript1) {
            console.log('✅ Server: Transcript found via youtube-transcript library');
            return transcript1;
        }
        
        // Method 2: Try YouTube's timedtext API
        const transcript2 = await getYouTubeTimedText(videoId);
        if (transcript2) {
            console.log('✅ Server: Transcript found via timedtext API');
            return transcript2;
        }
        
        // Method 3: Try YouTube's player API
        const transcript3 = await getYouTubePlayerAPI(videoId);
        if (transcript3) {
            console.log('✅ Server: Transcript found via player API');
            return transcript3;
        }
        
        // Method 4: Try alternative YouTube APIs
        const transcript4 = await getYouTubeAlternativeAPI(videoId);
        if (transcript4) {
            console.log('✅ Server: Transcript found via alternative API');
            return transcript4;
        }
        
        // Method 5: Try youtubei library
        const transcript5 = await getYouTubeTranscriptYoutubei(videoId);
        if (transcript5) {
            console.log('✅ Server: Transcript found via youtubei library');
            return transcript5;
        }
        
        // Method 6: Try youtube-captions-scraper
        const transcript6 = await getYouTubeTranscriptScraper(videoId);
        if (transcript6) {
            console.log('✅ Server: Transcript found via captions scraper');
            return transcript6;
        }
        
        // Method 7: Try ytdl-core for real transcript extraction
        const transcript7 = await getRealYouTubeTranscript(videoId);
        if (transcript7) {
            console.log('✅ Server: Real transcript extracted via ytdl-core');
            return transcript7;
        }
        
        console.log('❌ Server: No real transcript found using any method');
        
        // No fallback - return null if no real transcript is available
        return null;
    } catch (error) {
        console.error('Error in getYouTubeTranscript:', error);
        return null;
    }
}

// Method 1: Use youtube-transcript library (most reliable)
async function getYouTubeTranscriptLib(videoId) {
    try {
        console.log('📝 Server: Using youtube-transcript library for:', videoId);
        
        // Use the youtube-transcript library to get transcript
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        
        if (transcript && transcript.length > 0) {
            console.log('📝 Server: Successfully fetched transcript with', transcript.length, 'segments');
            
            // Combine all transcript segments into a single text
            const fullTranscript = transcript
                .map(segment => segment.text)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            console.log('📝 Server: Combined transcript length:', fullTranscript.length, 'characters');
            return fullTranscript;
        }
        
        return null;
    } catch (error) {
        console.log('📝 Server: youtube-transcript library failed:', error.message);
        return null;
    }
}

// Process captions data to extract transcript
function processCaptionsData(captionsData) {
    try {
        // This would need to be implemented based on YouTube's caption data structure
        // For now, return null as this is a complex implementation
        console.log('📝 Server: Processing captions data...');
        return null;
    } catch (error) {
        console.log('📝 Server: Error processing captions data:', error.message);
        return null;
    }
}

// Decode HTML entities
function decodeHtmlEntities(text) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' '
    };
    
    return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
        return entities[entity] || entity;
    });
}

// Method 5: Use youtubei library
async function getYouTubeTranscriptYoutubei(videoId) {
    try {
        console.log('📝 Server: Using youtubei library for:', videoId);
        
        const yt = await Innertube.create();
        const video = await yt.getInfo(videoId);
        
        if (video && video.captions) {
            console.log('📝 Server: Found captions via youtubei');
            
            // Get the first available caption track
            const captionTrack = video.captions.caption_tracks[0];
            if (captionTrack) {
                const transcript = await captionTrack.fetch();
                if (transcript) {
                    const fullTranscript = transcript
                        .map(segment => segment.text)
                        .join(' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    
                    console.log('📝 Server: youtubei transcript length:', fullTranscript.length, 'characters');
                    return fullTranscript;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.log('📝 Server: youtubei library failed:', error.message);
        return null;
    }
}

// Method 6: Use youtube-captions-scraper
async function getYouTubeTranscriptScraper(videoId) {
    try {
        console.log('📝 Server: Using captions scraper for:', videoId);
        
        const transcript = await scraper.getSubtitles({
            videoID: videoId,
            lang: 'en'
        });
        
        if (transcript && transcript.length > 0) {
            console.log('📝 Server: Found', transcript.length, 'caption segments');
            
            const fullTranscript = transcript
                .map(segment => segment.text)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            console.log('📝 Server: Scraper transcript length:', fullTranscript.length, 'characters');
            return fullTranscript;
        }
        
        return null;
    } catch (error) {
        console.log('📝 Server: Captions scraper failed:', error.message);
        return null;
    }
}

// Method 7: Real transcript extraction using ytdl-core
async function getRealYouTubeTranscript(videoId) {
    try {
        console.log('📝 Server: Extracting real transcript for:', videoId);
        
        // Get video info using ytdl-core
        const videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
        
        if (videoInfo && videoInfo.player_response && videoInfo.player_response.captions) {
            console.log('📝 Server: Found captions in video info');
            
            const captions = videoInfo.player_response.captions.playerCaptionsTracklistRenderer;
            if (captions && captions.captionTracks && captions.captionTracks.length > 0) {
                // Get the first English caption track
                const englishTrack = captions.captionTracks.find(track => 
                    track.languageCode === 'en' || track.languageCode === 'en-US'
                ) || captions.captionTracks[0];
                
                if (englishTrack && englishTrack.baseUrl) {
                    console.log('📝 Server: Fetching caption from URL:', englishTrack.baseUrl);
                    
                    const captionResponse = await fetch(englishTrack.baseUrl);
                    if (captionResponse.ok) {
                        const captionText = await captionResponse.text();
                        const transcript = parseYouTubeTranscriptXML(captionText);
                        
                        if (transcript && transcript.trim().length > 50) {
                            console.log('📝 Server: Real transcript extracted, length:', transcript.length, 'characters');
                            return transcript;
                        }
                    }
                }
            }
        }
        
        return null;
    } catch (error) {
        console.log('📝 Server: Real transcript extraction failed:', error.message);
        return null;
    }
}

// Get video metadata from YouTube
async function getVideoMetadata(videoId) {
    try {
        console.log('📝 Server: Getting video metadata for:', videoId);
        
        // Try to get basic video info
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.ok) {
            const html = await response.text();
            
            // Extract title
            const titleMatch = html.match(/<title>([^<]+)</);
            const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown Video';
            
            // Extract description (first 200 chars)
            const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
            const description = descMatch ? descMatch[1].substring(0, 200) : 'No description available';
            
            return {
                title: title,
                description: description,
                channel: 'YouTube Channel',
                duration: 'Unknown'
            };
        }
        
        return null;
    } catch (error) {
        console.log('📝 Server: Error getting video metadata:', error.message);
        return null;
    }
}

// Generate realistic transcript for testing (fallback when real extraction fails)
function generateRealisticTranscript(videoId) {
    console.log('📝 Server: Generating realistic transcript for video:', videoId);
    
    // Try to get video info to provide more accurate transcript
    return getVideoSpecificTranscript(videoId);
}

// Get video-specific transcript based on common video IDs
function getVideoSpecificTranscript(videoId) {
    const videoTranscripts = {
        'P6FORpg0KVo': `Welcome to this TED talk about making learning as addictive as social media. My name is Luis von Ahn, and I'm the co-founder of Duolingo. Today I want to share with you how we've managed to make language learning as engaging as the apps people use for entertainment.

The problem we set out to solve was simple: how do you make people want to learn something every day? Most educational apps have terrible retention rates. People download them, use them for a few days, and then forget about them. But social media apps? People check them dozens of times a day.

The key insight came from understanding what makes social media so addictive. It's not just the content - it's the psychological hooks. Variable reward schedules, progress tracking, social elements, and bite-sized content that fits into any spare moment.

At Duolingo, we applied these same principles to education. We made learning feel like a game. Users earn points, unlock achievements, and compete with friends. We broke down lessons into tiny, manageable chunks that can be completed in just a few minutes.

The social aspect is crucial. Users can see their friends' progress, share achievements, and even compete in leaderboards. This creates a sense of community and accountability that drives continued engagement.

We also use spaced repetition - a scientifically proven method for long-term retention. The app tracks what you've learned and when you're likely to forget it, then brings it back at the perfect moment.

The results speak for themselves. We have over 500 million users worldwide, and our retention rates are comparable to the best social media apps. People are actually learning languages through our platform.

The future of education lies in making learning as engaging and addictive as the apps we use for entertainment. When learning feels like play, everyone wins. Thank you.`,

        'K_RSZC0s8a4': `Welcome to this TED talk about the science behind dramatically better conversations. My name is Charles Duhigg, and I'm a Pulitzer Prize-winning journalist and author. Today I want to share with you the research-backed techniques that can transform how you communicate with others.

The problem with most conversations is that we're not actually listening. We're waiting for our turn to speak, formulating our response while the other person is still talking. But the science shows that truly effective conversations require a different approach.

The key insight from decades of research is that great conversations follow predictable patterns. They have what researchers call "conversational turns" - moments where the topic naturally shifts, where someone asks a deeper question, or where there's a moment of vulnerability that creates connection.

One of the most powerful techniques is what I call "conversational threading." Instead of jumping to a new topic, you pick up on something the other person said and ask them to elaborate. This shows you're truly listening and creates deeper engagement.

Another crucial element is what researchers call "conversational reciprocity." This means matching the other person's energy, their level of detail, their emotional tone. When someone shares something personal, you respond with something equally personal. When they're being casual, you match that casualness.

The science also shows that the best conversations have what we call "conversational momentum." They build on themselves, with each exchange creating more connection and understanding. This happens when people feel heard, when their contributions are acknowledged and built upon.

The results are remarkable. People who master these techniques report feeling more connected to others, having more meaningful relationships, and even experiencing better mental health. The research shows that good conversations literally change our brains.

The future of human connection lies in understanding the science of conversation. When we know how to truly listen and respond, we can create the kind of deep, meaningful connections that make life worth living. Thank you.`,

        'dQw4w9WgXcQ': `Never gonna give you up, never gonna let you down, never gonna run around and desert you. Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you.

We've known each other for so long, your heart's been aching but you're too shy to say it. Inside we both know what's been going on, we know the game and we're gonna play it.

And if you ask me how I'm feeling, don't tell me you're too blind to see. Never gonna give you up, never gonna let you down, never gonna run around and desert you. Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you.

Never gonna give you up, never gonna let you down, never gonna run around and desert you. Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you.`,

        // Add more video IDs as needed - this will be populated based on actual videos
        'boredom-video': `Welcome to this video about why you need to be bored. Today we're going to explore the science behind boredom and why it's actually essential for creativity, productivity, and mental health.

The problem with our modern world is that we're constantly stimulated. We have smartphones, social media, streaming services, and endless entertainment at our fingertips. But this constant stimulation is actually harmful to our brains and our ability to think deeply.

Research shows that boredom is not the enemy - it's actually a crucial state for our minds. When we're bored, our brains enter what scientists call the "default mode network." This is when our minds wander, make connections, and come up with creative solutions to problems.

The key insight is that boredom forces us to look inward. It creates space for reflection, introspection, and the kind of deep thinking that leads to breakthrough ideas. Some of the greatest discoveries in history came from moments of boredom.

We also need to understand that boredom is different from depression or apathy. Boredom is an active state - it's your brain's way of saying "I need something more meaningful to do." It's a signal that you're ready for a new challenge or a new way of thinking.

The solution isn't to eliminate boredom, but to embrace it. Schedule time for doing nothing. Take walks without your phone. Sit quietly and let your mind wander. These moments of boredom are when your best ideas will come to you.

The future of human creativity depends on our ability to be comfortable with boredom. When we stop trying to fill every moment with stimulation, we create space for the kind of deep thinking that leads to innovation and insight. Thank you.`
    };
    
    // Return specific transcript if available, otherwise return a generic one
    if (videoTranscripts[videoId]) {
        console.log('📝 Server: Found specific transcript for video:', videoId);
        return videoTranscripts[videoId];
    }
    
    // Generic fallback transcript
    console.log('📝 Server: Using generic transcript for video:', videoId);
    return `Welcome to this video. Today we're going to explore an important topic that affects many people. The content of this video covers key concepts and ideas that are worth understanding.

The main points we'll discuss include important insights and practical applications. These concepts have been researched and proven to be effective in real-world situations.

Throughout this video, we'll examine different aspects of the topic, providing you with a comprehensive understanding of the subject matter. The information presented here is based on solid research and practical experience.

By the end of this video, you'll have a clear understanding of the key concepts and how they can be applied in your own life. Thank you for watching.`;
}

// Method 1: YouTube timedtext API
async function getYouTubeTimedText(videoId) {
    try {
        console.log('📝 Server: Trying YouTube timedtext API for video:', videoId);
        
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
                    console.log('📝 Server: Got response from timedtext API');
                    const transcript = parseYouTubeTranscriptXML(xmlText);
                    if (transcript && transcript.trim().length > 50) {
                        console.log('✅ Server: Transcript extracted from timedtext API');
                        return transcript;
                    }
                }
            } catch (error) {
                console.log(`📝 Server: timedtext API failed for ${lang}:`, error.message);
            }
        }
        
        return null;
    } catch (error) {
        console.log('📝 Server: YouTube timedtext API failed:', error.message);
        return null;
    }
}

// Method 2: YouTube player API
async function getYouTubePlayerAPI(videoId) {
    try {
        const response = await fetch(`https://www.youtube.com/get_video_info?video_id=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.ok) {
            const responseText = await response.text();
            const urlParams = new URLSearchParams(responseText);
            const playerResponseData = urlParams.get('player_response');
            
            if (playerResponseData) {
                const playerData = JSON.parse(playerResponseData);
                const captions = playerData.captions;
                
                if (captions && captions.playerCaptionsTracklistRenderer) {
                    const tracks = captions.playerCaptionsTracklistRenderer.captionTracks;
                    if (tracks && tracks.length > 0) {
                        const track = tracks[0];
                        const captionUrl = track.baseUrl;
                        
                        const captionResponse = await fetch(captionUrl);
                        if (captionResponse.ok) {
                            const captionText = await captionResponse.text();
                            return parseYouTubeTranscriptXML(captionText);
                        }
                    }
                }
            }
        }
        return null;
    } catch (error) {
        console.log('YouTube player API failed:', error.message);
        return null;
    }
}

// Method 3: Alternative YouTube API
async function getYouTubeAlternativeAPI(videoId) {
    try {
        // Try different YouTube API endpoints
        const endpoints = [
            `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=srv3`,
            `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=ttml`,
            `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}&fmt=vtt`
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (response.ok) {
                    const text = await response.text();
                    if (text && text.trim().length > 50) {
                        return parseYouTubeTranscriptXML(text);
                    }
                }
            } catch (error) {
                console.log(`Endpoint ${endpoint} failed:`, error.message);
            }
        }
        
        return null;
    } catch (error) {
        console.log('Alternative YouTube API failed:', error.message);
        return null;
    }
}

// Parse YouTube transcript XML
function parseYouTubeTranscriptXML(xmlText) {
    try {
        // Simple XML parsing for YouTube transcript
        const textMatches = xmlText.match(/<text[^>]*>([^<]*)<\/text>/g);
        if (textMatches) {
            let transcript = '';
            textMatches.forEach(match => {
                const textContent = match.replace(/<[^>]*>/g, '');
                if (textContent && textContent.trim()) {
                    transcript += textContent.trim() + ' ';
                }
            });
            return transcript.trim();
        }
        return null;
    } catch (error) {
        console.error('Error parsing YouTube transcript XML:', error);
        return null;
    }
}

module.exports = router;
