/**
 * Motor de Sincronización en la Nube y Acceso Multiusuario en Tiempo Real.
 * Permite que múltiples dispositivos (móvil, tablet, PC) compartan de forma
 * dinámica las mismas obras, usuarios, visitas, fotos y documentos.
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
}

const CLOUD_CONFIG_STORAGE_KEY = 'geobras_cloud_sync_config_v1';
const CLOUD_SYNC_DEVICE_ID = typeof window !== 'undefined'
  ? (localStorage.getItem('geobras_device_id') || (() => {
      const id = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      try { localStorage.setItem('geobras_device_id', id); } catch {}
      return id;
    })())
  : 'dev-server';

// Configuración por defecto de sincronización en la nube
export const DEFAULT_CLOUD_CONFIG: CloudSyncConfig = {
  enabled: true,
  endpointUrl: 'https://kvdb.io/4y9y213yLh4mXbQz7T1u8p/',
  channelId: 'obras_central_database',
  apiKey: '',
  lastSyncAt: null,
};

/**
 * Obtiene la configuración de sincronización actual
 */
export function getCloudConfig(): CloudSyncConfig {
  if (typeof window === 'undefined') return DEFAULT_CLOUD_CONFIG;
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CLOUD_CONFIG, ...JSON.parse(raw) };
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
 * Sube el estado completo actual a la base de datos en la nube
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

  try {
    const url = `${config.endpointUrl.replace(/\/$/, '')}/${config.channelId}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      config.lastSyncAt = new Date().toISOString();
      saveCloudConfig(config);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[cloudSync] Error al enviar cambios a la nube:', err);
    return false;
  }
}

/**
 * Descarga el estado más reciente desde la base de datos en la nube
 */
export async function pullFromCloud(): Promise<CloudPayload | null> {
  const config = getCloudConfig();
  if (!config.enabled || !config.endpointUrl) return null;

  try {
    const url = `${config.endpointUrl.replace(/\/$/, '')}/${config.channelId}?t=${Date.now()}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' });
    if (!res.ok) return null;

    const data: CloudPayload = await res.json();
    if (data && Array.isArray(data.obras) && Array.isArray(data.userRegistry)) {
      config.lastSyncAt = new Date().toISOString();
      saveCloudConfig(config);
      return data;
    }
    return null;
  } catch (err) {
    console.warn('[cloudSync] Error al consultar datos en la nube:', err);
    return null;
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
