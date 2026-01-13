import { Injectable } from '@angular/core';

const STORAGE_PREFIX = 'draftdesk_';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private prefix = STORAGE_PREFIX;

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue ?? null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  // For API keys - basic encoding (not encryption, but obscures plain text)
  setSecure(key: string, value: string): void {
    const encoded = btoa(value);
    this.set(key, encoded);
  }

  getSecure(key: string): string | null {
    const encoded = this.get<string>(key);
    if (!encoded) return null;
    try {
      return atob(encoded);
    } catch {
      return null;
    }
  }
}
