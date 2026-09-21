import { UserRegistryRecord, UserRole, PermisosRol, User } from '@/types';
import { PERMISOS_POR_ROL } from '@/data/mockData';

export const REGISTRO_USUARIOS_STORAGE_KEY = 'geobras_registro_usuarios_db';
const LEGACY_STORAGE_KEY_V2 = 'geobras_users_list_v2';
const LEGACY_STORAGE_KEY_V1 = 'geobras_users_list';

// Registro inicial del Administrador Principal
export const REGISTRO_ADMIN_DEFECTO: UserRegistryRecord = {
  id: 'usr-1',
  name: 'David Pérez',
  email: 'david.perez@empresa.com',
  password: 'admin123',
  role: 'ADMIN',
  avatar: 'DP',
  activo: true,
  bloqueado: false,
  intentosFallidos: 0,
  permisos: { ...PERMISOS_POR_ROL.ADMIN },
  fechaRegistro: '2026-01-01T08:00:00.000Z',
  ultimoAcceso: null,
  registradoPor: 'Sistema Central GEOBRAS',
  notasSeguridad: 'Administrador principal del sistema (Protegido)',
};

/**
 * Valida y sanea un array de registros asegurando integridad de datos,
 * formato de correo único y al menos un Administrador activo.
 */
export function sanitizeRegistryRecords(raw: any[]): UserRegistryRecord[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [REGISTRO_ADMIN_DEFECTO];
  }

  const result: UserRegistryRecord[] = [];
  const seenEmails = new Set<string>();
  const seenIds = new Set<string>();

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;

    const email = (item.email || '').trim().toLowerCase();
    const id = (item.id || '').trim();

    if (!email || !email.includes('@') || seenEmails.has(email)) continue;
    if (!id || seenIds.has(id)) continue;

    seenEmails.add(email);
    seenIds.add(id);

    const name = (item.name || '').trim() || 'Usuario';
    const role: UserRole = (item.role as UserRole) || 'TECNICO_CAMPO';
    const basePermisos = PERMISOS_POR_ROL[role] || PERMISOS_POR_ROL.CONSULTOR_EXTERNO;

    const initials = (item.avatar || '').trim() || (
      name
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'US'
    );

    // Permisos combinados respetando configuraciones personalizadas del administrador
    const itemPermisos: PermisosRol = item.permisos && typeof item.permisos === 'object'
      ? { ...basePermisos, ...item.permisos }
      : { ...basePermisos };

    result.push({
      id,
      name,
      email,
      password: (item.password || '').trim() || '1234',
      role,
      avatar: initials,
      activo: item.activo !== false, // Activo por defecto a menos que se indique false
      bloqueado: Boolean(item.bloqueado),
      intentosFallidos: Number(item.intentosFallidos) || 0,
      permisos: itemPermisos,
      fechaRegistro: item.fechaRegistro || new Date().toISOString(),
      ultimoAcceso: item.ultimoAcceso || null,
      registradoPor: item.registradoPor || 'Administrador',
      notasSeguridad: item.notasSeguridad || '',
    });
  }

  if (result.length === 0) {
    return [REGISTRO_ADMIN_DEFECTO];
  }

  // Garantizar que siempre haya al menos 1 Administrador activo para evitar bloqueo del sistema
  const hasActiveAdmin = result.some((r) => r.role === 'ADMIN' && r.activo && !r.bloqueado);
  if (!hasActiveAdmin) {
    const adminIdx = result.findIndex((r) => r.role === 'ADMIN');
    if (adminIdx >= 0) {
      result[adminIdx].activo = true;
      result[adminIdx].bloqueado = false;
    } else {
      result[0].role = 'ADMIN';
      result[0].activo = true;
      result[0].bloqueado = false;
      result[0].permisos = { ...PERMISOS_POR_ROL.ADMIN };
    }
  }

  return result;
}

/**
 * Lee la tabla oficial de registros de usuarios de forma síncrona.
 * Incluye migración automática desde versiones previas si procede.
 */
export function getUserRegistry(): UserRegistryRecord[] {
  if (typeof window === 'undefined') {
    return [REGISTRO_ADMIN_DEFECTO];
  }

  try {
    // 1. Clave oficial de la tabla de registros
    const raw = localStorage.getItem(REGISTRO_USUARIOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeRegistryRecords(parsed);
      }
    }

    // 2. Migración desde clave v2 o v1 si no existe la tabla
    const rawV2 = localStorage.getItem(LEGACY_STORAGE_KEY_V2) || localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (rawV2) {
      const parsedLegacy = JSON.parse(rawV2);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        const migrated: UserRegistryRecord[] = parsedLegacy.map((u: User) => ({
          id: u.id || `usr-${Date.now()}`,
          name: u.name || 'Usuario',
          email: u.email.trim().toLowerCase(),
          password: u.password || '1234',
          role: u.role || 'TECNICO_CAMPO',
          avatar: u.avatar || 'US',
          activo: true,
          bloqueado: false,
          intentosFallidos: 0,
          permisos: { ...(PERMISOS_POR_ROL[u.role] || PERMISOS_POR_ROL.CONSULTOR_EXTERNO) },
          fechaRegistro: new Date().toISOString(),
          ultimoAcceso: null,
          registradoPor: 'Migración del Sistema',
        }));
        const sanitized = sanitizeRegistryRecords(migrated);
        saveUserRegistry(sanitized);
        return sanitized;
      }
    }

    // 3. Inicialización limpia con registro maestro predeterminado
    const defaultRegistry = [REGISTRO_ADMIN_DEFECTO];
    saveUserRegistry(defaultRegistry);
    return defaultRegistry;
  } catch (err) {
    console.error('Error cargando la tabla de registros de usuarios:', err);
    return [REGISTRO_ADMIN_DEFECTO];
  }
}

