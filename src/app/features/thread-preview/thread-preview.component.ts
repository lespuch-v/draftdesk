import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwitterUtilsService } from '../../core/services/twitter-utils.service';

@Component({
  selector: 'app-thread-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="thread-preview">
      <div class="thread-header">
        <div class="header-content">
          <svg class="thread-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <h3>Thread Preview</h3>
        </div>
        <span class="thread-count">
          <span class="count-number">{{ threadParts().length }}</span>
          tweets
        </span>
      </div>

      <div class="thread-scroll">
        <div class="thread-parts">
          @for (part of threadParts(); track $index; let i = $index) {
            <div class="thread-part" [style.animation-delay]="i * 60 + 'ms'">
              <div class="part-connector">
                <div class="connector-line" [class.first]="i === 0" [class.last]="i === threadParts().length - 1"></div>
                <div class="connector-dot">{{ i + 1 }}</div>
              </div>
              <div class="part-card">
                <div class="part-header">
                  <span class="part-number">Part {{ i + 1 }} of {{ threadParts().length }}</span>
                  <span class="part-chars" [class.warning]="getCharCount(part) > 270">
                    {{ getCharCount(part) }}/280
                  </span>
                </div>
                <p class="part-content">{{ part }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .thread-preview {
      background: var(--parchment-dark);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .thread-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: rgba(0, 0, 0, 0.15);
      border-bottom: 1px solid var(--border-subtle);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .thread-icon {
      width: 20px;
      height: 20px;
      color: var(--amber);
    }

    .thread-header h3 {
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-bright);
      margin: 0;
    }

    .thread-count {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .count-number {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--amber);
      margin-right: 0.25rem;
    }

    .thread-scroll {
      overflow-x: auto;
    }

    .thread-parts {
      display: flex;
      gap: 0;
      padding: 1.25rem;
    }

    .thread-part {
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: slideUp 0.4s ease both;
    }

    .part-connector {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      position: relative;
    }

    .connector-line {
      position: absolute;
      height: 2px;
      background: var(--amber);
      opacity: 0.3;
      top: 50%;
      transform: translateY(-50%);
    }

    .connector-line:not(.first) {
      left: -100%;
      width: 100%;
    }

    .connector-line:not(.last)::after {
      content: '';
      position: absolute;
      right: 0;
      width: 100%;
      height: 2px;
      background: var(--amber);
      opacity: 0.3;
    }

    .connector-dot {
      width: 28px;
      height: 28px;
      background: var(--amber);
      color: var(--ink-deep);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }

    .part-card {
      background: var(--manuscript);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card);
      width: 280px;
      flex-shrink: 0;
      margin: 0 0.5rem;
    }

    .part-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-manuscript);
    }

    .part-number {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-dark-secondary);
    }

    .part-chars {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-dark-secondary);
      font-variant-numeric: tabular-nums;
    }

    .part-chars.warning {
      color: var(--amber-deep);
    }

    .part-content {
      padding: 1rem;
      font-size: 0.9375rem;
      line-height: 1.6;
      color: var(--text-dark);
      word-break: break-word;
      margin: 0;
    }
  `],
})
export class ThreadPreviewComponent {
  @Input() content = '';

  constructor(private twitterUtils: TwitterUtilsService) {}

  threadParts = computed(() => {
    if (!this.content) return [];
    return this.twitterUtils.splitIntoThread(this.content);
  });

  getCharCount(text: string): number {
    return this.twitterUtils.countCharacters(text);
  }
}
