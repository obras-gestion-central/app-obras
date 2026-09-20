'use client';

import React, { useState } from 'react';
import { Obra, VisitaReport, Documento, FotoGPS, TimelineEvent, TaxonomyItem, UserRole, EstadoObra } from '@/types';
import { 
  OBRAS_MOCK, 
  VISITAS_MOCK, 
  DOCUMENTOS_MOCK, 
  FOTOS_GPS_MOCK, 
  TIMELINE_MOCK, 
  TAXONOMIAS_INICIALES, 
  USUARIOS_MOCK, 
  PERMISOS_POR_ROL 
} from '@/data/mockData';
import { formatCurrency, formatDate, exportObrasToCSV, downloadFile } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { MapView } from '@/components/MapView';
import { TimelineFeed } from '@/components/TimelineFeed';
import { DocumentosManager } from '@/components/DocumentosManager';
import { FotosGallery } from '@/components/FotosGallery';
import { VisitaModal } from '@/components/VisitaModal';
import { DossierModal } from '@/components/DossierModal';
import { TrashBinModal } from '@/components/TrashBinModal';
import { NuevaObraModal } from '@/components/NuevaObraModal';
import { AdminUsersRolesModal } from '@/components/AdminUsersRolesModal';

import { 
  Building2, 
  MapPin, 
  Calendar, 
  FileText, 
  Camera, 
  Plus, 
  Search, 
  FileDown, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  EyeOff, 
  Trash2,
  Receipt,
  Clock,
  ChevronRight,
  TrendingUp,
  FolderOpen
} from 'lucide-react';

