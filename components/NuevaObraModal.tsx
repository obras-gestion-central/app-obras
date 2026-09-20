'use client';

import React, { useState } from 'react';
import { Obra, EstadoObra, User } from '@/types';
import { CreatableCombobox } from './CreatableCombobox';
import { GpsHelperInput } from './GpsHelperInput';
import { X, Building2, User as UserIcon, Check } from 'lucide-react';

interface NuevaObraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveObra: (obra: Partial<Obra>) => void;
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
  lineasProductoOptions,
  tiposObraOptions,
  onCreateOption,
  currentUserNombre,
  users = [],
  onOpenManageTaxonomias,
}) => {
  const [codigo, setCodigo] = useState(`OBR-2026-00${Math.floor(Math.random() * 90) + 10}`);
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
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState('2026-12-31');

  // Responsable de la obra seleccionado de la lista de usuarios
  const initialResponsible = users.find((u) => u.name === currentUserNombre) || users[0];
  const [responsableId, setResponsableId] = useState(initialResponsible?.id || 'usr-1');
  const [responsableNombre, setResponsableNombre] = useState(initialResponsible?.name || currentUserNombre);

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
      codigo,
      titulo,
      descripcion,
      direccion,
      municipio,
      provincia,
      lat,
      lng,
      lineaProductoPrincipal: lineaProducto,
      tipoObra,
      presupuestoAdjudicacion: Number(presupuesto) || 0,
      importeEjecutado: 0,
      porcentajeAvance: 5,
      estado: 'PLANIFICACION' as EstadoObra,
      fechaInicio,
      fechaFinPrevista: fechaFin,
      responsableId,
      responsableNombre,
      createdAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Cabecera */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Alta de Nueva Obra</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Registrar nuevo expediente georreferenciado</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Título de la Obra *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Reforma y Climatización Centro Logístico"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              required
            />
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
            <label className="block font-semibold text-slate-700 mb-1">Descripción del Proyecto</label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Alcance técnico y detalles del trabajo..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Municipio</label>
              <input
                type="text"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                required
              />
            </div>
          </div>

          {/* ASISTENTE FÁCIL DE COORDENADAS GPS (Zero conocimientos técnicos) */}
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
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 text-xs"
            >
              <Check className="w-4 h-4" /> Dar de Alta Obra
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
