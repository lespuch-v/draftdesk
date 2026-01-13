import { AIProviderType } from './ai-provider.model';
import { TonePreset } from './tone-preset.model';

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
