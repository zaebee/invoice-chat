
import { ChatSession } from '../types';

const DB_NAME = 'ownima_chat_db';
const STORE_NAME = 'sessions';
const DB_VERSION = 1;
const BACKUP_KEY = 'ownima_chat_sessions_backup';

let dbPromise: Promise<IDBDatabase> | null = null;

export const dbService = {
  open: (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      // Check if IndexedDB is supported
      if (!window.indexedDB) {
        return reject(new Error("IndexedDB not supported"));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Create object store with 'id' as the key path (Reservation ID)
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Handle connection closing on version change (e.g. multi-tab)
          db.onversionchange = () => {
              db.close();
              dbPromise = null;
          };
          
          resolve(db);
      };
      
      request.onerror = (event) => {
          dbPromise = null;
          reject((event.target as IDBOpenDBRequest).error);
      };
    });
    
    return dbPromise;
  },

  getAllSessions: async (): Promise<ChatSession[]> => {
    try {
      const db = await dbService.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IDB Get All Error", e);
      return [];
    }
  },

  saveSession: async (session: ChatSession): Promise<void> => {
    try {
      const db = await dbService.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(session);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IDB Save Error", e);
    }
  },
  
  deleteSession: async (id: string): Promise<void> => {
      try {
        const db = await dbService.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
      } catch (e) {
          console.error("IDB Delete Error", e);
      }
  },

  // --- BACKUP METHODS (LocalStorage) ---
  
  saveBackup: (sessions: ChatSession[]) => {
    try {
      if (!sessions || !Array.isArray(sessions)) return;
      
      // Create lightweight backup (exclude messages content to save space)
      const minimal = sessions.map(s => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { messages, ...rest } = s;
          return { ...rest, messages: [] };
      });
      localStorage.setItem(BACKUP_KEY, JSON.stringify(minimal));
    } catch (e) {
      console.warn("LocalStorage backup failed (quota?)", e);
    }
  },

  loadBackup: (): ChatSession[] => {
    try {
      const raw = localStorage.getItem(BACKUP_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Failed to load backup", e);
      return [];
    }
  }
};
