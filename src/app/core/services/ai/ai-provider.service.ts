import { Observable } from 'rxjs';
import { AIProviderType, AIRequest, AIResponse, AIShortenRequest } from '../../models';

export abstract class AIProviderService {
  abstract readonly providerId: AIProviderType;
  abstract readonly providerName: string;

  abstract generateVariation(
    request: AIRequest,
    apiKey: string,
    model: string
  ): Observable<AIResponse>;
  abstract shortenContent(
    request: AIShortenRequest,
    apiKey: string,
    model: string
  ): Observable<AIResponse>;
  abstract validateApiKey(apiKey: string, model: string): Observable<boolean>;

  protected buildSystemPrompt(tonePrompt: string, contentType: string): string {
    return `${tonePrompt}

Content type: ${contentType}
Important: Keep the response within Twitter's 280 character limit when possible. If the original content is longer, maintain the essence while being concise.`;
  }

  protected buildShortenPrompt(
    tonePrompt: string,
    contentType: string,
    targetLength: number
  ): string {
    return `${tonePrompt}

Content type: ${contentType}
Task: Shorten the text to around ${targetLength} characters while preserving the core message and tone.
Avoid adding new information. Keep it in a single tweet and return ONLY the shortened text.`;
  }
}
