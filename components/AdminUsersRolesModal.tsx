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
  UserX, 
  Eye, 
  EyeOff, 
  Sliders, 
  Lock, 
  FileSpreadsheet, 
  Trash2, 
  FileText 
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

  const rolesList: { id: UserRole; name: string; badgeColor: string }[] = [
    { id: 'ADMIN', name: 'Administrador', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'JEFE_OBRA', name: 'Jefe de Obra', badgeColor: 'bg-sky-100 text-sky-800 border-sky-200' },
    { id: 'TECNICO_CAMPO', name: 'Técnico de Campo', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'CONSULTOR_EXTERNO', name: 'Consultor Externo', badgeColor: 'bg-slate-100 text-slate-800 border-slate-200' },
  ];

  const permisosDefinicion: { key: keyof PermisosRol; label: string; desc: string; icon: any }[] = [
    { 
      key: 'verDatosEconomicos', 
      label: 'Visibilidad Económica Completa', 
      desc: 'Acceso a presupuestos de obra, certificados y facturas de proveedores',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Cabecera del Panel */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Dashboard de Usuarios, Roles y Visibilidad</h3>
              <p className="text-[11px] text-slate-400">
                Gestiona compañeros, asigna rangos y configura qué puede ver cada perfil
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div className="px-6 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'usuarios'
                  ? 'border-sky-600 text-sky-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Equipo de Usuarios ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('permisos')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'permisos'
                  ? 'border-sky-600 text-sky-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Matriz de Visibilidad y Permisos por Rol</span>
            </button>
          </div>

          {activeTab === 'usuarios' && (
            <button
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Compañero</span>
            </button>
          )}
        </div>

        {/* Contenido del Panel */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
          
          {/* ==================================================== */}
          {/* PESTAÑA 1: GESTIÓN DE USUARIOS Y ASIGNACIÓN DE ROLES */}
          {/* ==================================================== */}
          {activeTab === 'usuarios' && (
            <div className="space-y-4">
              
              {/* Formulario desplegable para dar de alta nuevo usuario */}
              {showAddUserForm && (
                <form
                  onSubmit={handleCreateUserSubmit}
                  className="bg-white p-4 rounded-xl border border-sky-300 shadow-sm space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-sky-600" /> Registrar Nuevo Usuario en el Equipo
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Ej: Raúl Navarro (Ingeniero)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Rango / Rol Asignado</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
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
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg"
                    >
                      Guardar y Asignar Rol
                    </button>
                  </div>
                </form>
              )}

              {/* Listado de Usuarios */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
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
            <div className="space-y-4">
              
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start gap-2.5">
                <Sliders className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Control Granular en Vivo:</strong> Marca o desmarca las casillas para conceder o revocar permisos a cada rol. Cualquier cambio se aplica <strong>en tiempo real</strong> en toda la aplicación (ocultando importes, menús, botones de borrado o formularios de visita).
                </p>
              </div>

              {/* Tabla Matriz */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
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

        {/* Pie */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Los cambios se guardan y aplican instantáneamente en la interfaz.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors"
          >
            Listo / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
