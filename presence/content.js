// content.js - Injects and manages the trigger button and selection widget

(function() {
    // Avoid running multiple times if script is injected more than once
    if (document.getElementById('collaborative-sidebar-trigger')) {
        return;
    }

    console.log("Content script loaded for Collaborative Sidebar.");

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

})(); 