import TypedLocalStore from 'typed-local-store';
import { isWeb } from './consts';

interface StorageSchema {
  keyWords: string[];
}

function getStorage(): any {
  if (!isWeb) {
    return new TypedLocalStore<StorageSchema>();
  }
  class TypedLocalStorage {
    // Set an item
    setItem<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]) {
      localStorage.setItem(key, JSON.stringify(value));
    }

    // Get an item with proper type
    getItem<K extends keyof StorageSchema>(key: K): StorageSchema[K] | null {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as StorageSchema[K]) : null;
    }

    // Remove an item
    removeItem<K extends keyof StorageSchema>(key: K) {
      localStorage.removeItem(key);
    }
  }
  return new TypedLocalStorage();
}
const storage = getStorage();
export default storage;
