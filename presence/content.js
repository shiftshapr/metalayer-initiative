// content.js - Injects and manages the trigger button and selection widget

(function() {
    // Avoid running multiple times if script is injected more than once
    if (document.getElementById('collaborative-sidebar-trigger')) {
        return;
    }

    console.log("Content script loaded for Collaborative Sidebar.");
    
    // Early injection: Check for share page immediately and inject markers
    // This runs before DOM is ready, so the share page can detect extension faster
    (function earlyInject() {
        const isSharePage = window.location.pathname.includes('/share-message') || 
                           window.location.search.includes('message=') ||
                           (window.location.hostname === 'share.canopi.live' && window.location.search.includes('message='));
        
        if (isSharePage && document.documentElement) {
            document.documentElement.setAttribute('data-canopi-extension', 'true');
            if (!window.CanopiExtension) {
                window.CanopiExtension = {
                    installed: true,
                    version: chrome.runtime.getManifest().version,
                    sendMessage: (message, callback) => {
                        chrome.runtime.sendMessage(message, callback);
                    }
                };
            }
            console.log('🔗 Content script: Early share page markers injected');
        }
    })();

    // Listen for messages from the sidepanel
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractPageContent') {
            const pageContent = extractPageContent();
            sendResponse({ content: pageContent });
        }
    });

    // Detect if this is a share message page and inject extension marker
    // Check both pathname and query params (for root redirect case)
    // Note: Markers may already be injected above, but we still set up listeners
    const isSharePage = window.location.pathname.includes('/share-message') || 
                       window.location.search.includes('message=') ||
                       (window.location.hostname === 'share.canopi.live' && window.location.search.includes('message='));
    
    if (isSharePage) {
        // Ensure markers are set (in case they weren't set earlier)
        if (!document.documentElement.hasAttribute('data-canopi-extension')) {
            document.documentElement.setAttribute('data-canopi-extension', 'true');
        }
        
        // Ensure global flag is set
        if (!window.CanopiExtension) {
            window.CanopiExtension = {
                installed: true,
                version: chrome.runtime.getManifest().version,
                // Expose a method for the share page to send messages
                sendMessage: (message, callback) => {
                    chrome.runtime.sendMessage(message, callback);
                }
            };
        }

        // Listen for share page messages via postMessage
        window.addEventListener('message', (event) => {
            // Only accept messages from same origin
            if (event.origin !== window.location.origin) return;

            if (event.data && event.data.type === 'CHECK_CANOPI_EXTENSION') {
                window.postMessage({
                    type: 'CANOPI_EXTENSION_RESPONSE',
                    installed: true,
                    extensionId: chrome.runtime.id
                }, window.location.origin);
            }

            // Forward OPEN_SHARED_MESSAGE to background script
            if (event.data && event.data.type === 'OPEN_SHARED_MESSAGE') {
                chrome.runtime.sendMessage(event.data, (response) => {
                    // Forward response back to share page
                    window.postMessage({
                        type: 'OPEN_SHARED_MESSAGE_RESPONSE',
                        success: response ? response.success : false,
                        error: response ? response.error : null
                    }, window.location.origin);
                });
            }
        });
    }

    // Create the trigger button
    const triggerButton = document.createElement('button');
    triggerButton.id = 'collaborative-sidebar-trigger';
    triggerButton.textContent = '🗨️'; // Simple emoji placeholder, replace with icon via CSS
    triggerButton.title = 'Toggle Collaborative Sidebar';

    // Add event listener to the button
    triggerButton.addEventListener('click', () => {
        console.log("Trigger button clicked.");
        // Send a message to the background script to toggle the sidebar
        chrome.runtime.sendMessage({ action: "toggleSidebar" }, (response) => {
             if (chrome.runtime.lastError) {
                console.error("Error sending toggle message:", chrome.runtime.lastError);
            } else {
                console.log("Toggle message sent, background responded:", response);
            }
        });
    });

    // Append the button to the body
    document.body.appendChild(triggerButton);

    console.log("Trigger button added to page.");

    // --- Selection Widget ---
    let selectionWidget = null;
    let currentSelection = null;

    // Create the selection widget
    function createSelectionWidget() {
        if (selectionWidget) return selectionWidget;

        const widget = document.createElement('div');
        widget.id = 'metalayer-selection-widget';
        widget.className = 'metalayer-widget';
        
        widget.innerHTML = `
            <div class="widget-content">
                <div class="widget-header">
                    <span class="widget-title">MetaLayer</span>
                    <button class="widget-close">×</button>
                </div>
                <div class="widget-actions">
                    <button class="widget-action" data-action="message">
                        💬 Start Message
                    </button>
                    <button class="widget-action" data-action="visibility">
                        👁️ Anchor Visibility
                    </button>
                </div>
                <div class="widget-preview">
                    <span class="preview-label">Selected:</span>
                    <div class="preview-content"></div>
                </div>
            </div>
        `;

        // Add event listeners
        widget.querySelector('.widget-close').addEventListener('click', hideSelectionWidget);
        widget.querySelector('[data-action="message"]').addEventListener('click', () => handleWidgetAction('message'));
        widget.querySelector('[data-action="visibility"]').addEventListener('click', () => handleWidgetAction('visibility'));

        document.body.appendChild(widget);
        selectionWidget = widget;
        return widget;
    }

    // Show selection widget
    function showSelectionWidget(selection) {
        if (!selection || selection.toString().trim().length === 0) {
            hideSelectionWidget();
            return;
        }

        const widget = createSelectionWidget();
        const previewContent = widget.querySelector('.preview-content');
        
        // Update preview content
        const selectedText = selection.toString().trim();
        const previewText = selectedText.length > 100 
            ? selectedText.substring(0, 100) + '...' 
            : selectedText;
        
        previewContent.textContent = previewText;
        currentSelection = selectedText;

        // Position the widget near the selection
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        widget.style.position = 'fixed';
        widget.style.left = `${rect.left + window.scrollX}px`;
        widget.style.top = `${rect.bottom + window.scrollY + 5}px`;
        widget.style.display = 'block';

        // Ensure widget stays within viewport
        const widgetRect = widget.getBoundingClientRect();
        if (widgetRect.right > window.innerWidth) {
            widget.style.left = `${window.innerWidth - widgetRect.width - 10}px`;
        }
        if (widgetRect.bottom > window.innerHeight) {
            widget.style.top = `${rect.top + window.scrollY - widgetRect.height - 5}px`;
        }
    }

    // Hide selection widget
    function hideSelectionWidget() {
        if (selectionWidget) {
            selectionWidget.style.display = 'none';
        }
        currentSelection = null;
    }

    // Handle widget actions
    function handleWidgetAction(action) {
        if (!currentSelection) return;

        const selectedContent = currentSelection;
        const currentUrl = window.location.href;

        if (action === 'message') {
            // Send message to sidepanel to start a message with selected content
            chrome.runtime.sendMessage({
                action: 'startMessageWithContent',
                content: selectedContent,
                uri: currentUrl
            });
        } else if (action === 'visibility') {
            // Send message to sidepanel to anchor visibility
            chrome.runtime.sendMessage({
                action: 'anchorVisibility',
                content: selectedContent,
                uri: currentUrl
            });
        }

        hideSelectionWidget();
    }

    // Listen for text selection
    document.addEventListener('mouseup', () => {
        const selection = window.getSelection();
        if (selection.toString().trim().length > 0) {
            showSelectionWidget(selection);
        } else {
            hideSelectionWidget();
        }
    });

    // Listen for image selection (click)
    document.addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG') {
            const img = event.target;
            const altText = img.alt || img.title || 'Selected image';
            const selection = {
                toString: () => altText,
                getRangeAt: () => ({
                    getBoundingClientRect: () => img.getBoundingClientRect()
                })
            };
            showSelectionWidget(selection);
        }
    });

    // Hide widget when clicking elsewhere
    document.addEventListener('click', (event) => {
        if (selectionWidget && !selectionWidget.contains(event.target)) {
            hideSelectionWidget();
        }
    });

    // Hide widget on scroll
    window.addEventListener('scroll', hideSelectionWidget);

    // --- Optional: Logic for overlay vs. push mode ---
    // This would likely involve listening for changes in chrome.storage
    // and adding/removing a class to the <html> or <body> element
    // which CSS in content.css could use to apply margins/padding.
    // Example:
    /*
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.sidebarMode) {
            const mode = changes.sidebarMode.newValue;
            if (mode === 'push') {
                document.documentElement.classList.add('collaborative-sidebar-push-mode');
            } else {
                document.documentElement.classList.remove('collaborative-sidebar-push-mode');
            }
        }
    });
    // Initial check
    chrome.storage.sync.get('sidebarMode', ({ sidebarMode }) => {
         if (sidebarMode === 'push') {
            document.documentElement.classList.add('collaborative-sidebar-push-mode');
        }
    });
    */

    // Page content extraction for agent functionality
    function extractPageContent() {
        // Check if this is a YouTube page
        const isYouTube = window.location.hostname.includes('youtube.com');
        console.log('🔍 Content script: Is YouTube page?', isYouTube);
        console.log('🔍 Content script: Current URL:', window.location.href);
        const videoData = isYouTube ? extractYouTubeVideoData() : null;
        console.log('🔍 Content script: Video data:', videoData);
        
        // Remove unwanted elements (ads, scripts, styles, etc.)
        const unwantedSelectors = [
            'script', 'style', 'noscript', 'iframe[src*="ads"]', 
            '.ad', '.advertisement', '.ads', '[class*="ad-"]',
            '.social-share', '.share-buttons', '.comments',
            'nav', 'header', 'footer', '.sidebar', '.menu',
            '.cookie-banner', '.popup', '.modal'
        ];
        
        // Create a temporary copy to avoid modifying the original DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = document.body.innerHTML;
        
        unwantedSelectors.forEach(selector => {
            const elements = tempDiv.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
        
        // Extract comprehensive page information
        const pageData = {
            title: document.title,
            url: window.location.href,
            domain: window.location.hostname,
            timestamp: Date.now(),
            content: extractMainContent(tempDiv),
            metadata: extractMetadata(),
            structure: extractPageStructure(tempDiv),
            isYouTube: isYouTube,
            videoData: videoData
        };
        
        // Generate content hash (excluding ads and dynamic content)
        pageData.contentHash = generateContentHash(pageData.content);
        
        console.log('🔍 Content script: Final page data:', pageData);
        console.log('🔍 Content script: Is YouTube in final data:', pageData.isYouTube);
        console.log('🔍 Content script: Video data in final data:', pageData.videoData);
        
        return pageData;
    }

    function extractMainContent(container) {
        // Try to get main content from semantic selectors
        const mainSelectors = [
            'main',
            'article', 
            '[role="main"]',
            '.main-content',
            '.content',
            '#content',
            '.post-content',
            '.entry-content',
            '.article-content',
            '.page-content'
        ];
        
        let mainContent = '';
        for (const selector of mainSelectors) {
            const element = container.querySelector(selector);
            if (element && element.innerText.trim().length > 100) {
                mainContent = element.innerText || element.textContent;
                break;
            }
        }
        
        // Fallback to body if no main content found
        if (!mainContent || mainContent.length < 100) {
            mainContent = container.innerText || container.textContent;
        }
        
        // Clean and chunk the content
        return cleanAndChunkContent(mainContent);
    }

    function extractMetadata() {
        const metadata = {};
        
        // Meta tags
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(tag => {
            const name = tag.getAttribute('name') || tag.getAttribute('property');
            const content = tag.getAttribute('content');
            if (name && content) {
                metadata[name] = content;
            }
        });
        
        // Headings for structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        metadata.headings = Array.from(headings).map(h => ({
            level: parseInt(h.tagName.charAt(1)),
            text: h.innerText.trim()
        }));
        
        // Links for context
        const links = document.querySelectorAll('a[href]');
        metadata.links = Array.from(links).slice(0, 10).map(a => ({
            text: a.innerText.trim(),
            href: a.href
        }));
        
        return metadata;
    }

    function extractPageStructure(container) {
        return {
            headings: Array.from(container.querySelectorAll('h1, h2, h3')).map(h => ({
                level: parseInt(h.tagName.charAt(1)),
                text: h.innerText.trim()
            })),
            paragraphs: Array.from(container.querySelectorAll('p')).map(p => p.innerText.trim()).filter(text => text.length > 50),
            lists: Array.from(container.querySelectorAll('ul, ol')).map(list => 
                Array.from(list.querySelectorAll('li')).map(li => li.innerText.trim())
            )
        };
    }

    function cleanAndChunkContent(content) {
        // Clean up the content
        let cleaned = content
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
        
        // Split into chunks for better processing
        const chunks = [];
        const sentences = cleaned.split(/[.!?]+/);
        let currentChunk = '';
        
        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > 500) {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            } else {
                currentChunk += (currentChunk ? '. ' : '') + sentence;
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return {
            full: cleaned,
            chunks: chunks.filter(chunk => chunk.length > 20)
        };
    }

    function generateContentHash(content) {
        // Simple hash function for content (excluding ads and dynamic content)
        const cleanContent = content.full || content;
        let hash = 0;
        for (let i = 0; i < cleanContent.length; i++) {
            const char = cleanContent.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    function extractYouTubeVideoData() {
        try {
            const videoData = {
                videoId: new URLSearchParams(window.location.search).get('v'),
                title: '',
                channel: { name: '' },
                duration: '',
                views: '',
                likes: '',
                publishedDate: '',
                description: '',
                tags: []
            };
            
            // Try to get video title
            const titleSelectors = [
                'h1.title',
                'h1[class*="title"]',
                '.ytd-video-primary-info-renderer h1',
                'h1.ytd-video-primary-info-renderer'
            ];
            
            for (const selector of titleSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    videoData.title = element.textContent.trim();
                    break;
                }
            }
            
            // Try to get channel name
            const channelSelectors = [
                '#channel-name a',
                '.ytd-channel-name a',
                '[class*="channel-name"] a',
                '.ytd-video-owner-renderer a'
            ];
            
            for (const selector of channelSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    videoData.channel.name = element.textContent.trim();
                    break;
                }
            }
            
            // Try to get duration
            const durationSelectors = [
                '.ytp-time-duration',
                '[class*="duration"]',
                '.ytd-thumbnail-overlay-time-status-renderer'
            ];
            
            for (const selector of durationSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    videoData.duration = element.textContent.trim();
                    break;
                }
            }
            
            // Try to get views
            const viewsSelectors = [
                '#count .view-count',
                '.view-count',
                '[class*="view-count"]'
            ];
            
            for (const selector of viewsSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    videoData.views = element.textContent.trim();
                    break;
                }
            }
            
            // Try to get description
            const descriptionSelectors = [
                '#description',
                '.ytd-video-secondary-info-renderer #description',
                '.ytd-expander #content'
            ];
            
            for (const selector of descriptionSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    videoData.description = element.textContent.trim().substring(0, 1000);
                    break;
                }
            }
            
            console.log('📺 YouTube video data extracted:', videoData);
            return videoData;
        } catch (error) {
            console.error('Error extracting YouTube video data:', error);
            return null;
        }
    }

})(); 