export default function HomePage() {
  // Estado Principal
  const [obras, setObras] = useState<Obra[]>(OBRAS_MOCK);
  const [visitas, setVisitas] = useState<VisitaReport[]>(VISITAS_MOCK);
  const [documentos, setDocumentos] = useState<Documento[]>(DOCUMENTOS_MOCK);
  const [fotos, setFotos] = useState<FotoGPS[]>(FOTOS_GPS_MOCK);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(TIMELINE_MOCK);
  const [taxonomias, setTaxonomias] = useState<TaxonomyItem[]>(TAXONOMIAS_INICIALES);

  // Usuarios y Matriz de Permisos Dinámica
  const [users, setUsers] = useState<User[]>(USUARIOS_MOCK);
  const [permisosRoles, setPermisosRoles] = useState<Record<UserRole, PermisosRol>>(PERMISOS_POR_ROL);

  // Rol activo (RBAC interactivo para pruebas y depuración)
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [selectedObraId, setSelectedObraId] = useState<string>('obr-1');
  const [activeTabDetail, setActiveTabDetail] = useState<'timeline' | 'visitas' | 'fotos' | 'documentos'>('timeline');
  const [activeView, setActiveView] = useState<'mapa' | 'listado'>('mapa');

  // Filtros de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('TODOS');

  // Modales
  const [showVisitaModal, setShowVisitaModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [showNuevaObraModal, setShowNuevaObraModal] = useState(false);
  const [showAdminRolesModal, setShowAdminRolesModal] = useState(false);

  const currentUser = users.find((u) => u.role === currentRole) || users[0];
  const permisos = permisosRoles[currentRole];

  // Handlers para administración de usuarios y permisos
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const handleAddUser = (newUser: Omit<User, 'id'>) => {
    const created: User = {
      ...newUser,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, created]);
  };

  const handleTogglePermiso = (role: UserRole, permisoKey: keyof PermisosRol) => {
    setPermisosRoles((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permisoKey]: !prev[role][permisoKey],
      },
    }));
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole !== 'ADMIN') {
      setShowAdminRolesModal(false);
    }
  };

  // Listas para cuadros combinados dinámicos
  const lineasProductoOptions = Array.from(
    new Set([
      ...taxonomias.filter((t) => t.categoria === 'LINEA_PRODUCTO').map((t) => t.valor),
      ...obras.map((o) => o.lineaProductoPrincipal),
    ])
  );

  const tiposObraOptions = Array.from(
    new Set([
      ...taxonomias.filter((t) => t.categoria === 'TIPO_OBRA').map((t) => t.valor),
      ...obras.map((o) => o.tipoObra),
    ])
  );

  const tiposVisitaOptions = Array.from(
    new Set([
      ...taxonomias.filter((t) => t.categoria === 'TIPO_VISITA').map((t) => t.valor),
      ...visitas.map((v) => v.tipoVisita),
    ])
  );

  // Crear nueva opción en el catálogo al vuelo (Creatable Combobox)
  const handleCreateTaxonomy = (category: 'LINEA_PRODUCTO' | 'TIPO_OBRA' | 'TIPO_VISITA', value: string) => {
    const newItem: TaxonomyItem = {
      id: `tax-${Date.now()}`,
      categoria: category,
      valor: value,
    };
    setTaxonomias((prev) => [...prev, newItem]);
  };

  // Obra seleccionada activa
  const selectedObra = obras.find((o) => o.id === selectedObraId && !o.isDeleted) || obras.find((o) => !o.isDeleted);

  // Obras activas filtradas
  const activeObras = obras.filter((o) => {
    if (o.isDeleted) return false;
    if (estadoFilter !== 'TODOS' && o.estado !== estadoFilter) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        o.titulo.toLowerCase().includes(q) ||
        o.codigo.toLowerCase().includes(q) ||
        o.municipio.toLowerCase().includes(q) ||
        o.lineaProductoPrincipal.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Elementos eliminados (Papelera)
  const deletedObras = obras.filter((o) => o.isDeleted);
  const deletedDocumentos = documentos.filter((d) => d.isDeleted);

  // Acciones de Soft Delete y Restauración
  const handleSoftDeleteObra = (obraId: string) => {
    if (!confirm('¿Seguro que deseas enviar esta obra a la Papelera de reciclaje? Podrás restaurarla en cualquier momento.')) return;
    setObras((prev) =>
      prev.map((o) =>
        o.id === obraId
          ? { ...o, isDeleted: true, deletedAt: new Date().toLocaleTimeString('es-ES'), deletedBy: currentUser.name }
          : o
      )
    );
  };

  const handleRestoreObra = (obraId: string) => {
    setObras((prev) =>
      prev.map((o) => (o.id === obraId ? { ...o, isDeleted: false, deletedAt: undefined, deletedBy: undefined } : o))
    );
  };

  const handleSoftDeleteDocumento = (docId: string) => {
    setDocumentos((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isDeleted: true } : d))
    );
  };

  const handleRestoreDocumento = (docId: string) => {
    setDocumentos((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isDeleted: false } : d))
    );
  };

  // Guardar nueva Visita
  const handleSaveVisita = (nuevaVisitaData: Partial<VisitaReport>) => {
    const id = `vis-${Date.now()}`;
    const newVis: VisitaReport = {
      id,
      obraId: nuevaVisitaData.obraId || selectedObra?.id || '',
      tecnicoId: currentUser.id,
      tecnicoNombre: currentUser.name,
      tipoVisita: nuevaVisitaData.tipoVisita || 'Seguimiento',
      lineaProducto: nuevaVisitaData.lineaProducto || '',
      fechaVisita: nuevaVisitaData.fechaVisita || new Date().toISOString().split('T')[0],
      horaEntrada: nuevaVisitaData.horaEntrada || '10:00',
      horaSalida: nuevaVisitaData.horaSalida || '12:00',
      lat: nuevaVisitaData.lat,
      lng: nuevaVisitaData.lng,
      gpsVerificado: true,
      tituloResumen: nuevaVisitaData.tituloResumen || 'Visita registrada',
      conclusiones: nuevaVisitaData.conclusiones || '',
      estadoResultante: nuevaVisitaData.estadoResultante || selectedObra?.estado || 'EN_EJECUCION',
      checklist: nuevaVisitaData.checklist || [],
      fotosIds: [],
      documentosIds: [],
    };

    setVisitas((prev) => [newVis, ...prev]);

    // Crear evento en Timeline
    const newTl: TimelineEvent = {
      id: `tl-${Date.now()}`,
      obraId: newVis.obraId,
      eventType: 'VISITA',
      titulo: `${newVis.tipoVisita} - ${newVis.tituloResumen}`,
      descripcion: newVis.conclusiones,
      autorNombre: currentUser.name,
      autorRol: currentRole,
      fecha: `${newVis.fechaVisita} ${newVis.horaSalida}`,
      referenciaId: id,
      badge: 'Nueva Visita',
    };
    setTimeline((prev) => [newTl, ...prev]);

    // Actualizar estado de la obra si procede
    if (nuevaVisitaData.estadoResultante && selectedObra) {
      setObras((prev) =>
        prev.map((o) => (o.id === selectedObra.id ? { ...o, estado: nuevaVisitaData.estadoResultante! } : o))
      );
    }
  };

  // Guardar nueva Obra
  const handleSaveObra = (nuevaObraData: Partial<Obra>) => {
    const id = `obr-${Date.now()}`;
    const newOb: Obra = {
      id,
      codigo: nuevaObraData.codigo || `OBR-2026-${Math.floor(Math.random() * 900) + 100}`,
      titulo: nuevaObraData.titulo || 'Nueva Obra',
      descripcion: nuevaObraData.descripcion || '',
      direccion: nuevaObraData.direccion || '',
      municipio: nuevaObraData.municipio || 'Madrid',
      provincia: nuevaObraData.provincia || 'Madrid',
      lat: nuevaObraData.lat || 40.4168,
      lng: nuevaObraData.lng || -3.7038,
      estado: nuevaObraData.estado || 'PLANIFICACION',
      fechaInicio: nuevaObraData.fechaInicio || new Date().toISOString().split('T')[0],
      fechaFinPrevista: nuevaObraData.fechaFinPrevista || '2026-12-31',
      responsableId: currentUser.id,
      responsableNombre: currentUser.name,
      lineaProductoPrincipal: nuevaObraData.lineaProductoPrincipal || 'Climatización y Aerotermia',
      tipoObra: nuevaObraData.tipoObra || 'Residencial Multifamiliar',
      presupuestoAdjudicacion: nuevaObraData.presupuestoAdjudicacion || 0,
      importeEjecutado: 0,
      porcentajeAvance: nuevaObraData.porcentajeAvance || 5,
      createdAt: new Date().toISOString(),
    };

    setObras((prev) => [newOb, ...prev]);
    setSelectedObraId(id);

    // Evento de creación en Timeline
    const newTl: TimelineEvent = {
      id: `tl-${Date.now()}`,
      obraId: id,
      eventType: 'CREACION',
      titulo: 'Expediente dado de alta',
      descripcion: `Obra registrada por ${currentUser.name} con código ${newOb.codigo}.`,
      autorNombre: currentUser.name,
      autorRol: currentRole,
      fecha: new Date().toLocaleString('es-ES'),
    };
    setTimeline((prev) => [newTl, ...prev]);
  };

  // Guardar Documento
  const handleUploadDocumento = (docData: Partial<Documento>) => {
    if (!selectedObra) return;
    const id = `doc-${Date.now()}`;
    const newDoc: Documento = {
      id,
      obraId: selectedObra.id,
      categoria: docData.categoria || 'FACTURA',
      nombreArchivo: docData.nombreArchivo || 'documento.pdf',
      formato: docData.formato || 'PDF',
      tamanoBytes: docData.tamanoBytes || 1024000,
      urlDescarga: '#',
      importeAsociado: docData.importeAsociado,
      fechaDocumento: docData.fechaDocumento || new Date().toISOString().split('T')[0],
      subidoPor: currentUser.name,
      notas: docData.notas,
    };

    setDocumentos((prev) => [newDoc, ...prev]);

    // Timeline event
    let eventType: any = 'FACTURA';
    if (newDoc.categoria === 'OFERTA_PRESUPUESTO') eventType = 'OFERTA';
    if (newDoc.categoria === 'EMAIL_REGISTRADO') eventType = 'EMAIL';

    const newTl: TimelineEvent = {
      id: `tl-${Date.now()}`,
      obraId: selectedObra.id,
      eventType,
      titulo: `${newDoc.categoria}: ${newDoc.nombreArchivo}`,
      descripcion: newDoc.notas || 'Documento adjuntado al expediente.',
      autorNombre: currentUser.name,
      autorRol: currentRole,
      fecha: new Date().toLocaleString('es-ES'),
      referenciaId: id,
      metadata: newDoc.importeAsociado ? { importe: newDoc.importeAsociado } : undefined,
    };
    setTimeline((prev) => [newTl, ...prev]);
  };

  // Guardar Foto GPS
  const handleAddFoto = (fotoData: Partial<FotoGPS>) => {
    if (!selectedObra) return;
    const id = `fot-${Date.now()}`;
    const newFoto: FotoGPS = {
      id,
      obraId: selectedObra.id,
      url: fotoData.url || '',
      miniaturaUrl: fotoData.miniaturaUrl || fotoData.url || '',
      titulo: fotoData.titulo || 'Foto de obra',
      lat: fotoData.lat || selectedObra.lat,
      lng: fotoData.lng || selectedObra.lng,
      altitud: fotoData.altitud || 650,
      fechaCaptura: fotoData.fechaCaptura || new Date().toLocaleString('es-ES'),
      subidoPor: currentUser.name,
      distanciaMetrosAObra: fotoData.distanciaMetrosAObra || 5,
    };

    setFotos((prev) => [newFoto, ...prev]);

    const newTl: TimelineEvent = {
      id: `tl-${Date.now()}`,
      obraId: selectedObra.id,
      eventType: 'FOTO_GPS',
      titulo: `Foto GPS: ${newFoto.titulo}`,
      descripcion: `Coordenadas extraídas: ${newFoto.lat.toFixed(5)}, ${newFoto.lng.toFixed(5)} (${newFoto.distanciaMetrosAObra}m de la obra).`,
      autorNombre: currentUser.name,
      autorRol: currentRole,
      fecha: new Date().toLocaleString('es-ES'),
    };
    setTimeline((prev) => [newTl, ...prev]);
  };

  // Exportar Excel CSV
  const handleExportExcel = () => {
    const csvData = exportObrasToCSV(obras, currentRole);
    downloadFile(`Exportacion_Obras_${new Date().toISOString().split('T')[0]}.csv`, csvData, 'text/csv;charset=utf-8');
  };

  // Datos filtrados de la obra seleccionada
  const selectedVisitas = visitas.filter((v) => v.obraId === selectedObra?.id && !v.isDeleted);
  const selectedDocs = documentos.filter((d) => d.obraId === selectedObra?.id && !d.isDeleted);
  const selectedFotos = fotos.filter((f) => f.obraId === selectedObra?.id && !f.isDeleted);
  const selectedTimeline = timeline.filter((t) => t.obraId === selectedObra?.id);

  // Estadísticas KPI globales
  const totalPresupuesto = activeObras.reduce((acc, curr) => acc + curr.presupuestoAdjudicacion, 0);
  const totalVisitas = visitas.filter((v) => !v.isDeleted).length;
  const totalFotos = fotos.filter((f) => !f.isDeleted).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      
      {/* 1. Barra de Navegación Principal con Selector de Rol */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        deletedCount={deletedObras.length + deletedDocumentos.length}
        onOpenTrash={() => setShowTrashModal(true)}
        onOpenNewObra={() => setShowNuevaObraModal(true)}
        onExportExcel={handleExportExcel}
        onOpenAdminRoles={() => setShowAdminRolesModal(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* 2. Banner de Rol y Permisos Activos */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sky-400">Simulación RBAC:</span>
            <span>
              Sesión activa como <strong>{currentUser.name}</strong> ({currentRole})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!permisos.verDatosEconomicos ? (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <EyeOff className="w-3.5 h-3.5" />
                Presupuestos y facturación ocultos por rol
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Shield className="w-3.5 h-3.5" />
                Acceso financiero total activado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Panel de Indicadores KPI Rápidos */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Obras Activas</div>
              <div className="text-base font-bold text-slate-900">{activeObras.length}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Presupuesto en Zona</div>
              <div className="text-base font-bold text-slate-900">
                {permisos.verDatosEconomicos ? formatCurrency(totalPresupuesto) : '•••••••• €'}
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Visitas Registradas</div>
              <div className="text-base font-bold text-slate-900">{totalVisitas}</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Fotos con GPS</div>
              <div className="text-base font-bold text-slate-900">{totalFotos}</div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Cuerpo Principal (Layout Dividido: Mapa/Listado Izquierda - Ficha Detallada Derecha) */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex-1 flex flex-col">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[600px]">
          
          {/* COLUMNA IZQUIERDA: Mapa Interactivo y Buscador de Obras (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            
            {/* Mapa Interactivo con Capa Callejero y Satélite Esri Gratuita */}
            <div className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <MapView
                obras={activeObras}
                fotos={selectedFotos}
                selectedObraId={selectedObra?.id || null}
                onSelectObra={(id) => setSelectedObraId(id)}
                userRole={currentRole}
              />
            </div>

            {/* Buscador y Listado de Obras en la Zona */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex-1 flex flex-col">
              
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar obra, municipio o producto..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-slate-700 font-medium"
                >
                  <option value="TODOS">Todos</option>
                  <option value="EN_EJECUCION">En Ejecución</option>
                  <option value="PLANIFICACION">Planificación</option>
                  <option value="PARALIZADA">Paralizada</option>
                  <option value="FINALIZADA">Finalizada</option>
                </select>
              </div>

              {/* Lista Scrollable de Obras */}
              <div className="space-y-2 overflow-y-auto max-h-72 flex-1 pr-1">
                {activeObras.map((obra) => {
                  const isSelected = obra.id === selectedObra?.id;
                  return (
                    <div
                      key={obra.id}
                      onClick={() => setSelectedObraId(obra.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sky-50 border-sky-400 shadow-xs ring-1 ring-sky-400/30'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded">
                          {obra.codigo}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          obra.estado === 'EN_EJECUCION' ? 'bg-emerald-100 text-emerald-800' :
                          obra.estado === 'PLANIFICACION' ? 'bg-sky-100 text-sky-800' :
                          obra.estado === 'PARALIZADA' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {obra.estado.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 line-clamp-1">{obra.titulo}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{obra.municipio} • {obra.lineaProductoPrincipal}</span>
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                        <span>Avance: <strong>{obra.porcentajeAvance}%</strong></span>
                        {permisos.verDatosEconomicos ? (
                          <span className="text-emerald-700 font-semibold">{formatCurrency(obra.presupuestoAdjudicacion)}</span>
                        ) : (
                          <span className="text-slate-400 italic">Económico privado</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* COLUMNA DERECHA: Ficha Detallada, Timeline y Expediente (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {selectedObra ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex-1 flex flex-col space-y-4">
                
                {/* Cabecera de la Obra Seleccionada */}
                <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {selectedObra.codigo}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {selectedObra.municipio} ({selectedObra.provincia})
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">{selectedObra.titulo}</h2>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                      {selectedObra.descripcion}
                    </p>
                  </div>

                  {/* Botones de Acción Primaria */}
                  <div className="flex items-center gap-2 flex-wrap">
                    
                    {/* Botón Exportar Dossier (.md y PDF) */}
                    {permisos.exportarDossier && (
                      <button
                        onClick={() => setShowDossierModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
                        title="Exportar informe detallado en formato .md y PDF oficial con firmas"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Exportar Dossier</span>
                      </button>
                    )}

                    {/* Botón Nueva Visita */}
                    {permisos.crearVisitas && (
                      <button
                        onClick={() => setShowVisitaModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Registrar Visita</span>
                      </button>
                    )}

                    {/* Soft Delete de Obra */}
                    {permisos.borrarObras && (
                      <button
                        onClick={() => handleSoftDeleteObra(selectedObra.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                        title="Enviar obra a la Papelera de reciclaje"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Métricas de la Obra Seleccionada */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Línea de Producto</span>
                    <strong className="text-slate-800 text-[11px]">{selectedObra.lineaProductoPrincipal}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Tipología</span>
                    <strong className="text-slate-800 text-[11px]">{selectedObra.tipoObra}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Avance Físico</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-600 h-2 rounded-full" style={{ width: `${selectedObra.porcentajeAvance}%` }}></div>
                      </div>
                      <strong className="text-slate-900">{selectedObra.porcentajeAvance}%</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Presupuesto Adjudicado</span>
                    {permisos.verDatosEconomicos ? (
                      <strong className="text-emerald-700 font-bold">{formatCurrency(selectedObra.presupuestoAdjudicacion)}</strong>
                    ) : (
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Confidencial
                      </span>
                    )}
                  </div>
                </div>

                {/* Pestañas de Detalle de la Obra (Responsive con scroll horizontal en móvil) */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar py-1">
                  <button
                    onClick={() => setActiveTabDetail('timeline')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth flex items-center gap-1.5 shrink-0 ${
                      activeTabDetail === 'timeline'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Línea de Tiempo ({selectedTimeline.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTabDetail('visitas')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth flex items-center gap-1.5 shrink-0 ${
                      activeTabDetail === 'visitas'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Visitas ({selectedVisitas.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTabDetail('fotos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth flex items-center gap-1.5 shrink-0 ${
                      activeTabDetail === 'fotos'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Fotos GPS ({selectedFotos.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTabDetail('documentos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth flex items-center gap-1.5 shrink-0 ${
                      activeTabDetail === 'documentos'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Documentos ({selectedDocs.length})</span>
                  </button>
                </div>

                {/* Contenido Dinámico de la Pestaña */}
                <div className="flex-1 overflow-y-auto">
                  
                  {/* 1. Línea de Tiempo */}
                  {activeTabDetail === 'timeline' && (
                    <TimelineFeed
                      events={selectedTimeline}
                      userRole={currentRole}
                      onOpenVisita={() => setActiveTabDetail('visitas')}
                    />
                  )}

                  {/* 2. Informes de Visita Detallados */}
                  {activeTabDetail === 'visitas' && (
                    <div className="space-y-3">
                      {selectedVisitas.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                          No hay visitas registradas aún. Pulsa &quot;Registrar Visita&quot; para crear la primera.
                        </div>
                      ) : (
                        selectedVisitas.map((v) => (
                          <div key={v.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <span className="font-bold text-slate-900 text-sm">{v.tipoVisita}</span>
                                <span className="text-slate-400 ml-2">({formatDate(v.fechaVisita)} • {v.horaEntrada} - {v.horaSalida})</span>
                              </div>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                GPS Validado a pie de obra
                              </span>
                            </div>

                            <p className="text-slate-700 font-semibold">{v.tituloResumen}</p>
                            <p className="text-slate-600 italic">{v.conclusiones}</p>

                            {v.checklist && v.checklist.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <span className="font-bold text-[11px] text-slate-700 block mb-1">Checklist Técnico:</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {v.checklist.map((item) => (
                                    <div key={item.id} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                      <CheckCircle2 className={`w-3.5 h-3.5 ${item.conforme ? 'text-emerald-600' : 'text-rose-600'}`} />
                                      <span>{item.pregunta}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                              Técnico actuante: <strong>{v.tecnicoNombre}</strong> | Línea: {v.lineaProducto}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* 3. Fotos con GPS */}
                  {activeTabDetail === 'fotos' && (
                    <FotosGallery
                      fotos={selectedFotos}
                      userRole={currentRole}
                      obraTitulo={selectedObra.titulo}
                      obraLat={selectedObra.lat}
                      obraLng={selectedObra.lng}
                      onAddFoto={handleAddFoto}
                      currentUserNombre={currentUser.name}
                    />
                  )}

                  {/* 4. Documentos (Facturas, Mails, Ofertas) */}
                  {activeTabDetail === 'documentos' && (
                    <DocumentosManager
                      documentos={selectedDocs}
                      userRole={currentRole}
                      onUploadDocumento={handleUploadDocumento}
                      onDeleteDocumento={handleSoftDeleteDocumento}
                      currentUserNombre={currentUser.name}
                    />
                  )}

                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 flex-1 flex flex-col items-center justify-center">
                <Building2 className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Selecciona una obra para ver su ficha completa</p>
                <p className="text-xs text-slate-400 mt-1">O da de alta una nueva obra desde el botón superior</p>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* MODALES DEL SISTEMA */}
      
      {/* 1. Modal de Nueva Visita */}
      {selectedObra && (
        <VisitaModal
          isOpen={showVisitaModal}
          onClose={() => setShowVisitaModal(false)}
          obra={selectedObra}
          lineasProductoOptions={lineasProductoOptions}
          tiposVisitaOptions={tiposVisitaOptions}
          onCreateOption={handleCreateTaxonomy}
          onSaveVisita={handleSaveVisita}
          currentUserNombre={currentUser.name}
        />
      )}

      {/* 2. Modal de Dossier de Obra (.md y PDF) */}
      {selectedObra && (
        <DossierModal
          isOpen={showDossierModal}
          onClose={() => setShowDossierModal(false)}
          obra={selectedObra}
          visitas={selectedVisitas}
          documentos={selectedDocs}
          timeline={selectedTimeline}
          fotos={selectedFotos}
          userRole={currentRole}
        />
      )}

      {/* 3. Modal de Papelera de Reciclaje (Soft Delete) */}
      <TrashBinModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        deletedObras={deletedObras}
        deletedDocumentos={deletedDocumentos}
        onRestoreObra={handleRestoreObra}
        onRestoreDocumento={handleRestoreDocumento}
      />

      {/* 4. Modal de Nueva Obra */}
      <NuevaObraModal
        isOpen={showNuevaObraModal}
        onClose={() => setShowNuevaObraModal(false)}
        onSaveObra={handleSaveObra}
        lineasProductoOptions={lineasProductoOptions}
        tiposObraOptions={tiposObraOptions}
        onCreateOption={handleCreateTaxonomy}
        currentUserNombre={currentUser.name}
      />

      {/* 5. Modal de Gestión de Usuarios y Matriz de Roles (SOLO ADMINISTRADOR) */}
      {currentRole === 'ADMIN' && (
        <AdminUsersRolesModal
          isOpen={showAdminRolesModal}
          onClose={() => setShowAdminRolesModal(false)}
          users={users}
          onUpdateUserRole={handleUpdateUserRole}
          onAddUser={handleAddUser}
          permisosRoles={permisosRoles}
          onTogglePermiso={handleTogglePermiso}
        />
      )}

    </div>
  );
}
