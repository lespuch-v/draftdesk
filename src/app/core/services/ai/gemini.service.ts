import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { AIProviderService } from './ai-provider.service';
import { AIProviderType, AIRequest, AIResponse } from '../../models';
import { TONE_CONFIGS } from '../../constants/tone-presets.constants';
import { AI_ENDPOINTS, AI_PROVIDER_MODEL_DEFAULTS } from '../../constants/ai-providers.constants';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService extends AIProviderService {
  readonly providerId: AIProviderType = 'gemini';
  readonly providerName = 'Google Gemini';

  constructor(private http: HttpClient) {
    super();
  }

  generateVariation(request: AIRequest, apiKey: string, model: string): Observable<AIResponse> {
    const toneConfig = TONE_CONFIGS[request.tone];
    const systemPrompt = this.buildSystemPrompt(toneConfig.systemPrompt, request.contentType);

    const resolvedModel = model?.trim() || AI_PROVIDER_MODEL_DEFAULTS.gemini;
    const url = `${AI_ENDPOINTS.gemini}/${resolvedModel}:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nOriginal text: ${request.content}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    };

    return this.http.post<GeminiResponse>(url, body).pipe(
      map((response) => {
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
    const resolvedModel = model?.trim() || AI_PROVIDER_MODEL_DEFAULTS.gemini;
    const url = `${AI_ENDPOINTS.gemini}/${resolvedModel}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: 'Hello' }] }],
      generationConfig: { maxOutputTokens: 5 },
    };

    return this.http.post(url, body).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
