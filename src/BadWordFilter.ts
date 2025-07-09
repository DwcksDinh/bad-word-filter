import * as fs from 'fs/promises';
import * as path from 'path';
import { NodeBadWordFilter } from './node';
import { BadWordFilterOptions } from './interfaces';

/**
 * Backward compatibility wrapper for the original BadWordFilter class
 * @deprecated Use NodeBadWordFilter or BrowserBadWordFilter directly
 */
export class BadWordFilter {
  private nodeFilter: NodeBadWordFilter;

  private constructor(nodeFilter: NodeBadWordFilter) {
    this.nodeFilter = nodeFilter;
  }

  public static async create(
    badWordsOrFilePath?: string[] | string
  ): Promise<BadWordFilter> {
    const filter = await NodeBadWordFilter.create(badWordsOrFilePath);
    return new BadWordFilter(filter);
  }

  public hasBadWord(comment: string): boolean {
    return this.nodeFilter.hasBadWord(comment);
  }

  public filter(comment: string, mask: string = '*'): string {
    return this.nodeFilter.filter(comment, mask);
  }
}