'use client';

import React, { useState } from 'react';
import { UserRole, User } from '@/types';
import { USUARIOS_MOCK, PERMISOS_POR_ROL } from '@/data/mockData';
import { 
  Building2, 
  MapPin, 
  Trash2, 
  FileSpreadsheet, 
  Plus, 
  Shield, 
  EyeOff, 
  Users,
  Menu,
  X,
  Layers,
  ChevronDown,
  Home,
  LogOut,
  User as UserIcon
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
  onGoHome?: () => void;
  onLogout?: () => void;
  currentUser?: User;
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
  onGoHome,
  onLogout,
  currentUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const permisos = PERMISOS_POR_ROL[currentRole];
  const user = currentUser || USUARIOS_MOCK.find((u) => u.role === currentRole) || USUARIOS_MOCK[0];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo interactivo (Botón de Inicio) */}
          <button
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left hover:opacity-90 active:scale-98 transition-all"
            title="Ir a Inicio / Mapa Principal"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
                  GEOBRAS
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
                  Inicio
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block -mt-0.5">
                Seguimiento de obras en mapa, visitas y expedientes
              </p>
            </div>
          </button>

          {/* Acciones principales de la cabecera */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Botón de Inicio explícito en escritorio */}
            <button
              onClick={onGoHome}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-smooth"
              title="Volver al mapa de inicio"
            >
              <Home className="w-3.5 h-3.5 text-sky-400" />
              <span>Inicio</span>
            </button>

            {/* Alternador Mapa / Listado (Visible en pantallas medianas y grandes) */}
            <div className="hidden sm:flex bg-slate-800 p-0.5 rounded-lg items-center border border-slate-700">
              <button
                onClick={() => setActiveView('mapa')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-smooth ${
                  activeView === 'mapa'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Mapa</span>
              </button>
              <button
                onClick={() => setActiveView('listado')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-smooth ${
                  activeView === 'listado'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Listado</span>
              </button>
            </div>

            {/* Botón Nueva Obra (Destacado siempre) */}
            {permisos.editarObras && (
              <button
                onClick={onOpenNewObra}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm shadow-sky-500/30 transition-smooth"
                title="Dar de alta una nueva obra en el mapa"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">Nueva Obra</span>
              </button>
            )}

            {/* Selector de ROL interactivo para depuración */}
            <div className="relative">
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-slate-800 text-[11px] sm:text-xs text-sky-300 font-semibold py-1 sm:py-1.5 pl-2 pr-6 rounded-lg border border-slate-700 hover:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer appearance-none"
                title="Cambia de rol para simular visibilidad y permisos"
              >
                <option value="ADMIN">👑 Admin</option>
                <option value="JEFE_OBRA">👷 Jefe Obra</option>
                <option value="TECNICO_CAMPO">🔍 Técnico (Sin $)</option>
                <option value="CONSULTOR_EXTERNO">📊 Consultor</option>
              </select>
              <ChevronDown className="w-3 h-3 text-sky-400 pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Botones de acción rápida para Desktop */}
            <div className="hidden lg:flex items-center gap-2 pl-1 border-l border-slate-800">
              
              {/* Exportar a Excel */}
              {permisos.exportarExcel && (
                <button
                  onClick={onExportExcel}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-700/50 hover:bg-emerald-900/60 rounded-lg transition-smooth"
                  title="Exportar base de datos a Excel / CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Excel</span>
                </button>
              )}

              {/* Papelera de reciclaje */}
              {permisos.accederPapelera && (
                <button
                  onClick={onOpenTrash}
                  className="relative p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg border border-slate-700 transition-smooth"
                  title="Papelera de reciclaje"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletedCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {deletedCount}
                    </span>
                  )}
                </button>
              )}

              {/* Gestión de Usuarios y Roles (ADMIN) */}
              {currentRole === 'ADMIN' && (
                <button
                  onClick={onOpenAdminRoles}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-950/50 hover:bg-purple-900/70 text-purple-300 hover:text-white text-xs font-semibold rounded-lg border border-purple-500/40 transition-smooth"
                  title="Panel de Usuarios y Matriz de Permisos"
                >
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Usuarios y Roles</span>
                </button>
              )}

              {/* Botón Cerrar Sesión en Escritorio */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-smooth"
                  title="Cerrar sesión / Cambiar de usuario"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Botón Menú Hamburguesa en Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition-smooth ml-1"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </div>

      {/* Menú Desplegable Móvil (< lg) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/98 border-t border-slate-800 px-4 py-3 space-y-3 animate-in slide-in-from-top-2 duration-150 backdrop-blur-md">
          
          {/* Info de sesión y permisos */}
          <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
            <div className="min-w-0 pr-2">
              <div className="font-semibold text-slate-200 truncate">{user.name}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
            </div>
            <div className="shrink-0">
              {!permisos.verDatosEconomicos ? (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800/50">
                  <EyeOff className="w-3 h-3" /> Sin datos económicos
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/50">
                  <Shield className="w-3 h-3" /> Acceso financiero total
                </span>
              )}
            </div>
          </div>

          {/* Opciones del menú móvil */}
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            
            {/* Volver a Inicio */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGoHome?.();
              }}
              className="w-full flex items-center gap-2.5 p-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl border border-slate-700 text-left font-medium transition-smooth"
            >
              <Home className="w-4 h-4 text-sky-400" />
              <span>Ir a Inicio (Mapa Principal)</span>
            </button>

            {/* Gestión de Usuarios y Roles (Solo ADMIN) */}
            {currentRole === 'ADMIN' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminRoles();
                }}
                className="w-full flex items-center justify-between p-2.5 bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 rounded-xl border border-purple-800/50 font-semibold text-left transition-smooth"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Gestión de Usuarios y Permisos</span>
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Admin</span>
              </button>
            )}

            {/* Exportar Excel */}
            {permisos.exportarExcel && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onExportExcel();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl border border-slate-700 text-left font-medium transition-smooth"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Exportar Base de Datos a Excel / CSV</span>
              </button>
            )}

            {/* Papelera de reciclaje */}
            {permisos.accederPapelera && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTrash();
                }}
                className="w-full flex items-center justify-between p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-left font-medium transition-smooth"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-amber-400" />
                  <span>Papelera de Reciclaje (Soft-Delete)</span>
                </div>
                {deletedCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {deletedCount} pendientes
                  </span>
                )}
              </button>
            )}

            {/* Cerrar Sesión en Móvil */}
            {onLogout && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 rounded-xl border border-rose-800/40 text-left font-medium transition-smooth mt-1"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Cerrar Sesión / Cambiar Usuario</span>
              </button>
            )}

          </div>

        </div>
      )}
    </header>
  );
};
