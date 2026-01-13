import { Injectable, signal, computed } from '@angular/core';
import { AppSettings, DEFAULT_SETTINGS, TonePreset, AIProviderType } from '../models';
import { StorageService } from './storage.service';

const SETTINGS_KEY = 'app_settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settings = signal<AppSettings>(DEFAULT_SETTINGS);

  readonly currentSettings = computed(() => this.settings());
  readonly defaultTone = computed(() => this.settings().defaultTone);
  readonly defaultProvider = computed(() => this.settings().defaultProvider);
  readonly defaultVariationCount = computed(() => this.settings().defaultVariationCount);
  readonly maxVariationCount = computed(() => this.settings().maxVariationCount);
  readonly minVariationCount = computed(() => this.settings().minVariationCount);

  constructor(private storage: StorageService) {
    this.loadSettings();
  }

  private loadSettings(): void {
    const saved = this.storage.get<AppSettings>(SETTINGS_KEY);
    if (saved) {
      this.settings.set({ ...DEFAULT_SETTINGS, ...saved });
    }
  }

  private saveSettings(): void {
    this.storage.set(SETTINGS_KEY, this.settings());
  }

  updateSettings(partial: Partial<AppSettings>): void {
    this.settings.update((current) => ({
      ...current,
      ...partial,
    }));
    this.saveSettings();
  }

  setDefaultTone(tone: TonePreset): void {
    this.updateSettings({ defaultTone: tone });
  }

  setDefaultProvider(provider: AIProviderType | 'all'): void {
    this.updateSettings({ defaultProvider: provider });
  }

  setVariationCount(count: number): void {
    const min = this.settings().minVariationCount;
    const max = this.settings().maxVariationCount;
    const validated = Math.max(min, Math.min(max, count));
    this.updateSettings({ defaultVariationCount: validated });
  }

  setMaxVariationCount(max: number): void {
    this.updateSettings({
      maxVariationCount: max,
      defaultVariationCount: Math.min(this.settings().defaultVariationCount, max),
    });
  }

  resetToDefaults(): void {
    this.settings.set(DEFAULT_SETTINGS);
    this.saveSettings();
  }
}
