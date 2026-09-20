'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Map as MapIcon, Clipboard, Check, AlertCircle } from 'lucide-react';

interface GpsHelperInputProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  municipio?: string;
}

export const GpsHelperInput: React.FC<GpsHelperInputProps> = ({
  lat,
  lng,
  onChange,
  municipio,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'map' | 'link'>('quick');
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [pasteLinkInput, setPasteLinkInput] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Referencias para el mini-mapa interactivo
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // 1. Obtener ubicación con 1 toque usando el GPS del móvil / navegador
  const handleGetDeviceLocation = () => {
    setGpsStatus('Localizando tu posición vía satélite...');
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Tu dispositivo o navegador no soporta geolocalización GPS.');
      setGpsStatus(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(5));
        const userLng = Number(pos.coords.longitude.toFixed(5));
        onChange(userLat, userLng);
        setGpsStatus(`¡Ubicación GPS capturada con éxito! (Precisión ±${Math.round(pos.coords.accuracy || 5)} metros)`);
        setGpsError(null);
      },
      (err) => {
        setGpsError('No se pudo obtener la posición GPS. Asegúrate de dar permisos de ubicación al navegador.');
        setGpsStatus(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 2. Parser inteligente para pegar enlaces de Google Maps o WhatsApp
  const handleParseLink = (text: string) => {
    setPasteLinkInput(text);
    setPasteSuccess(false);
    setGpsError(null);

    if (!text.trim()) return;

    // Patrón 1: Coordenadas directas "40.4168, -3.7038" o "40.4168,-3.7038"
    const directRegex = /(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/;
    const directMatch = text.match(directRegex);
    if (directMatch) {
      const parsedLat = parseFloat(directMatch[1]);
      const parsedLng = parseFloat(directMatch[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        onChange(Number(parsedLat.toFixed(5)), Number(parsedLng.toFixed(5)));
        setPasteSuccess(true);
        setGpsStatus(`Coordenadas extraídas: ${parsedLat.toFixed(5)}, ${parsedLng.toFixed(5)}`);
        return;
      }
    }

    // Patrón 2: Enlace de Google Maps con @lat,lng (ej: /@40.4168,-3.7038,17z)
    const atRegex = /@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/;
    const atMatch = text.match(atRegex);
    if (atMatch) {
      const parsedLat = parseFloat(atMatch[1]);
      const parsedLng = parseFloat(atMatch[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        onChange(Number(parsedLat.toFixed(5)), Number(parsedLng.toFixed(5)));
        setPasteSuccess(true);
        setGpsStatus(`Coordenadas extraídas del enlace de Google Maps.`);
        return;
      }
    }

    // Patrón 3: Parámetro q=lat,lng o ll=lat,lng
    const qRegex = /[?&](?:q|ll)=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/;
    const qMatch = text.match(qRegex);
    if (qMatch) {
      const parsedLat = parseFloat(qMatch[1]);
      const parsedLng = parseFloat(qMatch[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        onChange(Number(parsedLat.toFixed(5)), Number(parsedLng.toFixed(5)));
        setPasteSuccess(true);
        setGpsStatus(`Coordenadas extraídas de Google Maps.`);
        return;
      }
    }

    setGpsError('No se reconocieron coordenadas en el enlace o texto pegado.');
  };

  // 3. Mini-mapa interactivo para seleccionar tocando la pantalla
  useEffect(() => {
    if (activeTab !== 'map' || typeof window === 'undefined') return;

    let isMounted = true;

    const initMiniMap = async () => {
      const L = (await import('leaflet')).default;
      if (!isMounted || !miniMapContainerRef.current) return;

      if (!miniMapInstanceRef.current) {
        const map = L.map(miniMapContainerRef.current, {
          center: [lat || 40.4168, lng || -3.7038],
          zoom: 14,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OSM',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const marker = L.marker([lat || 40.4168, lng || -3.7038], {
          draggable: true,
        }).addTo(map);

        // Al hacer clic en cualquier punto del mapa
        map.on('click', (e: any) => {
          const newLat = Number(e.latlng.lat.toFixed(5));
          const newLng = Number(e.latlng.lng.toFixed(5));
          marker.setLatLng([newLat, newLng]);
          onChange(newLat, newLng);
          setGpsStatus(`Posición marcada en el mapa: ${newLat}, ${newLng}`);
        });

        // Al arrastrar el marcador
        marker.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
          const newLat = Number(pos.lat.toFixed(5));
          const newLng = Number(pos.lng.toFixed(5));
          onChange(newLat, newLng);
          setGpsStatus(`Marcador fijado: ${newLat}, ${newLng}`);
        });

        miniMapInstanceRef.current = map;
        markerRef.current = marker;

        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      } else {
        miniMapInstanceRef.current.invalidateSize();
      }
    };

    initMiniMap();

    return () => {
      isMounted = false;
    };
  }, [activeTab, lat, lng, onChange]);

  return (
    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 space-y-3">
      
      {/* Selector de método */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-sky-600" />
          <span>Localización de la Obra (Asistente Fácil)</span>
        </label>

        {/* Pestañas de método */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'quick' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📍 1 Toque GPS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'map' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🗺️ Tocar Mapa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'link' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Pegar Enlace
          </button>
        </div>
      </div>

      {/* MÉTODO 1: 1 Toque GPS del Teléfono */}
      {activeTab === 'quick' && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGetDeviceLocation}
            className="w-full py-2.5 px-3 bg-white hover:bg-sky-50 active:scale-98 text-sky-700 border border-sky-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Navigation className="w-4 h-4 text-sky-600 animate-pulse" />
            <span>Usar Mi Ubicación Actual (GPS del Teléfono)</span>
          </button>
          <p className="text-[10px] text-slate-500 text-center">
            Pulsa este botón si estás a pie de obra o en el lugar exacto.
          </p>
        </div>
      )}

      {/* MÉTODO 2: Tocar sobre el Mapa */}
      {activeTab === 'map' && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-600">
            👉 <strong>Toca o arrastra la chincheta</strong> en el mapa sobre el lugar donde se ubica la obra:
          </p>
          <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner">
            <div ref={miniMapContainerRef} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* MÉTODO 3: Pegar Enlace de Google Maps o WhatsApp */}
      {activeTab === 'link' && (
        <div className="space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={pasteLinkInput}
              onChange={(e) => handleParseLink(e.target.value)}
              placeholder="Pega aquí el enlace de Google Maps o WhatsApp..."
              className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {pasteSuccess && (
              <Check className="w-4 h-4 text-emerald-600 absolute right-2.5" />
            )}
          </div>
          <p className="text-[10px] text-slate-500">
            Acepta enlaces como <em>maps.google.com/?q=...</em> o texto de coordenadas directas.
          </p>
        </div>
      )}

      {/* Mensajes de Estado o Error */}
      {gpsStatus && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] flex items-center gap-1.5 font-medium animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{gpsStatus}</span>
        </div>
      )}

      {gpsError && (
        <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] flex items-center gap-1.5 font-medium animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Valores resultantes visibles de forma compacta */}
      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Coordenadas fijadas:</span>
        <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
          Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
        </span>
      </div>

    </div>
  );
};
