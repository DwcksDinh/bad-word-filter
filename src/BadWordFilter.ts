import * as fs from 'fs/promises';
import * as path from 'path';

export class BadWordFilter {
  private badWords: Set<string>;
  private regex: RegExp | null = null;

  private constructor(badWords: string[]) {
    this.badWords = new Set(badWords);
  }

  public static async create(
    badWordsOrFilePath?: string[] | string
  ): Promise<BadWordFilter> {
    let badWords: string[] = [];

    if (Array.isArray(badWordsOrFilePath)) {
      badWords = badWordsOrFilePath;
    } else {
      const filePath =
        typeof badWordsOrFilePath === 'string'
          ? badWordsOrFilePath
          : path.resolve(process.cwd(), 'bad-words.txt');

      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        badWords = fileContent
          .split('\n')
          .map((word) => word.trim())
          .filter((word) => word.length > 0);
      } catch (error) {
        console.warn(`Không đọc được file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        badWords = [];
      }
    }

    return new BadWordFilter(badWords);
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private buildRegex(): RegExp {
    if (!this.regex) {
      const escapedWords = Array.from(this.badWords).map((word) =>
        this.escapeRegex(word)
      );
      this.regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    }
    return this.regex;
  }

  public hasBadWord(comment: string): boolean {
    if (!comment || typeof comment !== 'string') return false;
    return this.buildRegex().test(comment);
  }

  public filter(comment: string, mask: string = '*'): string {
    if (!comment || typeof comment !== 'string') return comment;
    return comment.replace(this.buildRegex(), (match) =>
      mask.repeat(match.length)
    );
  }
}