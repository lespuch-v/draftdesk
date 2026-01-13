import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiKeyManagerComponent } from './api-key-manager.component';
import { VariationConfigComponent } from './variation-config.component';

type Tab = 'api-keys' | 'preferences';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ApiKeyManagerComponent, VariationConfigComponent],
  template: `
    <div class="settings-overlay" (click)="onOverlayClick($event)">
      <div class="settings-modal">
        <div class="modal-header">
          <div class="header-content">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
                <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655 1.113 2.706L4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.387 2.651-1.098L18 20l2-2-1.484-1.733 1.098-2.65L22 13v-2l-2.378-.605z"/>
              </svg>
            </div>
            <div>
              <h2>Settings</h2>
              <p>Configure your DraftDesk experience</p>
            </div>
          </div>
          <button class="close-btn" (click)="closeSettings()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'api-keys'"
            (click)="setTab('api-keys')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            API Keys
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'preferences'"
            (click)="setTab('preferences')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="21" x2="4" y2="14"/>
              <line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/>
              <line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="1" y1="14" x2="7" y2="14"/>
              <line x1="9" y1="8" x2="15" y2="8"/>
              <line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
            Preferences
          </button>
        </div>

        <div class="modal-content">
          @if (activeTab() === 'api-keys') {
            <app-api-key-manager />
          } @else {
            <app-variation-config />
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-overlay {
      position: fixed;
      inset: 0;
      background: rgba(13, 11, 9, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease;
    }

    .settings-modal {
      background: var(--parchment-dark);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 540px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lg), 0 0 0 1px rgba(250, 248, 245, 0.05);
      animation: slideUp 0.3s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem 1.5rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .header-content {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .header-icon {
      width: 44px;
      height: 44px;
      background: var(--amber-hint);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-icon svg {
      width: 22px;
      height: 22px;
      color: var(--amber);
    }

    .header-content h2 {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-bright);
      margin: 0 0 0.25rem;
    }

    .header-content p {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin: 0;
    }

    .close-btn {
      padding: 0.5rem;
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      color: var(--text-muted);
    }

    .close-btn:hover {
      background: var(--parchment-mid);
      color: var(--text-primary);
    }

    .close-btn svg {
      width: 20px;
      height: 20px;
    }

    .modal-tabs {
      display: flex;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .tab-btn svg {
      width: 16px;
      height: 16px;
    }

    .tab-btn:hover {
      background: var(--parchment-mid);
      color: var(--text-primary);
    }

    .tab-btn.active {
      background: var(--amber);
      color: var(--ink-deep);
      font-weight: 600;
    }

    .modal-content {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }
  `],
})
export class SettingsComponent {
  @Output() close = new EventEmitter<void>();

  activeTab = signal<Tab>('api-keys');

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  closeSettings(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('settings-overlay')) {
      this.closeSettings();
    }
  }
}
