'use client';

import React, { useState } from 'react';
import { User, UserRole, PermisosRol } from '@/types';
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
  ChevronDown
} from 'lucide-react';

interface AdminUsersRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  permisosRoles: Record<UserRole, PermisosRol>;
  onTogglePermiso: (role: UserRole, permisoKey: keyof PermisosRol) => void;
}

export const AdminUsersRolesModal: React.FC<AdminUsersRolesModalProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateUserRole,
  onAddUser,
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

  if (!isOpen) return null;

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const initials = newUserName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    onAddUser({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      avatar: initials || 'US',
    });

    setNewUserName('');
    setNewUserEmail('');
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
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">Usuarios, Roles y Permisos</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Administración de equipo y control de acceso RBAC
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
              <span>Equipo ({users.length})</span>
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
              <span>Permisos por Rol</span>
            </button>
          </div>

          {activeTab === 'usuarios' && (
            <button
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] sm:text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Añadir Compañero</span>
              <span className="xs:hidden sm:hidden">Añadir</span>
            </button>
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
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-sky-300 shadow-sm space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-sky-600" /> Registrar Nuevo Usuario en el Equipo
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Ej: Raúl Navarro (Ingeniero)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="raul.navarro@empresa.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Rango / Rol Asignado</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="TECNICO_CAMPO">🔍 Técnico de Campo (Sin $)</option>
                        <option value="JEFE_OBRA">👷 Jefe de Obra</option>
                        <option value="ADMIN">👑 Administrador</option>
                        <option value="CONSULTOR_EXTERNO">📊 Consultor Externo</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddUserForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl"
                    >
                      Guardar y Asignar Rol
                    </button>
                  </div>
                </form>
              )}

              {/* VISTA MÓVIL: TARJETAS RESPONSIVE DE USUARIOS (< sm) */}
              <div className="sm:hidden space-y-2.5">
                {users.map((u) => {
                  const rolPerm = permisosRoles[u.role];
                  return (
                    <div
                      key={u.id}
                      className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
                    >
                      {/* Cabecera del usuario */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {u.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs truncate">{u.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">{u.email}</div>
                          </div>
                        </div>

                        {/* Estado económico */}
                        <div className="shrink-0">
                          {rolPerm.verDatosEconomicos ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Eye className="w-2.5 h-2.5" /> Con $
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <EyeOff className="w-2.5 h-2.5" /> Sin $
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Selector de Rol táctil de ancho completo */}
                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          Modificar Rol / Rango de este usuario:
                        </label>
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
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VISTA ESCRITORIO: TABLA COMPLETA (>= sm) */}
              <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-4">Usuario</th>
                      <th className="py-2.5 px-4">Correo</th>
                      <th className="py-2.5 px-4">Rango / Rol Activo</th>
                      <th className="py-2.5 px-4">Acceso a Datos Económicos</th>
                      <th className="py-2.5 px-4 text-right">Asignar Nuevo Rol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const rolPerm = permisosRoles[u.role];
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                              {u.avatar}
                            </div>
                            <span>{u.name}</span>
                          </td>

                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                              u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              u.role === 'JEFE_OBRA' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                              u.role === 'TECNICO_CAMPO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {rolPerm.verDatosEconomicos ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> Visible
                              </span>
                            ) : (
                              <span className="text-amber-600 font-semibold flex items-center gap-1">
                                <EyeOff className="w-3.5 h-3.5" /> Oculto (Confidencial)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <select
                              value={u.role}
                              onChange={(e) => onUpdateUserRole(u.id, e.target.value as UserRole)}
                              className="text-xs bg-slate-50 border border-slate-300 rounded-lg py-1 px-2 font-medium focus:ring-1 focus:ring-sky-500 cursor-pointer"
                              title="Cambia el rol del usuario para alterar sus permisos al instante"
                            >
                              <option value="ADMIN">Administrador</option>
                              <option value="JEFE_OBRA">Jefe de Obra</option>
                              <option value="TECNICO_CAMPO">Técnico de Campo</option>
                              <option value="CONSULTOR_EXTERNO">Consultor Externo</option>
                            </select>
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
