'use client';

import React, { useState } from 'react';
import { FotoGPS, UserRole } from '@/types';
import { PERMISOS_POR_ROL } from '@/data/mockData';
import { 
  Camera, 
  MapPin, 
  Download, 
  Package, 
  Plus, 
  Eye, 
  X, 
  CheckCircle,
  Calendar,
  Compass
} from 'lucide-react';

interface FotosGalleryProps {
  fotos: FotoGPS[];
  userRole: UserRole;
  obraTitulo: string;
  obraLat: number;
  obraLng: number;
  onAddFoto: (foto: Partial<FotoGPS>) => void;
  currentUserNombre: string;
}

export const FotosGallery: React.FC<FotosGalleryProps> = ({
  fotos,
  userRole,
  obraTitulo,
  obraLat,
  obraLng,
  onAddFoto,
  currentUserNombre,
}) => {
  const permisos = PERMISOS_POR_ROL[userRole];
  const [selectedFoto, setSelectedFoto] = useState<FotoGPS | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [tituloFoto, setTituloFoto] = useState('');
  const [fotoUrlInput, setFotoUrlInput] = useState('');

  const handleDownloadAllZip = () => {
    alert(`Descarga en lote (.zip) iniciada para ${fotos.length} fotografías en alta resolución.`);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloFoto.trim()) return;

    const defaultImages = [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1000&auto=format&fit=crop&q=80'
    ];
    const pickedImg = fotoUrlInput.trim() || defaultImages[Math.floor(Math.random() * defaultImages.length)];

    onAddFoto({
      titulo: tituloFoto.trim(),
      url: pickedImg,
      miniaturaUrl: pickedImg.replace('w=1000', 'w=200'),
      lat: obraLat + (Math.random() - 0.5) * 0.0001,
      lng: obraLng + (Math.random() - 0.5) * 0.0001,
      altitud: Math.floor(Math.random() * 50) + 600,
      fechaCaptura: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
      subidoPor: currentUserNombre,
      distanciaMetrosAObra: Math.floor(Math.random() * 15) + 3,
    });

    setTituloFoto('');
    setFotoUrlInput('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Acciones */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-amber-500" />
            <span>Galería Fotográfica Georreferenciada</span>
          </h4>
          <p className="text-xs text-slate-500">
            Miniaturas con coordenadas GPS (EXIF) y verificación in situ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {fotos.length > 0 && (
            <button
              onClick={handleDownloadAllZip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-smooth"
              title="Descargar paquete comprimido de fotos en alta resolución"
            >
              <Package className="w-3.5 h-3.5 text-slate-600" />
              <span>Descargar .zip ({fotos.length})</span>
            </button>
          )}

          {permisos.crearVisitas && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-smooth"
            >
              <Plus className="w-4 h-4" />
              <span>Subir Foto GPS</span>
            </button>
          )}
        </div>
      </div>

      {/* Cuadrícula de Miniaturas */}
      {fotos.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No hay fotografías registradas aún en esta obra.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all"
            >
              {/* Imagen Miniatura */}
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={foto.miniaturaUrl || foto.url}
                  alt={foto.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Badge de Distancia GPS */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-slate-950/75 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-amber-400" />
                  <span>{foto.distanciaMetrosAObra || 0}m de obra</span>
                </div>

                {/* Botón flotante para ver detalle */}
                <button
                  onClick={() => setSelectedFoto(foto)}
                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  title="Ver imagen completa y coordenadas GPS"
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>

              {/* Pie de la miniatura */}
              <div className="p-2.5">
                <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{foto.titulo}</h5>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{foto.fechaCaptura}</span>
                  <a
                    href={foto.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-sky-600 p-0.5"
                    title="Descargar original"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Lightbox / Detalle de Foto y EXIF */}
      {selectedFoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">{selectedFoto.titulo}</span>
              <button
                onClick={() => setSelectedFoto(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[50vh]">
                <img
                  src={selectedFoto.url}
                  alt={selectedFoto.titulo}
                  className="max-h-[50vh] w-auto object-contain"
                />
              </div>

              {/* Metadatos GPS EXIF */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Latitud</span>
                  <strong className="text-slate-800 font-mono">{selectedFoto.lat.toFixed(6)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Longitud</span>
                  <strong className="text-slate-800 font-mono">{selectedFoto.lng.toFixed(6)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Altitud</span>
                  <strong className="text-slate-800">{selectedFoto.altitud || 0} m</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Distancia al centro</span>
                  <strong className="text-amber-600 font-semibold">{selectedFoto.distanciaMetrosAObra || 0} metros</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Fotografiado por: <strong>{selectedFoto.subidoPor}</strong> el {selectedFoto.fechaCaptura}</span>
                <a
                  href={selectedFoto.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar Alta Resolución
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Subir Foto */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" /> Subir Fotografía con Extracción GPS
            </h4>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título de la Fotografía</label>
                <input
                  type="text"
                  value={tituloFoto}
                  onChange={(e) => setTituloFoto(e.target.value)}
                  placeholder="Ej: Conexión de colector en planta baja"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-600" /> Extractor EXIF Activado
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  Al cargar fotos desde el smartphone o cámara de obra, el sistema extrae automáticamente la fecha, hora y coordenadas GPS exactas.
                </p>
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
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg"
                >
                  Confirmar y Subir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
