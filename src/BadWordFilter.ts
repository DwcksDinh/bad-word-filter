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
          : path.resolve(__dirname, 'bad-words.txt');
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

    // Chuẩn hóa từ xấu: chuyển về chữ thường
    badWords = badWords.map((word) => word.toLowerCase());
    // Sắp xếp từ dài đến ngắn để ưu tiên cụm từ
    badWords.sort((a, b) => b.length - a.length);
    return new BadWordFilter(badWords);
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private normalizeText(text: string): string {
    // Chuyển về chữ thường và chuẩn hóa Unicode
    let normalized = text.toLowerCase().normalize('NFKD');
    // Loại bỏ dấu câu và ký tự đặc biệt, giữ lại chữ cái, số và ký tự tiếng Việt
    normalized = normalized.replace(/[^a-z0-9\s\u00C0-\u1EF9]/g, '');
    // Loại bỏ khoảng trắng thừa
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
  }

  private buildRegex(): RegExp {
    if (!this.regex) {
      // Tạo regex cho từng từ, cho phép ký tự đặc biệt xen kẽ
      const escapedWords = Array.from(this.badWords).map((word) => {
        // Thêm \S* giữa các ký tự để khớp các biến thể như f***k
        const chars = word.split('');
        return chars.map((c) => this.escapeRegex(c) + '\\S*').join('');
      });
      this.regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    }
    return this.regex;
  }

  public hasBadWord(comment: string): boolean {
    if (!comment || typeof comment !== 'string') return false;
    const normalizedComment = this.normalizeText(comment);
    return this.buildRegex().test(comment) || this.buildRegex().test(normalizedComment);
  }

  public filter(comment: string, mask: string = '*'): string {
    if (!comment || typeof comment !== 'string') return comment;
    return comment.replace(this.buildRegex(), (match) => mask.repeat(match.length));
  }
}