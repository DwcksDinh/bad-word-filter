import * as fs from 'fs/promises';
import * as path from 'path';
import { BaseBadWordFilter } from './base';
import { BadWordFilterOptions } from './interfaces';

/**
 * Node.js implementation of BadWordFilter
 * Reads bad words from file system
 */
export class NodeBadWordFilter extends BaseBadWordFilter {
  private filePath: string;
  private isLoaded: boolean = false;

  constructor(
    filePath?: string,
    options: BadWordFilterOptions = {}
  ) {
    super(options);
    
    // Default to bad-words.txt in the same directory as this file
    this.filePath = filePath || path.resolve(__dirname, 'bad-words.txt');
    
    // If custom bad words are provided, use them directly
    if (options.customBadWords && options.customBadWords.length > 0) {
      this.setBadWords(options.customBadWords);
      this.isLoaded = true;
    }
  }

  /**
   * Load bad words from file
   * @returns Promise that resolves when words are loaded
   */
  public async loadBadWords(): Promise<void> {
    if (this.isLoaded && this.options.customBadWords.length > 0) {
      return; // Already loaded with custom words
    }

    try {
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      const words = fileContent
        .split('\n')
        .map((word: string) => word.trim())
        .filter((word: string) => word.length > 0);
      
      this.setBadWords(words);
      this.isLoaded = true;
    } catch (error) {
      console.warn(`Could not read bad words file ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to custom words if file reading fails
      if (this.options.customBadWords.length > 0) {
        this.setBadWords(this.options.customBadWords);
      } else {
        this.setBadWords([]); // Empty list as fallback
      }
      this.isLoaded = true;
    }
  }

  /**
   * Static factory method for backward compatibility
   * @param badWordsOrFilePath Array of bad words or file path
   * @param options Filter options
   * @returns Promise resolving to filter instance
   */
  public static async create(
    badWordsOrFilePath?: string[] | string,
    options: BadWordFilterOptions = {}
  ): Promise<NodeBadWordFilter> {
    let filter: NodeBadWordFilter;
    
    if (Array.isArray(badWordsOrFilePath)) {
      // Custom bad words provided
      filter = new NodeBadWordFilter(undefined, {
        ...options,
        customBadWords: badWordsOrFilePath
      });
    } else {
      // File path provided or use default
      filter = new NodeBadWordFilter(badWordsOrFilePath, options);
    }
    
    await filter.loadBadWords();
    return filter;
  }
}