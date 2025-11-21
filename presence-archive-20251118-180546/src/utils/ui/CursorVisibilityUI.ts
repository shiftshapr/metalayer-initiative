/**
 * Cursor Visibility UI Handler
 * Connects UI controls to CursorVisibilityModule
 */

interface CursorVisibilityModule {
  initialize: () => Promise<void>;
  getIsLive: () => boolean;
  goLive: () => Promise<void>;
  stopLive: () => Promise<void>;
  parkCursor: () => Promise<void>;
  unparkCursor: () => Promise<void>;
}

const getGlobalWindow = () =>
  window as typeof window & {
    cursorVisibilityModule?: CursorVisibilityModule;
  };

async function initializeCursorVisibilityUI(): Promise<void> {
  const liveButton = document.getElementById('cursor-live-button') as HTMLButtonElement | null;
  const liveIndicator = document.getElementById('cursor-live-indicator') as HTMLElement | null;
  const parkButton = document.getElementById('cursor-park-button') as HTMLButtonElement | null;
  const unparkButton = document.getElementById('cursor-unpark-button') as HTMLButtonElement | null;
  const parkControls = document.getElementById('cursor-park-controls') as HTMLElement | null;

  if (!liveButton || !liveIndicator) {
    console.warn('Cursor visibility UI elements not found');
    return;
  }

  // Wait for cursorVisibilityModule to be available
  let cursorModule: CursorVisibilityModule | undefined = getGlobalWindow().cursorVisibilityModule;
  if (!cursorModule) {
    // Try importing it
    try {
      const module = await import('../../features/CursorVisibilityModule.js');
      cursorModule = (module as { cursorVisibilityModule?: CursorVisibilityModule }).cursorVisibilityModule || getGlobalWindow().cursorVisibilityModule;
    } catch (error) {
      console.error('Failed to load CursorVisibilityModule:', error);
      return;
    }
  }

  if (!cursorModule) {
    console.warn('CursorVisibilityModule not available');
    return;
  }

  // Initialize the module
  await cursorModule.initialize();

  // Go Live / Stop Live button
  liveButton.addEventListener('click', async () => {
    const isLive = cursorModule!.getIsLive();

    if (isLive) {
      await cursorModule!.stopLive();
      liveButton.textContent = 'Go Live';
      liveButton.style.background = '#4CAF50';
      liveIndicator.textContent = '⚪ Offline';
      liveIndicator.setAttribute('data-live', 'false');
      if (parkControls) parkControls.style.display = 'none';
    } else {
      await cursorModule!.goLive();
      liveButton.textContent = 'Stop Live';
      liveButton.style.background = '#f44336';
      liveIndicator.textContent = '🔴 LIVE';
      liveIndicator.setAttribute('data-live', 'true');
      if (parkControls) parkControls.style.display = 'block';
    }
  });

  // Park Cursor button
  if (parkButton) {
    parkButton.addEventListener('click', async () => {
      await cursorModule!.parkCursor();
    });
  }

  // Unpark Cursor button
  if (unparkButton) {
    unparkButton.addEventListener('click', async () => {
      await cursorModule!.unparkCursor();
    });
  }

  // Listen for live status changes from module
  // Update UI when status changes externally
  const originalGoLive = cursorModule.goLive.bind(cursorModule);
  cursorModule.goLive = async function () {
    await originalGoLive();
    liveButton.textContent = 'Stop Live';
    liveButton.style.background = '#f44336';
    liveIndicator.textContent = '🔴 LIVE';
    liveIndicator.setAttribute('data-live', 'true');
    if (parkControls) parkControls.style.display = 'block';
  };

  const originalStopLive = cursorModule.stopLive.bind(cursorModule);
  cursorModule.stopLive = async function () {
    await originalStopLive();
    liveButton.textContent = 'Go Live';
    liveButton.style.background = '#4CAF50';
    liveIndicator.textContent = '⚪ Offline';
    liveIndicator.setAttribute('data-live', 'false');
    if (parkControls) parkControls.style.display = 'none';
  };

  console.log('✅ Cursor visibility UI initialized');
}

// Wait for DOM and module to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Also wait a bit for modules to load
    setTimeout(initializeCursorVisibilityUI, 500);
  });
} else {
  setTimeout(initializeCursorVisibilityUI, 500);
}

export { initializeCursorVisibilityUI };




