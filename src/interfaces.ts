/**
 * Configuration options for BadWordFilter
 */
export interface BadWordFilterOptions {
  /** Character to use for masking bad words (default: '*') */
  replaceChar?: string;
  /** Whether matching should be case sensitive (default: false) */
  caseSensitive?: boolean;
  /** Custom list of bad words to use instead of default list */
  customBadWords?: string[];
  /** Additional bad words to add to the default list */
  additionalBadWords?: string[];
  /** URL to load bad words from (browser only) */
  badWordsUrl?: string;
}

/**
 * Result of bad word detection
 */
export interface BadWordDetectionResult {
  /** Whether bad words were found */
  hasBadWords: boolean;
  /** List of bad words found in the text */
  wordsFound: string[];
  /** Original text with bad words masked */
  filteredText: string;
}

/**
 * Interface for bad word filter implementations
 */
export interface IBadWordFilter {
  /**
   * Check if text contains bad words
   * @param text Text to check
   * @returns True if bad words are found
   */
  hasBadWord(text: string): boolean;

  /**
   * Filter bad words from text
   * @param text Text to filter
   * @param mask Character to use for masking (optional, uses configured replaceChar)
   * @returns Text with bad words masked
   */
  filter(text: string, mask?: string): string;

  /**
   * Get list of bad words found in text
   * @param text Text to analyze
   * @returns Array of bad words found
   */
  getBadWordsFound(text: string): string[];

  /**
   * Load bad words from source (async operation)
   * @returns Promise that resolves when bad words are loaded
   */
  loadBadWords(): Promise<void>;

  /**
   * Get detailed analysis of text
   * @param text Text to analyze
   * @returns Detailed result object
   */
  analyze(text: string): BadWordDetectionResult;
}