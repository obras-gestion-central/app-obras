'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Obra, FotoGPS, UserRole } from '@/types';
import { PERMISOS_POR_ROL } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import { Layers, Camera, Maximize2, Compass, Info } from 'lucide-react';

interface MapViewProps {
  obras: Obra[];
  fotos: FotoGPS[];
  selectedObraId: string | null;
  onSelectObra: (id: string) => void;
  onOpenExpediente?: (id: string) => void;
  userRole: UserRole;
  isPickingLocation?: boolean;
  onLocationPicked?: (lat: number, lng: number) => void;
  topOffsetClassName?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  obras,
  fotos,
  selectedObraId,
  onSelectObra,
  onOpenExpediente,
  userRole,
  isPickingLocation = false,
  onLocationPicked,
  topOffsetClassName = 'top-20 sm:top-4',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const photosLayerRef = useRef<any>(null);
  const streetLayerRef = useRef<any>(null);
  const satelliteLayerRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<'street' | 'satellite'>('street');
  const [showPhotoPins, setShowPhotoPins] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  const permisos = PERMISOS_POR_ROL[userRole];

  // Carga e inicialización de Leaflet en el cliente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Centro inicial en el centro geográfico de las obras simuladas (Madrid y alrededores)
        const map = L.map(mapContainerRef.current, {
          center: [40.4412, -3.7005],
          zoom: 11,
          zoomControl: false,
        });

