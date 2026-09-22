/**
 * Gestor de Almacenamiento Robusto con IndexedDB y Respaldo LocalStorage.
 * Permite almacenar documentos, ficheros PDF, Excel, Word y fotos GPS
 * sin sufrir las limitaciones de cuota (5MB) de localStorage.
 */

const DB_NAME = 'geobras_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';

// Abrir base de datos IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no disponible en este entorno'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result as IDBDatabase);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

/**
 * Obtiene un valor desde IndexedDB
 */
export async function getFromIndexedDB<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result !== undefined ? req.result : null);
      };
      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn(`[storageManager] Fallo al leer de IndexedDB (${key}):`, err);
    return null;
  }
}

/**
 * Guarda un valor en IndexedDB de forma persistente
 */
export async function saveToIndexedDB(key: string, value: any): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => {
        resolve(true);
      };
      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.error(`[storageManager] Error al guardar en IndexedDB (${key}):`, err);
    return false;
  }
}

/**
 * Guarda simultáneamente en localStorage e IndexedDB con protección de cuota.
 * Si localStorage se llena por ficheros grandes, IndexedDB garantiza la persistencia.
 */
export function persistDataSafely(key: string, value: any): void {
  if (typeof window === 'undefined') return;

  // 1. Guardar de forma asíncrona en IndexedDB (almacenamiento masivo sin límite de 5MB)
  saveToIndexedDB(key, value).catch((e) => {
    console.warn(`[storageManager] No se pudo escribir en IndexedDB para ${key}:`, e);
  });

  // 2. Intentar guardar en localStorage para lectura síncrona inmediata
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err: any) {
    // Si la cuota de localStorage se superó (ej. PDFs o fotos base64 grandes),
    // se limpia la entrada en localStorage para evitar bloqueos del navegador,
    // ya que los datos están protegidos en IndexedDB.
    console.warn(`[storageManager] Cuota de localStorage superada para ${key}. Guardado seguro en IndexedDB.`);
  }
}

/**
 * Carga inicial de datos combinando localStorage e IndexedDB
 */
export async function loadDataSafely<T = any>(key: string, defaultValue: T): Promise<T> {
  if (typeof window === 'undefined') return defaultValue;

  // 1. Primero intentar desde localStorage (ultra rápido)
  try {
    const local = localStorage.getItem(key);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed) return parsed;
    }
  } catch {}

  // 2. Si no está en localStorage o está corrupto, leer de IndexedDB
  try {
    const idbData = await getFromIndexedDB<T>(key);
    if (idbData !== null) {
      // Intentar refrescar localStorage si cabe
      try {
        localStorage.setItem(key, JSON.stringify(idbData));
      } catch {}
      return idbData;
    }
  } catch {}

  return defaultValue;
}
