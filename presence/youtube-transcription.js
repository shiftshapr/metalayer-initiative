// YouTube Transcription Service
// This service handles YouTube video transcription and AI summarization

class YouTubeTranscriptionService {
    constructor() {
        this.apiUrl = 'http://localhost:3001/api/youtube';
        this.agentApiUrl = 'http://localhost:3001/api/agent';
    }

    // Extract captions from YouTube video
    async getVideoTranscript(videoId) {
        try {
            console.log('🎬 Getting transcript for video:', videoId);
            
            // Use enhanced transcript extraction with multiple fallbacks
            const transcript = await this.getVideoTranscriptEnhanced(videoId);
            if (transcript) {
                console.log('✅ Transcript successfully extracted');
                return transcript;
            }

            throw new Error('No transcript available for this video');
        } catch (error) {
            console.error('❌ Error getting transcript:', error);
            throw error;
        }
    }

    // Extract captions from YouTube's internal caption system
    async extractYouTubeCaptions(videoId) {
        try {
            console.log('📝 Attempting to extract YouTube captions...');
            
            // Method 1: Try to access YouTube's internal caption data
            const transcript = await this.getYouTubeTranscript(videoId);
            if (transcript) {
                return transcript;
            }
            
            // Method 2: Try to scrape captions from the page
            const scrapedTranscript = await this.scrapeYouTubeCaptions();
            if (scrapedTranscript) {
                return scrapedTranscript;
            }
            
            return null;
        } catch (error) {
            console.error('Error extracting YouTube captions:', error);
            return null;
        }
    }

