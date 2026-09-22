/**
 * Motor de Sincronización en la Nube y Acceso Multiusuario en Tiempo Real.
 * Permite que múltiples dispositivos (móvil, tablet, PC) compartan de forma
 * dinámica las mismas obras, usuarios, visitas, fotos y documentos en tiempo real.
 */

import { Obra, VisitaReport, Documento, FotoGPS, TaxonomyItem, UserRegistryRecord } from '@/types';
import { getUserRegistry, saveUserRegistry } from '@/lib/userRegistry';

export interface CloudPayload {
  version: number;
  timestamp: string;
  sourceDevice: string;
  obras: Obra[];
  visitas: VisitaReport[];
  documentos: Documento[];
  fotos: FotoGPS[];
  userRegistry: UserRegistryRecord[];
  taxonomias: TaxonomyItem[];
}

export interface CloudSyncConfig {
  enabled: boolean;
  endpointUrl: string;
  channelId: string;
  apiKey?: string;
  lastSyncAt: string | null;
  secondaryEndpointUrl?: string;
}

const CLOUD_CONFIG_STORAGE_KEY = 'geobras_cloud_sync_config_v2';
const LEGACY_STORAGE_KEY = 'geobras_cloud_sync_config_v1';

export const CLOUD_SYNC_DEVICE_ID = typeof window !== 'undefined'
  ? (localStorage.getItem('geobras_device_id') || (() => {
      const id = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      try { localStorage.setItem('geobras_device_id', id); } catch {}
      return id;
    })())
  : 'dev-server';

// Canal primario de alta disponibilidad y tiempo real (CORS abierto, SSE y caché de adjuntos)
// y canal secundario persistente en kvdb.io para obras.gestion.central@gmail.com
export const DEFAULT_CLOUD_CONFIG: CloudSyncConfig = {
  enabled: true,
  endpointUrl: 'https://ntfy.sh/geobras_obras_central_database_v1',
  channelId: 'geobras_obras_central_database_v1',
  apiKey: '',
  lastSyncAt: null,
  secondaryEndpointUrl: 'https://kvdb.io/35hEgoCjGZugMmoFEzUK9R/obras_central_database',
};

/**
 * Obtiene la configuración de sincronización actual migrando automáticamente versiones obsoletas
 */
export function getCloudConfig(): CloudSyncConfig {
  if (typeof window === 'undefined') return DEFAULT_CLOUD_CONFIG;
  try {
    // Purgar configuración obsoleta con URLs 404
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy && (legacy.includes('4y9y213yLh4mXbQz7T1u8p') || legacy.includes('kvdb.io/4y9y213y'))) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }

    const raw = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validar que no contenga el endpoint roto
      if (!parsed.endpointUrl || parsed.endpointUrl.includes('4y9y213yLh4mXbQz7T1u8p')) {
        return DEFAULT_CLOUD_CONFIG;
      }
      return { ...DEFAULT_CLOUD_CONFIG, ...parsed };
    }
  } catch {}
  return DEFAULT_CLOUD_CONFIG;
}

/**
 * Guarda la configuración de sincronización
 */
export function saveCloudConfig(config: CloudSyncConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

/**
 * Sube el estado completo actual a la base de datos en la nube (Doble canal: tiempo real + persistente)
 */
export async function pushToCloud(data: Omit<CloudPayload, 'version' | 'timestamp' | 'sourceDevice'>): Promise<boolean> {
  const config = getCloudConfig();
  if (!config.enabled || !config.endpointUrl) return false;

  const payload: CloudPayload = {
    version: Date.now(),
    timestamp: new Date().toISOString(),
    sourceDevice: CLOUD_SYNC_DEVICE_ID,
    ...data,
  };

  const jsonStr = JSON.stringify(payload);
  let success = false;

  // 1. Canal Primario en Vivo (ntfy.sh REST con subida de adjunto)
  try {
    const res = await fetch(config.endpointUrl, {
      method: 'PUT',
      headers: {
        'Filename': 'geobras_sync.json',
        'Title': 'GEOBRAS Cloud Sync',
        'X-Cache': 'yes',
      },
      body: jsonStr,
    });

    if (res.ok) {
      success = true;
      config.lastSyncAt = new Date().toISOString();
      saveCloudConfig(config);
    }
  } catch (err) {
    console.warn('[cloudSync] Aviso al subir al canal primario:', err);
  }

  // 2. Canal Secundario Persistente (kvdb.io) en segundo plano
  if (config.secondaryEndpointUrl) {
    fetch(config.secondaryEndpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonStr,
    }).catch(() => {
      // Si el bucket está pendiente de confirmación de email, no bloquea el canal primario
    });
  }

  return success;
}

