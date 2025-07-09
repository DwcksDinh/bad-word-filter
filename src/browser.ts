import { BaseBadWordFilter } from './base';
import { BadWordFilterOptions } from './interfaces';
import { DEFAULT_BAD_WORDS } from './browser-words';

/**
 * Browser implementation of BadWordFilter
 * Uses inlined bad words data or loads from URL
 */
export class BrowserBadWordFilter extends BaseBadWordFilter {
  private isLoaded: boolean = false;

  constructor(options: BadWordFilterOptions = {}) {
    super(options);
    
    // If custom bad words are provided, use them directly
    if (options.customBadWords && options.customBadWords.length > 0) {
      this.setBadWords(options.customBadWords);
      this.isLoaded = true;
    }
  }

  /**
   * Load bad words from default list or URL
   * @returns Promise that resolves when words are loaded
   */
  public async loadBadWords(): Promise<void> {
    if (this.isLoaded && this.options.customBadWords.length > 0) {
      return; // Already loaded with custom words
    }

    try {
      if (this.options.badWordsUrl) {
        // Load from URL
        await this.loadFromUrl(this.options.badWordsUrl);
      } else {
        // Use default inlined words
        this.setBadWords(DEFAULT_BAD_WORDS);
      }
      this.isLoaded = true;
    } catch (error) {
      console.warn(`Could not load bad words: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to custom words or default list
      if (this.options.customBadWords.length > 0) {
        this.setBadWords(this.options.customBadWords);
      } else {
        this.setBadWords(DEFAULT_BAD_WORDS);
      }
      this.isLoaded = true;
    }
  }

  /**
   * Load bad words from URL
   * @param url URL to load words from
   */
  private async loadFromUrl(url: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch bad words from ${url}: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    const words = content
      .split('\n')
      .map((word: string) => word.trim())
      .filter((word: string) => word.length > 0);
    
    this.setBadWords(words);
  }

  /**
   * Static factory method for backward compatibility
   * @param badWordsOrUrl Array of bad words or URL to load from
   * @param options Filter options
   * @returns Promise resolving to filter instance
   */
  public static async create(
    badWordsOrUrl?: string[] | string,
    options: BadWordFilterOptions = {}
  ): Promise<BrowserBadWordFilter> {
    let filter: BrowserBadWordFilter;
    
    if (Array.isArray(badWordsOrUrl)) {
      // Custom bad words provided
      filter = new BrowserBadWordFilter({
        ...options,
        customBadWords: badWordsOrUrl
      });
    } else if (typeof badWordsOrUrl === 'string') {
      // URL provided
      filter = new BrowserBadWordFilter({
        ...options,
        badWordsUrl: badWordsOrUrl
      });
    } else {
      // Use default
      filter = new BrowserBadWordFilter(options);
    }
    
    await filter.loadBadWords();
    return filter;
  }
}