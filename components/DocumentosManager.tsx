'use client';

import React, { useState, useRef } from 'react';
import { Documento, TipoDocumento, UserRole } from '@/types';
import { PERMISOS_POR_ROL } from '@/data/mockData';
import { formatCurrency, formatDate, formatBytes, downloadFile } from '@/lib/utils';
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
  FileCheck,
  FileSpreadsheet,
  File,
  Paperclip,
  CheckCircle2,
  X
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [detectedFormato, setDetectedFormato] = useState<string>('PDF');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detección inteligente de formato y categoría según extensión
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setNombreArchivo(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    let formato = 'PDF';
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      formato = 'EXCEL';
      setCategoria('FACTURA');
    } else if (['doc', 'docx'].includes(ext)) {
      formato = 'WORD';
      setCategoria('INFORME');
    } else if (['pdf'].includes(ext)) {
      formato = 'PDF';
    } else if (['dwg', 'dxf'].includes(ext)) {
      formato = 'CAD';
      setCategoria('PLANO');
    } else if (['eml', 'msg'].includes(ext)) {
      formato = 'EML';
      setCategoria('EMAIL_REGISTRADO');
    } else if (['txt'].includes(ext)) {
      formato = 'TXT';
    } else {
      formato = ext.toUpperCase() || 'FILE';
    }
    setDetectedFormato(formato);

    // Lectura de archivo como Data URL para permitir descarga y persistencia real
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFileDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setFileDataUrl('');
    setDetectedFormato('PDF');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDocIcon = (doc: Documento) => {
    const fmt = doc.formato?.toUpperCase() || '';
    const cat = doc.categoria;

    if (fmt === 'EXCEL' || doc.nombreArchivo.match(/\.(xlsx?|csv)$/i)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    if (fmt === 'WORD' || doc.nombreArchivo.match(/\.(docx?)$/i)) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (fmt === 'CAD' || cat === 'PLANO' || doc.nombreArchivo.match(/\.(dwg|dxf)$/i)) {
      return <FileCode className="w-5 h-5 text-amber-600" />;
    }
    if (fmt === 'EML' || cat === 'EMAIL_REGISTRADO' || doc.nombreArchivo.match(/\.(eml|msg)$/i)) {
      return <Mail className="w-5 h-5 text-indigo-600" />;
    }
    if (cat === 'FACTURA') {
      return <Receipt className="w-5 h-5 text-purple-600" />;
    }
    if (cat === 'OFERTA_PRESUPUESTO') {
      return <FileCheck className="w-5 h-5 text-teal-600" />;
    }
    if (fmt === 'PDF' || doc.nombreArchivo.match(/\.pdf$/i)) {
      return <FileText className="w-5 h-5 text-rose-600" />;
    }
    return <File className="w-5 h-5 text-slate-600" />;
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreArchivo.trim()) return;

    const tamanoBytes = selectedFile ? selectedFile.size : 1024000;
    const urlDescarga = fileDataUrl || '#';

    onUploadDocumento({
      categoria,
      nombreArchivo: nombreArchivo.trim(),
      formato: detectedFormato,
      tamanoBytes,
      urlDescarga,
      importeAsociado: importe !== '' ? Number(importe) : undefined,
      fechaDocumento: new Date().toISOString().split('T')[0],
      subidoPor: currentUserNombre,
      notas: notas.trim() || undefined,
    });

    handleClearSelectedFile();
    setNombreArchivo('');
    setImporte('');
    setNotas('');
    setShowUploadModal(false);
  };

  // Descarga real de archivo: si tiene dataUrl se descarga directamente, si es '#' genera blob real
  const handleDownload = (doc: Documento) => {
    if (doc.urlDescarga && doc.urlDescarga !== '#') {
      const link = document.createElement('a');
      link.href = doc.urlDescarga;
      link.download = doc.nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Descarga de archivo de texto con el informe completo del documento para registros legacy
      const fileText = `EXPEDIENTE DE OBRA - DOCUMENTO ADJUNTO
==========================================
Nombre del archivo: ${doc.nombreArchivo}
Categoría: ${doc.categoria}
Formato: ${doc.formato}
Fecha de registro: ${formatDate(doc.fechaDocumento)}
Subido por: ${doc.subidoPor}
${doc.importeAsociado ? `Importe: ${formatCurrency(doc.importeAsociado)}\n` : ''}
Notas técnicas: ${doc.notas || 'Sin notas adicionales'}
==========================================
`;
      downloadFile(doc.nombreArchivo.endsWith('.txt') ? doc.nombreArchivo : `${doc.nombreArchivo}.txt`, fileText);
    }
  };

  const activeDocs = documentos.filter((d) => !d.isDeleted);

  return (
    <div className="space-y-4">
      {/* Barra superior con botón de subir */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Expediente Documental de la Obra</h4>
          <p className="text-xs text-slate-500">
            Archivos PDF, Word, Excel, Planos CAD, Facturas y Mails técnicos
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
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                    {getDocIcon(doc)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                        {doc.categoria.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-sky-50 text-sky-700 border border-sky-200">
                        {doc.formato || 'DOC'}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(doc.fechaDocumento)}</span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 mt-1 break-all line-clamp-2" title={doc.nombreArchivo}>
                      {doc.nombreArchivo}
                    </h5>

                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{formatBytes(doc.tamanoBytes)}</span>
                      <span>•</span>
                      <span>Subido por: <strong className="text-slate-600">{doc.subidoPor}</strong></span>
                    </div>

                    {doc.notas && (
                      <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">{doc.notas}</p>
                    )}

                    {doc.importeAsociado !== undefined && (
                      <div className="mt-1.5">
                        {hideAmount ? (
                          <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Importe Confidencial
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {formatCurrency(doc.importeAsociado)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-200"
                    title={`Descargar ${doc.nombreArchivo}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {permisos.borrarObras && (
                    <button
                      type="button"
                      onClick={() => onDeleteDocumento(doc.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Modal para adjuntar documento con soporte para archivos reales */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-sky-600" /> Adjuntar Archivo al Expediente
              </h4>
              <button
                type="button"
                onClick={() => {
                  handleClearSelectedFile();
                  setShowUploadModal(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input real de archivo oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.dwg,.dxf,.eml,.msg,.txt,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv"
              className="hidden"
            />

            {/* Zona de Selección de Archivo */}
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-sky-50/50 transition-colors space-y-1.5"
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 mx-auto flex items-center justify-center">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Haz clic para seleccionar un archivo
                </div>
                <div className="text-[11px] text-slate-500">
                  Soporta Word (.docx), Excel (.xlsx, .csv), PDF, CAD (.dwg), Mails (.eml) y TXT
                </div>
              </div>
            ) : (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {formatBytes(selectedFile.size)} • Formato: <strong className="text-sky-700">{detectedFormato}</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedFile}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white"
                  title="Eliminar archivo seleccionado"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría Documental</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as TipoDocumento)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="FACTURA">💶 Factura</option>
                  <option value="OFERTA_PRESUPUESTO">📄 Oferta / Presupuesto</option>
                  <option value="EMAIL_REGISTRADO">✉️ Email Registrado</option>
                  <option value="PLANO">📐 Plano de Obra (CAD)</option>
                  <option value="ACTA_REUNION">📋 Acta de Reunión</option>
                  <option value="INFORME">📑 Informe Técnico</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Archivo</label>
                <input
                  type="text"
                  value={nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                  placeholder="Ej: Presupuesto_Climatizacion_Fase1.xlsx"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20"
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas / Referencia</label>
                <input
                  type="text"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Aprobado por la dirección facultativa"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleClearSelectedFile();
                    setShowUploadModal(false);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs"
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
