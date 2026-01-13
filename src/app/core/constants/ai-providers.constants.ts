import { AIProvider, AIProviderType } from '../models/ai-provider.model';

export const AI_PROVIDERS: Record<AIProviderType, AIProvider> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    icon: 'gemini',
    isConfigured: false,
    apiKeyStorageKey: 'draftdesk_gemini_api_key',
  },
  openai: {
    id: 'openai',
    name: 'ChatGPT',
    icon: 'openai',
    isConfigured: false,
    apiKeyStorageKey: 'draftdesk_openai_api_key',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'deepseek',
    isConfigured: false,
    apiKeyStorageKey: 'draftdesk_deepseek_api_key',
  },
};

export const AI_PROVIDER_OPTIONS: AIProviderType[] = ['gemini', 'openai', 'deepseek'];

export const AI_PROVIDER_MODEL_DEFAULTS: Record<AIProviderType, string> = {
  gemini: 'gemini-1.5-flash',
  openai: 'gpt-4o-mini',
  deepseek: 'deepseek-chat',
};

export const AI_PROVIDER_MODEL_OPTIONS: Record<AIProviderType, string[]> = {
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-3-flash-preview'],
  openai: ['gpt-4o-mini', 'gpt-4o'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
};

export const AI_PROVIDER_MODEL_STORAGE_KEYS: Record<AIProviderType, string> = {
  gemini: 'draftdesk_gemini_model',
  openai: 'draftdesk_openai_model',
  deepseek: 'draftdesk_deepseek_model',
};

export const AI_ENDPOINTS = {
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
} as const;
