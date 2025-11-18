/**
 * Content Anchor Manager
 * Handles content selection, validation, and anchoring for messages
 */

import { 
  ContentAnchor, 
  AnchorContentType, 
  TextSelectionValidation,
  ContentSelectionEvent 
} from '../types/anchors';

/**
 * Manages content selection and anchoring
 */
export class ContentAnchorManager {
  /**
   * Validates text selection to ensure it's a full sentence
   * Expands selection to include complete sentences if needed
   */
  static validateTextSelection(selection: Selection): TextSelectionValidation {
    const selectedText = selection.toString().trim();
    
    if (!selectedText) {
      return {
        valid: false,
        selectedText: '',
        error: 'No text selected'
      };
    }

    // Get the range
    if (selection.rangeCount === 0) {
      return {
        valid: false,
        selectedText,
        error: 'Invalid selection range'
      };
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Get the full text of the container element
    let containerElement: HTMLElement | null = null;
    if (container.nodeType === Node.TEXT_NODE) {
      containerElement = container.parentElement;
    } else if (container.nodeType === Node.ELEMENT_NODE) {
      containerElement = container as HTMLElement;
    }

    if (!containerElement) {
      return {
        valid: false,
        selectedText,
        error: 'Could not determine container element'
      };
    }

    const fullText = containerElement.textContent || '';
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    // Find sentence boundaries
    const sentenceRegex = /[.!?]+[\s\n]*/g;
    const sentences: Array<{ start: number; end: number; text: string }> = [];
    
    let match;
    let lastIndex = 0;
    
    while ((match = sentenceRegex.exec(fullText)) !== null) {
      const sentenceEnd = match.index + match[0].length;
      if (sentenceEnd > startOffset) {
        // Find the start of this sentence
        let sentenceStart = lastIndex;
        
        // Look backwards for the start of the sentence
        for (let i = match.index; i >= 0; i--) {
          const char = fullText[i];
          if (i === 0 || /[.!?]\s*$/.test(fullText.substring(Math.max(0, i - 10), i + 1))) {
            sentenceStart = i === 0 ? 0 : i + 1;
            break;
          }
        }
        
        sentences.push({
          start: sentenceStart,
          end: sentenceEnd,
          text: fullText.substring(sentenceStart, sentenceEnd).trim()
        });
        
        lastIndex = sentenceEnd;
        
        // If we've covered the selection, stop
        if (sentenceEnd >= endOffset) {
          break;
        }
      }
    }

    // If no sentences found, try to expand to nearest sentence boundaries
    if (sentences.length === 0) {
      // Find the sentence containing the selection
      const beforeText = fullText.substring(0, startOffset);
      const afterText = fullText.substring(endOffset);
      
      // Find last sentence boundary before selection
      const beforeMatch = beforeText.match(/[.!?]+[\s\n]*$/);
      const sentenceStart = beforeMatch 
        ? beforeMatch.index! + beforeMatch[0].length 
        : 0;
      
      // Find first sentence boundary after selection
      const afterMatch = afterText.match(/^[\s\n]*|[.!?]+[\s\n]*/);
      const sentenceEnd = afterMatch 
        ? endOffset + afterMatch.index! + afterMatch[0].length 
        : fullText.length;

      const expandedText = fullText.substring(sentenceStart, sentenceEnd).trim();
      
      return {
        valid: true,
        selectedText,
        expandedText,
        range: {
          start: sentenceStart,
          end: sentenceEnd
        }
      };
    }

    // Combine all sentences that overlap with the selection
    const relevantSentences = sentences.filter(s => 
      (s.start <= endOffset && s.end >= startOffset)
    );

    if (relevantSentences.length === 0) {
      return {
        valid: false,
        selectedText,
        error: 'Could not determine sentence boundaries'
      };
    }

    const firstSentence = relevantSentences[0];
    const lastSentence = relevantSentences[relevantSentences.length - 1];
    
    const expandedText = fullText.substring(
      firstSentence.start,
      lastSentence.end
    ).trim();

    // Extract context phrases (before and after)
    // Look for phrase before (up to 50 chars or to previous sentence boundary)
    let contextBefore: string | null = null;
    if (firstSentence.start > 0) {
      const beforeStart = Math.max(0, firstSentence.start - 50);
      const beforeText = fullText.substring(beforeStart, firstSentence.start).trim();
      if (beforeText) {
        // Find last sentence boundary in before text
        const beforeMatch = beforeText.match(/[.!?]+[\s\n]*[^\s]*$/);
        if (beforeMatch) {
          contextBefore = beforeText.substring(beforeMatch.index! + beforeMatch[0].length).trim();
        } else {
          contextBefore = beforeText;
        }
        // Limit to 50 chars
        if (contextBefore.length > 50) {
          contextBefore = '...' + contextBefore.substring(contextBefore.length - 47);
        }
      }
    }

    // Look for phrase after (up to 50 chars or to next sentence boundary)
    let contextAfter: string | null = null;
    if (lastSentence.end < fullText.length) {
      const afterEnd = Math.min(fullText.length, lastSentence.end + 50);
      const afterText = fullText.substring(lastSentence.end, afterEnd).trim();
      if (afterText) {
        // Find first sentence boundary in after text
        const afterMatch = afterText.match(/^[^\s]*[.!?]+[\s\n]*/);
        if (afterMatch) {
          contextAfter = afterText.substring(0, afterMatch.index! + afterMatch[0].length).trim();
        } else {
          contextAfter = afterText;
        }
        // Limit to 50 chars
        if (contextAfter.length > 50) {
          contextAfter = contextAfter.substring(0, 47) + '...';
        }
      }
    }

    return {
      valid: true,
      selectedText,
      expandedText,
      contextBefore,
      contextAfter,
      range: {
        start: firstSentence.start,
        end: lastSentence.end
      }
    };
  }

  /**
   * Creates a content anchor from a text selection
   */
  static createTextAnchor(
    selection: Selection,
    sourceUrl: string
  ): ContentAnchor | null {
    const validation = this.validateTextSelection(selection);
    
    if (!validation.valid || !validation.expandedText) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    let containerElement: HTMLElement | null = null;
    
    if (container.nodeType === Node.TEXT_NODE) {
      containerElement = container.parentElement;
    } else if (container.nodeType === Node.ELEMENT_NODE) {
      containerElement = container as HTMLElement;
    }

    if (!containerElement) {
      return null;
    }

    // Generate selector for the element
    const selector = this.generateSelector(containerElement);
    const xpath = this.generateXPath(containerElement);

    return {
      type: 'text',
      content: validation.expandedText,
      sourceUrl,
      selector,
      xpath,
      textContext: {
        contextBefore: validation.contextBefore ?? null,
        selectedText: validation.expandedText,
        contextAfter: validation.contextAfter ?? null
      },
      textRange: validation.range,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Creates a content anchor from an image element
   * @param image - The image element
   * @param sourceUrl - Source URL of the page
   * @param coordinateRange - Optional coordinate range for region selection
   *   - start (optional): top-left corner
   *   - end (optional, but only valid if start is provided): bottom-right corner (creates rectangle)
   */
  static createImageAnchor(
    image: HTMLImageElement,
    sourceUrl: string,
    coordinateRange?: {
      start?: { x: number; y: number };
      end?: { x: number; y: number };
      coordinateSystem?: 'percentage' | 'pixels';
    }
  ): ContentAnchor {
    const altText = image.alt || image.title || image.src.split('/').pop() || 'Selected image';
    const selector = this.generateSelector(image);
    const xpath = this.generateXPath(image);

    return {
      type: 'image',
      content: altText,
      sourceUrl,
      selector,
      xpath,
      mediaUrl: image.src,
      altText,
      coordinateRange: coordinateRange ? {
        start: coordinateRange.start,
        end: coordinateRange.end,
        coordinateSystem: coordinateRange.coordinateSystem || 'percentage'
      } : undefined,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Creates a content anchor from a video element
   * @param video - The video element
   * @param sourceUrl - Source URL of the page
   * @param timestampRange - Optional timestamp range
   *   - start (optional): timestamp in seconds
   *   - end (optional, but only valid if start is provided): end timestamp (creates range)
   * @param coordinateRange - Optional coordinate range for region selection (for frame anchoring)
   *   - start (optional): top-left corner
   *   - end (optional, but only valid if start is provided): bottom-right corner (creates rectangle)
   */
  static createVideoAnchor(
    video: HTMLVideoElement,
    sourceUrl: string,
    timestampRange?: {
      start?: number;
      end?: number;
    },
    coordinateRange?: {
      start?: { x: number; y: number };
      end?: { x: number; y: number };
      coordinateSystem?: 'percentage' | 'pixels';
    }
  ): ContentAnchor {
    const altText = video.title || video.getAttribute('aria-label') || 'Selected video';
    const selector = this.generateSelector(video);
    const xpath = this.generateXPath(video);
    const mediaUrl = video.src || video.currentSrc || '';

    return {
      type: 'video',
      content: altText,
      sourceUrl,
      selector,
      xpath,
      mediaUrl,
      altText,
      timestampRange: timestampRange ? {
        start: timestampRange.start,
        end: timestampRange.end
      } : undefined,
      coordinateRange: coordinateRange ? {
        start: coordinateRange.start,
        end: coordinateRange.end,
        coordinateSystem: coordinateRange.coordinateSystem || 'percentage'
      } : undefined,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Creates a content anchor from an audio element
   * @param audio - The audio element
   * @param sourceUrl - Source URL of the page
   * @param timestampRange - Optional timestamp range
   *   - start (optional): timestamp in seconds
   *   - end (optional, but only valid if start is provided): end timestamp (creates range)
   */
  static createAudioAnchor(
    audio: HTMLAudioElement,
    sourceUrl: string,
    timestampRange?: {
      start?: number;
      end?: number;
    }
  ): ContentAnchor {
    const altText = audio.title || audio.getAttribute('aria-label') || 'Selected audio';
    const selector = this.generateSelector(audio);
    const xpath = this.generateXPath(audio);
    const mediaUrl = audio.src || audio.currentSrc || '';

    return {
      type: 'audio',
      content: altText,
      sourceUrl,
      selector,
      xpath,
      mediaUrl,
      altText,
      timestampRange: timestampRange ? {
        start: timestampRange.start,
        end: timestampRange.end
      } : undefined,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generates a CSS selector for an element
   */
  private static generateSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }

    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.className) {
        const classes = current.className.trim().split(/\s+/).filter(Boolean);
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }

      // Add nth-child if needed for uniqueness
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current);
        if (siblings.filter(s => s.tagName === current!.tagName).length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  /**
   * Generates an XPath for an element
   */
  private static generateXPath(element: HTMLElement): string {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = current.previousElementSibling;

      while (sibling) {
        if (sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }

      const tagName = current.nodeName.toLowerCase();
      const xpathIndex = index > 1 ? `[${index}]` : '';
      parts.unshift(`${tagName}${xpathIndex}`);

      current = current.parentElement;
    }

    return '/' + parts.join('/');
  }

  /**
   * Serializes a content anchor to a string (for storage in optionalContent field)
   */
  static serializeAnchor(anchor: ContentAnchor): string {
    return JSON.stringify(anchor);
  }

  /**
   * Deserializes a content anchor from a string
   */
  static deserializeAnchor(serialized: string): ContentAnchor | null {
    try {
      return JSON.parse(serialized) as ContentAnchor;
    } catch {
      return null;
    }
  }
}

