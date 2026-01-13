import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-character-counter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="character-counter" [class]="statusClass()">
      <div class="counter-ring-container">
        <svg class="counter-ring" viewBox="0 0 36 36">
          <circle
            class="counter-bg"
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke-width="2.5"
          />
          <circle
            class="counter-progress"
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke-width="2.5"
            stroke-linecap="round"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="dashOffset()"
            transform="rotate(-90 18 18)"
          />
        </svg>
        @if (isNearLimit() || isOverLimit()) {
          <span class="counter-number">{{ remaining() }}</span>
        }
      </div>
      <span class="counter-text">
        {{ count }}<span class="separator">/</span>{{ maxLength }}
      </span>
    </div>
  `,
  styles: [`
    .character-counter {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .counter-ring-container {
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .counter-ring {
      width: 32px;
      height: 32px;
    }

    .counter-bg {
      stroke: rgba(0, 0, 0, 0.08);
    }

    .counter-progress {
      stroke: var(--success);
      transition: stroke-dashoffset 0.3s ease, stroke 0.2s ease;
    }

    .character-counter.warning .counter-progress {
      stroke: var(--warning);
    }

    .character-counter.danger .counter-progress {
      stroke: var(--error);
    }

    .counter-number {
      position: absolute;
      font-size: 0.625rem;
      font-weight: 700;
      font-family: var(--font-body);
    }

    .character-counter.warning .counter-number {
      color: var(--amber-deep);
    }

    .character-counter.danger .counter-number {
      color: #a85454;
    }

    .counter-text {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-dark-secondary);
      font-variant-numeric: tabular-nums;
    }

    .separator {
      opacity: 0.4;
      margin: 0 1px;
    }

    .character-counter.warning .counter-text {
      color: var(--amber-deep);
    }

    .character-counter.danger .counter-text {
      color: #a85454;
      font-weight: 600;
    }
  `],
})
export class CharacterCounterComponent {
  @Input() count = 0;
  @Input() maxLength = 280;

  readonly circumference = 2 * Math.PI * 15;

  percentage = computed(() => Math.min((this.count / this.maxLength) * 100, 100));
  remaining = computed(() => this.maxLength - this.count);
  isNearLimit = computed(() => this.remaining() <= 20 && this.remaining() > 0);
  isOverLimit = computed(() => this.count > this.maxLength);

  dashOffset = computed(() => {
    const progress = this.percentage() / 100;
    return this.circumference * (1 - progress);
  });

  statusClass = computed(() => {
    if (this.isOverLimit()) return 'danger';
    if (this.isNearLimit()) return 'warning';
    return '';
  });
}
