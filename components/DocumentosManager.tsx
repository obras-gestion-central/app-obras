'use client';

import React, { useState } from 'react';
import { Documento, TipoDocumento, UserRole } from '@/types';
import { PERMISOS_POR_ROL } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  FileText, 
  Receipt, 
  Mail, 
  FileCode, 
  Download, 
  Plus, 
  Trash2, 
  EyeOff, 
  UploadCloud,
  FileCheck
} from 'lucide-react';

interface DocumentosManagerProps {
  documentos: Documento[];
  userRole: UserRole;
  onUploadDocumento: (doc: Partial<Documento>) => void;
  onDeleteDocumento: (docId: string) => void;
  currentUserNombre: string;
}

export const DocumentosManager: React.FC<DocumentosManagerProps> = ({
  documentos,
  userRole,
  onUploadDocumento,
  onDeleteDocumento,
  currentUserNombre,
}) => {
  const permisos = PERMISOS_POR_ROL[userRole];
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Formulario nuevo documento
  const [categoria, setCategoria] = useState<TipoDocumento>('FACTURA');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [importe, setImporte] = useState<number | ''>('');
  const [notas, setNotas] = useState('');

  const getDocIcon = (cat: TipoDocumento) => {
    switch (cat) {
      case 'FACTURA':
        return <Receipt className="w-5 h-5 text-purple-600" />;
      case 'OFERTA_PRESUPUESTO':
        return <FileCheck className="w-5 h-5 text-emerald-600" />;
      case 'EMAIL_REGISTRADO':
        return <Mail className="w-5 h-5 text-indigo-600" />;
      case 'PLANO':
        return <FileCode className="w-5 h-5 text-amber-600" />;
      case 'ACTA_REUNION':
      case 'INFORME':
      default:
        return <FileText className="w-5 h-5 text-sky-600" />;
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreArchivo.trim()) return;

    onUploadDocumento({
      categoria,
      nombreArchivo: nombreArchivo.endsWith('.pdf') || nombreArchivo.endsWith('.eml') ? nombreArchivo : `${nombreArchivo}.pdf`,
      formato: categoria === 'EMAIL_REGISTRADO' ? 'EML' : 'PDF',
      tamanoBytes: Math.floor(Math.random() * 2000000) + 500000,
      urlDescarga: '#',
      importeAsociado: importe !== '' ? Number(importe) : undefined,
      fechaDocumento: new Date().toISOString().split('T')[0],
      subidoPor: currentUserNombre,
      notas: notas.trim() || undefined,
    });

    setNombreArchivo('');
    setImporte('');
    setNotas('');
    setShowUploadModal(false);
  };

  const activeDocs = documentos.filter((d) => !d.isDeleted);

  return (
    <div className="space-y-4">
      {/* Barra superior con botón de subir */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Expediente Documental de la Obra</h4>
          <p className="text-xs text-slate-500">
            Facturas, Ofertas, Mails, Planos y Actas vinculadas
          </p>
        </div>

        {permisos.subirDocumentos && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-smooth"
          >
            <Plus className="w-4 h-4" />
            <span>Adjuntar Documento</span>
          </button>
        )}
      </div>

      {/* Listado de Documentos */}
      {activeDocs.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No hay documentos adjuntos en este expediente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeDocs.map((doc) => {
            const isEconomic = doc.categoria === 'FACTURA' || doc.categoria === 'OFERTA_PRESUPUESTO';
            const hideAmount = isEconomic && !permisos.verDatosEconomicos;

            return (
              <div
                key={doc.id}
                className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-smooth flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    {getDocIcon(doc.categoria)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                        {doc.categoria.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(doc.fechaDocumento)}</span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 mt-1 break-all">
                      {doc.nombreArchivo}
                    </h5>

                    {doc.notas && (
                      <p className="text-[11px] text-slate-500 mt-0.5 italic">{doc.notas}</p>
                    )}

                    {doc.importeAsociado !== undefined && (
                      <div className="mt-1">
                        {hideAmount ? (
                          <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Importe Confidencial
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700">
                            {formatCurrency(doc.importeAsociado)}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 mt-1">
                      Subido por: <strong>{doc.subidoPor}</strong>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <a
                    href={doc.urlDescarga}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Descarga simulada de: ${doc.nombreArchivo}`);
                    }}
                    className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Descargar archivo a tu equipo"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {permisos.borrarObras && (
                    <button
                      onClick={() => onDeleteDocumento(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Enviar a la Papelera de reciclaje"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para adjuntar documento */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-sky-600" /> Adjuntar Nuevo Documento
            </h4>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as TipoDocumento)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="FACTURA">💶 Factura</option>
                  <option value="OFERTA_PRESUPUESTO">📄 Oferta / Presupuesto</option>
                  <option value="EMAIL_REGISTRADO">✉️ Email Registrado</option>
                  <option value="PLANO">📐 Plano de Obra</option>
                  <option value="ACTA_REUNION">📋 Acta de Reunión</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Archivo</label>
                <input
                  type="text"
                  value={nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                  placeholder="Ej: Factura_Proveedor_Tubos_04.pdf"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              {(categoria === 'FACTURA' || categoria === 'OFERTA_PRESUPUESTO') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Importe (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={importe}
                    onChange={(e) => setImporte(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej: 14500.00"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas / Referencia</label>
                <input
                  type="text"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Aprobada por el promotor"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg"
                >
                  Guardar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
