import { Injectable, signal, computed } from '@angular/core';
import { AIProviderType } from '../models/ai-provider.model';
import { AI_PROVIDERS } from '../constants/ai-providers.constants';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ApiKeyService {
  private apiKeys = signal<Record<AIProviderType, string | null>>({
    gemini: null,
    openai: null,
    deepseek: null,
  });

  readonly configuredProviders = computed(() => {
    const keys = this.apiKeys();
    return (Object.keys(keys) as AIProviderType[]).filter((provider) => !!keys[provider]);
  });

  readonly hasAnyProvider = computed(() => this.configuredProviders().length > 0);

  constructor(private storage: StorageService) {
    this.loadApiKeys();
  }

  private loadApiKeys(): void {
    const keys: Record<AIProviderType, string | null> = {
      gemini: null,
      openai: null,
      deepseek: null,
    };

    for (const provider of Object.keys(AI_PROVIDERS) as AIProviderType[]) {
      const storageKey = AI_PROVIDERS[provider].apiKeyStorageKey;
      keys[provider] = this.storage.getSecure(storageKey);
    }

    this.apiKeys.set(keys);
  }

  getApiKey(provider: AIProviderType): string | null {
    return this.apiKeys()[provider];
  }

  setApiKey(provider: AIProviderType, key: string): void {
    const storageKey = AI_PROVIDERS[provider].apiKeyStorageKey;
    this.storage.setSecure(storageKey, key);

    this.apiKeys.update((keys) => ({
      ...keys,
      [provider]: key,
    }));
  }

  removeApiKey(provider: AIProviderType): void {
    const storageKey = AI_PROVIDERS[provider].apiKeyStorageKey;
    this.storage.remove(storageKey);

    this.apiKeys.update((keys) => ({
      ...keys,
      [provider]: null,
    }));
  }

  isProviderConfigured(provider: AIProviderType): boolean {
    return !!this.apiKeys()[provider];
  }
}
