// content.js - Injects and manages the trigger button

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
    triggerButton.title = 'Toggle Collaborative Sidebar (Drag to move)';

    // Load saved position from storage
    chrome.storage.local.get(['iconPosition'], (result) => {
        if (result.iconPosition) {
            triggerButton.style.left = result.iconPosition.x + 'px';
            triggerButton.style.top = result.iconPosition.y + 'px';
        } else {
            // Default position (bottom-right)
            triggerButton.style.left = 'calc(100vw - 60px)';
            triggerButton.style.top = 'calc(100vh - 60px)';
        }
    });

    // Dragging variables
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    // Mouse down event - start dragging
    triggerButton.addEventListener('mousedown', (e) => {
        // Only start dragging if it's not a click (prevent accidental drags)
        if (e.button === 0) { // Left mouse button
            isDragging = true;
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
            
            // Save position to storage
            const rect = triggerButton.getBoundingClientRect();
            chrome.storage.local.set({
                iconPosition: {
                    x: rect.left,
                    y: rect.top
                }
            });
        }
    });

    // Click event - toggle sidebar (only if not dragging)
    triggerButton.addEventListener('click', (e) => {
        // Only trigger if we're not in the middle of a drag
        if (!isDragging) {
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

    // Append the button to the body
    document.body.appendChild(triggerButton);

    console.log("Trigger button added to page.");

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