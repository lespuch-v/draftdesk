export type ContentType = 'new-post' | 'reply' | 'comment' | 'quote-tweet';

export interface ContentAnalysis {
  type: ContentType;
  confidence: number;
  indicators: string[];
}
