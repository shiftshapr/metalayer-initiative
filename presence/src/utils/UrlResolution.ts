/**
 * URL Resolution Utilities
 * Handles URL normalization and page ID generation
 */

export interface UrlResult {
  pageId: string;
  source: string;
  normalizedUrl?: string;
}

/**
 * Resolve URL to page ID for message loading
 */
export async function resolveMessageUrl(url?: string | null): Promise<UrlResult> {
  if (!url) {
    // Try to get current URL from state or active tab
    try {
      const win = window as Window & {
        stateManagerInstance?: {
          getState?: (key: string) => unknown;
        };
      };

      const stateManager = win.stateManagerInstance;
      if (stateManager?.getState) {
        const currentUrlData = stateManager.getState('currentUrlData') as {
          pageId?: string;
          rawUrl?: string;
        } | null;

        if (currentUrlData?.pageId) {
          return {
            pageId: currentUrlData.pageId,
            source: 'state'
          };
        }
      }
    } catch (error) {
      console.warn('Failed to get URL from state:', error);
    }

    // Fallback: generate from window.location
    const currentUrl = window.location.href;
    const pageId = currentUrl.replace(/[^a-zA-Z0-9]/g, '_');

    return {
      pageId,
      source: 'window',
      normalizedUrl: currentUrl
    };
  }

  // URL provided - normalize it
  const pageId = url.replace(/[^a-zA-Z0-9]/g, '_');

  return {
    pageId,
    source: 'provided',
    normalizedUrl: url
  };
}

/**
 * Get current page ID for message loading
 */
export async function getMessagePageId(url?: string | null): Promise<string | null> {
  try {
    const result = await resolveMessageUrl(url);
    return result.pageId;
  } catch (error) {
    console.error('Failed to get message page ID:', error);
    return null;
  }
}
