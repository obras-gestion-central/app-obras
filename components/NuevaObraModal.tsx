'use client';

import React, { useState, useEffect } from 'react';
import { Obra, EstadoObra, User } from '@/types';
import { CreatableCombobox } from './CreatableCombobox';
import { GpsHelperInput } from './GpsHelperInput';
import { X, Building2, User as UserIcon, Check, Edit2 } from 'lucide-react';

interface NuevaObraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveObra: (obra: Partial<Obra>) => void;
  initialObra?: Obra | null;
  lineasProductoOptions: string[];
  tiposObraOptions: string[];
  onCreateOption: (category: 'LINEA_PRODUCTO' | 'TIPO_OBRA', value: string) => void;
  currentUserNombre: string;
  users?: User[];
  onOpenManageTaxonomias?: (category: 'LINEA_PRODUCTO' | 'TIPO_OBRA') => void;
}

export const NuevaObraModal: React.FC<NuevaObraModalProps> = ({
  isOpen,
  onClose,
  onSaveObra,
  initialObra,
  lineasProductoOptions,
  tiposObraOptions,
  onCreateOption,
  currentUserNombre,
  users = [],
  onOpenManageTaxonomias,
}) => {
  const isEditMode = Boolean(initialObra);

  const [codigo, setCodigo] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [municipio, setMunicipio] = useState('Madrid');
  const [provincia, setProvincia] = useState('Madrid');
  const [lat, setLat] = useState<number>(40.4168);
  const [lng, setLng] = useState<number>(-3.7038);
  const [lineaProducto, setLineaProducto] = useState(lineasProductoOptions[0] || 'Climatización y Aerotermia');
  const [tipoObra, setTipoObra] = useState(tiposObraOptions[0] || 'Residencial Multifamiliar');
  const [presupuesto, setPresupuesto] = useState<number | ''>(125000);
  const [estado, setEstado] = useState<EstadoObra>('PLANIFICACION');
  const [porcentajeAvance, setPorcentajeAvance] = useState<number>(5);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState('2026-12-31');
  const [responsableId, setResponsableId] = useState('usr-1');
  const [responsableNombre, setResponsableNombre] = useState(currentUserNombre);

  // Sincronizar campos cuando se abre el modal o cambia initialObra
  useEffect(() => {
    if (initialObra) {
      setCodigo(initialObra.codigo || '');
      setTitulo(initialObra.titulo || '');
      setDescripcion(initialObra.descripcion || '');
      setDireccion(initialObra.direccion || '');
      setMunicipio(initialObra.municipio || 'Madrid');
      setProvincia(initialObra.provincia || 'Madrid');
      setLat(initialObra.lat || 40.4168);
      setLng(initialObra.lng || -3.7038);
      setLineaProducto(initialObra.lineaProductoPrincipal || lineasProductoOptions[0] || 'Climatización y Aerotermia');
      setTipoObra(initialObra.tipoObra || tiposObraOptions[0] || 'Residencial Multifamiliar');
      setPresupuesto(initialObra.presupuestoAdjudicacion ?? 125000);
      setEstado(initialObra.estado || 'PLANIFICACION');
      setPorcentajeAvance(initialObra.porcentajeAvance ?? 5);
      setFechaInicio(initialObra.fechaInicio || new Date().toISOString().split('T')[0]);
      setFechaFin(initialObra.fechaFinPrevista || '2026-12-31');
      setResponsableId(initialObra.responsableId || 'usr-1');
      setResponsableNombre(initialObra.responsableNombre || '');
    } else {
      setCodigo(`OBR-2026-00${Math.floor(Math.random() * 90) + 10}`);
      setTitulo('');
      setDescripcion('');
      setDireccion('');
      setMunicipio('Madrid');
      setProvincia('Madrid');
      setLat(40.4168);
      setLng(-3.7038);
      setLineaProducto(lineasProductoOptions[0] || 'Climatización y Aerotermia');
      setTipoObra(tiposObraOptions[0] || 'Residencial Multifamiliar');
      setPresupuesto(125000);
      setEstado('PLANIFICACION');
      setPorcentajeAvance(5);
      setFechaInicio(new Date().toISOString().split('T')[0]);
      setFechaFin('2026-12-31');
      const initialResponsible = users.find((u) => u.name === currentUserNombre) || users[0];
      setResponsableId(initialResponsible?.id || 'usr-1');
      setResponsableNombre(initialResponsible?.name || currentUserNombre);
    }
  }, [isOpen, initialObra]);

  if (!isOpen) return null;

  const handleResponsibleChange = (selectedId: string) => {
    setResponsableId(selectedId);
    const found = users.find((u) => u.id === selectedId);
    if (found) {
      setResponsableNombre(found.name);
    }
  };

  const handleGpsChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    onSaveObra({
      ...(initialObra ? { id: initialObra.id } : {}),
      codigo,
      titulo: titulo.trim(),
      descripcion,
      direccion,
      municipio,
      provincia,
      lat,
      lng,
      lineaProductoPrincipal: lineaProducto,
      tipoObra,
      presupuestoAdjudicacion: Number(presupuesto) || 0,
      estado,
      porcentajeAvance: Number(porcentajeAvance) || 0,
      fechaInicio,
      fechaFinPrevista: fechaFin,
      responsableId,
      responsableNombre,
      ...(initialObra ? {} : { createdAt: new Date().toISOString(), importeEjecutado: 0 }),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Cabecera dinámica (Alta vs Edición) */}
        <div className={`px-5 py-4 text-white flex items-center justify-between ${
          isEditMode 
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-800/40' 
            : 'bg-slate-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
              isEditMode ? 'bg-indigo-600' : 'bg-sky-600'
            }`}>
              {isEditMode ? <Edit2 className="w-5 h-5 text-white" /> : <Building2 className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isEditMode ? 'Editar Obra y Detalles Básicos' : 'Alta de Nueva Obra'}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-300">
                {isEditMode 
                  ? `Modificando expediente: ${initialObra?.codigo || ''}` 
                  : 'Registrar nuevo expediente georreferenciado'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          
          {/* Nombre o Título de la Obra (Campo Principal) */}
          <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-200/80 space-y-1.5">
            <label className="block font-bold text-sky-950 text-xs">
              Nombre o Título de la Obra *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Reforma y Climatización Centro Logístico"
              className="w-full px-3.5 py-2.5 bg-white border border-sky-300 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Código de Expediente</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Presupuesto Adjudicación (€)</label>
              <input
                type="number"
                value={presupuesto}
                onChange={(e) => setPresupuesto(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-700 text-xs"
                required
              />
            </div>
          </div>

          {/* Estado de la Obra y Porcentaje de Avance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estado del Proyecto *</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoObra)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                required
              >
                <option value="PLANIFICACION">Planificación</option>
                <option value="EN_EJECUCION">En Ejecución</option>
                <option value="PARALIZADA">Paralizada</option>
                <option value="FINALIZADA">Finalizada</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Porcentaje de Avance: <strong className="text-sky-700">{porcentajeAvance}%</strong>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={porcentajeAvance}
                  onChange={(e) => setPorcentajeAvance(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-20 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                  required
                />
                <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-600 h-full rounded-full transition-all duration-200" 
                    style={{ width: `${porcentajeAvance}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selector de Responsable de la Obra (de la lista de usuarios) */}
          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-200/80 space-y-1.5">
            <label className="block font-bold text-indigo-950 text-xs flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-indigo-600" />
              <span>Responsable Asignado de la Obra *</span>
            </label>
            <select
              value={responsableId}
              onChange={(e) => handleResponsibleChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              required
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-indigo-700">
              Esta persona figurará en los expedientes, certificados y dossieres oficiales.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Descripción del Proyecto y Alcance</label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Alcance técnico, cliente o detalles del trabajo..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Cuadros Combinados Dinámicos (Línea de Producto y Tipo de Obra) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CreatableCombobox
              label="Línea de Producto Principal"
              options={lineasProductoOptions}
              value={lineaProducto}
              onChange={setLineaProducto}
              onCreateOption={(v) => onCreateOption('LINEA_PRODUCTO', v)}
              onManage={onOpenManageTaxonomias ? () => onOpenManageTaxonomias('LINEA_PRODUCTO') : undefined}
              required
            />

            <CreatableCombobox
              label="Tipología de Obra"
              options={tiposObraOptions}
              value={tipoObra}
              onChange={setTipoObra}
              onCreateOption={(v) => onCreateOption('TIPO_OBRA', v)}
              onManage={onOpenManageTaxonomias ? () => onOpenManageTaxonomias('TIPO_OBRA') : undefined}
              required
            />
          </div>

          {/* Dirección y Municipio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Dirección Postal</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle, número o polígono"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Municipio</label>
              <input
                type="text"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          {/* ASISTENTE FÁCIL DE COORDENADAS GPS */}
          <GpsHelperInput
            lat={lat}
            lng={lng}
            onChange={handleGpsChange}
            municipio={municipio}
          />

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Fin Prevista</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                isEditMode
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isEditMode ? 'Guardar Cambios' : 'Dar de Alta Obra'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
