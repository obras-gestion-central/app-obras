'use client';

import React, { useState } from 'react';
import { TimelineEvent, UserRole } from '@/types';
import { PERMISOS_POR_ROL } from '@/data/mockData';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { 
  ClipboardCheck, 
  Camera, 
  FileText, 
  Receipt, 
  Mail, 
  Flag, 
  Clock, 
  Filter,
  EyeOff
} from 'lucide-react';

interface TimelineFeedProps {
  events: TimelineEvent[];
  userRole: UserRole;
  onOpenVisita?: (visitaId: string) => void;
}

export const TimelineFeed: React.FC<TimelineFeedProps> = ({
  events,
  userRole,
  onOpenVisita,
}) => {
  const [filterType, setFilterType] = useState<string>('TODOS');
  const permisos = PERMISOS_POR_ROL[userRole];

  // Filtrado de eventos
  const filteredEvents = events.filter((ev) => {
    if (filterType === 'TODOS') return true;
    if (filterType === 'VISITAS') return ev.eventType === 'VISITA';
    if (filterType === 'ECONOMICOS') return ev.eventType === 'FACTURA' || ev.eventType === 'OFERTA';
    if (filterType === 'FOTOS') return ev.eventType === 'FOTO_GPS';
    if (filterType === 'EMAILS') return ev.eventType === 'EMAIL';
    return true;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'VISITA':
        return <ClipboardCheck className="w-4 h-4 text-sky-400" />;
      case 'FOTO_GPS':
        return <Camera className="w-4 h-4 text-amber-400" />;
      case 'OFERTA':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'FACTURA':
        return <Receipt className="w-4 h-4 text-purple-400" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-indigo-400" />;
      case 'CAMBIO_ESTADO':
      case 'CREACION':
      default:
        return <Flag className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'VISITA':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'FOTO_GPS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OFERTA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'FACTURA':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'EMAIL':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros del Timeline */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtrar por:</span>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'VISITAS', label: '📍 Visitas' },
            { id: 'ECONOMICOS', label: '💶 Económico' },
            { id: 'FOTOS', label: '📷 Fotos GPS' },
            { id: 'EMAILS', label: '✉️ Mails' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-smooth ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista del Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No hay hitos que coincidan con el filtro seleccionado.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {filteredEvents.map((item) => {
            const isEconomic = item.eventType === 'FACTURA' || item.eventType === 'OFERTA';
            const hideAmount = isEconomic && !permisos.verDatosEconomicos;

            return (
              <div key={item.id} className="relative group">
                {/* Nodo en la línea */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-white shadow-sm flex items-center justify-center">
                  {getEventIcon(item.eventType)}
                </div>

                {/* Contenido del evento */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-smooth">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${getEventBadgeColor(item.eventType)}`}>
                        {item.badge || item.eventType}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{item.titulo}</h4>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.fecha}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {item.descripcion}
                  </p>

                  {/* Detalle económico o metadatos protegidos */}
                  {item.metadata?.importe && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Importe registrado:</span>
                      {hideAmount ? (
                        <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Confidencial
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600">
                          {formatCurrency(item.metadata.importe)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pie de autoría */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Registrado por: <strong className="text-slate-600">{item.autorNombre}</strong></span>
                    {item.referenciaId && item.eventType === 'VISITA' && onOpenVisita && (
                      <button
                        onClick={() => onOpenVisita(item.referenciaId!)}
                        className="text-sky-600 hover:text-sky-800 font-semibold hover:underline"
                      >
                        Ver Reporte Completo &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
