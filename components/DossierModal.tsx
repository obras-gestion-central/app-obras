'use client';

import React, { useState } from 'react';
import { Obra, VisitaReport, Documento, TimelineEvent, FotoGPS, UserRole } from '@/types';
import { PERMISOS_POR_ROL } from '@/data/mockData';
import { generateMarkdownDossier, downloadFile, formatCurrency, formatDate } from '@/lib/utils';
import { 
  FileDown, 
  Printer, 
  FileText, 
  Eye, 
  X, 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Shield, 
  EyeOff 
} from 'lucide-react';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  obra: Obra;
  visitas: VisitaReport[];
  documentos: Documento[];
  timeline: TimelineEvent[];
  fotos: FotoGPS[];
  userRole: UserRole;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  isOpen,
  onClose,
  obra,
  visitas,
  documentos,
  timeline,
  fotos,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'markdown'>('pdf');
  const permisos = PERMISOS_POR_ROL[userRole];

  if (!isOpen) return null;

  const markdownContent = generateMarkdownDossier(
    obra,
    visitas,
    documentos,
    timeline,
    fotos,
    userRole
  );

  const handleDownloadMD = () => {
    downloadFile(`Dossier_${obra.codigo}.md`, markdownContent, 'text/markdown;charset=utf-8');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Cabecera del Modal (No se imprime) */}
        <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono text-sky-400 font-semibold">
              Exportación de Expediente • {obra.codigo}
            </span>
            <h3 className="text-base font-bold">Dossier Técnico Completo de Obra</h3>
          </div>

          {/* Selector de formato y acciones */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
              <button
                onClick={() => setActiveTab('pdf')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'pdf' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Vista Dossier PDF</span>
              </button>

              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'markdown' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Código Markdown (.md)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Descarga Rápida (No se imprime) */}
        <div className="no-print px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-600">
            Exportando con nivel de permisos: <strong className="text-slate-800 font-semibold">{userRole}</strong>
            {!permisos.verDatosEconomicos && (
              <span className="ml-2 text-amber-600 font-medium">(Valores económicos reservados)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMD}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <FileDown className="w-4 h-4 text-sky-600" />
              <span>Descargar .md</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Descargar PDF / Imprimir</span>
            </button>
          </div>
        </div>

        {/* Contenido Visualizable */}
        <div className="overflow-y-auto p-6 flex-1 bg-slate-50">
          
          {/* Vista Markdown puro */}
          {activeTab === 'markdown' && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
              {markdownContent}
            </div>
          )}

          {/* Vista Maquetada PDF para Pantalla e Impresión */}
          {activeTab === 'pdf' && (
            <div
              id="dossier-print-area"
              className="bg-white p-8 rounded-xl shadow-md border border-slate-200 max-w-3xl mx-auto text-slate-900 space-y-6"
            >
              {/* Encabezado Oficial */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between print-avoid-break">
                <div>
                  <div className="flex items-center gap-2 text-sky-700 font-black text-xl tracking-tight">
                    <Building2 className="w-6 h-6 text-sky-700" />
                    <span>GEOBRAS • SISTEMA DE GESTIÓN TÉCNICA</span>
                  </div>
                  <h1 className="text-xl font-black text-slate-900 mt-1 uppercase">
                    DOSSIER TÉCNICO OFICIAL DE OBRA (DIN A4)
                  </h1>
                  <p className="text-xs text-slate-500">
                    Expediente: <strong className="text-slate-800">{obra.codigo}</strong> • Emisión: {new Date().toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white uppercase">
                    {obra.estado.replace('_', ' ')}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Ref: {obra.id.slice(0, 8)}
                  </div>
                </div>
              </div>

              {/* Ficha Principal de la Obra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs print-avoid-break">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-2">{obra.titulo}</h3>
                  <p className="text-slate-600 mb-3">{obra.descripcion}</p>
                  
                  <div className="space-y-1 text-slate-600">
                    <div><strong>Dirección:</strong> {obra.direccion}, {obra.municipio} ({obra.provincia})</div>
                    <div><strong>Coordenadas GPS:</strong> {obra.lat.toFixed(6)}, {obra.lng.toFixed(6)}</div>
                    <div><strong>Responsable de Obra:</strong> {obra.responsableNombre}</div>
                  </div>
                </div>

                <div className="space-y-2 border-l border-slate-200 pl-4">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Especialidad / Línea Principal</span>
                    <span className="font-bold text-slate-800">{obra.lineaProductoPrincipal}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Tipo de Obra</span>
                    <span className="font-bold text-slate-800">{obra.tipoObra}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Plazo Previsto</span>
                    <span className="font-semibold text-slate-700">{formatDate(obra.fechaInicio)} al {formatDate(obra.fechaFinPrevista)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Avance Físico ({obra.porcentajeAvance}%)</span>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-600 h-2 rounded-full" style={{ width: `${obra.porcentajeAvance}%` }}></div>
                    </div>
                  </div>

                  {permisos.verDatosEconomicos ? (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Presupuesto Adjudicado</span>
                      <span className="text-sm font-black text-emerald-700">{formatCurrency(obra.presupuestoAdjudicacion)}</span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200 text-amber-700 italic text-[11px]">
                      Datos económicos restringidos por rol
                    </div>
                  )}
                </div>
              </div>

              {/* Histórico Cronológico de Visitas */}
              <div className="print-avoid-break">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b border-slate-200">
                  1. Informes de Visitas e Inspecciones a Pie de Obra
                </h3>

                {visitas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No constan visitas registradas.</p>
                ) : (
                  <div className="space-y-3">
                    {visitas.map((v, i) => (
                      <div key={v.id} className="p-3 border border-slate-200 rounded-lg text-xs space-y-1.5 print-avoid-break bg-white">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Visita #{i + 1}: {v.tipoVisita} ({formatDate(v.fechaVisita)})</span>
                          <span className="text-slate-600 font-medium">Técnico in situ: <strong>{v.tecnicoNombre}</strong> ({v.horaEntrada} - {v.horaSalida})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between border-b border-slate-100 pb-1">
                          <span>Especialidad: <strong>{v.lineaProducto}</strong></span>
                          <span>Registrado por: <strong>{v.registradoPorNombre || v.tecnicoNombre}</strong></span>
                        </div>
                        <p className="text-slate-700 pt-0.5"><strong>Actuación:</strong> {v.tituloResumen}</p>
                        <p className="text-slate-600 italic"><strong>Conclusiones:</strong> {v.conclusiones}</p>

                        {v.checklist && v.checklist.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px]">
                            {v.checklist.map((c) => (
                              <div key={c.id} className="flex items-center gap-1.5">
                                <CheckCircle2 className={`w-3 h-3 ${c.conforme ? 'text-emerald-600' : 'text-rose-600'}`} />
                                <span>{c.pregunta}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Registro de Hitos (Timeline) */}
              <div className="print-avoid-break">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b border-slate-200">
                  2. Registro Cronológico de Eventos y Comunicaciones
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                      <th className="py-1">Fecha</th>
                      <th className="py-1">Tipo</th>
                      <th className="py-1">Autor</th>
                      <th className="py-1">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {timeline.map((ev) => (
                      <tr key={ev.id}>
                        <td className="py-1.5 font-semibold text-slate-700">{ev.fecha}</td>
                        <td className="py-1.5 font-mono text-[10px] text-sky-700">{ev.eventType}</td>
                        <td className="py-1.5 text-slate-600">{ev.autorNombre}</td>
                        <td className="py-1.5 text-slate-800">{ev.titulo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Registro Documental */}
              <div className="print-avoid-break">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b border-slate-200">
                  3. Expediente Documental (Facturas, Ofertas, Planos)
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                      <th className="py-1">Categoría</th>
                      <th className="py-1">Archivo</th>
                      <th className="py-1">Fecha</th>
                      <th className="py-1">Subido por</th>
                      {permisos.verDatosEconomicos && <th className="py-1 text-right">Importe</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documentos.map((d) => (
                      <tr key={d.id}>
                        <td className="py-1.5 font-bold text-slate-700">{d.categoria}</td>
                        <td className="py-1.5 text-slate-800">{d.nombreArchivo}</td>
                        <td className="py-1.5 text-slate-500">{formatDate(d.fechaDocumento)}</td>
                        <td className="py-1.5 text-slate-500">{d.subidoPor}</td>
                        {permisos.verDatosEconomicos && (
                          <td className="py-1.5 text-right font-semibold text-emerald-700">
                            {d.importeAsociado ? formatCurrency(d.importeAsociado) : '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Galería de Fotografías con GPS */}
              {fotos.length > 0 && (
                <div className="print-avoid-break">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b border-slate-200">
                    4. Fotografías Georreferenciadas a Pie de Obra
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {fotos.slice(0, 4).map((f) => (
                      <div key={f.id} className="border border-slate-200 rounded-lg p-2 text-center text-xs bg-white">
                        <img src={f.miniaturaUrl || f.url} alt={f.titulo} className="w-full h-28 object-cover rounded mb-1.5" />
                        <div className="font-bold text-slate-800 text-[11px]">{f.titulo}</div>
                        <div className="text-[10px] text-slate-400">
                          GPS: {f.lat.toFixed(5)}, {f.lng.toFixed(5)} ({f.fechaCaptura})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Área de Firmas Oficiales (Paginada al pie) */}
              <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 text-xs print-avoid-break">
                <div className="text-center">
                  <div className="h-16 border-b border-dashed border-slate-400 mb-2"></div>
                  <span className="font-bold text-slate-800 block">Firma del Técnico Responsable</span>
                  <span className="text-slate-500 text-[10px]">{obra.responsableNombre}</span>
                </div>

                <div className="text-center">
                  <div className="h-16 border-b border-dashed border-slate-400 mb-2"></div>
                  <span className="font-bold text-slate-800 block">Dirección Facultativa / Supervisor</span>
                  <span className="text-slate-500 text-[10px]">Conforme con el estado y certificaciones</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
