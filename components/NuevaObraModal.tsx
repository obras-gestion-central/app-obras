'use client';

import React, { useState } from 'react';
import { Obra, EstadoObra } from '@/types';
import { CreatableCombobox } from './CreatableCombobox';
import { X, Building2, MapPin, Check } from 'lucide-react';

interface NuevaObraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveObra: (obra: Partial<Obra>) => void;
  lineasProductoOptions: string[];
  tiposObraOptions: string[];
  onCreateOption: (category: 'LINEA_PRODUCTO' | 'TIPO_OBRA', value: string) => void;
  currentUserNombre: string;
}

export const NuevaObraModal: React.FC<NuevaObraModalProps> = ({
  isOpen,
  onClose,
  onSaveObra,
  lineasProductoOptions,
  tiposObraOptions,
  onCreateOption,
  currentUserNombre,
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

  if (!isOpen) return null;

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
      responsableNombre: currentUserNombre,
      createdAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold">Alta de Nueva Obra en el Sistema</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Código de Expediente</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Presupuesto Adjudicación (€)</label>
              <input
                type="number"
                value={presupuesto}
                onChange={(e) => setPresupuesto(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-700"
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
              placeholder="Ej: Reforma y Climatización Centro Logístico Las Rozas"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Descripción del Proyecto</label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Alcance técnico del trabajo a ejecutar..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
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
              required
            />

            <CreatableCombobox
              label="Tipología de Obra"
              options={tiposObraOptions}
              value={tipoObra}
              onChange={setTipoObra}
              onCreateOption={(v) => onCreateOption('TIPO_OBRA', v)}
              required
            />
          </div>

          {/* Localización */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Dirección Postal</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle, número o polígono"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Municipio</label>
              <input
                type="text"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Coordenadas GPS */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-sky-50 rounded-xl border border-sky-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Latitud GPS</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Longitud GPS</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                required
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Fin Prevista</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Dar de Alta Obra
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
