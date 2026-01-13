import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiKeyService } from '../../core/services/api-key.service';
import { AIProviderFactoryService } from '../../core/services/ai/ai-provider-factory.service';
import { AIModelService } from '../../core/services/ai-model.service';
import { AIProviderType } from '../../core/models';
import {
  AI_PROVIDERS,
  AI_PROVIDER_MODEL_DEFAULTS,
  AI_PROVIDER_MODEL_OPTIONS,
  AI_PROVIDER_OPTIONS,
} from '../../core/constants/ai-providers.constants';

interface ProviderKeyState {
  key: string;
  isEditing: boolean;
  isValidating: boolean;
  isValid: boolean | null;
}

interface ProviderModelState {
  selection: string;
  isCustom: boolean;
  customValue: string;
}

const CUSTOM_MODEL_VALUE = '__custom__';

@Component({
  selector: 'app-api-key-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="api-key-manager">
      <div class="section-intro">
        <h3>API Keys</h3>
        <p>Connect your AI providers to start polishing content</p>
      </div>

      <div class="providers-list">
        @for (provider of providers; track provider) {
          <div class="provider-item" [class.configured]="isConfigured(provider)">
            <div class="provider-header">
              <div class="provider-info">
                <span class="provider-icon">{{ getProviderIcon(provider) }}</span>
                <div class="provider-details">
                  <span class="provider-name">{{ getInfo(provider).name }}</span>
                  @if (isConfigured(provider)) {
                    <span class="status configured">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Connected
                    </span>
                  } @else {
                    <span class="status">Not connected</span>
                  }
                </div>
              </div>
            </div>

            <div class="key-input-group">
              @if (keyStates()[provider].isEditing) {
                <div class="input-row">
                  <input
                    type="password"
                    class="key-input"
                    [placeholder]="'Paste your ' + getInfo(provider).name + ' API key'"
                    [ngModel]="keyStates()[provider].key"
                    (ngModelChange)="updateKey(provider, $event)"
                  />
                </div>
                <div class="action-row">
                  <button
                    class="action-btn save"
                    [disabled]="!keyStates()[provider].key || keyStates()[provider].isValidating"
                    (click)="saveKey(provider)"
                  >
                    @if (keyStates()[provider].isValidating) {
                      <span class="spinner"></span>
                      Validating...
                    } @else {
                      Save Key
                    }
                  </button>
                  <button class="action-btn cancel" (click)="cancelEdit(provider)">
                    Cancel
                  </button>
                </div>
              } @else {
                @if (isConfigured(provider)) {
                  <div class="configured-row">
                    <span class="key-masked">•••••••••••••••••••••••</span>
                    <div class="config-actions">
                      <button class="action-btn edit" (click)="startEdit(provider)">
                        Change
                      </button>
                      <button class="action-btn remove" (click)="removeKey(provider)">
                        Remove
                      </button>
                    </div>
                  </div>
                } @else {
                  <button class="action-btn add" (click)="startEdit(provider)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add API Key
                  </button>
                }
              }
            </div>

            <div class="model-row">
              <label class="model-label">Model</label>
              <div class="model-controls">
                <select
                  class="model-select"
                  [ngModel]="modelStates()[provider].selection"
                  (ngModelChange)="updateModelSelection(provider, $event)"
                >
                  @for (model of getModelOptions(provider); track model) {
                    <option [value]="model">{{ model }}</option>
                  }
                  <option [value]="customModelValue">Custom</option>
                </select>
                @if (modelStates()[provider].isCustom) {
                  <input
                    type="text"
                    class="model-input"
                    placeholder="Enter model name"
                    [ngModel]="modelStates()[provider].customValue"
                    (ngModelChange)="updateCustomModel(provider, $event)"
                    (blur)="commitCustomModel(provider)"
                    (keyup.enter)="commitCustomModel(provider)"
                  />
                }
              </div>
              <p class="model-hint">Used for new requests.</p>
            </div>

            @if (keyStates()[provider].isValid === false) {
              <p class="error-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Invalid API key or model. Please check and try again.
              </p>
            }
          </div>
        }
      </div>

      <div class="security-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <div>
          <strong>Your keys stay local</strong>
          <p>API keys are stored securely in your browser and never sent to our servers.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .api-key-manager {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section-intro h3 {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-bright);
      margin: 0 0 0.375rem;
    }

    .section-intro p {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin: 0;
    }

    .providers-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .provider-item {
      padding: 1rem 1.25rem;
      background: var(--parchment-mid);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      transition: border-color var(--transition-fast);
    }

    .provider-item.configured {
      border-color: rgba(124, 184, 124, 0.3);
    }

    .provider-header {
      margin-bottom: 0.875rem;
    }

    .provider-info {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .provider-icon {
      font-size: 1.5rem;
    }

    .provider-details {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .provider-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.9375rem;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .status.configured {
      color: var(--success);
    }

    .status svg {
      width: 12px;
      height: 12px;
    }

    .key-input-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .model-row {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .model-label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .model-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .input-row {
      display: flex;
      gap: 0.5rem;
    }

    .key-input {
      flex: 1;
      padding: 0.75rem 1rem;
      background: var(--ink-rich);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      color: var(--text-primary);
      font-family: var(--font-mono);
    }

    .key-input:focus {
      outline: none;
      border-color: var(--amber);
    }

    .key-input::placeholder {
      color: var(--text-muted);
      font-family: var(--font-body);
    }

    .model-select,
    .model-input {
      padding: 0.65rem 0.85rem;
      background: var(--ink-rich);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      color: var(--text-primary);
      font-family: var(--font-mono);
      min-width: 14rem;
    }

    .model-select:focus,
    .model-input:focus {
      outline: none;
      border-color: var(--amber);
    }

    .model-input::placeholder {
      color: var(--text-muted);
      font-family: var(--font-body);
    }

    .model-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0;
    }

    .action-row {
      display: flex;
      gap: 0.5rem;
    }

    .configured-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .key-masked {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      letter-spacing: 0.1em;
    }

    .config-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .action-btn svg {
      width: 14px;
      height: 14px;
    }

    .action-btn.add {
      background: var(--amber);
      color: var(--ink-deep);
    }

    .action-btn.add:hover {
      background: var(--amber-glow);
    }

    .action-btn.save {
      background: var(--success);
      color: white;
    }

    .action-btn.save:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .action-btn.save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn.cancel,
    .action-btn.edit {
      background: var(--parchment-light);
      color: var(--text-secondary);
    }

    .action-btn.cancel:hover,
    .action-btn.edit:hover {
      background: var(--border-visible);
      color: var(--text-primary);
    }

    .action-btn.remove {
      background: transparent;
      color: var(--error);
      padding: 0.5rem 0.75rem;
    }

    .action-btn.remove:hover {
      background: var(--error-soft);
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.875rem;
      background: var(--error-soft);
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      color: var(--error);
      margin-top: 0.5rem;
    }

    .error-message svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .security-note {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: var(--amber-hint);
      border-radius: var(--radius-lg);
    }

    .security-note > svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      color: var(--amber);
      margin-top: 0.125rem;
    }

    .security-note strong {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .security-note p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.4;
      margin: 0;
    }
  `],
})
export class ApiKeyManagerComponent {
  providers = AI_PROVIDER_OPTIONS;
  customModelValue = CUSTOM_MODEL_VALUE;

  keyStates = signal<Record<AIProviderType, ProviderKeyState>>({
    gemini: { key: '', isEditing: false, isValidating: false, isValid: null },
    openai: { key: '', isEditing: false, isValidating: false, isValid: null },
    deepseek: { key: '', isEditing: false, isValidating: false, isValid: null },
  });

  modelStates = signal<Record<AIProviderType, ProviderModelState>>({
    gemini: { selection: AI_PROVIDER_MODEL_DEFAULTS.gemini, isCustom: false, customValue: '' },
    openai: { selection: AI_PROVIDER_MODEL_DEFAULTS.openai, isCustom: false, customValue: '' },
    deepseek: { selection: AI_PROVIDER_MODEL_DEFAULTS.deepseek, isCustom: false, customValue: '' },
  });

  constructor(
    private apiKeyService: ApiKeyService,
    private aiFactory: AIProviderFactoryService,
    private aiModelService: AIModelService
  ) {
    this.initializeModelStates();
  }

  getInfo(provider: AIProviderType) {
    return AI_PROVIDERS[provider];
  }

  getProviderIcon(provider: AIProviderType): string {
    const icons: Record<AIProviderType, string> = {
      gemini: '🔮',
      openai: '🤖',
      deepseek: '🌊',
    };
    return icons[provider];
  }

  getModelOptions(provider: AIProviderType): string[] {
    return AI_PROVIDER_MODEL_OPTIONS[provider];
  }

  isConfigured(provider: AIProviderType): boolean {
    return this.apiKeyService.isProviderConfigured(provider);
  }

  updateKey(provider: AIProviderType, value: string): void {
    this.keyStates.update((states) => ({
      ...states,
      [provider]: { ...states[provider], key: value, isValid: null },
    }));
  }

  updateModelSelection(provider: AIProviderType, selection: string): void {
    const state = this.modelStates()[provider];
    if (selection === CUSTOM_MODEL_VALUE) {
      const currentModel = this.aiModelService.getModel(provider);
      this.modelStates.update((states) => ({
        ...states,
        [provider]: {
          ...state,
          selection,
          isCustom: true,
          customValue: state.isCustom ? state.customValue : currentModel,
        },
      }));
      return;
    }

    this.aiModelService.setModel(provider, selection);
    this.modelStates.update((states) => ({
      ...states,
      [provider]: { selection, isCustom: false, customValue: '' },
    }));
  }

  updateCustomModel(provider: AIProviderType, value: string): void {
    this.modelStates.update((states) => ({
      ...states,
      [provider]: { ...states[provider], customValue: value },
    }));
  }

  commitCustomModel(provider: AIProviderType): void {
    const state = this.modelStates()[provider];
    const trimmed = state.customValue.trim();
    if (!trimmed) {
      return;
    }

    this.aiModelService.setModel(provider, trimmed);
    this.modelStates.update((states) => ({
      ...states,
      [provider]: { ...states[provider], selection: CUSTOM_MODEL_VALUE, isCustom: true },
    }));
  }

  startEdit(provider: AIProviderType): void {
    this.keyStates.update((states) => ({
      ...states,
      [provider]: { ...states[provider], isEditing: true, key: '', isValid: null },
    }));
  }

  cancelEdit(provider: AIProviderType): void {
    this.keyStates.update((states) => ({
      ...states,
      [provider]: { ...states[provider], isEditing: false, key: '', isValid: null },
    }));
  }

  saveKey(provider: AIProviderType): void {
    const state = this.keyStates()[provider];
    if (!state.key) return;

    this.keyStates.update((states) => ({
      ...states,
      [provider]: { ...states[provider], isValidating: true },
    }));

    this.aiFactory.validateApiKey(provider, state.key).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.apiKeyService.setApiKey(provider, state.key);
          this.keyStates.update((states) => ({
            ...states,
            [provider]: { key: '', isEditing: false, isValidating: false, isValid: true },
          }));
        } else {
          this.keyStates.update((states) => ({
            ...states,
            [provider]: { ...states[provider], isValidating: false, isValid: false },
          }));
        }
      },
      error: () => {
        this.keyStates.update((states) => ({
          ...states,
          [provider]: { ...states[provider], isValidating: false, isValid: false },
        }));
      },
    });
  }

  removeKey(provider: AIProviderType): void {
    this.apiKeyService.removeApiKey(provider);
  }

  private initializeModelStates(): void {
    const buildState = (provider: AIProviderType): ProviderModelState => {
      const model = this.aiModelService.getModel(provider);
      const options = this.getModelOptions(provider);
      const isCustom = !options.includes(model);
      return {
        selection: isCustom ? CUSTOM_MODEL_VALUE : model,
        isCustom,
        customValue: isCustom ? model : '',
      };
    };

    this.modelStates.set({
      gemini: buildState('gemini'),
      openai: buildState('openai'),
      deepseek: buildState('deepseek'),
    });
  }
}
