import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variation } from '../../core/models/variation.model';
import { AI_PROVIDERS } from '../../core/constants/ai-providers.constants';
import { TONE_CONFIGS } from '../../core/constants/tone-presets.constants';

@Component({
  selector: 'app-variation-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="variation-card" [class.over-limit]="variation.isOverLimit">
      <div class="card-header">
        <div class="card-meta">
          <span class="provider-badge">{{ getProviderIcon() }} {{ getProviderName() }}</span>
          <span class="tone-badge" [class]="'tone-' + variation.tone">
            {{ getToneName() }}
          </span>
        </div>
        <span class="char-count" [class.over]="variation.isOverLimit">
          {{ variation.characterCount }}
        </span>
      </div>

      <div class="card-content">
        <p>{{ variation.polishedContent }}</p>
      </div>

      <div class="card-actions">
        <button class="action-btn copy-btn" (click)="copyToClipboard()" [class.copied]="copied">
          @if (copied) {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
            </svg>
            <span>Copy</span>
          }
        </button>
        <button class="action-btn use-btn" (click)="useVariation()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
          </svg>
          <span>Use This</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .variation-card {
      background: var(--manuscript);
      border-radius: var(--radius-lg);
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(250, 248, 245, 0.08);
      min-width: 300px;
      max-width: 340px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      animation: slideInRight 0.4s ease both;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    }

    .variation-card:hover {
      transform: translateY(-4px);
      box-shadow:
        0 8px 30px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(250, 248, 245, 0.12);
    }

    .variation-card.over-limit {
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.2),
        0 0 0 1px var(--warning);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1rem;
      border-bottom: 1px solid var(--border-manuscript);
    }

    .card-meta {
      display: flex;
      gap: 0.5rem;
    }

    .provider-badge,
    .tone-badge {
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-full);
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .provider-badge {
      background: rgba(0, 0, 0, 0.05);
      color: var(--text-dark-secondary);
    }

    .tone-badge {
      color: white;
    }

    .tone-badge.tone-professional { background: var(--tone-professional); }
    .tone-badge.tone-casual { background: var(--tone-casual); }
    .tone-badge.tone-viral { background: var(--tone-viral); }
    .tone-badge.tone-concise { background: var(--tone-concise); }
    .tone-badge.tone-humorous { background: var(--tone-humorous); }

    .char-count {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-dark-secondary);
      font-variant-numeric: tabular-nums;
    }

    .char-count.over {
      color: #a85454;
    }

    .card-content {
      flex: 1;
      padding: 1rem;
    }

    .card-content p {
      font-size: 0.9375rem;
      line-height: 1.65;
      color: var(--text-dark);
      word-break: break-word;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.02);
      border-top: 1px solid var(--border-manuscript);
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0.625rem;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: var(--radius-md);
      background: white;
      color: var(--text-dark-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .action-btn svg {
      width: 14px;
      height: 14px;
    }

    .action-btn:hover {
      background: var(--manuscript-alt);
      border-color: rgba(0, 0, 0, 0.15);
      color: var(--text-dark);
    }

    .use-btn {
      background: var(--amber);
      color: var(--ink-deep);
      border-color: var(--amber);
    }

    .use-btn:hover {
      background: var(--amber-glow);
      border-color: var(--amber-glow);
    }

    .copy-btn.copied {
      background: var(--success);
      color: white;
      border-color: var(--success);
    }
  `],
})
export class VariationCardComponent {
  @Input() variation!: Variation;
  @Output() use = new EventEmitter<Variation>();

  copied = false;

  getProviderName(): string {
    return AI_PROVIDERS[this.variation.provider]?.name || this.variation.provider;
  }

  getProviderIcon(): string {
    const icons: Record<string, string> = {
      gemini: '🔮',
      openai: '🤖',
      deepseek: '🌊',
    };
    return icons[this.variation.provider] || '✨';
  }

  getToneName(): string {
    return TONE_CONFIGS[this.variation.tone]?.label || this.variation.tone;
  }

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.variation.polishedContent);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  useVariation(): void {
    this.use.emit(this.variation);
  }
}
