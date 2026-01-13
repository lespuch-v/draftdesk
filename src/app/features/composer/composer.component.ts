import { Component, Input, Output, EventEmitter, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterCounterComponent } from './character-counter.component';
import { ContentTypeBadgeComponent } from './content-type-badge.component';
import { ContentAnalysis } from '../../core/models';
import { TwitterUtilsService } from '../../core/services/twitter-utils.service';

@Component({
  selector: 'app-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, CharacterCounterComponent, ContentTypeBadgeComponent],
  template: `
    <div class="composer">
      <div class="composer-paper">
        <!-- Decorative corner -->
        <div class="paper-corner"></div>

        <div class="composer-header">
          <app-content-type-badge [analysis]="contentAnalysis" />
          <app-character-counter
            [count]="characterCount()"
            [maxLength]="280"
          />
        </div>

        <div class="composer-body">
          <textarea
            #textareaRef
            class="composer-textarea"
            [ngModel]="content"
            (ngModelChange)="onContentChange($event)"
            placeholder="What story do you want to tell today?"
            rows="6"
          ></textarea>

          <div class="typing-indicator" [class.visible]="content.length > 0">
            <span class="cursor"></span>
          </div>
        </div>

        @if (hashtags().length > 0) {
          <div class="hashtag-bar">
            <span class="hashtag-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" y1="9" x2="20" y2="9"></line>
                <line x1="4" y1="15" x2="20" y2="15"></line>
                <line x1="10" y1="3" x2="8" y2="21"></line>
                <line x1="16" y1="3" x2="14" y2="21"></line>
              </svg>
            </span>
            <div class="hashtags">
              @for (tag of hashtags(); track tag) {
                <span class="hashtag">{{ tag }}</span>
              }
            </div>
          </div>
        }
      </div>

      @if (content.length > 0) {
        <div class="composer-actions">
          <button class="clear-btn" (click)="clearContent()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
            Clear draft
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .composer {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .composer-paper {
      background: var(--manuscript);
      border-radius: var(--radius-lg);
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(250, 248, 245, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.5);
      position: relative;
      overflow: hidden;
    }

    /* Decorative fold corner */
    .paper-corner {
      position: absolute;
      top: 0;
      right: 0;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.03) 50%);
      pointer-events: none;
    }

    .paper-corner::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 40px 40px 0;
      border-color: transparent var(--ink-deep) transparent transparent;
      opacity: 0.05;
    }

    .composer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-manuscript);
    }

    .composer-body {
      padding: 1.25rem;
      position: relative;
    }

    .composer-textarea {
      width: 100%;
      min-height: 180px;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--text-dark);
      font-family: var(--font-body);
      font-size: 1.0625rem;
      line-height: 1.7;
      resize: none;
      outline: none;
    }

    .composer-textarea::placeholder {
      color: var(--text-dark-secondary);
      font-style: italic;
      opacity: 0.7;
    }

    .composer-textarea:focus::placeholder {
      opacity: 0.4;
    }

    /* Typewriter cursor effect */
    .typing-indicator {
      position: absolute;
      bottom: 1.25rem;
      right: 1.25rem;
      opacity: 0;
      transition: opacity var(--transition-normal);
    }

    .typing-indicator.visible {
      opacity: 1;
    }

    .cursor {
      display: inline-block;
      width: 2px;
      height: 18px;
      background: var(--amber-deep);
      animation: typewriter-cursor 1s infinite;
    }

    /* Hashtag bar */
    .hashtag-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      background: rgba(0, 0, 0, 0.02);
      border-top: 1px solid var(--border-manuscript);
    }

    .hashtag-label {
      color: var(--text-dark-secondary);
      display: flex;
      align-items: center;
    }

    .hashtag-label svg {
      width: 16px;
      height: 16px;
    }

    .hashtags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .hashtag {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      background: var(--amber-soft);
      color: var(--amber-deep);
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: var(--radius-full);
    }

    /* Actions */
    .composer-actions {
      display: flex;
      justify-content: flex-end;
      padding: 0 0.25rem;
    }

    .clear-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.875rem;
      background: transparent;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.8125rem;
      font-weight: 500;
      transition: all var(--transition-fast);
    }

    .clear-btn svg {
      width: 15px;
      height: 15px;
    }

    .clear-btn:hover {
      background: var(--error-soft);
      border-color: var(--error);
      color: var(--error);
    }
  `],
})
export class ComposerComponent implements AfterViewInit {
  @Input() content = '';
  @Input() contentAnalysis: ContentAnalysis = { type: 'new-post', confidence: 1, indicators: [] };
  @Output() contentChange = new EventEmitter<string>();

  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;

  constructor(private twitterUtils: TwitterUtilsService) {}

  characterCount = computed(() => this.twitterUtils.countCharacters(this.content));
  hashtags = computed(() => this.twitterUtils.extractHashtags(this.content));

  ngAfterViewInit(): void {
    this.adjustTextareaHeight();
  }

  onContentChange(value: string): void {
    this.content = value;
    this.contentChange.emit(value);
    this.adjustTextareaHeight();
  }

  clearContent(): void {
    this.content = '';
    this.contentChange.emit('');
  }

  private adjustTextareaHeight(): void {
    if (this.textareaRef) {
      const textarea = this.textareaRef.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(180, textarea.scrollHeight) + 'px';
    }
  }
}
