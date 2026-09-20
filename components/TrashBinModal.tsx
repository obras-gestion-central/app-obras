'use client';

import React from 'react';
import { Obra, Documento } from '@/types';
import { Trash2, RotateCcw, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedObras: Obra[];
  deletedDocumentos: Documento[];
  onRestoreObra: (obraId: string) => void;
  onRestoreDocumento: (docId: string) => void;
}

export const TrashBinModal: React.FC<TrashBinModalProps> = ({
  isOpen,
  onClose,
  deletedObras,
  deletedDocumentos,
  onRestoreObra,
  onRestoreDocumento,
}) => {
  if (!isOpen) return null;

  const totalDeleted = deletedObras.length + deletedDocumentos.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Cabecera */}
        <div className="px-6 py-4 bg-amber-500 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            <h3 className="text-base font-black">Papelera de Reciclaje (Cero Borrado Real)</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-amber-600 rounded-lg text-slate-950">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explicación de seguridad */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Protección de Integridad:</strong> En esta aplicación ningún registro se elimina de forma destructiva (Soft Delete). Si tú o un compañero borra una obra o factura por accidente, permanecerá resguardada aquí y podrás restaurarla en cualquier momento.
          </p>
        </div>

        {/* Lista de Registros Eliminados */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {totalDeleted === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span>La papelera está vacía. No hay elementos borrados.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Obras Borradas */}
              {deletedObras.map((obra) => (
                <div
                  key={obra.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-mono text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      OBRA ELIMINADA
                    </span>
                    <h5 className="font-bold text-slate-900 mt-1">{obra.titulo}</h5>
                    <p className="text-[11px] text-slate-500">
                      Código: {obra.codigo} • {obra.municipio}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Borrado por: <strong>{obra.deletedBy || 'Administrador'}</strong> ({obra.deletedAt || 'Reciente'})
                    </div>
                  </div>

                  <button
                    onClick={() => onRestoreObra(obra.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar</span>
                  </button>
                </div>
              ))}

              {/* Documentos Borrados */}
              {deletedDocumentos.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-mono text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                      DOCUMENTO ({doc.categoria})
                    </span>
                    <h5 className="font-bold text-slate-900 mt-1">{doc.nombreArchivo}</h5>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Subido originalmente por: {doc.subidoPor}
                    </div>
                  </div>

                  <button
                    onClick={() => onRestoreDocumento(doc.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