/**
 * Guarda de forma síncrona e inmediata la tabla de registros en el almacenamiento local.
 */
export function saveUserRegistry(records: UserRegistryRecord[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const sanitized = sanitizeRegistryRecords(records);
    const serialized = JSON.stringify(sanitized);
    
    // Guardar en la tabla maestra
    localStorage.setItem(REGISTRO_USUARIOS_STORAGE_KEY, serialized);

    // Sincronizar simultáneamente con el formato de usuario estándar para compatibilidad total
    const simpleUsers: User[] = sanitized.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      avatar: r.avatar,
      password: r.password,
      requiresPassword: true,
      activo: r.activo,
      bloqueado: r.bloqueado,
      permisos: r.permisos,
      ultimoAcceso: r.ultimoAcceso,
      fechaRegistro: r.fechaRegistro,
    }));
    const simpleSerialized = JSON.stringify(simpleUsers);
    localStorage.setItem(LEGACY_STORAGE_KEY_V2, simpleSerialized);
    localStorage.setItem(LEGACY_STORAGE_KEY_V1, simpleSerialized);

    return true;
  } catch (err) {
    console.error('Error guardando la tabla de registros:', err);
    return false;
  }
}

export interface VerificationResult {
  success: boolean;
  user?: UserRegistryRecord;
  error?: string;
}

/**
 * Verificación estricta de credenciales contra la Tabla de Registros de Usuarios.
 * En caso de diferencias o incumplimiento de condiciones, deniega el acceso.
 */
export function verifyUserLogin(emailInput: string, passwordInput: string): VerificationResult {
  const cleanEmail = (emailInput || '').trim().toLowerCase();
  const cleanPassword = (passwordInput || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return {
      success: false,
      error: 'Debe introducir su correo electrónico y contraseña.',
    };
  }

  // 1. Obtener la tabla oficial y fresca de registros
  const registry = getUserRegistry();

  // 2. Buscar al usuario en la tabla de registros
  const targetIndex = registry.findIndex((r) => r.email.toLowerCase() === cleanEmail);

  if (targetIndex === -1) {
    return {
      success: false,
      error: 'Credenciales de acceso incorrectas. Usuario no registrado.',
    };
  }

  const targetUser = registry[targetIndex];

  // 3. Comprobar si el usuario está inactivo o bloqueado
  if (!targetUser.activo) {
    return {
      success: false,
      error: 'Cuenta desactivada por la administración. Acceso denegado.',
    };
  }

  if (targetUser.bloqueado) {
    return {
      success: false,
      error: 'Cuenta bloqueada por motivos de seguridad. Contacte con el Administrador.',
    };
  }

  // 4. Verificación estricta de contraseña
  if (targetUser.password !== cleanPassword) {
    // Incrementar intentos fallidos
    targetUser.intentosFallidos = (targetUser.intentosFallidos || 0) + 1;
    if (targetUser.intentosFallidos >= 5) {
      targetUser.bloqueado = true;
      targetUser.notasSeguridad = `Bloqueado automáticamente tras ${targetUser.intentosFallidos} intentos fallidos el ${new Date().toLocaleString('es-ES')}`;
    }
    registry[targetIndex] = targetUser;
    saveUserRegistry(registry);

    if (targetUser.bloqueado) {
      return {
        success: false,
        error: 'Demasiados intentos fallidos. Su cuenta ha sido bloqueada por seguridad.',
      };
    }

    return {
      success: false,
      error: 'Credenciales de acceso incorrectas.',
    };
  }

  // 5. Autenticación exitosa: reiniciar intentos y actualizar último acceso
  targetUser.intentosFallidos = 0;
  targetUser.ultimoAcceso = new Date().toISOString();
  registry[targetIndex] = targetUser;
  saveUserRegistry(registry);

  return {
    success: true,
    user: targetUser,
  };
}

/**
 * Exporta la tabla de registros a formato CSV para auditoría de seguridad
 */
export function exportRegistryToCSV(records: UserRegistryRecord[]): string {
  const headers = [
    'ID',
    'Nombre',
    'Correo Electrónico',
    'Rol',
    'Estado',
    'Bloqueado',
    'Fecha Registro',
    'Último Acceso',
    'Registrado Por',
    'Permiso Datos Económicos',
    'Permiso Editar Obras',
    'Permiso Borrar Obras',
    'Permiso Crear Visitas',
    'Permiso Subir Documentos',
    'Permiso Papelera',
    'Permiso Exportar Dossier',
    'Permiso Exportar Excel',
  ];

  const rows = records.map((r) => [
    `"${r.id}"`,
    `"${r.name.replace(/"/g, '""')}"`,
    `"${r.email}"`,
    `"${r.role}"`,
    r.activo ? '"ACTIVO"' : '"INACTIVO"',
    r.bloqueado ? '"SÍ"' : '"NO"',
    `"${r.fechaRegistro}"`,
    r.ultimoAcceso ? `"${r.ultimoAcceso}"` : '"NUNCA"',
    `"${r.registradoPor || 'Admin'}"`,
    r.permisos.verDatosEconomicos ? 'SÍ' : 'NO',
    r.permisos.editarObras ? 'SÍ' : 'NO',
    r.permisos.borrarObras ? 'SÍ' : 'NO',
    r.permisos.crearVisitas ? 'SÍ' : 'NO',
    r.permisos.subirDocumentos ? 'SÍ' : 'NO',
    r.permisos.accederPapelera ? 'SÍ' : 'NO',
    r.permisos.exportarDossier ? 'SÍ' : 'NO',
    r.permisos.exportarExcel ? 'SÍ' : 'NO',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
}
