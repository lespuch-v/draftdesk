import { Observable } from 'rxjs';
import { AIProviderType, AIRequest, AIResponse } from '../../models/ai-provider.model';

export abstract class AIProviderService {
  abstract readonly providerId: AIProviderType;
  abstract readonly providerName: string;

  abstract generateVariation(
    request: AIRequest,
    apiKey: string,
    model: string
  ): Observable<AIResponse>;
  abstract validateApiKey(apiKey: string, model: string): Observable<boolean>;

  protected buildSystemPrompt(tonePrompt: string, contentType: string): string {
    return `${tonePrompt}

Content type: ${contentType}
Important: Keep the response within Twitter's 280 character limit when possible. If the original content is longer, maintain the essence while being concise.`;
  }
}
