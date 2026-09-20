'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Building2, Lock, ArrowRight, AlertCircle, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  users: User[];
  onLogin: (user: User) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  users,
  onLogin,
  onClose,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Permitir cerrar con la tecla Escape
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePasswordLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedInput = emailInput.trim().toLowerCase();

    if (!trimmedInput) {
      setErrorMsg('Por favor, introduce tu correo electrónico.');
      return;
    }

    // Buscar por correo o coincidencia de nombre
    const targetUser = users.find(
      (u) => 
        u.email.toLowerCase() === trimmedInput || 
        u.name.toLowerCase() === trimmedInput ||
        u.name.toLowerCase().includes(trimmedInput)
    );

    if (!targetUser) {
      setErrorMsg('No se encontró ningún usuario con ese correo electrónico.');
      return;
    }

    if (targetUser.requiresPassword) {
      if (!passwordInput) {
        setErrorMsg('Este usuario requiere contraseña. Por favor, introdúcela.');
        return;
      }
      if (targetUser.password !== passwordInput) {
        setErrorMsg('Contraseña incorrecta. Por favor, revísala.');
        return;
      }
    }

    onLogin(targetUser);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto select-none"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Cabecera de bienvenida */}
        <div className="px-6 py-6 bg-slate-900 text-white text-center border-b border-slate-800 relative">
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
              title="Cerrar ventana y entrar al mapa"
              aria-label="Cerrar ventana"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cerrar</span>
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-sky-500/30 mb-3">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight">GEOBRAS</h2>
          <p className="text-xs text-sky-400 font-semibold mt-0.5">Control y Gestión Geográfica de Obras</p>
          <p className="text-[11px] text-slate-400 mt-1">Identifícate para acceder al panel de control</p>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Formulario de Login */}
          <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Introduce tu correo (ej. david.perez@empresa.com)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck="false"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Contraseña
                </label>
                <span className="text-[10px] text-slate-400">
                  (Si tu cuenta la requiere)
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all"
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Acceder al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Botón para abandonar o cerrar la ventana */}
          {onClose && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                title="Abandonar inicio de sesión y acceder al mapa"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>Abandonar / Cerrar ventana (Ir al Mapa)</span>
              </button>
            </div>
          )}

        </div>

        {/* Pie informativo */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          🛡️ Entorno protegido con Control de Acceso por Roles (RBAC)
        </div>

      </div>
    </div>
  );
};
