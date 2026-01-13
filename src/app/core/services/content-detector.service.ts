import { Injectable } from '@angular/core';
import { ContentAnalysis, ContentType } from '../models/content-type.model';
import { TwitterUtilsService } from './twitter-utils.service';

@Injectable({
  providedIn: 'root',
})
export class ContentDetectorService {
  constructor(private twitterUtils: TwitterUtilsService) {}

  detectContentType(text: string): ContentAnalysis {
    if (!text || !text.trim()) {
      return {
        type: 'new-post',
        confidence: 1,
        indicators: [],
      };
    }

    const trimmedText = text.trim();
    const indicators: string[] = [];
    let type: ContentType = 'new-post';
    let confidence = 0.5;

    // Check for reply patterns (starts with @mention)
    if (this.twitterUtils.startsWithMention(trimmedText)) {
      type = 'reply';
      confidence = 0.9;
      indicators.push('Starts with @mention');
    }

    // Check for quote tweet patterns
    const quotePatterns = [
      /^[""].+[""]$/m,
      /^>.+/m,
      /this\s*👆/i,
      /\bquote\b/i,
      /\bQT\b/,
    ];

    for (const pattern of quotePatterns) {
      if (pattern.test(trimmedText)) {
        type = 'quote-tweet';
        confidence = 0.7;
        indicators.push('Contains quote indicators');
        break;
      }
    }

    // Check for comment patterns
    const commentPatterns = [
      /^(agreed|exactly|this|yes|no|true|facts|same)/i,
      /^(lol|lmao|haha|wow)/i,
      /^(great|nice|awesome|love this)/i,
    ];

    for (const pattern of commentPatterns) {
      if (pattern.test(trimmedText) && trimmedText.length < 50) {
        type = 'comment';
        confidence = 0.6;
        indicators.push('Short response pattern');
        break;
      }
    }

    // If text is very short and seems reactive, it's likely a comment
    if (trimmedText.length < 30 && !this.twitterUtils.startsWithMention(trimmedText)) {
      const hasQuestion = /\?$/.test(trimmedText);
      const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(trimmedText);

      if (hasQuestion || hasEmoji) {
        type = 'comment';
        confidence = 0.5;
        indicators.push('Short reactive content');
      }
    }

    return {
      type,
      confidence,
      indicators,
    };
  }

  getContentTypeLabel(type: ContentType): string {
    const labels: Record<ContentType, string> = {
      'new-post': 'New Post',
      reply: 'Reply',
      comment: 'Comment',
      'quote-tweet': 'Quote Tweet',
    };
    return labels[type];
  }

  getContentTypeIcon(type: ContentType): string {
    const icons: Record<ContentType, string> = {
      'new-post': 'edit',
      reply: 'reply',
      comment: 'message-circle',
      'quote-tweet': 'quote',
    };
    return icons[type];
  }
}
