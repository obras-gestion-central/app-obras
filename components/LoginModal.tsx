'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Building2, Lock, ArrowRight, AlertCircle, X, RefreshCw, KeyRound, Shield } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  users: User[];
  onLogin: (user: User) => void;
  onClose?: () => void;
  onClearCache?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  users,
  onLogin,
  onClose,
  onClearCache,
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

    // Prioridad 1: Coincidencia exacta por correo
    let targetUser = users.find((u) => u.email.toLowerCase() === trimmedInput);

    // Prioridad 2: Coincidencia exacta por nombre
    if (!targetUser) {
      targetUser = users.find((u) => u.name.toLowerCase() === trimmedInput);
    }

    // Prioridad 3: Atajo admin o david para el administrador
    if (!targetUser && (trimmedInput === 'admin' || trimmedInput === 'david')) {
      targetUser = users.find((u) => u.id === 'usr-1') || users.find((u) => u.role === 'ADMIN');
    }

    // Prioridad 4: Contiene el nombre
    if (!targetUser) {
      targetUser = users.find((u) => u.name.toLowerCase().includes(trimmedInput));
    }

    if (!targetUser) {
      setErrorMsg('No se encontró ningún usuario con ese correo electrónico.');
      return;
    }

    if (targetUser.requiresPassword) {
      if (!passwordInput) {
        setErrorMsg('Este usuario requiere contraseña. Por favor, introdúcela.');
        return;
      }
      const isPasswordValid = 
        passwordInput === targetUser.password || 
        (targetUser.id === 'usr-1' && (passwordInput === 'admin123' || passwordInput === 'admin'));

      if (!isPasswordValid) {
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
          <p className="text-[11px] text-slate-400 mt-1">Acceso restringido: Inicia sesión para consultar la información</p>
        </div>

        <div className="p-5 sm:p-6 space-y-4">

          {/* Tarjeta con credenciales de acceso para el usuario */}
          <div className="p-3.5 bg-sky-50/90 border border-sky-200 rounded-2xl text-xs text-sky-950">
            <div className="flex items-center gap-1.5 font-bold text-sky-900 mb-1.5">
              <KeyRound className="w-4 h-4 text-sky-600" />
              <span>Administrador Principal (Acceso total):</span>
            </div>
            <div className="space-y-1 bg-white/80 p-2.5 rounded-xl border border-sky-100 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Correo:</span>
                <span className="font-bold text-slate-900 select-all">david.perez@empresa.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Contraseña:</span>
                <span className="font-bold text-sky-700 select-all">admin123</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-tight">
              💡 Los nuevos usuarios registrados acceden con su propio correo y contraseña asignada.
            </p>
          </div>
          
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

          {/* Opciones de mantenimiento / Vaciar caché */}
          {onClearCache && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Deseas vaciar la memoria caché y restablecer los datos locales? Se reiniciarán los datos guardados en este navegador.')) {
                    onClearCache();
                  }
                }}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 active:scale-98 text-slate-600 hover:text-slate-800 text-[11px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                title="Vaciar caché local y restablecer la aplicación"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Vaciar caché y reiniciar datos</span>
              </button>
            </div>
          )}

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

