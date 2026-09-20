'use client';

import React, { useState, useEffect } from 'react';
import { TaxonomyItem } from '@/types';
import { 
  X, 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  RotateCcw, 
  ClipboardList, 
  Layers, 
  Building2,
  Sparkles,
  Info
} from 'lucide-react';

export type CategoriaTaxonomia = 'TIPO_VISITA' | 'LINEA_PRODUCTO' | 'TIPO_OBRA';

interface TaxonomiasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: CategoriaTaxonomia;
  taxonomias: TaxonomyItem[];
  onAdd: (category: CategoriaTaxonomia, value: string) => void;
  onUpdate: (id: string, oldValue: string, newValue: string, category: CategoriaTaxonomia) => void;
  onDelete: (id: string) => void;
  onResetDefaults?: () => void;
}

export const TaxonomiasModal: React.FC<TaxonomiasModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'TIPO_VISITA',
  taxonomias,
  onAdd,
  onUpdate,
  onDelete,
  onResetDefaults,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoriaTaxonomia>(initialCategory);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [newValueInput, setNewValueInput] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
    setEditingId(null);
    setNewValueInput('');
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const currentItems = taxonomias.filter((t) => t.categoria === activeCategory);

  const handleStartEdit = (item: TaxonomyItem) => {
    setEditingId(item.id);
    setEditValue(item.valor);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (item: TaxonomyItem) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    if (trimmed === item.valor) {
      setEditingId(null);
      return;
    }
    onUpdate(item.id, item.valor, trimmed, activeCategory);
    setEditingId(null);
    setFeedbackMsg(`Concepto actualizado a "${trimmed}"`);
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newValueInput.trim();
    if (!trimmed) return;

    // Evitar duplicados exactos
    const exists = currentItems.some((t) => t.valor.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert('Ese concepto ya existe en la lista.');
      return;
    }

    onAdd(activeCategory, trimmed);
    setNewValueInput('');
    setFeedbackMsg(`"${trimmed}" añadido correctamente`);
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  const handleDelete = (id: string, valor: string) => {
    if (currentItems.length <= 1) {
      alert('Debe haber al menos un concepto en esta categoría.');
      return;
    }
    if (confirm(`¿Eliminar el concepto "${valor}"?`)) {
      onDelete(id);
      setFeedbackMsg(`"${valor}" eliminado`);
      setTimeout(() => setFeedbackMsg(''), 2500);
    }
  };

  const categoriesConfig: Record<CategoriaTaxonomia, { title: string; subtitle: string; icon: React.ReactNode; badgeColor: string }> = {
    TIPO_VISITA: {
      title: 'Motivos / Tipos de Visita',
      subtitle: 'Conceptos utilizados al redactar informes y visitas técnicas a pie de obra.',
      icon: <ClipboardList className="w-4 h-4 text-sky-600" />,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    LINEA_PRODUCTO: {
      title: 'Especialidades / Líneas de Trabajo',
      subtitle: 'Ramos de actividad técnica asignados a las obras y visitas (ej: Clima, Estructuras, etc.).',
      icon: <Layers className="w-4 h-4 text-indigo-600" />,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    TIPO_OBRA: {
      title: 'Tipologías de Obra',
      subtitle: 'Clasificación constructiva del expediente (ej: Rehabilitación, Obra Nueva, etc.).',
      icon: <Building2 className="w-4 h-4 text-amber-600" />,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  };

  const currentConfig = categoriesConfig[activeCategory];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/30">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Gestor de Vocabulario y Conceptos</span>
                <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                  Personalizable
                </span>
              </h3>
              <p className="text-xs text-slate-400">Edita, añade o renombra los valores que aparecen en los desplegables</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Categoría */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 shrink-0 overflow-x-auto">
          {(Object.keys(categoriesConfig) as CategoriaTaxonomia[]).map((catKey) => {
            const cfg = categoriesConfig[catKey];
            const isActive = activeCategory === catKey;
            const count = taxonomias.filter((t) => t.categoria === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => {
                  setActiveCategory(catKey);
                  setEditingId(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {cfg.icon}
                <span>{cfg.title.split('/')[0].trim()}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full border ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Contenido Principal */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* Explicación de la categoría actual */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block mb-0.5">{currentConfig.title}</strong>
              <p className="text-slate-600 text-[11px] leading-relaxed">{currentConfig.subtitle}</p>
            </div>
          </div>

          {/* Notificación de feedback temporal */}
          {feedbackMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Formulario para Añadir Nuevo Concepto */}
          <form onSubmit={handleAddNew} className="flex gap-2">
            <input
              type="text"
              value={newValueInput}
              onChange={(e) => setNewValueInput(e.target.value)}
              placeholder={`Escribir nuevo concepto para ${currentConfig.title.toLowerCase()}...`}
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 font-medium"
            />
            <button
              type="submit"
              disabled={!newValueInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir</span>
            </button>
          </form>

          {/* Lista de Conceptos Existentes */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Conceptos Activos ({currentItems.length})
            </div>

            <div className="space-y-1.5 max-h-[36vh] overflow-y-auto pr-1">
              {currentItems.map((item, idx) => {
                const isEditing = editingId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                      isEditing
                        ? 'bg-sky-50/70 border-sky-400 ring-1 ring-sky-400/30 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit(item);
                            }
                            if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-sky-400 rounded-lg focus:outline-none text-slate-900 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                          title="Guardar nombre"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[10px] text-slate-400 w-5 shrink-0 text-right">
                            {idx + 1}.
                          </span>
                          <span className="font-bold text-slate-900 truncate">
                            {item.valor}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Renombrar este concepto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.valor)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar este concepto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Pie del Modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {onResetDefaults ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Restablecer el vocabulario a los valores predeterminados de fábrica?')) {
                  onResetDefaults();
                }
              }}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer predeterminados</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400">
              💾 Guardado automático en tu navegador
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Listo / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
