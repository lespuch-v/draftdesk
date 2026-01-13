import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToneSelectorComponent } from './tone-selector.component';
import { ProviderSelectorComponent } from './provider-selector.component';
import { VariationCardComponent } from './variation-card.component';
import { AIProviderFactoryService } from '../../core/services/ai/ai-provider-factory.service';
import { ApiKeyService } from '../../core/services/api-key.service';
import { SettingsService } from '../../core/services/settings.service';
import { TwitterUtilsService } from '../../core/services/twitter-utils.service';
import { TonePreset } from '../../core/models/tone-preset.model';
import { AIProviderType } from '../../core/models/ai-provider.model';
import { ContentAnalysis } from '../../core/models/content-type.model';
import { Variation } from '../../core/models/variation.model';

@Component({
  selector: 'app-ai-playground',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToneSelectorComponent,
    ProviderSelectorComponent,
    VariationCardComponent,
  ],
  template: `
    <div class="ai-playground">
      <div class="playground-card">
        <!-- Controls Section -->
        <div class="controls-section">
          <div class="control-group">
            <app-tone-selector
              [selectedTone]="selectedTone()"
              (toneChange)="onToneChange($event)"
            />
          </div>

          <div class="control-group">
            <app-provider-selector
              [selectedProvider]="selectedProvider()"
              (providerChange)="onProviderChange($event)"
            />
          </div>

          <div class="control-group slider-group">
            <label class="control-label">
              <span>Variations</span>
              <span class="count-badge">{{ variationCount() }}</span>
            </label>
            <div class="slider-container">
              <input
                type="range"
                class="slider"
                [min]="minCount()"
                [max]="maxCount()"
                [ngModel]="variationCount()"
                (ngModelChange)="onCountChange($event)"
              />
              <div class="slider-track">
                <div class="slider-fill" [style.width.%]="sliderPercent()"></div>
              </div>
            </div>
          </div>

          <button
            class="generate-btn"
            [disabled]="!canGenerate() || isLoading()"
            (click)="generate()"
          >
            @if (isLoading()) {
              <div class="spinner"></div>
              <span>Polishing...</span>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>Generate Variations</span>
            }
          </button>
        </div>

        <!-- Variations Section -->
        <div class="variations-section">
          @if (variations().length > 0) {
            <div class="variations-header">
              <div class="variations-info">
                <span class="variations-count">{{ variations().length }}</span>
                <span class="variations-label">polished variations</span>
              </div>
              <button class="clear-btn" (click)="clearVariations()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Clear
              </button>
            </div>
            <div class="variations-scroll">
              <div class="variations-grid">
                @for (variation of variations(); track variation.id; let i = $index) {
                  <app-variation-card
                    [variation]="variation"
                    [style.animation-delay]="i * 80 + 'ms'"
                    (use)="onUseVariation($event)"
                  />
                }
              </div>
            </div>
          } @else if (!isLoading()) {
            <div class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3>Ready to polish</h3>
              <p>Write something in the composer and hit generate to see AI-polished variations of your content</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-playground {
      height: 100%;
    }

    .playground-card {
      background: var(--parchment-dark);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 500px;
    }

    /* Controls */
    .controls-section {
      padding: 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .control-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .count-badge {
      background: var(--amber);
      color: var(--ink-deep);
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
    }

    /* Slider */
    .slider-container {
      position: relative;
      height: 6px;
    }

    .slider {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }

    .slider-track {
      position: absolute;
      inset: 0;
      background: var(--parchment-light);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .slider-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--amber-deep), var(--amber));
      border-radius: var(--radius-full);
      transition: width var(--transition-fast);
    }

    /* Generate button */
    .generate-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%);
      color: var(--ink-deep);
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-normal);
      box-shadow: 0 4px 16px rgba(212, 168, 83, 0.25);
    }

    .generate-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(212, 168, 83, 0.35);
    }

    .generate-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .generate-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .generate-btn svg {
      width: 18px;
      height: 18px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid transparent;
      border-top-color: var(--ink-deep);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Variations section */
    .variations-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .variations-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1.25rem;
      background: rgba(0, 0, 0, 0.15);
      border-bottom: 1px solid var(--border-subtle);
    }

    .variations-info {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .variations-count {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--amber);
    }

    .variations-label {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .clear-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.625rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }

    .clear-btn svg {
      width: 14px;
      height: 14px;
    }

    .clear-btn:hover {
      background: var(--error-soft);
      color: var(--error);
    }

    /* Variations grid */
    .variations-scroll {
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
    }

    .variations-grid {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      min-height: 100%;
    }

    /* Empty state */
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
    }

    .empty-icon {
      width: 72px;
      height: 72px;
      background: var(--amber-hint);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .empty-icon svg {
      width: 36px;
      height: 36px;
      color: var(--amber);
      opacity: 0.7;
    }

    .empty-state h3 {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      font-size: 0.875rem;
      color: var(--text-muted);
      max-width: 280px;
      line-height: 1.5;
    }
  `],
})
export class AiPlaygroundComponent {
  private contentValue = signal('');

