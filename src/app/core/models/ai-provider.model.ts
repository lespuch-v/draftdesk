import { TonePreset } from './tone-preset.model';
import { ContentType } from './content-type.model';

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

export interface AIResponse {
  variation: string;
  provider: AIProviderType;
  tone: TonePreset;
  generatedAt: Date;
  characterCount: number;
}
