/**
 * Unified Storage Abstraction
 *
 * Provides a consistent async interface over localStorage (backward-compat)
 * and IndexedDB (larger quota, non-blocking).  The factory `createStorage()`
 * returns the best available adapter; callers should never care which one.
 *
 * Usage:
 *   import { storage } from '@/store/persistence'
 *   await storage.set('my-key', { foo: 1 })
 *   const val = await storage.get<MyType>('my-key')
 */

// ── Public interface ─────────────────────────────────────────────────────────

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<string[]>
}

// ── LocalStorageAdapter ──────────────────────────────────────────────────────

export class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* quota exceeded — silently ignore */
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }

  async list(prefix?: string): Promise<string[]> {
    if (typeof window === 'undefined') return []
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (!prefix || k.startsWith(prefix))) {
        keys.push(k)
      }
    }
    return keys
  }
}

// ── IndexedDBAdapter ─────────────────────────────────────────────────────────

const IDB_NAME = 'yotel-studio'
const IDB_STORE = 'data'
const IDB_VERSION = 1

export class IndexedDBAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBDatabase> | null = null

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE)
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        this.dbPromise = null
        reject(request.error)
      }
    })

    return this.dbPromise
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.openDB()
      return new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly')
        const store = tx.objectStore(IDB_STORE)
        const req = store.get(key)
        req.onsuccess = () => resolve((req.result as T) ?? null)
        req.onerror = () => reject(req.error)
      })
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.openDB()
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readwrite')
        const store = tx.objectStore(IDB_STORE)
        const req = store.put(value, key)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      })
    } catch {
      /* IndexedDB write failed — silently ignore */
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.openDB()
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readwrite')
        const store = tx.objectStore(IDB_STORE)
        const req = store.delete(key)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      })
    } catch {
      /* IndexedDB delete failed — silently ignore */
    }
  }

  async list(prefix?: string): Promise<string[]> {
    try {
      const db = await this.openDB()
      return new Promise<string[]>((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly')
        const store = tx.objectStore(IDB_STORE)
        const req = store.getAllKeys()
        req.onsuccess = () => {
          const allKeys = (req.result as IDBValidKey[]).map(String)
          resolve(prefix ? allKeys.filter((k) => k.startsWith(prefix)) : allKeys)
        }
        req.onerror = () => reject(req.error)
      })
    } catch {
      return []
    }
  }
}

// ── Factory ──────────────────────────────────────────────────────────────────

function indexedDBAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return typeof indexedDB !== 'undefined'
  } catch {
    return false
  }
}

export function createStorage(): StorageAdapter {
  if (indexedDBAvailable()) {
    return new IndexedDBAdapter()
  }
  return new LocalStorageAdapter()
}

// ── Singleton ────────────────────────────────────────────────────────────────

export const storage: StorageAdapter = createStorage()
