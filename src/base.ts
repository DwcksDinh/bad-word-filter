import { IBadWordFilter, BadWordFilterOptions, BadWordDetectionResult } from './interfaces';

/**
 * Abstract base class for bad word filter implementations
 */
export abstract class BaseBadWordFilter implements IBadWordFilter {
  protected badWords: Set<string> = new Set();
  protected regex: RegExp | null = null;
  protected options: Required<BadWordFilterOptions>;

  constructor(options: BadWordFilterOptions = {}) {
    this.options = {
      replaceChar: options.replaceChar || '*',
      caseSensitive: options.caseSensitive || false,
      customBadWords: options.customBadWords || [],
      additionalBadWords: options.additionalBadWords || [],
      badWordsUrl: options.badWordsUrl || '',
    };
  }

  /**
   * Abstract method to load bad words - implementation specific
   */
  abstract loadBadWords(): Promise<void>;

  /**
   * Set bad words and rebuild regex
   * @param words Array of bad words
   */
  protected setBadWords(words: string[]): void {
    const allWords = [
      ...words,
      ...this.options.additionalBadWords
    ];
    
    // Normalize words based on case sensitivity
    const normalizedWords = this.options.caseSensitive 
      ? allWords
      : allWords.map(word => word.toLowerCase());
    
    // Sort by length (longest first) to prioritize longer phrases
    normalizedWords.sort((a, b) => b.length - a.length);
    
    this.badWords = new Set(normalizedWords);
    this.regex = null; // Reset regex to force rebuild
  }

  /**
   * Escape special regex characters
   * @param text Text to escape
   * @returns Escaped text
   */
  protected escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Normalize text for matching
   * @param text Text to normalize
   * @returns Normalized text
   */
  protected normalizeText(text: string): string {
    let normalized = text;
    
    if (!this.options.caseSensitive) {
      normalized = normalized.toLowerCase();
    }
    
    // Normalize Unicode
    normalized = normalized.normalize('NFKD');
    
    return normalized;
  }

  /**
   * Build regex for matching bad words
   * @returns Compiled regex
   */
  protected buildRegex(): RegExp {
    if (!this.regex && this.badWords.size > 0) {
      // Create word boundary regex for each bad word
      const escapedWords = Array.from(this.badWords).map((word) => {
        const escapedWord = this.escapeRegex(word);
        // Use Unicode-aware word boundaries
        return `(?<!\\w)${escapedWord}(?!\\w)`;
      });
      
      const flags = this.options.caseSensitive ? 'gu' : 'giu';
      this.regex = new RegExp(`(${escapedWords.join('|')})`, flags);
    }
    
    return this.regex || new RegExp('(?!)', 'g'); // Return non-matching regex if no words
  }

  /**
   * Check if text contains bad words
   * @param text Text to check
   * @returns True if bad words are found
   */
  public hasBadWord(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    const normalizedText = this.normalizeText(text);
    const regex = this.buildRegex();
    
    return regex.test(text) || regex.test(normalizedText);
  }

  /**
   * Filter bad words from text
   * @param text Text to filter
   * @param mask Character to use for masking (optional)
   * @returns Text with bad words masked
   */
  public filter(text: string, mask?: string): string {
    if (!text || typeof text !== 'string') return text;
    
    const maskChar = mask || this.options.replaceChar;
    const regex = this.buildRegex();
    
    return text.replace(regex, (match) => maskChar.repeat(match.length));
  }

  /**
   * Get list of bad words found in text
   * @param text Text to analyze
   * @returns Array of bad words found
   */
  public getBadWordsFound(text: string): string[] {
    if (!text || typeof text !== 'string') return [];
    
    const regex = this.buildRegex();
    const matches = text.match(regex) || [];
    
    // Remove duplicates and return
    return [...new Set(matches)];
  }

  /**
   * Get detailed analysis of text
   * @param text Text to analyze
   * @returns Detailed result object
   */
  public analyze(text: string): BadWordDetectionResult {
    const wordsFound = this.getBadWordsFound(text);
    const hasBadWords = wordsFound.length > 0;
    const filteredText = this.filter(text);
    
    return {
      hasBadWords,
      wordsFound,
      filteredText
    };
  }
}