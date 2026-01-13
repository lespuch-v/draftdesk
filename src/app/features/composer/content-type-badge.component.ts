import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentAnalysis, ContentType } from '../../core/models/content-type.model';

@Component({
  selector: 'app-content-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="badge" [class]="'badge-' + analysis.type">
      <span class="badge-dot"></span>
      <span class="badge-text">{{ getLabel(analysis.type) }}</span>
    </div>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: rgba(0, 0, 0, 0.04);
      color: var(--text-dark-secondary);
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .badge-new-post {
      background: rgba(139, 157, 195, 0.12);
      color: #5a6b8a;
    }

    .badge-reply {
      background: rgba(124, 184, 124, 0.12);
      color: #4a8f4a;
    }

    .badge-comment {
      background: rgba(212, 168, 83, 0.12);
      color: var(--amber-deep);
    }

    .badge-quote-tweet {
      background: rgba(124, 184, 201, 0.12);
      color: #4a7a8a;
    }
  `],
})
export class ContentTypeBadgeComponent {
  @Input() analysis: ContentAnalysis = { type: 'new-post', confidence: 1, indicators: [] };

  getLabel(type: ContentType): string {
    const labels: Record<ContentType, string> = {
      'new-post': 'New Post',
      reply: 'Reply',
      comment: 'Comment',
      'quote-tweet': 'Quote',
    };
    return labels[type];
  }
}
