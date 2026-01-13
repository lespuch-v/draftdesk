import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComposerComponent } from '../composer/composer.component';
import { AiPlaygroundComponent } from '../ai-playground/ai-playground.component';
import { ThreadPreviewComponent } from '../thread-preview/thread-preview.component';
import { SettingsComponent } from '../settings/settings.component';
import { TwitterUtilsService } from '../../core/services/twitter-utils.service';
import { ContentDetectorService } from '../../core/services/content-detector.service';
import { ContentAnalysis, Variation } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ComposerComponent,
    AiPlaygroundComponent,
    ThreadPreviewComponent,
    SettingsComponent,
  ],
  template: `
    <div class="dashboard">
      <!-- Ambient glow effects -->
      <div class="ambient-glow ambient-glow-1"></div>
      <div class="ambient-glow ambient-glow-2"></div>

      <header class="dashboard-header">
        <div class="logo">
          <div class="logo-mark">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M8 24L4 20L20 4L24 8L8 24Z" fill="currentColor" opacity="0.3"/>
              <path d="M20 4L28 4L28 12L20 4Z" fill="currentColor"/>
              <path d="M4 20L4 28L12 28L4 20Z" fill="currentColor" opacity="0.6"/>
              <circle cx="16" cy="16" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div class="logo-text">
            <h1>DraftDesk</h1>
            <span class="tagline">Polish your words</span>
          </div>
        </div>

        <nav class="header-actions">
          <button class="settings-btn" (click)="showSettings.set(true)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
              <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655 1.113 2.706L4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.387 2.651-1.098L18 20l2-2-1.484-1.733 1.098-2.65L22 13v-2l-2.378-.605z"/>
            </svg>
            <span>Settings</span>
          </button>
        </nav>
      </header>

      <main class="dashboard-main">
        <section class="panel composer-panel">
          <div class="panel-header">
            <div class="panel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
            </div>
            <div class="panel-title">
              <h2>Compose</h2>
              <p>Write your draft</p>
            </div>
          </div>
          <app-composer
            [content]="content()"
            (contentChange)="onContentChange($event)"
            [contentAnalysis]="contentAnalysis()"
          />
        </section>

        <section class="panel playground-panel">
          <div class="panel-header">
            <div class="panel-icon glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div class="panel-title">
              <h2>AI Playground</h2>
              <p>Generate polished variations</p>
            </div>
          </div>
          <app-ai-playground
            [content]="content()"
            [contentAnalysis]="contentAnalysis()"
            (variationSelected)="onVariationSelected($event)"
          />
        </section>
      </main>

      @if (showThreadPreview()) {
        <section class="thread-section">
          <app-thread-preview [content]="content()" />
        </section>
      }

      @if (showSettings()) {
        <app-settings (close)="showSettings.set(false)" />
      }
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 1;
    }

    /* Ambient background glows */
    .ambient-glow {
      position: fixed;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
      z-index: 0;
    }

    .ambient-glow-1 {
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(212, 168, 83, 0.08) 0%, transparent 70%);
      top: -200px;
      left: -100px;
    }

    .ambient-glow-2 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(212, 168, 83, 0.05) 0%, transparent 70%);
      bottom: -150px;
      right: -100px;
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 2rem;
      background: rgba(26, 22, 20, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 100;
      animation: fadeIn 0.5s ease;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-mark {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(212, 168, 83, 0.3);
    }

    .logo-mark svg {
      width: 24px;
      height: 24px;
      color: var(--ink-deep);
    }

    .logo-text h1 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-bright);
      letter-spacing: -0.02em;
      margin: 0;
    }

    .tagline {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 400;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .settings-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: var(--parchment-dark);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--transition-normal);
    }

    .settings-btn svg {
      width: 18px;
      height: 18px;
    }

    .settings-btn:hover {
      background: var(--parchment-mid);
      color: var(--text-primary);
      border-color: var(--border-visible);
      transform: translateY(-1px);
    }

    /* Main layout */
    .dashboard-main {
      display: grid;
      grid-template-columns: minmax(380px, 1fr) minmax(500px, 1.6fr);
      gap: 1.5rem;
      padding: 1.5rem 2rem 2rem;
      flex: 1;
      max-width: 1800px;
      margin: 0 auto;
      width: 100%;
    }

    /* Panels */
    .panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      animation: slideUp 0.6s ease both;
    }

    .composer-panel {
      animation-delay: 0.1s;
    }

    .playground-panel {
      animation-delay: 0.2s;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0 0.25rem;
    }

    .panel-icon {
      width: 40px;
      height: 40px;
      background: var(--parchment-dark);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }

    .panel-icon.glow {
      background: var(--amber-hint);
      border-color: rgba(212, 168, 83, 0.2);
      color: var(--amber);
    }

    .panel-icon svg {
      width: 20px;
      height: 20px;
    }

    .panel-title h2 {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-bright);
      margin: 0;
      letter-spacing: -0.01em;
    }

    .panel-title p {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin: 0;
    }

    /* Thread section */
    .thread-section {
      padding: 0 2rem 2rem;
      max-width: 1800px;
      margin: 0 auto;
      width: 100%;
      animation: slideUp 0.5s ease;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .dashboard-main {
        grid-template-columns: 1fr;
        max-width: 700px;
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        padding: 1rem 1.25rem;
      }

      .logo-text h1 {
        font-size: 1.25rem;
      }

      .tagline {
        display: none;
      }

      .settings-btn span {
        display: none;
      }

      .settings-btn {
        padding: 0.625rem;
      }

      .dashboard-main {
        padding: 1rem 1.25rem 1.5rem;
        gap: 1.25rem;
      }

      .panel-header {
        gap: 0.75rem;
      }

      .panel-icon {
        width: 36px;
        height: 36px;
      }

      .panel-title h2 {
        font-size: 1rem;
      }
    }
  `],
})
export class DashboardComponent {
  content = signal('');
  contentAnalysis = signal<ContentAnalysis>({ type: 'new-post', confidence: 1, indicators: [] });
  showSettings = signal(false);
  showThreadPreview = signal(false);

  constructor(
    private twitterUtils: TwitterUtilsService,
    private contentDetector: ContentDetectorService
  ) {}

  onContentChange(newContent: string): void {
    this.content.set(newContent);
    this.contentAnalysis.set(this.contentDetector.detectContentType(newContent));
    this.showThreadPreview.set(this.twitterUtils.isOverLimit(newContent));
  }

  onVariationSelected(variation: Variation): void {
    this.content.set(variation.polishedContent);
  }
}