/**
 * Descarga el estado más reciente desde la base de datos en la nube
 */
export async function pullFromCloud(): Promise<CloudPayload | null> {
  const config = getCloudConfig();
  if (!config.enabled || !config.endpointUrl) return null;

  // 1. Intentar consultar el canal primario en vivo
  try {
    const pollUrl = `${config.endpointUrl.replace(/\/$/, '')}/json?poll=1&since=12h`;
    const res = await fetch(pollUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const msg = JSON.parse(lines[i]);
          if (msg.attachment && msg.attachment.url) {
            const fileRes = await fetch(msg.attachment.url, { cache: 'no-store' });
            if (fileRes.ok) {
              const data: CloudPayload = await fileRes.json();
              if (data && Array.isArray(data.obras) && Array.isArray(data.userRegistry)) {
                config.lastSyncAt = new Date().toISOString();
                saveCloudConfig(config);
                return data;
              }
            }
          } else if (msg.message) {
            // Si el mensaje vino directamente en el cuerpo
            try {
              const data: CloudPayload = JSON.parse(msg.message);
              if (data && Array.isArray(data.obras) && Array.isArray(data.userRegistry)) {
                config.lastSyncAt = new Date().toISOString();
                saveCloudConfig(config);
                return data;
              }
            } catch {}
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[cloudSync] Aviso al consultar canal primario:', err);
  }

  // 2. Fallback: Intentar consultar el canal secundario en kvdb
  if (config.secondaryEndpointUrl) {
    try {
      const fallbackUrl = `${config.secondaryEndpointUrl}?t=${Date.now()}`;
      const res = await fetch(fallbackUrl, { cache: 'no-store' });
      if (res.ok) {
        const data: CloudPayload = await res.json();
        if (data && Array.isArray(data.obras) && Array.isArray(data.userRegistry)) {
          config.lastSyncAt = new Date().toISOString();
          saveCloudConfig(config);
          return data;
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Suscripción en Tiempo Real mediante Server-Sent Events (SSE).
 * Se conecta al canal en vivo; cuando cualquier otro dispositivo publica una actualización,
 * descarga de inmediato el nuevo estado y ejecuta el callback onUpdate(payload).
 */
export function subscribeToLiveCloudUpdates(
  onUpdate: (payload: CloudPayload) => void
): () => void {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return () => {};
  }

  const config = getCloudConfig();
  if (!config.enabled || !config.endpointUrl) {
    return () => {};
  }

  const sseUrl = `${config.endpointUrl.replace(/\/$/, '')}/sse`;
  let eventSource: EventSource | null = null;

  try {
    eventSource = new EventSource(sseUrl);

    eventSource.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'message') {
          if (msg.attachment && msg.attachment.url) {
            const fileRes = await fetch(msg.attachment.url, { cache: 'no-store' });
            if (fileRes.ok) {
              const data: CloudPayload = await fileRes.json();
              // Evitar eco del propio dispositivo
              if (data && data.sourceDevice !== CLOUD_SYNC_DEVICE_ID) {
                if (Array.isArray(data.obras) && Array.isArray(data.userRegistry)) {
                  onUpdate(data);
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('[cloudSync] Error al procesar evento SSE:', err);
      }
    };

    eventSource.onerror = () => {
      // EventSource reconecta automáticamente
    };
  } catch (err) {
    console.warn('[cloudSync] No se pudo inicializar EventSource en tiempo real:', err);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}

/**
 * Prueba la conectividad y funcionamiento del canal en la nube
 */
export async function testCloudConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const config = getCloudConfig();
    const testUrl = `${config.endpointUrl.replace(/\/$/, '')}/json?poll=1&since=12h`;
    const res = await fetch(testUrl, { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      return {
        success: true,
        message: 'Conexión exitosa con el canal en la nube en tiempo real.',
        details: { endpoint: config.endpointUrl, status: res.status }
      };
    }
    return {
      success: false,
      message: `El servidor respondió con código ${res.status}.`,
      details: { endpoint: config.endpointUrl, status: res.status }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error de red al conectar: ${err.message || err}`,
    };
  }
}

/**
 * Genera un archivo JSON de respaldo completo descargable
 */
export function exportFullBackupFile(data: Omit<CloudPayload, 'version' | 'timestamp' | 'sourceDevice'>): string {
  const backup: CloudPayload = {
    version: Date.now(),
    timestamp: new Date().toISOString(),
    sourceDevice: CLOUD_SYNC_DEVICE_ID,
    ...data,
  };
  return JSON.stringify(backup, null, 2);
}