    // Get YouTube transcript using YouTube's internal API
    async getYouTubeTranscript(videoId) {
        try {
            // This method tries to access YouTube's internal transcript API
            const response = await fetch(`https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/xml'
                }
            });

            if (response.ok) {
                const xmlText = await response.text();
                return this.parseYouTubeTranscriptXML(xmlText);
            }
            
            return null;
        } catch (error) {
            console.log('YouTube transcript API not accessible:', error.message);
            return null;
        }
    }

    // Parse YouTube transcript XML
    parseYouTubeTranscriptXML(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const textElements = xmlDoc.getElementsByTagName('text');
            
            let transcript = '';
            for (let i = 0; i < textElements.length; i++) {
                const text = textElements[i].textContent;
                if (text && text.trim()) {
                    transcript += text.trim() + ' ';
                }
            }
            
            return transcript.trim();
        } catch (error) {
            console.error('Error parsing YouTube transcript XML:', error);
            return null;
        }
    }

    // Scrape captions from the current page
    async scrapeYouTubeCaptions() {
        try {
            // Try to find caption elements on the page
            const captionSelectors = [
                '.ytp-caption-segment',
                '.caption-line',
                '.ytp-caption-window-container',
                '[class*="caption"]',
                '[class*="subtitle"]'
            ];
            
            for (const selector of captionSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    let transcript = '';
                    elements.forEach(el => {
                        if (el.textContent && el.textContent.trim()) {
                            transcript += el.textContent.trim() + ' ';
                        }
                    });
                    if (transcript.trim()) {
                        return transcript.trim();
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error scraping YouTube captions:', error);
            return null;
        }
    }

    // Get transcript from server endpoint
    async getExternalTranscript(videoId) {
        try {
            console.log('🌐 Fetching transcript from server for video:', videoId);
            
            // Try the OFFICIAL YouTube API first
            const officialResponse = await fetch(`http://localhost:3001/api/youtube-api/transcript/${videoId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (officialResponse.ok) {
                const officialData = await officialResponse.json();
                if (officialData.success && officialData.transcript) {
                    console.log('✅ OFFICIAL YouTube API transcript received');
                    return officialData.transcript;
                }
            }
            
            // Try the FREE method as fallback
            const freeResponse = await fetch(`http://localhost:3001/api/youtube-free/transcript/${videoId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (freeResponse.ok) {
                const freeData = await freeResponse.json();
                if (freeData.success && freeData.transcript) {
                    console.log('✅ FREE method transcript received');
                    return freeData.transcript;
                }
            }
            
            // Fallback to original method
            const response = await fetch(`${this.apiUrl}/transcript/${videoId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.transcript) {
                console.log('✅ Fallback transcript received');
                return data.transcript;
            } else {
                console.log('❌ Server: No transcript available');
                return null;
            }
        } catch (error) {
            console.error('Error getting server transcript:', error);
            return null;
        }
    }

    // Alternative method: Use YouTube's player API to get captions
    async getYouTubePlayerCaptions(videoId) {
        try {
            // Try to access YouTube's player API
            const playerResponse = await fetch(`https://www.youtube.com/get_video_info?video_id=${videoId}`, {
                method: 'GET'
            });

            if (playerResponse.ok) {
                const responseText = await playerResponse.text();
                const urlParams = new URLSearchParams(responseText);
                const playerResponseData = urlParams.get('player_response');
                
                if (playerResponseData) {
                    const playerData = JSON.parse(playerResponseData);
                    const captions = playerData.captions;
                    
                    if (captions && captions.playerCaptionsTracklistRenderer) {
                        const tracks = captions.playerCaptionsTracklistRenderer.captionTracks;
                        if (tracks && tracks.length > 0) {
                            // Get the first available track (usually English)
                            const track = tracks[0];
                            const captionUrl = track.baseUrl;
                            
                            // Fetch the caption data
                            const captionResponse = await fetch(captionUrl);
                            if (captionResponse.ok) {
                                const captionText = await captionResponse.text();
                                return this.parseYouTubeTranscriptXML(captionText);
                            }
                        }
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error getting YouTube player captions:', error);
            return null;
        }
    }

    // Enhanced transcript extraction with multiple fallbacks
    async getVideoTranscriptEnhanced(videoId) {
        try {
            console.log('🎬 Enhanced transcript extraction for video:', videoId);
            
            // Try multiple methods in order of preference (server first to avoid CSP issues)
            const methods = [
                () => this.getExternalTranscript(videoId), // Server endpoint first
                () => this.scrapeYouTubeCaptions(), // Local scraping
                () => this.getYouTubePlayerCaptions(videoId), // Direct API (may fail due to CSP)
                () => this.getYouTubeTranscript(videoId) // Direct API (may fail due to CSP)
            ];
            
            for (let i = 0; i < methods.length; i++) {
                try {
                    console.log(`📝 Trying transcript method ${i + 1}...`);
                    const transcript = await methods[i]();
                    if (transcript && transcript.trim().length > 50) {
                        console.log(`✅ Transcript found using method ${i + 1}`);
                        return transcript;
                    }
                } catch (error) {
                    console.log(`❌ Method ${i + 1} failed:`, error.message);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error in enhanced transcript extraction:', error);
            return null;
        }
    }

    // Generate AI summary of the video transcript
    async generateVideoSummary(videoData, transcript) {
        try {
            console.log('🤖 Generating AI summary for video...');
            
            const context = {
                videoTitle: videoData.title,
                videoDescription: videoData.description,
                channelName: videoData.channel?.name,
                duration: videoData.duration,
                views: videoData.views,
                transcript: transcript,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(this.agentApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "Please provide a comprehensive summary of this YouTube video based on the transcript and video information provided.",
                    context: context,
                    type: 'youtube_summary'
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('❌ Error generating video summary:', error);
            throw error;
        }
    }

    // Generate key points from video
    async generateKeyPoints(videoData, transcript) {
        try {
            console.log('📋 Generating key points for video...');
            
            const context = {
                videoTitle: videoData.title,
                transcript: transcript,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(this.agentApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "Extract the key points and main topics from this YouTube video transcript. Provide a bulleted list of the most important points discussed.",
                    context: context,
                    type: 'youtube_keypoints'
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('❌ Error generating key points:', error);
            throw error;
        }
    }

    // Generate Q&A based on video content
    async generateQuestions(videoData, transcript) {
        try {
            console.log('❓ Generating questions for video...');
            
            const context = {
                videoTitle: videoData.title,
                transcript: transcript,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(this.agentApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "Generate 5-7 thoughtful questions that someone might ask about this YouTube video content. Focus on the main topics and concepts discussed.",
                    context: context,
                    type: 'youtube_questions'
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('❌ Error generating questions:', error);
            throw error;
        }
    }

    // Process YouTube video - main function
    async processYouTubeVideo(videoData) {
        try {
            console.log('🎥 Processing YouTube video:', videoData.title);
            
            // Step 1: Get transcript
            const transcript = await this.getVideoTranscript(videoData.videoId);
            if (!transcript) {
                throw new Error('No transcript available for this video');
            }

            // Step 2: Generate AI content
            const [summary, keyPoints, questions] = await Promise.all([
                this.generateVideoSummary(videoData, transcript),
                this.generateKeyPoints(videoData, transcript),
                this.generateQuestions(videoData, transcript)
            ]);

            return {
                videoData: videoData,
                transcript: transcript,
                summary: summary,
                keyPoints: keyPoints,
                questions: questions,
                processedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error processing YouTube video:', error);
            throw error;
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YouTubeTranscriptionService;
} else {
    window.YouTubeTranscriptionService = YouTubeTranscriptionService;
}
