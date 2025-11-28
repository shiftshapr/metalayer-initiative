/**
 * PRE-RENDER INITIALIZATION
 * 
 * Initializes user data before showing the interface to prevent flash
 */

// Create and show loading indicator FIRST (before hiding body)
const loadingDiv = document.createElement('div');
loadingDiv.id = 'pre-render-loading';
loadingDiv.innerHTML = `
  <div style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
  ">
    <div style="text-align: center;">
      <div style="
        width: 50px;
        height: 50px;
        border: 5px solid rgba(255, 255, 255, 0.3);
        border-top: 5px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 24px;
      "></div>
      <h2 style="
        color: white;
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 8px 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">Loading Canopi</h2>
      <p style="
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">Initializing your collaborative workspace...</p>
    </div>
  </div>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`;
document.body.appendChild(loadingDiv);

// Hide body initially to prevent flash
document.body.style.display = 'none';

// Initialize pre-render data
(async function() {
  try {
    console.log('🚀 Starting pre-render initialization...');

    // Wait for PreRenderInitializer to be available
    let attempts = 0;
    while (!window.preRenderInitializer && attempts < 100) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
      console.log(`⏳ Waiting for PreRenderInitializer... (${attempts}/100)`);
    }

    if (!window.preRenderInitializer) {
      throw new Error('PreRenderInitializer not available after waiting');
    }

    console.log('✅ PreRenderInitializer found, starting initialization...');
    await window.preRenderInitializer.initialize();
    console.log('✅ Pre-render initialization complete');

    // Log the results
    const data = window.preRenderInitializer.getPreRenderData();
    console.log('📊 Pre-render data:', {
      isInitialized: data.isInitialized,
      hasAuraColor: !!data.auraColor,
      hasAvatarUrl: !!data.avatarUrl,
      auraColor: data.auraColor,
      avatarUrl: data.avatarUrl?.substring(0, 50) + '...'
    });

  } catch (error) {
    console.error('❌ Pre-render initialization failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Remove loading indicator
    const loading = document.getElementById('pre-render-loading');
    if (loading) {
      // Fade out animation
      loading.style.transition = 'opacity 0.3s ease-out';
      loading.style.opacity = '0';
      setTimeout(() => loading.remove(), 300);
    }
    
    // Show body regardless of success/failure
    document.body.style.display = '';
    console.log('👁️ Interface now visible');
  }
})();

