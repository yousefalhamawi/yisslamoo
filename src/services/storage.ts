
import { get, set, del } from 'idb-keyval';

export const storage = {
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      // Try to get from IndexedDB first
      const value = await get(key);
      if (value !== undefined && value !== null) {
        return typeof value === 'string' ? JSON.parse(value) : value;
      }
      
      // Fallback to localStorage for migration
      const localValue = localStorage.getItem(key);
      if (localValue) {
        try {
          const parsed = JSON.parse(localValue);
          await this.setItem(key, parsed);
          // We keep it in localStorage for now to be safe, or we could remove it
          return parsed;
        } catch (e) {
          console.error(`Error parsing ${key} from localStorage:`, e);
        }
      }
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
    }
    return defaultValue;
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
      // If IndexedDB fails, we might want to try localStorage as a last resort,
      // but that's what caused the original error, so we just log it.
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await del(key);
      localStorage.removeItem(key); // تنظيف احتياطي من LocalStorage لمنع مشكلة استعادة الجلسة القديمة (Fallback Loop)
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }
};
