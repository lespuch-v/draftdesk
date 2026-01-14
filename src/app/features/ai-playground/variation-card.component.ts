import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variation } from '../../core/models';
import { AI_PROVIDERS } from '../../core/constants/ai-providers.constants';
import { TONE_CONFIGS } from '../../core/constants/tone-presets.constants';
import { TWITTER_CONSTANTS } from '../../core/constants/twitter.constants';

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

      <div class="shorten-controls">
        <label class="shorten-label">Target length</label>
        <div class="length-input">
          <input
            type="number"
            class="length-field"
            [min]="minTargetLength"
            [max]="maxTargetLength"
            [step]="lengthStep"
            [value]="targetLength"
            [disabled]="variation.isShortening"
            (input)="onTargetLengthInput($event)"
          />
          <span class="length-unit">chars</span>
        </div>
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
        <button
          class="action-btn shorten-btn"
          (click)="requestShorten()"
          [disabled]="variation.isShortening"
        >
          @if (variation.isShortening) {
            <div class="mini-spinner"></div>
            <span>Shortening...</span>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="7" x2="20" y2="7"></line>
              <line x1="4" y1="12" x2="14" y2="12"></line>
              <line x1="4" y1="17" x2="18" y2="17"></line>
            </svg>
            <span>Shorten</span>
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
      display: flex;
      flex-direction: column;
      animation: slideUp 0.4s ease both;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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

    .variation-card ::selection {
      background: var(--amber);
      color: var(--ink-deep);
    }

    .variation-card ::-moz-selection {
      background: var(--amber);
      color: var(--ink-deep);
    }

    .shorten-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1rem;
      background: rgba(0, 0, 0, 0.02);
      border-top: 1px solid var(--border-manuscript);
    }

    .shorten-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .length-input {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: var(--radius-sm);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .length-input:focus-within {
      border-color: rgba(0, 0, 0, 0.2);
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
    }

    .length-field {
      width: 64px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-dark);
      text-align: right;
    }

    .length-field:disabled {
      color: var(--text-muted);
      background: transparent;
      cursor: not-allowed;
    }

    .length-unit {
      font-size: 0.6875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
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

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .shorten-btn {
      background: white;
      color: var(--text-dark-secondary);
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

    .mini-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  `],
})
export class VariationCardComponent {
  @Input() variation!: Variation;
  @Output() use = new EventEmitter<Variation>();
  @Output() shorten = new EventEmitter<{ variation: Variation; targetLength: number }>();

  copied = false;
  targetLength = 180;
  readonly minTargetLength = 80;
  readonly maxTargetLength = TWITTER_CONSTANTS.MAX_TWEET_LENGTH;
  readonly lengthStep = 10;

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

  onTargetLengthInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    const rawValue = Number.parseInt(input.value, 10);
    if (Number.isNaN(rawValue)) return;
    this.targetLength = this.clampTargetLength(rawValue);
    input.value = String(this.targetLength);
  }

  requestShorten(): void {
    this.shorten.emit({ variation: this.variation, targetLength: this.targetLength });
  }

  private clampTargetLength(value: number): number {
    return Math.max(this.minTargetLength, Math.min(this.maxTargetLength, value));
  }
}
