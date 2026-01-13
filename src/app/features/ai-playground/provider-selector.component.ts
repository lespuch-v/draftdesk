import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AIProviderType } from '../../core/models/ai-provider.model';
import { AI_PROVIDERS, AI_PROVIDER_OPTIONS } from '../../core/constants/ai-providers.constants';
import { ApiKeyService } from '../../core/services/api-key.service';

@Component({
  selector: 'app-provider-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="provider-selector">
      <label class="selector-label">AI Provider</label>
      <div class="provider-options">
        <button
          class="provider-btn"
          [class.active]="selectedProvider === 'all'"
          (click)="selectProvider('all')"
          [disabled]="!hasAnyProvider()"
        >
          <span class="provider-icon">✨</span>
          <span>All</span>
        </button>
        @for (provider of providers; track provider) {
          <button
            class="provider-btn"
            [class.active]="selectedProvider === provider"
            [class.unconfigured]="!isConfigured(provider)"
            (click)="selectProvider(provider)"
            [disabled]="!isConfigured(provider)"
            [title]="isConfigured(provider) ? getInfo(provider).name : 'API key not configured'"
          >
            <span class="provider-icon">{{ getProviderIcon(provider) }}</span>
            <span>{{ getInfo(provider).name }}</span>
            @if (!isConfigured(provider)) {
              <span class="unconfigured-dot"></span>
            }
          </button>
        }
      </div>
      @if (!hasAnyProvider()) {
        <p class="no-provider-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Configure API keys in Settings to enable AI
        </p>
      }
    </div>
  `,
  styles: [`
    .provider-selector {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .selector-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .provider-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .provider-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.875rem;
      background: var(--parchment-mid);
      border: 1px solid transparent;
      border-radius: var(--radius-full);
      color: var(--text-secondary);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
    }

    .provider-icon {
      font-size: 0.875rem;
    }

    .provider-btn:hover:not(:disabled) {
      background: var(--parchment-light);
      color: var(--text-primary);
    }

    .provider-btn.active {
      background: var(--amber);
      color: var(--ink-deep);
      font-weight: 600;
    }

    .provider-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .provider-btn.unconfigured {
      opacity: 0.6;
    }

    .unconfigured-dot {
      width: 6px;
      height: 6px;
      background: var(--warning);
      border-radius: 50%;
      margin-left: 0.125rem;
    }

    .no-provider-hint {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .no-provider-hint svg {
      width: 14px;
      height: 14px;
      color: var(--warning);
    }
  `],
})
export class ProviderSelectorComponent {
  @Input() selectedProvider: AIProviderType | 'all' = 'all';
  @Output() providerChange = new EventEmitter<AIProviderType | 'all'>();

  providers = AI_PROVIDER_OPTIONS;

  constructor(private apiKeyService: ApiKeyService) {}

  getInfo(provider: AIProviderType) {
    return AI_PROVIDERS[provider];
  }

  getProviderIcon(provider: AIProviderType): string {
    const icons: Record<AIProviderType, string> = {
      gemini: '🔮',
      openai: '🤖',
      deepseek: '🌊',
    };
    return icons[provider];
  }

  isConfigured(provider: AIProviderType): boolean {
    return this.apiKeyService.isProviderConfigured(provider);
  }

  hasAnyProvider(): boolean {
    return this.apiKeyService.hasAnyProvider();
  }

  selectProvider(provider: AIProviderType | 'all'): void {
    if (provider === 'all' || this.isConfigured(provider)) {
      this.selectedProvider = provider;
      this.providerChange.emit(provider);
    }
  }
}
