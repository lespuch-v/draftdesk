import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TonePreset } from '../../core/models/tone-preset.model';
import { TONE_CONFIGS, TONE_OPTIONS } from '../../core/constants/tone-presets.constants';

@Component({
  selector: 'app-tone-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tone-selector">
      <label class="selector-label">Tone</label>
      <div class="tone-options">
        @for (tone of tones; track tone) {
          <button
            class="tone-btn"
            [class.active]="selectedTone === tone"
            [class]="'tone-' + tone"
            (click)="selectTone(tone)"
            [title]="getConfig(tone).description"
          >
            <span class="tone-icon">{{ getIcon(tone) }}</span>
            <span class="tone-label">{{ getConfig(tone).label }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .tone-selector {
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

    .tone-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tone-btn {
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
    }

    .tone-icon {
      font-size: 0.875rem;
    }

    .tone-btn:hover {
      background: var(--parchment-light);
      color: var(--text-primary);
    }

    .tone-btn.active {
      color: var(--ink-deep);
      border-color: transparent;
      font-weight: 600;
    }

    .tone-btn.active.tone-professional {
      background: var(--tone-professional);
    }

    .tone-btn.active.tone-casual {
      background: var(--tone-casual);
    }

    .tone-btn.active.tone-viral {
      background: var(--tone-viral);
    }

    .tone-btn.active.tone-concise {
      background: var(--tone-concise);
    }

    .tone-btn.active.tone-humorous {
      background: var(--tone-humorous);
    }
  `],
})
export class ToneSelectorComponent {
  @Input() selectedTone: TonePreset = 'professional';
  @Output() toneChange = new EventEmitter<TonePreset>();

  tones = TONE_OPTIONS;

  getConfig(tone: TonePreset) {
    return TONE_CONFIGS[tone];
  }

  getIcon(tone: TonePreset): string {
    const icons: Record<TonePreset, string> = {
      professional: '💼',
      casual: '👋',
      viral: '🔥',
      concise: '✂️',
      humorous: '😄',
    };
    return icons[tone];
  }

  selectTone(tone: TonePreset): void {
    this.selectedTone = tone;
    this.toneChange.emit(tone);
  }
}
