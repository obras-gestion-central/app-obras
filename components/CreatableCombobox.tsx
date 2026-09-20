'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check, Tag } from 'lucide-react';

interface CreatableComboboxProps {
  label: string;
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
  onCreateOption: (newOption: string) => void;
  placeholder?: string;
  required?: boolean;
  onManage?: () => void;
}

export const CreatableCombobox: React.FC<CreatableComboboxProps> = ({
  label,
  options,
  value,
  onChange,
  onCreateOption,
  placeholder = 'Buscar o crear...',
  required = false,
  onManage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = query.trim() === ''
    ? options
    : options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()));

  const canCreate = query.trim() !== '' && !options.some(
    (opt) => opt.toLowerCase() === query.trim().toLowerCase()
  );

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setIsOpen(false);
    setQuery('');
  };

  const handleCreate = () => {
    const newVal = query.trim();
    if (!newVal) return;
    onCreateOption(newVal);
    onChange(newVal);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className="block text-xs font-semibold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        {onManage && (
          <button
            type="button"
            onClick={onManage}
            className="text-[10px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 transition-colors hover:underline"
            title="Editar personalmente estos conceptos"
          >
            <Tag className="w-3 h-3 text-amber-500" />
            <span>Personalizar</span>
          </button>
        )}
      </div>

      {/* Input / Botón Desplegable */}
      <div
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 shadow-xs hover:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 cursor-pointer"
      >
        <span className={value ? 'font-medium text-slate-900' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto">
          {/* Buscador interno */}
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe para buscar o crear..."
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              autoFocus
            />
          </div>

          {/* Opción de Crear Nuevo Término */}
          {canCreate && (
            <button
              type="button"
              onClick={handleCreate}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 flex items-center gap-2 border-b border-sky-100"
            >
              <Plus className="w-3.5 h-3.5 text-sky-600" />
              <span>Crear nueva entrada: &quot;<strong>{query.trim()}</strong>&quot;</span>
            </button>
          )}

          {/* Opciones existentes filtradas */}
          {filtered.length === 0 && !canCreate ? (
            <div className="px-3 py-3 text-center text-xs text-slate-400">
              No hay coincidencias
            </div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between"
              >
                <span className={opt === value ? 'font-bold text-sky-700' : ''}>{opt}</span>
                {opt === value && <Check className="w-3.5 h-3.5 text-sky-600" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
