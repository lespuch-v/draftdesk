import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { AIProviderService } from './ai-provider.service';
import { AIProviderType, AIRequest, AIResponse, AIShortenRequest } from '../../models';
import { TONE_CONFIGS } from '../../constants/tone-presets.constants';
import { AI_ENDPOINTS } from '../../constants/ai-providers.constants';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface OpenAIResponsesResponse {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  status?: string;
  incomplete_details?: {
    reason?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OpenAIService extends AIProviderService {
  readonly providerId: AIProviderType = 'openai';
  readonly providerName = 'ChatGPT';

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

    if (this.usesResponsesApi(model)) {
      const body = this.buildResponsesBody(
        model,
        systemPrompt,
        `Original text: ${request.content}`,
        800
      );

      return this.http
        .post<OpenAIResponsesResponse>(AI_ENDPOINTS.openaiResponses, body, { headers })
        .pipe(
          map((response) => {
            console.log('[OpenAI Responses] raw response', response);
            const text = this.extractResponsesText(response);
            if (!text) {
              console.warn('[OpenAI Responses] empty output', {
                status: response.status,
                reason: response.incomplete_details?.reason,
              });
            }
            console.log('[OpenAI Responses] extracted text', text);
            return {
              variation: text,
              provider: this.providerId,
              tone: request.tone,
              generatedAt: new Date(),
              characterCount: text.length,
            };
          })
        );
    }

    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Original text: ${request.content}` },
      ],
      temperature: 0.7,
      max_tokens: 500,
    };

    return this.http.post<OpenAIResponse>(AI_ENDPOINTS.openai, body, { headers }).pipe(
      map((response) => {
        console.log('[OpenAI Chat] raw response', response);
        const text = response.choices?.[0]?.message?.content?.trim() || '';
        console.log('[OpenAI Chat] extracted text', text);
        return {
          variation: text,
          provider: this.providerId,
          tone: request.tone,
          generatedAt: new Date(),
          characterCount: text.length,
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

    if (this.usesResponsesApi(model)) {
      const body = this.buildResponsesBody(
        model,
        systemPrompt,
        `Text to shorten: ${request.content}`,
        400
      );

      return this.http
        .post<OpenAIResponsesResponse>(AI_ENDPOINTS.openaiResponses, body, { headers })
        .pipe(
          map((response) => {
            console.log('[OpenAI Responses] raw response', response);
            const text = this.extractResponsesText(response);
            if (!text) {
              console.warn('[OpenAI Responses] empty output', {
                status: response.status,
                reason: response.incomplete_details?.reason,
              });
            }
            console.log('[OpenAI Responses] extracted text', text);
            return {
              variation: text,
              provider: this.providerId,
              tone: request.tone,
              generatedAt: new Date(),
              characterCount: text.length,
            };
          })
        );
    }

    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Text to shorten: ${request.content}` },
      ],
      temperature: 0.5,
      max_tokens: 300,
    };

    return this.http.post<OpenAIResponse>(AI_ENDPOINTS.openai, body, { headers }).pipe(
      map((response) => {
        console.log('[OpenAI Chat] raw response', response);
        const text = response.choices?.[0]?.message?.content?.trim() || '';
        console.log('[OpenAI Chat] extracted text', text);
        return {
          variation: text,
          provider: this.providerId,
          tone: request.tone,
          generatedAt: new Date(),
          characterCount: text.length,
        };
      })
    );
  }

  validateApiKey(apiKey: string, model: string): Observable<boolean> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    });

    if (this.usesResponsesApi(model)) {
      const body = this.buildResponsesBody(model, '', 'Hi', 5);

      return this.http.post(AI_ENDPOINTS.openaiResponses, body, { headers }).pipe(
        map(() => true),
        catchError(() => of(false))
      );
    }

    const body = {
      model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    };

    return this.http.post(AI_ENDPOINTS.openai, body, { headers }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private usesResponsesApi(model: string): boolean {
    const normalized = model?.trim().toLowerCase();
    return (
      normalized.startsWith('gpt-5') ||
      normalized.startsWith('o1-') ||
      normalized.startsWith('o3-')
    );
  }

  private extractResponsesText(response: OpenAIResponsesResponse): string {
    const directText = response.output_text?.trim();
    if (directText) {
      return directText;
    }

    const outputs = response.output || [];
    for (const output of outputs) {
      const content = output?.content || [];
      for (const item of content) {
        const text = item?.text?.trim();
        if (text) {
          return text;
        }
      }
    }

    return '';
  }

  private buildResponsesBody(
    model: string,
    instructions: string,
    input: string,
    maxOutputTokens: number,
    temperature?: number
  ) {
    const body: {
      model: string;
      instructions?: string;
      input: string;
      max_output_tokens: number;
      reasoning?: {
        effort: 'low' | 'medium' | 'high';
      };
      text?: {
        format: {
          type: 'text';
        };
      };
      temperature?: number;
    } = {
      model,
      input,
      max_output_tokens: maxOutputTokens,
      reasoning: { effort: 'low' },
      text: { format: { type: 'text' } },
    };

    if (instructions?.trim()) {
      body.instructions = instructions.trim();
    }

    if (typeof temperature === 'number') {
      body.temperature = temperature;
    }

    return body;
  }
}
