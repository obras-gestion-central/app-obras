'use client';

import React from 'react';
import { UserRole } from '@/types';
import { USUARIOS_MOCK, PERMISOS_POR_ROL } from '@/data/mockData';
import { 
  Building2, 
  MapPin, 
  Trash2, 
  FileSpreadsheet, 
  PlusCircle, 
  Shield, 
  EyeOff, 
  UserCheck,
  Users 
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  deletedCount: number;
  onOpenTrash: () => void;
  onOpenNewObra: () => void;
  onExportExcel: () => void;
  onOpenAdminRoles: () => void;
  activeView: 'mapa' | 'listado';
  setActiveView: (view: 'mapa' | 'listado') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  deletedCount,
  onOpenTrash,
  onOpenNewObra,
  onExportExcel,
  onOpenAdminRoles,
  activeView,
  setActiveView,
}) => {
  const permisos = PERMISOS_POR_ROL[currentRole];
  const currentUser = USUARIOS_MOCK.find((u) => u.role === currentRole) || USUARIOS_MOCK[0];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">GEOBRAS</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full">
                  Gestión Geográfica
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Seguimiento, Visitas, Fotos GPS y Línea Temporal
              </p>
            </div>
          </div>

          {/* Selector de Vistas y Acciones */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Alternador Mapa / Listado */}
            <div className="bg-slate-800 p-1 rounded-lg flex items-center border border-slate-700">
              <button
                onClick={() => setActiveView('mapa')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-smooth ${
                  activeView === 'mapa'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Mapa y Obras</span>
              </button>
            </div>

            {/* Exportar a Excel */}
            {permisos.exportarExcel && (
              <button
                onClick={onExportExcel}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-700/50 hover:bg-emerald-900/60 rounded-lg transition-smooth"
                title="Exportar base de datos a Excel / CSV con filtro de rol"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar Excel</span>
              </button>
            )}

            {/* Papelera de reciclaje (Soft Delete) */}
            {permisos.accederPapelera && (
              <button
                onClick={onOpenTrash}
                className="relative p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg border border-slate-700 transition-smooth"
                title="Papelera de Reciclaje (Registros protegidos contra borrado)"
              >
                <Trash2 className="w-4 h-4" />
                {deletedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {deletedCount}
                  </span>
                )}
              </button>
            )}

            {/* Botón Nueva Obra */}
            {permisos.editarObras && (
              <button
                onClick={onOpenNewObra}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-sky-500/30 transition-smooth"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Obra</span>
              </button>
            )}

            {/* Botón Gestión de Usuarios y Roles (EXCLUSIVO ADMINISTRADOR) */}
            {currentRole === 'ADMIN' && (
              <button
                onClick={onOpenAdminRoles}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/50 hover:bg-purple-900/70 text-purple-300 hover:text-white text-xs font-semibold rounded-lg border border-purple-500/40 transition-smooth"
                title="Panel de Gestión de Usuarios y Matriz de Permisos por Rol (Solo Administradores)"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">Usuarios y Roles</span>
              </button>
            )}

            {/* Selector de ROL en Tiempo Real para Depuración */}
            <div className="pl-2 border-l border-slate-700 flex items-center gap-2">
              <div className="text-right hidden xl:block">
                <div className="text-xs font-medium text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  {!permisos.verDatosEconomicos ? (
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <EyeOff className="w-2.5 h-2.5" /> Económico Oculto
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" /> Acceso Completo
                    </span>
                  )}
                </div>
              </div>

              <div className="relative">
                <select
                  value={currentRole}
                  onChange={(e) => onRoleChange(e.target.value as UserRole)}
                  className="bg-slate-800 text-xs text-sky-300 font-medium py-1.5 px-2.5 rounded-lg border border-slate-700 hover:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  title="Cambia de rol para simular la visibilidad y permisos en tiempo real"
                >
                  <option value="ADMIN">👑 Administrador (Total)</option>
                  <option value="JEFE_OBRA">👷 Jefe de Obra</option>
                  <option value="TECNICO_CAMPO">🔍 Técnico de Campo (Sin $)</option>
                  <option value="CONSULTOR_EXTERNO">📊 Consultor Externo (Lectura)</option>
                </select>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
