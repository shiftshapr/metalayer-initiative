// Inject a floating button and sidebar root
(function() {
  if (window.__metalayerSidebarInjected) return;
  window.__metalayerSidebarInjected = true;

  let sidebarRoot, floatingBtn;

  // Create sidebar root
  function createSidebar() {
    sidebarRoot = document.createElement('div');
    sidebarRoot.id = 'metalayer-sidebar-root';
    sidebarRoot.style.position = 'fixed';
    sidebarRoot.style.top = '0';
    sidebarRoot.style.left = '0';
    sidebarRoot.style.height = '100vh';
    sidebarRoot.style.zIndex = '999999';
    sidebarRoot.style.display = 'none';
    sidebarRoot.style.pointerEvents = 'auto';
    document.body.appendChild(sidebarRoot);

    // Inject React app into sidebar root
    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('index.html');
    iframe.style.width = '320px';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.background = 'transparent';
    iframe.style.boxShadow = '2px 0 16px rgba(0,0,0,0.08)';
    iframe.style.pointerEvents = 'auto';
    sidebarRoot.appendChild(iframe);
  }

  // Create floating button
  function createFloatingButton() {
    floatingBtn = document.createElement('button');
    floatingBtn.innerText = '🛡️';
    floatingBtn.title = 'Open Metalayer Sidebar';
    floatingBtn.style.position = 'fixed';
    floatingBtn.style.top = '20px';
    floatingBtn.style.left = '10px';
    floatingBtn.style.zIndex = '1000000';
    floatingBtn.style.width = '48px';
    floatingBtn.style.height = '48px';
    floatingBtn.style.borderRadius = '50%';
    floatingBtn.style.background = '#1e293b';
    floatingBtn.style.color = '#fff';
    floatingBtn.style.fontSize = '2rem';
    floatingBtn.style.border = 'none';
    floatingBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    floatingBtn.style.cursor = 'pointer';
    floatingBtn.style.display = 'flex';
    floatingBtn.style.alignItems = 'center';
    floatingBtn.style.justifyContent = 'center';
    floatingBtn.style.transition = 'background 0.2s';
    floatingBtn.onmouseenter = () => floatingBtn.style.background = '#334155';
    floatingBtn.onmouseleave = () => floatingBtn.style.background = '#1e293b';
    floatingBtn.onclick = toggleSidebar;
    document.body.appendChild(floatingBtn);
  }

  // Toggle sidebar visibility
  function toggleSidebar() {
    if (!sidebarRoot) {
      createSidebar();
    }
    const isVisible = sidebarRoot.style.display === 'block';
    sidebarRoot.style.display = isVisible ? 'none' : 'block';
    
    // Update button appearance
    if (floatingBtn) {
      floatingBtn.style.background = isVisible ? '#1e293b' : '#3b82f6';
      floatingBtn.innerText = isVisible ? '🛡️' : '✕';
    }
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleSidebar') {
      toggleSidebar();
    }
  });

  // Initialize
  createFloatingButton();
})(); 