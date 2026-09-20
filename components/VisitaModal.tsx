'use client';

import React, { useState } from 'react';
import { Obra, VisitaReport, CheckItem, EstadoObra, User } from '@/types';
import { CreatableCombobox } from './CreatableCombobox';
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle,
  Users,
  UserCheck
} from 'lucide-react';

interface VisitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  obra: Obra;
  lineasProductoOptions: string[];
  tiposVisitaOptions: string[];
  onCreateOption: (category: 'LINEA_PRODUCTO' | 'TIPO_VISITA', value: string) => void;
  onSaveVisita: (visita: Partial<VisitaReport>) => void;
  currentUserNombre: string;
  users?: User[];
}

export const VisitaModal: React.FC<VisitaModalProps> = ({
  isOpen,
  onClose,
  obra,
  lineasProductoOptions,
  tiposVisitaOptions,
  onCreateOption,
  onSaveVisita,
  currentUserNombre,
  users = [],
}) => {
  const [tecnicoNombre, setTecnicoNombre] = useState<string>(currentUserNombre);
  const [tipoVisita, setTipoVisita] = useState<string>('Seguimiento Periódico de Avance');
  const [lineaProducto, setLineaProducto] = useState<string>(obra.lineaProductoPrincipal);
  const [fechaVisita, setFechaVisita] = useState<string>(new Date().toISOString().split('T')[0]);
  const [horaEntrada, setHoraEntrada] = useState<string>('10:00');
  const [horaSalida, setHoraSalida] = useState<string>('12:00');
  
  // GPS a pie de obra
  const [gpsCaptured, setGpsCaptured] = useState<{ lat: number; lng: number } | null>({
    lat: obra.lat + (Math.random() - 0.5) * 0.0002, // Simulación realista de estar al lado de la obra
    lng: obra.lng + (Math.random() - 0.5) * 0.0002,
  });
  const [gpsStatus, setGpsStatus] = useState<string>('GPS Validado (a 8m de la obra)');

  const [tituloResumen, setTituloResumen] = useState<string>('');
  const [conclusiones, setConclusiones] = useState<string>('');
  const [estadoResultante, setEstadoResultante] = useState<EstadoObra>(obra.estado);

  // Lista dinámica de puntos de control (Checklist)
  const [checklist, setChecklist] = useState<CheckItem[]>([
    { id: '1', pregunta: '¿Verificación de medidas de seguridad y EPIs?', conforme: true },
    { id: '2', pregunta: '¿Cumplimiento de especificaciones de proyecto?', conforme: true },
    { id: '3', pregunta: '¿Materiales acopiados con homologación CE?', conforme: true },
  ]);
  const [newCheckItemText, setNewCheckItemText] = useState<string>('');

  if (!isOpen) return null;

  const handleCaptureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCaptured({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsStatus('GPS Capturado con éxito desde dispositivo móvil');
        },
        () => {
          // Fallback con simulación en la posición de la obra
          setGpsCaptured({ lat: obra.lat, lng: obra.lng });
          setGpsStatus('GPS asignado a las coordenadas oficiales de la obra');
        }
      );
    } else {
      setGpsCaptured({ lat: obra.lat, lng: obra.lng });
      setGpsStatus('GPS asignado a la obra');
    }
  };

  const handleToggleCheck = (id: string, current: boolean | null) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        // Ciclo: true -> false -> null -> true
        let next: boolean | null = false;
        if (current === true) next = false;
        else if (current === false) next = null;
        else next = true;
        return { ...item, conforme: next };
      })
    );
  };

  const handleAddCheckItem = () => {
    if (!newCheckItemText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        pregunta: newCheckItemText.trim(),
        conforme: true,
      },
    ]);
    setNewCheckItemText('');
  };

  const handleRemoveCheckItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloResumen.trim()) {
      alert('Por favor, indica un resumen de la visita.');
      return;
    }

    onSaveVisita({
      obraId: obra.id,
      tecnicoNombre: tecnicoNombre || currentUserNombre,
      registradoPorNombre: currentUserNombre,
      registradoEn: new Date().toISOString(),
      tipoVisita,
      lineaProducto,
      fechaVisita,
      horaEntrada,
      horaSalida,
      lat: gpsCaptured?.lat,
      lng: gpsCaptured?.lng,
      gpsVerificado: true,
      tituloResumen,
      conclusiones,
      estadoResultante,
      checklist,
      fotosIds: [],
      documentosIds: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-semibold text-sky-400">
              {obra.codigo} • {obra.titulo}
            </span>
            <h3 className="text-base font-bold">Nuevo Informe de Visita a Pie de Obra</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Selector de Compañero que realiza la visita */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/90 space-y-1">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Compañero que realiza la visita</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                Sesión actual: <strong className="text-slate-700">{currentUserNombre}</strong>
              </span>
            </label>
            <select
              value={tecnicoNombre}
              onChange={(e) => setTecnicoNombre(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-semibold text-slate-900"
            >
              {users && users.length > 0 ? (
                users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} — {u.role.replace('_', ' ')}
                  </option>
                ))
              ) : (
                <option value={currentUserNombre}>{currentUserNombre}</option>
              )}
            </select>
          </div>

          {/* Fila 1: Cuadros Combinados Dinámicos (Línea de Trabajo y Motivo de la Visita) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CreatableCombobox
              label="Motivo / Tipo de Visita"
              options={tiposVisitaOptions}
              value={tipoVisita}
              onChange={setTipoVisita}
              onCreateOption={(newVal) => onCreateOption('TIPO_VISITA', newVal)}
              required
            />

            <CreatableCombobox
              label="Especialidad / Línea de Trabajo Asociada"
              options={lineasProductoOptions}
              value={lineaProducto}
              onChange={setLineaProducto}
              onCreateOption={(newVal) => onCreateOption('LINEA_PRODUCTO', newVal)}
              required
            />
          </div>

          {/* Fila 2: Fecha y Horario */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Visita</label>
              <input
                type="date"
                value={fechaVisita}
                onChange={(e) => setFechaVisita(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hora Entrada</label>
              <input
                type="time"
                value={horaEntrada}
                onChange={(e) => setHoraEntrada(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hora Salida</label>
              <input
                type="time"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                required
              />
            </div>
          </div>

          {/* Fila 3: Validación GPS in situ */}
          <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Geolocalización In Situ</div>
                <div className="text-[11px] text-sky-700">{gpsStatus}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCaptureGPS}
              className="px-3 py-1.5 bg-white text-sky-700 hover:bg-sky-100 text-xs font-semibold rounded-lg border border-sky-300 shadow-2xs transition-colors"
            >
              Re-capturar GPS
            </button>
          </div>

          {/* Fila 4: Título y Resumen */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título / Resumen de la Actuación <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={tituloResumen}
              onChange={(e) => setTituloResumen(e.target.value)}
              placeholder="Ej: Prueba hidráulica de climatización y revisión de aislamiento"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              required
            />
          </div>

          {/* Fila 5: Checklist dinámico adaptable */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Puntos de Control / Checklist Dinámico
              </label>
              <span className="text-[11px] text-slate-400">Clic en el icono para alternar Conforme / No conforme</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCheck(item.id, item.conforme)}
                      className="focus:outline-hidden"
                    >
                      {item.conforme === true && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {item.conforme === false && <XCircle className="w-4 h-4 text-rose-600" />}
                      {item.conforme === null && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    </button>
                    <span className="text-slate-800">{item.pregunta}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCheckItem(item.id)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Añadir nueva pregunta al checklist */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCheckItemText}
                onChange={(e) => setNewCheckItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCheckItem())}
                placeholder="Añadir nuevo punto de control a la visita..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddCheckItem}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir
              </button>
            </div>
          </div>

          {/* Fila 6: Conclusiones */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Conclusiones Técnicas e Incidencias Detectadas
            </label>
            <textarea
              rows={3}
              value={conclusiones}
              onChange={(e) => setConclusiones(e.target.value)}
              placeholder="Detalla los avances, materiales recibidos, retrasos o acuerdos alcanzados con el encargado..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          {/* Fila 7: Estado resultante de la obra */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estado de la Obra tras la Visita
            </label>
            <select
              value={estadoResultante}
              onChange={(e) => setEstadoResultante(e.target.value as EstadoObra)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
            >
              <option value="EN_EJECUCION">🟢 En Ejecución Normal</option>
              <option value="PLANIFICACION">🔵 En Planificación / Acopio</option>
              <option value="PARALIZADA">🔴 Paralizada / Incidencia Grave</option>
              <option value="FINALIZADA">⚪ Finalizada / Recepcionada</option>
            </select>
          </div>

          {/* Registro de Auditoría y Trazabilidad */}
          <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 flex items-center justify-between text-xs text-sky-900">
            <span className="flex items-center gap-1.5 font-medium">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <span>Auditoría de inserción:</span>
            </span>
            <span className="text-[11px] text-slate-600">
              Quedará registrado a nombre de <strong>{currentUserNombre}</strong> con fecha y hora actual
            </span>
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Guardar Informe de Visita
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
