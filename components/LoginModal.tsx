'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { verifyUserLogin } from '@/lib/userRegistry';
import { Building2, Lock, ArrowRight, AlertCircle, X, RefreshCw, KeyRound, Shield } from 'lucide-react';

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

  const handleClose = () => {
    if (!onClose) return;
    setEmailInput('');
    setPasswordInput('');
    setErrorMsg('');
    onClose();
  };

  // Permitir cerrar con la tecla Escape solo si onClose está definido
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
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

    if (!passwordInput) {
      setErrorMsg('Por favor, introduce tu contraseña.');
      return;
    }

    // Verificación estricta contra la Tabla Oficial de Registros de Usuarios
    const result = verifyUserLogin(trimmedInput, passwordInput);

    if (!result.success || !result.user) {
      setErrorMsg(result.error || 'Credenciales de acceso incorrectas.');
      return;
    }

    onLogin(result.user);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 overflow-y-auto select-none"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Cabecera de bienvenida */}
        <div className="px-6 py-6 bg-slate-900 text-white text-center border-b border-slate-800 relative">
          {onClose && (
            <button
              onClick={handleClose}
              type="button"
              className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
              title="Cerrar ventana"
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
          <p className="text-[11px] text-slate-400 mt-1">Acceso restringido: Inicia sesión para acceder al sistema</p>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Formulario de Login */}
          <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all"
                  autoComplete="current-password"
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
        </div>

        {/* Pie informativo */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Información privada protegida. Autenticación requerida.</span>
        </div>

      </div>
    </div>
  );
};