  @Input() set content(value: string) {
    this.contentValue.set(value ?? '');
  }

  get content(): string {
    return this.contentValue();
  }

  @Input() contentAnalysis: ContentAnalysis = { type: 'new-post', confidence: 1, indicators: [] };
  @Output() variationSelected = new EventEmitter<Variation>();

  selectedTone = signal<TonePreset>('professional');
  selectedProvider = signal<AIProviderType | 'all'>('all');
  variationCount = signal(3);
  variations = signal<Variation[]>([]);
  isLoading = signal(false);

  constructor(
    private aiFactory: AIProviderFactoryService,
    private settingsService: SettingsService,
    private twitterUtils: TwitterUtilsService,
    private apiKeyService: ApiKeyService
  ) {
    this.selectedTone.set(this.settingsService.defaultTone());
    this.selectedProvider.set(this.settingsService.defaultProvider());
    this.variationCount.set(this.settingsService.defaultVariationCount());
  }

  minCount = computed(() => this.settingsService.minVariationCount());
  maxCount = computed(() => this.settingsService.maxVariationCount());
  canGenerate = computed(() => {
    return this.contentValue().trim().length > 0 && this.apiKeyService.hasAnyProvider();
  });

  sliderPercent = computed(() => {
    const min = this.minCount();
    const max = this.maxCount();
    const current = this.variationCount();
    return ((current - min) / (max - min)) * 100;
  });

  onToneChange(tone: TonePreset): void {
    this.selectedTone.set(tone);
  }

  onProviderChange(provider: AIProviderType | 'all'): void {
    this.selectedProvider.set(provider);
  }

  onCountChange(count: number): void {
    this.variationCount.set(count);
  }

  generate(): void {
    if (!this.canGenerate() || this.isLoading()) return;

    this.isLoading.set(true);

    const request = {
      content: this.content,
      tone: this.selectedTone(),
      contentType: this.contentAnalysis.type,
      variationCount: this.variationCount(),
    };

    this.aiFactory
      .generateMultipleVariations(request, this.variationCount(), this.selectedProvider())
      .subscribe({
        next: (responses) => {
          const newVariations: Variation[] = responses.map((response, index) => ({
            id: `${Date.now()}-${index}`,
            originalContent: this.content,
            polishedContent: response.variation,
            provider: response.provider,
            tone: response.tone,
            characterCount: response.characterCount,
            isOverLimit: response.characterCount > 280,
            threadParts: response.characterCount > 280
              ? this.twitterUtils.splitIntoThread(response.variation)
              : undefined,
            createdAt: response.generatedAt,
            isSelected: false,
          }));

          this.variations.update((current) => [...newVariations, ...current]);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error generating variations:', error);
          this.isLoading.set(false);
        },
      });
  }

  clearVariations(): void {
    this.variations.set([]);
  }

  onUseVariation(variation: Variation): void {
    this.variationSelected.emit(variation);
  }
}
