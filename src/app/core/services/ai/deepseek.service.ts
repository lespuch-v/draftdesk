import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { AIProviderService } from './ai-provider.service';
import { AIProviderType, AIRequest, AIResponse, AIShortenRequest } from '../../models';
import { TONE_CONFIGS } from '../../constants/tone-presets.constants';
import { AI_ENDPOINTS } from '../../constants/ai-providers.constants';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class DeepSeekService extends AIProviderService {
  readonly providerId: AIProviderType = 'deepseek';
  readonly providerName = 'DeepSeek';

  constructor(private http: HttpClient) {
    super();
  }

  generateVariation(request: AIRequest, apiKey: string, model: string): Observable<AIResponse> {
    const toneConfig = TONE_CONFIGS[request.tone];
    const systemPrompt = this.buildSystemPrompt(toneConfig.systemPrompt, request.contentType);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    });

    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Original text: ${request.content}` },
      ],
      temperature: 0.7,
      max_tokens: 500,
    };

    return this.http.post<DeepSeekResponse>(AI_ENDPOINTS.deepseek, body, { headers }).pipe(
      map((response) => {
        const text = response.choices?.[0]?.message?.content || '';
        return {
          variation: text.trim(),
          provider: this.providerId,
          tone: request.tone,
          generatedAt: new Date(),
          characterCount: text.trim().length,
        };
      })
    );
  }

  shortenContent(
    request: AIShortenRequest,
    apiKey: string,
    model: string
  ): Observable<AIResponse> {
    const toneConfig = TONE_CONFIGS[request.tone];
    const systemPrompt = this.buildShortenPrompt(
      toneConfig.systemPrompt,
      request.contentType,
      request.targetLength
    );

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    });

    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Text to shorten: ${request.content}` },
      ],
      temperature: 0.5,
      max_tokens: 300,
    };

    return this.http.post<DeepSeekResponse>(AI_ENDPOINTS.deepseek, body, { headers }).pipe(
      map((response) => {
        const text = response.choices?.[0]?.message?.content || '';
        return {
          variation: text.trim(),
          provider: this.providerId,
          tone: request.tone,
          generatedAt: new Date(),
          characterCount: text.trim().length,
        };
      })
    );
  }

  validateApiKey(apiKey: string, model: string): Observable<boolean> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    });

    const body = {
      model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    };

    return this.http.post(AI_ENDPOINTS.deepseek, body, { headers }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
