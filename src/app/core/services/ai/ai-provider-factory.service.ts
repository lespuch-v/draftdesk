import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, catchError, map } from 'rxjs';
import { AIProviderService } from './ai-provider.service';
import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';
import { DeepSeekService } from './deepseek.service';
import { AIProviderType, AIRequest, AIResponse } from '../../models/ai-provider.model';
import { ApiKeyService } from '../api-key.service';
import { AIModelService } from '../ai-model.service';
import { AI_PROVIDERS, AI_PROVIDER_OPTIONS } from '../../constants/ai-providers.constants';

@Injectable({
  providedIn: 'root',
})
export class AIProviderFactoryService {
  private providers: Map<AIProviderType, AIProviderService>;

  constructor(
    private geminiService: GeminiService,
    private openaiService: OpenAIService,
    private deepseekService: DeepSeekService,
    private apiKeyService: ApiKeyService,
    private aiModelService: AIModelService
  ) {
    this.providers = new Map<AIProviderType, AIProviderService>();
    this.providers.set('gemini', this.geminiService);
    this.providers.set('openai', this.openaiService);
    this.providers.set('deepseek', this.deepseekService);
  }

  getProvider(type: AIProviderType): AIProviderService | undefined {
    return this.providers.get(type);
  }

  getAvailableProviders(): AIProviderType[] {
    return AI_PROVIDER_OPTIONS.filter((provider) =>
      this.apiKeyService.isProviderConfigured(provider)
    );
  }

  getProviderInfo(type: AIProviderType) {
    return AI_PROVIDERS[type];
  }

  generateVariation(
    request: AIRequest,
    providerType: AIProviderType
  ): Observable<AIResponse | null> {
    const provider = this.getProvider(providerType);
    const apiKey = this.apiKeyService.getApiKey(providerType);
    const model = this.aiModelService.getModel(providerType);

    if (!provider || !apiKey) {
      return of(null);
    }

    return provider.generateVariation(request, apiKey, model).pipe(
      catchError((error) => {
        console.error(`Error from ${providerType}:`, error);
        return of(null);
      })
    );
  }

  generateMultipleVariations(
    request: AIRequest,
    count: number,
    providerType: AIProviderType | 'all' = 'all'
  ): Observable<AIResponse[]> {
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      return of([]);
    }

    const providersToUse =
      providerType === 'all'
        ? availableProviders
        : availableProviders.includes(providerType)
        ? [providerType]
        : [];

    if (providersToUse.length === 0) {
      return of([]);
    }

    // Distribute variations across providers
    const requests: Observable<AIResponse | null>[] = [];

    for (let i = 0; i < count; i++) {
      const provider = providersToUse[i % providersToUse.length];
      requests.push(this.generateVariation(request, provider));
    }

    return forkJoin(requests).pipe(
      map((responses) => responses.filter((r): r is AIResponse => r !== null))
    );
  }

  validateApiKey(providerType: AIProviderType, apiKey: string): Observable<boolean> {
    const provider = this.getProvider(providerType);
    if (!provider) {
      return of(false);
    }
    const model = this.aiModelService.getModel(providerType);
    return provider.validateApiKey(apiKey, model);
  }
}
