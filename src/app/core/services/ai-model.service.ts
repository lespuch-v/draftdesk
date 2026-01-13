import { Injectable, signal } from '@angular/core';
import { AIProviderType } from '../models/ai-provider.model';
import { StorageService } from './storage.service';
import {
  AI_PROVIDER_MODEL_DEFAULTS,
  AI_PROVIDER_MODEL_STORAGE_KEYS,
} from '../constants/ai-providers.constants';

@Injectable({
  providedIn: 'root',
})
export class AIModelService {
  private models = signal<Record<AIProviderType, string>>({
    ...AI_PROVIDER_MODEL_DEFAULTS,
  });

  constructor(private storage: StorageService) {
    this.loadModels();
  }

  private loadModels(): void {
    const models: Record<AIProviderType, string> = {
      ...AI_PROVIDER_MODEL_DEFAULTS,
    };

    for (const provider of Object.keys(models) as AIProviderType[]) {
      const storageKey = AI_PROVIDER_MODEL_STORAGE_KEYS[provider];
      const saved = this.storage.get<string>(storageKey);
      if (saved && saved.trim()) {
        models[provider] = saved.trim();
      }
    }

    this.models.set(models);
  }

  getModel(provider: AIProviderType): string {
    return this.models()[provider] || AI_PROVIDER_MODEL_DEFAULTS[provider];
  }

  setModel(provider: AIProviderType, model: string): void {
    const trimmed = model.trim();
    if (!trimmed) {
      return;
    }

    const storageKey = AI_PROVIDER_MODEL_STORAGE_KEYS[provider];
    this.storage.set(storageKey, trimmed);

    this.models.update((current) => ({
      ...current,
      [provider]: trimmed,
    }));
  }

  resetModel(provider: AIProviderType): void {
    const storageKey = AI_PROVIDER_MODEL_STORAGE_KEYS[provider];
    this.storage.remove(storageKey);

    this.models.update((current) => ({
      ...current,
      [provider]: AI_PROVIDER_MODEL_DEFAULTS[provider],
    }));
  }
}