        // Capa Callejero Gratuita (OpenStreetMap)
        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        });

        // Capa Satelital Gratuita de Alta Definición (Esri World Imagery)
        const satelliteLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri',
          }
        );

        streetLayer.addTo(map);
        streetLayerRef.current = streetLayer;
        satelliteLayerRef.current = satelliteLayer;

        // Zoom en esquina inferior derecha para pantallas grandes
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        const photosLayer = L.layerGroup().addTo(map);

        markersLayerRef.current = markersLayer;
        photosLayerRef.current = photosLayer;
        mapInstanceRef.current = map;

        setIsLeafletReady(true);
      }
    };

    initMap();

    // Redimensionar automáticamente si cambia el tamaño de la ventana
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Forzar invalidateSize cuando Leaflet esté listo
  useEffect(() => {
    if (isLeafletReady && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isLeafletReady]);

  // Cambio de capa Callejero <-> Satélite
  useEffect(() => {
    if (!mapInstanceRef.current || !streetLayerRef.current || !satelliteLayerRef.current) return;

    const map = mapInstanceRef.current;
    if (activeLayer === 'satellite') {
      map.removeLayer(streetLayerRef.current);
      satelliteLayerRef.current.addTo(map);
    } else {
      map.removeLayer(satelliteLayerRef.current);
      streetLayerRef.current.addTo(map);
    }
  }, [activeLayer]);

  // Renderizado de chinchetas de obras y fotos
  useEffect(() => {
    if (!isLeafletReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    const renderMarkers = async () => {
      const L = (await import('leaflet')).default;
      const markersLayer = markersLayerRef.current;
      const photosLayer = photosLayerRef.current;

      markersLayer.clearLayers();
      photosLayer.clearLayers();

      const validObras = obras.filter((o) => !o.isDeleted);

      validObras.forEach((obra) => {
        // Color según estado
        let colorClass = 'bg-emerald-600 border-emerald-300 shadow-emerald-900/30';
        if (obra.estado === 'PLANIFICACION') colorClass = 'bg-sky-600 border-sky-300 shadow-sky-900/30';
        if (obra.estado === 'PARALIZADA') colorClass = 'bg-rose-600 border-rose-300 shadow-rose-900/30';
        if (obra.estado === 'FINALIZADA') colorClass = 'bg-slate-600 border-slate-300 shadow-slate-900/30';

        const isSelected = obra.id === selectedObraId;

        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 active:scale-95'}">
            <div class="w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center shadow-lg border-2">
              <span class="text-[10px] font-black tracking-tighter">${obra.codigo.split('-')[2] || 'OB'}</span>
            </div>
            ${isSelected ? '<div class="absolute -inset-1.5 rounded-full border-2 border-amber-400 animate-ping opacity-75"></div>' : ''}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-map-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const marker = L.marker([obra.lat, obra.lng], { icon: customIcon });

        // Popup descriptivo con enlace al expediente
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-slate-800 text-xs font-sans min-w-[210px] select-none';
        popupContent.innerHTML = `
          <div id="popup-body-${obra.id}" class="cursor-pointer group hover:bg-slate-50 p-1 -m-1 rounded-lg transition-colors mb-2" title="Clic para acceder al expediente">
            <div class="font-bold text-sm text-slate-900 group-hover:text-sky-600 flex items-center justify-between gap-1 mb-0.5">
              <span class="truncate">${obra.titulo}</span>
              <span class="text-[10px] text-sky-600 font-bold shrink-0">Ver →</span>
            </div>
            <div class="text-[11px] text-slate-500 font-mono mb-1.5">${obra.codigo} • ${obra.municipio}</div>
            <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div class="bg-sky-600 h-1.5 rounded-full" style="width: ${obra.porcentajeAvance}%"></div>
            </div>
          </div>
          <button id="btn-popup-${obra.id}" class="w-full py-1.5 px-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold rounded-lg text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer" title="Seleccionar obra y abrir su expediente completo">
            <svg class="w-3.5 h-3.5 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path d="M6 14l1.5-2.9A2 2 0 019.24 10H20a2 2 0 011.94 2.5l-1.54 6a2 2 0 01-1.95 1.5H4a2 2 0 01-2-2V5a2 2 0 012-2h3.9a2 2 0 011.69.9l.81 1.2a2 2 0 001.67.9H18a2 2 0 012 2v2"/></svg>
            <span>Seleccionar Obra</span>
          </button>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-popup-${obra.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              onSelectObra(obra.id);
              if (onOpenExpediente) {
                onOpenExpediente(obra.id);
              }
            };
          }
          const body = document.getElementById(`popup-body-${obra.id}`);
          if (body) {
            body.onclick = (e) => {
              e.stopPropagation();
              onSelectObra(obra.id);
              if (onOpenExpediente) {
                onOpenExpediente(obra.id);
              }
            };
          }
        });

        // El clic directo en el marcador selecciona la obra inmediatamente (vital para el bottom sheet táctil)
        marker.on('click', () => {
          onSelectObra(obra.id);
        });

        markersLayer.addLayer(marker);
      });

      // Renderizar fotos geolocalizadas si la capa está activa
      if (showPhotoPins) {
        fotos.forEach((foto) => {
          const photoIconHtml = `
            <div class="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md border border-white hover:scale-125 transition-transform cursor-pointer" title="${foto.titulo}">
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 9a3 3 0 100 6 3 3 0 000-6zm-7 9a1 1 0 01-1-1V8a1 1 0 011-1h2.268a2 2 0 001.664-.89l.812-1.22A2 2 0 0111.408 4h1.184a2 2 0 011.664.89l.812 1.22A2 2 0 0016.732 7H19a1 1 0 011 1v9a1 1 0 01-1 1H5z"/></svg>
            </div>
          `;

          const photoIcon = L.divIcon({
            html: photoIconHtml,
            className: 'photo-pin',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const pMarker = L.marker([foto.lat, foto.lng], { icon: photoIcon });
          pMarker.bindPopup(`
            <div class="text-xs p-1 text-slate-800 max-w-[200px]">
              <img src="${foto.miniaturaUrl}" class="w-full h-24 object-cover rounded mb-1" />
              <div class="font-bold">${foto.titulo}</div>
              <div class="text-[10px] text-slate-500">Tomada: ${foto.fechaCaptura}</div>
              <div class="text-[10px] text-amber-600 font-semibold">Distancia a obra: ${foto.distanciaMetrosAObra || 0}m</div>
            </div>
          `);
          photosLayer.addLayer(pMarker);
        });
      }

      // Si hay una obra seleccionada, centrar suavemente en ella
      if (selectedObraId) {
        const selected = validObras.find((o) => o.id === selectedObraId);
        if (selected) {
          mapInstanceRef.current.setView([selected.lat, selected.lng], 14, { animate: true });
        }
      }
    };

    renderMarkers();
  }, [isLeafletReady, obras, fotos, selectedObraId, showPhotoPins, permisos.verDatosEconomicos, onSelectObra]);

  const handleCenterAll = () => {
    if (!mapInstanceRef.current || obras.length === 0) return;
    const validObras = obras.filter((o) => !o.isDeleted);
    if (validObras.length === 0) return;

    import('leaflet').then((L) => {
      const bounds = L.default.latLngBounds(validObras.map((o) => [o.lat, o.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 select-none">
      {/* Contenedor DOM para Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Controles Flotantes del Mapa (En posición lateral derecha, sin tapar el buscador superior) */}
      <div className={`absolute ${topOffsetClassName} right-3 z-20 flex flex-col gap-1.5`}>
        
        {/* Selector Rápido Callejero / Satélite */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-0.5 shadow-md border border-slate-200/80 flex flex-col gap-0.5">
          <button
            onClick={() => setActiveLayer('street')}
            className={`p-2 rounded-lg flex items-center justify-center transition-smooth ${
              activeLayer === 'street'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Capa Callejero (OpenStreetMap)"
          >
            <Compass className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveLayer('satellite')}
            className={`p-2 rounded-lg flex items-center justify-center transition-smooth ${
              activeLayer === 'satellite'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Capa Satélite HD (Esri Gratuito)"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Botón Alternar Fotos GPS */}
        <button
          onClick={() => setShowPhotoPins(!showPhotoPins)}
          className={`p-2 rounded-xl shadow-md border transition-smooth flex items-center justify-center ${
            showPhotoPins
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
              : 'bg-white/95 backdrop-blur-md text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
          title="Mostrar u ocultar fotos georreferenciadas a pie de obra"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Botón Encuadre Total */}
        <button
          onClick={handleCenterAll}
          className="p-2 bg-white/95 backdrop-blur-md hover:bg-slate-100 text-slate-700 rounded-xl shadow-md border border-slate-200 transition-smooth flex items-center justify-center"
          title="Centrar y encuadrar todas las obras"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Botón Leyenda (Móvil) */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`sm:hidden p-2 rounded-xl shadow-md border transition-smooth flex items-center justify-center ${
            showLegend
              ? 'bg-slate-800 text-white border-slate-700'
              : 'bg-white/95 backdrop-blur-md text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
          title="Ver leyenda de colores de obras"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Leyenda Inteligente: visible fija en pantallas medianas/grandes, o desplegable en móvil */}
      {(showLegend || false) && (
        <div className="sm:hidden absolute top-40 right-3 z-20 bg-slate-900/95 text-white backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-700 text-[11px] space-y-1.5 animate-in fade-in-50 duration-150">
          <div className="font-bold text-xs text-sky-400 mb-1 border-b border-slate-700 pb-1">Leyenda</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>En Ejecución</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>Planificación</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Paralizada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Foto GPS</span>
          </div>
        </div>
      )}

      {/* Leyenda fija en escritorio (esquina inferior izquierda) */}
      <div className="hidden sm:flex absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 text-[11px] text-slate-600 items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>En Ejecución</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
          <span>Planificación</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span>Paralizada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Foto GPS</span>
        </div>
      </div>
    </div>
  );
};
