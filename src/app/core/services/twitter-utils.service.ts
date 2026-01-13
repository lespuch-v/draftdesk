import { Injectable } from '@angular/core';
import { TWITTER_CONSTANTS } from '../constants/twitter.constants';

@Injectable({
  providedIn: 'root',
})
export class TwitterUtilsService {
  readonly MAX_TWEET_LENGTH = TWITTER_CONSTANTS.MAX_TWEET_LENGTH;

  countCharacters(text: string): number {
    if (!text) return 0;

    // Replace URLs with placeholder of Twitter's shortened URL length
    let processedText = text.replace(
      TWITTER_CONSTANTS.URL_PATTERN,
      'x'.repeat(TWITTER_CONSTANTS.URL_LENGTH)
    );

    return processedText.length;
  }

  isOverLimit(text: string): boolean {
    return this.countCharacters(text) > this.MAX_TWEET_LENGTH;
  }

  getRemainingCharacters(text: string): number {
    return this.MAX_TWEET_LENGTH - this.countCharacters(text);
  }

  getCharacterPercentage(text: string): number {
    const count = this.countCharacters(text);
    return Math.min((count / this.MAX_TWEET_LENGTH) * 100, 100);
  }

  splitIntoThread(text: string, maxLength: number = this.MAX_TWEET_LENGTH): string[] {
    if (!text || this.countCharacters(text) <= maxLength) {
      return text ? [text] : [];
    }

    const parts: string[] = [];
    const words = text.split(/\s+/);
    let currentPart = '';

    for (const word of words) {
      const testPart = currentPart ? `${currentPart} ${word}` : word;

      // Reserve space for thread indicator (e.g., "1/5 ")
      const reservedSpace = 5;

      if (this.countCharacters(testPart) <= maxLength - reservedSpace) {
        currentPart = testPart;
      } else {
        if (currentPart) {
          parts.push(currentPart);
        }
        currentPart = word;
      }
    }

    if (currentPart) {
      parts.push(currentPart);
    }

    // Add thread numbering
    const totalParts = parts.length;
    return parts.map((part, index) => `${index + 1}/${totalParts} ${part}`);
  }

  extractHashtags(text: string): string[] {
    if (!text) return [];
    const matches = text.match(TWITTER_CONSTANTS.HASHTAG_PATTERN);
    return matches ? [...new Set(matches)] : [];
  }

  extractMentions(text: string): string[] {
    if (!text) return [];
    const mentionPattern = /@\w+/g;
    const matches = text.match(mentionPattern);
    return matches ? [...new Set(matches)] : [];
  }

  startsWithMention(text: string): boolean {
    if (!text) return false;
    return TWITTER_CONSTANTS.MENTION_PATTERN.test(text.trim());
  }
}
