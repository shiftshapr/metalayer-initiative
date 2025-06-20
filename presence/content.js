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