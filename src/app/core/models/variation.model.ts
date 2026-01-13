import { AIProviderType } from './ai-provider.model';
import { TonePreset } from './tone-preset.model';

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
}
