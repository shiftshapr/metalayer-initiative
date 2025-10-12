// content.js - Injects and manages the trigger button

(function() {
    // Avoid running multiple times if script is injected more than once
    if (document.getElementById('collaborative-sidebar-trigger')) {
        return;
    }

    console.log("Content script loaded for Collaborative Sidebar.");

    // Listen for messages from the sidepanel
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractPageContent') {
            const pageContent = extractPageContent();
            sendResponse({ content: pageContent });
        }
    });

    // Create the trigger button
    const triggerButton = document.createElement('button');
    triggerButton.id = 'collaborative-sidebar-trigger';
    triggerButton.textContent = '🗨️'; // Simple emoji placeholder, replace with icon via CSS
    triggerButton.title = 'Toggle Collaborative Sidebar (Drag to move)';

    // Dragging variables
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let hasMoved = false; // Track if mouse has moved during drag

    // Function to set up event listeners
    function setupEventListeners() {
        // Mouse down event - start dragging
        triggerButton.addEventListener('mousedown', (e) => {
            // Only start dragging if it's not a click (prevent accidental drags)
            if (e.button === 0) { // Left mouse button
                isDragging = true;
                hasMoved = false;
                triggerButton.style.opacity = '0.7';
                triggerButton.style.cursor = 'grabbing';
                
                // Calculate offset from mouse to button corner
                const rect = triggerButton.getBoundingClientRect();
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
                
                e.preventDefault();
            }
        });

        // Mouse move event - handle dragging
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                hasMoved = true;
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                
                // Keep button within viewport bounds
                const buttonSize = 50; // Approximate button size
                const maxX = window.innerWidth - buttonSize;
                const maxY = window.innerHeight - buttonSize;
                
                const constrainedX = Math.max(0, Math.min(newX, maxX));
                const constrainedY = Math.max(0, Math.min(newY, maxY));
                
                triggerButton.style.left = constrainedX + 'px';
                triggerButton.style.top = constrainedY + 'px';
                
            }
        });

        // Mouse up event - stop dragging
        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                triggerButton.style.opacity = '1';
                triggerButton.style.cursor = 'grab';
                
                // Reset hasMoved after a short delay to allow click detection
                setTimeout(() => {
                    hasMoved = false;
                }, 100);
            }
        });

        // Click event - toggle sidebar (only if not dragging)
        triggerButton.addEventListener('click', (e) => {
            // Only trigger if we're not in the middle of a drag and haven't moved
            if (!isDragging && !hasMoved) {
                console.log("Trigger button clicked.");
                // Send a message to the background script to toggle the sidebar
                chrome.runtime.sendMessage({ action: "toggleSidebar" }, (response) => {
                     if (chrome.runtime.lastError) {
                        console.error("Error sending toggle message:", chrome.runtime.lastError);
                    } else {
                        console.log("Toggle message sent, background responded:", response);
                    }
                });
            }
        });
    }

    // Set default position (bottom-right) and append button
    triggerButton.style.left = 'calc(100vw - 60px)';
    triggerButton.style.top = 'calc(100vh - 60px)';
    
    // Set up event listeners
    setupEventListeners();
    
    // Append the button to the body
    document.body.appendChild(triggerButton);

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

    // Enhanced page content extraction function
    function extractPageContent() {
        
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
        };
        
        // Generate content hash (excluding ads and dynamic content)
        pageData.contentHash = generateContentHash(pageData.content);
        
        console.log('🔍 Content script: Final page data:', pageData);
        
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
        return Math.abs(hash).toString(36);
    }


})(); 