'use client';

import React, { useState } from 'react';
import { User, UserRole, PermisosRol, UserRegistryRecord } from '@/types';
import { PERMISOS_POR_ROL } from '@/data/mockData';
import { formatDateTime, formatDate, downloadFile } from '@/lib/utils';
import { exportRegistryToCSV, getUserRegistry } from '@/lib/userRegistry';
import { 
  Users, 
  Shield, 
  Plus, 
  Check, 
  X, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Sliders, 
  Trash2, 
  FileSpreadsheet, 
  FileText,
  ChevronDown,
  Edit2,
  KeyRound,
  Lock,
  Unlock,
  AlertTriangle,
  Download
} from 'lucide-react';

interface AdminUsersRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  onEditUser?: (updatedUser: User) => void;
  onDeleteUser?: (userId: string) => void;
  onToggleUserStatus?: (userId: string, statusType: 'activo' | 'bloqueado') => void;
  permisosRoles: Record<UserRole, PermisosRol>;
  onTogglePermiso: (role: UserRole, permisoKey: keyof PermisosRol) => void;
}

export const AdminUsersRolesModal: React.FC<AdminUsersRolesModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateUserRole,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onToggleUserStatus,
  permisosRoles,
  onTogglePermiso,
}) => {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'permisos'>('usuarios');
  
  // Para la vista móvil de permisos: rol actualmente seleccionado
  const [selectedMobileRole, setSelectedMobileRole] = useState<UserRole>('ADMIN');

  // Estado para nuevo usuario
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('TECNICO_CAMPO');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPermisos, setNewUserPermisos] = useState<PermisosRol>({ ...PERMISOS_POR_ROL.TECNICO_CAMPO });
  const [formError, setFormError] = useState('');

  // Estado para editar usuario
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('TECNICO_CAMPO');
  const [editActivo, setEditActivo] = useState(true);
  const [editBloqueado, setEditBloqueado] = useState(false);
  const [editPermisos, setEditPermisos] = useState<PermisosRol>({ ...PERMISOS_POR_ROL.TECNICO_CAMPO });
  const [editError, setEditError] = useState('');

  const handleExportRegistryCSV = () => {
    const records = getUserRegistry();
    const csvContent = exportRegistryToCSV(records);
    downloadFile(
      `Auditoria_Registro_Usuarios_${new Date().toISOString().split('T')[0]}.csv`,
      csvContent,
      'text/csv;charset=utf-8'
    );
  };

  const handleStartEdit = (u: User) => {
    setEditingUserId(u.id);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword(u.password || '');
    setEditRole(u.role);
    setEditActivo(u.activo !== false);
    setEditBloqueado(Boolean(u.bloqueado));
    setEditPermisos(u.permisos ? { ...u.permisos } : { ...permisosRoles[u.role] });
    setEditError('');
    setShowAddUserForm(false);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editingUserId || !onEditUser) return;

    const trimmedName = editName.trim();
    const cleanEmail = editEmail.trim().toLowerCase();
    const cleanPass = editPassword.trim();

    if (!trimmedName) {
      setEditError('El nombre no puede estar vacío.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setEditError('Introduce un correo electrónico válido.');
      return;
    }
    if (!cleanPass || cleanPass.length < 3) {
      setEditError('La contraseña debe tener al menos 3 caracteres.');
      return;
    }

    const emailConflict = users.some(
      (u) => u.id !== editingUserId && u.email.toLowerCase() === cleanEmail
    );
    if (emailConflict) {
      setEditError(`El correo "${cleanEmail}" ya está asignado a otro usuario.`);
      return;
    }

    const target = users.find((u) => u.id === editingUserId);
    if (!target) return;

    onEditUser({
      ...target,
      name: trimmedName,
      email: cleanEmail,
      password: cleanPass,
      role: editRole,
      avatar: trimmedName.length >= 2 ? trimmedName.slice(0, 2).toUpperCase() : 'US',
      activo: editActivo,
      bloqueado: editBloqueado,
      permisos: editPermisos,
    });

    setEditingUserId(null);
  };

  if (!isOpen) return null;

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = newUserName.trim();
    const cleanEmail = newUserEmail.trim().toLowerCase();
    const cleanPass = newUserPassword.trim();

    if (!trimmedName) {
      setFormError('Introduce el nombre completo del usuario.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError('Introduce un correo electrónico válido.');
      return;
    }

    if (!cleanPass) {
      setFormError('Los nuevos usuarios deben tener una contraseña de acceso asignada.');
      return;
    }

    if (cleanPass.length < 3) {
      setFormError('La contraseña debe tener un mínimo de 3 caracteres.');
      return;
    }

    // Comprobación estricta de correo duplicado
    const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      setFormError(`Ya existe un usuario con el correo "${cleanEmail}". Cada compañero debe tener una dirección única.`);
      return;
    }

    const initials = trimmedName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';

    onAddUser({
      name: trimmedName,
      email: cleanEmail,
      role: newUserRole,
      avatar: initials,
      password: cleanPass,
      requiresPassword: true,
      activo: true,
      bloqueado: false,
      permisos: newUserPermisos,
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserPermisos({ ...permisosRoles.TECNICO_CAMPO });
    setFormError('');
    setShowAddUserForm(false);
  };

  const rolesList: { id: UserRole; name: string; shortName: string; badgeColor: string; emoji: string }[] = [
    { id: 'ADMIN', name: 'Administrador', shortName: 'Admin', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200', emoji: '👑' },
    { id: 'JEFE_OBRA', name: 'Jefe de Obra', shortName: 'Jefe Obra', badgeColor: 'bg-sky-100 text-sky-800 border-sky-200', emoji: '👷' },
    { id: 'TECNICO_CAMPO', name: 'Técnico de Campo', shortName: 'Técnico', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200', emoji: '🔍' },
    { id: 'CONSULTOR_EXTERNO', name: 'Consultor Externo', shortName: 'Consultor', badgeColor: 'bg-slate-100 text-slate-800 border-slate-200', emoji: '📊' },
  ];

  const permisosDefinicion: { key: keyof PermisosRol; label: string; desc: string; icon: any }[] = [
    { 
      key: 'verDatosEconomicos', 
      label: 'Visibilidad Económica Completa', 
      desc: 'Acceso a presupuestos de obra, importes ejecutados y facturación',
      icon: Eye
    },
    { 
      key: 'editarObras', 
      label: 'Creación y Edición de Obras', 
      desc: 'Alta de nuevos expedientes, modificación de plazos y porcentajes',
      icon: Sliders
    },
    { 
      key: 'borrarObras', 
      label: 'Borrado a Papelera (Soft-delete)', 
      desc: 'Capacidad de enviar obras y expedientes a la papelera',
      icon: Trash2
    },
    { 
      key: 'crearVisitas', 
      label: 'Registro de Visitas a Pie de Obra', 
      desc: 'Completar checklists in situ, capturar GPS y redactar reportes',
      icon: UserCheck
    },
    { 
      key: 'subirDocumentos', 
      label: 'Subida de Documentos y Fotos', 
      desc: 'Adjuntar facturas, planos, contratos y fotos geolocalizadas',
      icon: Plus
    },
    { 
      key: 'accederPapelera', 
      label: 'Acceso a Papelera y Restauración', 
      desc: 'Supervisar elementos eliminados y recuperarlos en 1 clic',
      icon: Shield
    },
    { 
      key: 'exportarDossier', 
      label: 'Exportación de Dossier (.md y PDF)', 
      desc: 'Generar informes oficiales de expediente con firmas',
      icon: FileText
    },
    { 
      key: 'exportarExcel', 
      label: 'Exportación de BD a Excel/CSV', 
      desc: 'Descarga masiva de tablas de datos tabulares',
      icon: FileSpreadsheet
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs sm:p-4 overflow-y-auto">
      <div className="bg-white sm:rounded-2xl shadow-2xl border border-slate-200 w-full sm:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Cabecera del Panel */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-600/30 shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">Tabla de Registros y Permisos de Usuarios</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Gestión oficial de identidades, control de acceso y verificación de credenciales
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div className="px-3 sm:px-6 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'usuarios'
                  ? 'border-sky-600 text-sky-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Tabla de Registros ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('permisos')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'permisos'
                  ? 'border-sky-600 text-sky-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Matriz por Rol</span>
            </button>
          </div>

          {activeTab === 'usuarios' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportRegistryCSV}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] sm:text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
                title="Descargar tabla oficial de usuarios en CSV para auditoría"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Auditoría CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>

              <button
                onClick={() => setShowAddUserForm(!showAddUserForm)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] sm:text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Nuevo Registro</span>
                <span className="xs:hidden sm:hidden">+ Nuevo</span>
              </button>
            </div>
          )}
        </div>

        {/* Contenido del Panel */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
          
          {/* ==================================================== */}
          {/* PESTAÑA 1: GESTIÓN DE USUARIOS Y ASIGNACIÓN DE ROLES */}
          {/* ==================================================== */}
          {activeTab === 'usuarios' && (
            <div className="space-y-3">
              
              {/* Formulario desplegable para dar de alta nuevo usuario */}
              {showAddUserForm && (
                <form
                  onSubmit={handleCreateUserSubmit}
                  autoComplete="off"
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-sky-300 shadow-sm space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-sky-600" /> Registrar Nuevo Usuario en el Equipo
                  </h4>

                  {formError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <span className="font-bold">⚠️ Error:</span>
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Nombre y apellidos"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                        required
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="correo@empresa.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                        required
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Contraseña Obligatoria *</label>
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Contraseña de acceso"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                        required
                        autoComplete="new-password"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Rango / Rol Asignado *</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => {
                          const r = e.target.value as UserRole;
                          setNewUserRole(r);
                          setNewUserPermisos({ ...permisosRoles[r] });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="TECNICO_CAMPO">🔍 Técnico de Campo (Sin $)</option>
                        <option value="JEFE_OBRA">👷 Jefe de Obra</option>
                        <option value="ADMIN">👑 Administrador</option>
                        <option value="CONSULTOR_EXTERNO">📊 Consultor Externo</option>
                      </select>
                    </div>
                  </div>

                  {/* Configuración granular de permisos para este registro */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-sky-600" /> Permisos Individuales Concedidos:
                      </span>
                      <span className="text-[10px] text-slate-400">Personaliza los accesos de este registro</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {permisosDefinicion.map((p) => (
                        <label key={p.key} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(newUserPermisos[p.key])}
                            onChange={(e) => setNewUserPermisos((prev) => ({ ...prev, [p.key]: e.target.checked }))}
                            className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                          />
                          <span className="truncate">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddUserForm(false);
                        setFormError('');
                      }}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Guardar y Crear Registro
                    </button>
                  </div>
                </form>
              )}

              {/* Formulario desplegable para EDITAR usuario existente */}
              {editingUserId && (
                <form
                  onSubmit={handleSaveEdit}
                  autoComplete="off"
                  className="bg-sky-50/80 p-3.5 sm:p-4 rounded-2xl border-2 border-sky-400 shadow-md space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                      <Edit2 className="w-4 h-4 text-sky-600" /> Modificar Datos, Contraseña y Permisos del Usuario
                    </h4>
                    <span className="text-[10px] bg-sky-200/80 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                      Editando registro
                    </span>
                  </div>

                  {editError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <span className="font-bold">⚠️ Error:</span>
                      <span>{editError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nombre y apellidos"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                        required
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="correo@empresa.com"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                        required
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nueva Contraseña *</label>
                      <input
                        type="text"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Nueva contraseña"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                        required
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Rango / Rol Asignado *</label>
                      <select
                        value={editRole}
                        onChange={(e) => {
                          const r = e.target.value as UserRole;
                          setEditRole(r);
                          setEditPermisos({ ...permisosRoles[r] });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="ADMIN">👑 Administrador (Acceso Total)</option>
                        <option value="JEFE_OBRA">👷 Jefe de Obra</option>
                        <option value="TECNICO_CAMPO">🔍 Técnico de Campo (Sin $)</option>
                        <option value="CONSULTOR_EXTERNO">📊 Consultor Externo</option>
                      </select>
                    </div>
                  </div>

                  {/* Estado y Bloqueo de Acceso */}
                  <div className="pt-2 border-t border-sky-200 space-y-2">
                    <div className="flex flex-wrap items-center gap-4 bg-white/90 p-2.5 rounded-xl border border-sky-200 text-xs">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editActivo}
                          onChange={(e) => setEditActivo(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                        <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Cuenta Activa (Permite Iniciar Sesión)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 font-bold text-rose-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editBloqueado}
                          onChange={(e) => setEditBloqueado(e.target.checked)}
                          className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                        />
                        <span className="flex items-center gap-1 text-rose-800 font-semibold">
                          <Lock className="w-3.5 h-3.5 text-rose-600" /> Bloqueo de Seguridad (Acceso Denegado)
                        </span>
                      </label>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-800 block mb-1">
                        Permisos Granulares Individuales para este Registro:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/90 p-2.5 rounded-xl border border-sky-200">
                        {permisosDefinicion.map((p) => (
                          <label key={p.key} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(editPermisos[p.key])}
                              onChange={(e) => setEditPermisos((prev) => ({ ...prev, [p.key]: e.target.checked }))}
                              className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                            />
                            <span className="truncate">{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-sky-200">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-xl font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Guardar Modificaciones
                    </button>
                  </div>
                </form>
              )}

              {/* VISTA MÓVIL: TARJETAS RESPONSIVE DE REGISTROS DE USUARIOS (< sm) */}
              <div className="sm:hidden space-y-2.5">
                {users.map((u) => {
                  const rolPerm = permisosRoles[u.role];
                  const userPerms = u.permisos || rolPerm;
                  const adminCount = users.filter((x) => x.role === 'ADMIN' && x.activo !== false && !x.bloqueado).length;
                  const isProtectedAdmin = u.role === 'ADMIN' && adminCount <= 1;
                  const canDelete = onDeleteUser && (!isProtectedAdmin);
                  const isBlocked = Boolean(u.bloqueado);
                  const isActive = u.activo !== false && !isBlocked;

                  const activePermsCount = [
                    userPerms.verDatosEconomicos,
                    userPerms.editarObras,
                    userPerms.borrarObras,
                    userPerms.crearVisitas,
                    userPerms.subirDocumentos,
                    userPerms.accederPapelera,
                    userPerms.exportarDossier,
                    userPerms.exportarExcel,
                  ].filter(Boolean).length;

                  return (
                    <div
                      key={u.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                    >
                      {/* Cabecera del usuario */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {u.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.role === 'ADMIN' && (
                                <span className="text-[10px]" title="Administrador">👑</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">{u.email}</div>
                          </div>
                        </div>

                        {/* Estado de seguridad */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isBlocked ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 border border-rose-200">
                              <Lock className="w-2.5 h-2.5" /> Bloqueado
                            </span>
                          ) : isActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                              <Check className="w-2.5 h-2.5" /> Activo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                              <X className="w-2.5 h-2.5" /> Inactivo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detalles de permisos y accesos */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Permisos asignados:</span>
                          <span className="font-bold text-slate-800">{activePermsCount} de 8 concedidos</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            userPerms.verDatosEconomicos ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {userPerms.verDatosEconomicos ? '€ Datos Financieros' : 'Sin Datos $'}
                          </span>
                          {userPerms.editarObras && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9px] text-slate-700">Edición</span>}
                          {userPerms.borrarObras && <span className="bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded text-[9px]">Borrado</span>}
                          {userPerms.subirDocumentos && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9px] text-slate-700">Docs/Fotos</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                          <span>Último acceso:</span>
                          <span className="font-mono text-slate-700 font-medium">
                            {u.ultimoAcceso ? formatDateTime(u.ultimoAcceso) : 'Sin accesos'}
                          </span>
                        </div>
                      </div>

                      {/* Selector de Rol táctil y acciones */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-slate-500">
                            Rol del usuario:
                          </label>
                          <div className="flex items-center gap-2">
                            {onToggleUserStatus && !isProtectedAdmin && (
                              <button
                                type="button"
                                onClick={() => onToggleUserStatus(u.id, isBlocked ? 'bloqueado' : 'activo')}
                                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline"
                              >
                                {isBlocked ? 'Desbloquear' : isActive ? 'Desactivar' : 'Activar'}
                              </button>
                            )}
                            {onEditUser && (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(u)}
                                className="text-[11px] text-sky-600 font-bold flex items-center gap-1 hover:underline"
                              >
                                <Edit2 className="w-3 h-3" /> Editar
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="relative">
                          <select
                            value={u.role}
                            onChange={(e) => onUpdateUserRole(u.id, e.target.value as UserRole)}
                            className="w-full text-xs font-bold py-2 pl-3 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
                          >
                            <option value="ADMIN">👑 Administrador (Acceso Total)</option>
                            <option value="JEFE_OBRA">👷 Jefe de Obra (Gestión Integral)</option>
                            <option value="TECNICO_CAMPO">🔍 Técnico de Campo (Sin Datos Financieros)</option>
                            <option value="CONSULTOR_EXTERNO">📊 Consultor Externo (Lectura)</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                        </div>

                        {canDelete && (
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`¿Deseas dar de baja y eliminar al usuario ${u.name}?`)) {
                                  onDeleteUser?.(u.id);
                                }
                              }}
                              className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 hover:underline p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Dar de baja usuario
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VISTA ESCRITORIO: TABLA COMPLETA DE REGISTROS (>= sm) */}
              <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Usuario</th>
                      <th className="py-2.5 px-3">Correo</th>
                      <th className="py-2.5 px-3">Rol</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Permisos</th>
                      <th className="py-2.5 px-3">Último Acceso / Alta</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const rolPerm = permisosRoles[u.role];
                      const userPerms = u.permisos || rolPerm;
                      const adminCount = users.filter((x) => x.role === 'ADMIN' && x.activo !== false && !x.bloqueado).length;
                      const isProtectedAdmin = u.role === 'ADMIN' && adminCount <= 1;
                      const canDelete = onDeleteUser && (!isProtectedAdmin);
                      const isBlocked = Boolean(u.bloqueado);
                      const isActive = u.activo !== false && !isBlocked;

                      const activePermsCount = [
                        userPerms.verDatosEconomicos,
                        userPerms.editarObras,
                        userPerms.borrarObras,
                        userPerms.crearVisitas,
                        userPerms.subirDocumentos,
                        userPerms.accederPapelera,
                        userPerms.exportarDossier,
                        userPerms.exportarExcel,
                      ].filter(Boolean).length;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Columna Usuario */}
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                {u.avatar}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate flex items-center gap-1">
                                  <span>{u.name}</span>
                                  {u.role === 'ADMIN' && (
                                    <span className="text-[11px]" title="Administrador">👑</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Columna Correo */}
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{u.email}</td>

                          {/* Columna Rol */}
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                              u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              u.role === 'JEFE_OBRA' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                              u.role === 'TECNICO_CAMPO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>

                          {/* Columna Estado */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              {isBlocked ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 border border-rose-200">
                                  <Lock className="w-3 h-3 text-rose-600" /> Bloqueado
                                </span>
                              ) : isActive ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" /> Activo
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 flex items-center gap-1 border border-slate-200">
                                  <X className="w-3 h-3 text-slate-500" /> Inactivo
                                </span>
                              )}

                              {onToggleUserStatus && !isProtectedAdmin && (
                                <button
                                  type="button"
                                  onClick={() => onToggleUserStatus(u.id, isBlocked ? 'bloqueado' : 'activo')}
                                  className="text-[10px] text-slate-400 hover:text-slate-800 p-0.5 rounded hover:bg-slate-200/60"
                                  title={isBlocked ? 'Desbloquear cuenta' : isActive ? 'Desactivar acceso' : 'Activar acceso'}
                                >
                                  {isBlocked ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Sliders className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Columna Permisos */}
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  userPerms.verDatosEconomicos ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {userPerms.verDatosEconomicos ? '€ Datos $' : 'Sin $'}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500">
                                  {activePermsCount}/8 activos
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 text-[9px] text-slate-500">
                                {userPerms.editarObras && <span className="bg-slate-100 px-1 rounded">Edición</span>}
                                {userPerms.borrarObras && <span className="bg-rose-50 text-rose-700 px-1 rounded">Borrar</span>}
                                {userPerms.subirDocumentos && <span className="bg-slate-100 px-1 rounded">Docs/Fotos</span>}
                              </div>
                            </div>
                          </td>

                          {/* Columna Último Acceso / Alta */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5 text-[10px]">
                              <div className="text-slate-800 font-semibold font-mono">
                                {u.ultimoAcceso ? formatDateTime(u.ultimoAcceso) : <span className="text-slate-400 font-sans italic">Sin accesos</span>}
                              </div>
                              <div className="text-slate-400 text-[9px]">
                                Alta: {u.fechaRegistro ? formatDate(u.fechaRegistro) : 'Inicial'}
                              </div>
                            </div>
                          </td>

                          {/* Columna Acciones */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onEditUser && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(u)}
                                  className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-slate-200"
                                  title="Editar nombre, correo, clave o permisos individuales"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <select
                                value={u.role}
                                onChange={(e) => onUpdateUserRole(u.id, e.target.value as UserRole)}
                                className="text-xs bg-slate-50 border border-slate-300 rounded-lg py-1 px-1.5 font-medium focus:ring-1 focus:ring-sky-500 cursor-pointer"
                                title="Cambiar rol predeterminado"
                              >
                                <option value="ADMIN">Administrador</option>
                                <option value="JEFE_OBRA">Jefe de Obra</option>
                                <option value="TECNICO_CAMPO">Técnico de Campo</option>
                                <option value="CONSULTOR_EXTERNO">Consultor Externo</option>
                              </select>

                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`¿Deseas dar de baja y eliminar al usuario ${u.name}?`)) {
                                      onDeleteUser?.(u.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Eliminar usuario del sistema"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 2: MATRIZ DE VISIBILIDAD Y PERMISOS CONFIGURABLE POR ROL */}
          {/* ================================================================= */}
          {activeTab === 'permisos' && (
            <div className="space-y-3">
              
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start gap-2">
                <Sliders className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px] sm:text-xs">
                  <strong>Control Granular en Vivo:</strong> Cualquier casilla activada o desactivada modifica inmediatamente lo que puede ver o hacer ese rol en toda la aplicación.
                </p>
              </div>

              {/* VISTA MÓVIL: SELECTOR DE ROL Y LISTA DE PERMISOS (< sm) */}
              <div className="sm:hidden space-y-3">
                
                {/* Selector de rol con píldoras horizontales táctiles */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedMobileRole(r.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 ${
                        selectedMobileRole === r.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.shortName}</span>
                    </button>
                  ))}
                </div>

                {/* Lista de permisos con conmutador táctil para el rol seleccionado */}
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
                  {permisosDefinicion.map((item) => {
                    const IconComp = item.icon;
                    const isChecked = permisosRoles[selectedMobileRole][item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => onTogglePermiso(selectedMobileRole, item.key)}
                        className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isChecked ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-400'}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <strong className="text-xs font-bold text-slate-900 block leading-tight">{item.label}</strong>
                            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{item.desc}</span>
                          </div>
                        </div>

                        {/* Toggle switch visual táctil */}
                        <div
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                            isChecked ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform flex items-center justify-center ${
                              isChecked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          >
                            {isChecked ? (
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            ) : (
                              <X className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* VISTA ESCRITORIO: TABLA MATRIZ COMPLETA (>= sm) */}
              <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4 w-2/5">Elemento / Permiso de Visibilidad</th>
                      {rolesList.map((r) => (
                        <th key={r.id} className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${r.badgeColor}`}>
                            {r.name}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {permisosDefinicion.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <tr key={item.key} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 mt-0.5">
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block font-semibold">{item.label}</strong>
                                <span className="text-[11px] text-slate-500 leading-tight block">{item.desc}</span>
                              </div>
                            </div>
                          </td>

                          {rolesList.map((r) => {
                            const isChecked = permisosRoles[r.id][item.key];
                            return (
                              <td key={r.id} className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => onTogglePermiso(r.id, item.key)}
                                  className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition-all ${
                                    isChecked
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                      : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                                  }`}
                                  title={`Alternar ${item.label} para ${r.name}`}
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* Pie del Panel */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 shrink-0">
          <span className="hidden sm:inline">Los cambios se guardan y aplican instantáneamente en la interfaz.</span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors text-center"
          >
            Listo / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
