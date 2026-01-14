export type ContentType = 'new-post' | 'reply' | 'comment' | 'quote-tweet';

export interface ContentAnalysis {
  type: ContentType;
  confidence: number;
  indicators: string[];
}

export type TonePreset = 'professional' | 'casual' | 'viral' | 'concise' | 'humorous';

export interface ToneConfig {
  id: TonePreset;
  label: string;
  description: string;
  icon: string;
  systemPrompt: string;
}

export type AIProviderType = 'gemini' | 'openai' | 'deepseek';

export interface AIProvider {
  id: AIProviderType;
  name: string;
  icon: string;
  isConfigured: boolean;
  apiKeyStorageKey: string;
}

export interface AIRequest {
  content: string;
  tone: TonePreset;
  contentType: ContentType;
  variationCount: number;
}

export interface AIShortenRequest {
  content: string;
  tone: TonePreset;
  contentType: ContentType;
  targetLength: number;
}

export interface AIResponse {
  variation: string;
  provider: AIProviderType;
  tone: TonePreset;
  generatedAt: Date;
  characterCount: number;
}

export interface Variation {
  id: string;
  originalContent: string;
  polishedContent: string;
  provider: AIProviderType;
  tone: TonePreset;
  characterCount: number;
  isOverLimit: boolean;
  threadParts?: string[];
  createdAt: Date;
  isSelected: boolean;
  isShortening?: boolean;
}

export interface AppSettings {
  defaultVariationCount: number;
  maxVariationCount: number;
  minVariationCount: number;
  defaultTone: TonePreset;
  defaultProvider: AIProviderType | 'all';
  autoDetectContentType: boolean;
  showHashtagSuggestions: boolean;
}

export interface ApiKeyConfig {
  provider: AIProviderType;
  key: string;
  isValid: boolean;
  lastValidated?: Date;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultVariationCount: 3,
  maxVariationCount: 10,
  minVariationCount: 1,
  defaultTone: 'professional',
  defaultProvider: 'all',
  autoDetectContentType: true,
  showHashtagSuggestions: true,
};
