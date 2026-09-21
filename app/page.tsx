'use client';

import React, { useState, useEffect } from 'react';
import { Obra, VisitaReport, Documento, FotoGPS, TimelineEvent, TaxonomyItem, UserRole, EstadoObra, User, PermisosRol } from '@/types';
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
import { LoginModal } from '@/components/LoginModal';
import { TaxonomiasModal, CategoriaTaxonomia } from '@/components/TaxonomiasModal';

import { 
  Building2, 
  MapPin, 
  FileText, 
  Camera, 
  Plus, 
  Search, 
  FileDown, 
  CheckCircle2, 
  EyeOff, 
  Trash2,
  Clock,
  TrendingUp,
  FolderOpen,
  X,
  ArrowLeft,
  ChevronRight,
  Filter,
  Layers,
  Map as MapIcon,
  Maximize2,
  Home,
  LogOut,
  Shield,
  User as UserIcon,
  Tag
} from 'lucide-react';

export default function HomePage() {
  // Estado Principal con Persistencia Local
  const [obras, setObras] = useState<Obra[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geobras_obras_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return OBRAS_MOCK;
  });
  const [visitas, setVisitas] = useState<VisitaReport[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geobras_visitas_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return VISITAS_MOCK;
  });
  const [documentos, setDocumentos] = useState<Documento[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geobras_documentos_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return DOCUMENTOS_MOCK;
  });
  const [fotos, setFotos] = useState<FotoGPS[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geobras_fotos_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return FOTOS_GPS_MOCK;
  });
  const [timeline, setTimeline] = useState<TimelineEvent[]>(TIMELINE_MOCK);
  const [taxonomias, setTaxonomias] = useState<TaxonomyItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geobras_taxonomias');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return TAXONOMIAS_INICIALES;
  });
  const [showTaxonomiasModal, setShowTaxonomiasModal] = useState(false);
  const [taxonomiasModalCategory, setTaxonomiasModalCategory] = useState<CategoriaTaxonomia>('TIPO_VISITA');

  // Usuarios y Matriz de Permisos Dinámica con Persistencia Local
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geobras_users_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const hasDavid = parsed.some((u: User) => u.name === 'David Pérez');
            if (hasDavid) return parsed;
            return [...USUARIOS_MOCK, ...parsed];
          }
        } catch {}
      }
    }
    return USUARIOS_MOCK;
  });
  const [permisosRoles, setPermisosRoles] = useState<Record<UserRole, PermisosRol>>(PERMISOS_POR_ROL);

  // Sesión y Autenticación de Usuario (Inicia cerrada / null por defecto para requerir identificación limpia)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geobras_user_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id) {
            return parsed;
          } else {
            localStorage.removeItem('geobras_user_session');
          }
        } catch {}
      }
    }
    return null;
  });
  // Pantalla de inicio obligatoria por defecto al cargar la app
  const [showLoginModal, setShowLoginModal] = useState(true);

  // Rol activo (RBAC interactivo derivado de la sesión)
  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser?.role || 'ADMIN');
  const [selectedObraId, setSelectedObraId] = useState<string>('obr-1');
  const [activeTabDetail, setActiveTabDetail] = useState<'timeline' | 'visitas' | 'fotos' | 'documentos'>('timeline');
  const [activeView, setActiveView] = useState<'mapa' | 'listado'>('mapa');

  // Estados específicos para interacción Móvil Depurada (Mobile-First)
  const [mobileSheetDismissed, setMobileSheetDismissed] = useState(false);
  const [mobileExpedienteOpen, setMobileExpedienteOpen] = useState(false);

  // Filtros de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('TODOS');

  // Modales
  const [showVisitaModal, setShowVisitaModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [showNuevaObraModal, setShowNuevaObraModal] = useState(false);
  const [showAdminRolesModal, setShowAdminRolesModal] = useState(false);

  const permisos = permisosRoles[currentRole];

  // Sincronizar el rol cuando cambia el usuario de sesión
  useEffect(() => {
    if (currentUser) {
      setCurrentRole(currentUser.role);
    }
  }, [currentUser]);

  // Handlers de Login y Logout
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setShowLoginModal(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('geobras_user_session', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginModal(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('geobras_user_session');
    }
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('geobras_user_session');
    }
  };

  const handleGoHome = () => {
    setActiveView('mapa');
    setMobileExpedienteOpen(false);
    setMobileSheetDismissed(false);
  };

  // Handlers para administración de usuarios y permisos con persistencia en localStorage
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
      if (typeof window !== 'undefined') {
        localStorage.setItem('geobras_users_list', JSON.stringify(updated));
      }
      return updated;
    });
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
      setCurrentRole(newRole);
      if (typeof window !== 'undefined') {
        localStorage.setItem('geobras_user_session', JSON.stringify(updatedUser));
      }
    }
  };

  const handleAddUser = (newUser: Omit<User, 'id'>) => {
    const created: User = {
      ...newUser,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => {
      const updated = [...prev, created];
      if (typeof window !== 'undefined') {
        localStorage.setItem('geobras_users_list', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === 'usr-1') {
      alert('No es posible eliminar al Administrador principal.');
      return;
    }
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('geobras_users_list', JSON.stringify(updated));
      }
      return updated;
    });
    if (currentUser?.id === userId) {
      handleLogout();
    }
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

  // Taxonomías dinámicas
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

  const handleOpenTaxonomias = (cat: CategoriaTaxonomia = 'TIPO_VISITA') => {
    setTaxonomiasModalCategory(cat);
    setShowTaxonomiasModal(true);
  };

  const handleAddTaxonomia = (category: CategoriaTaxonomia, value: string) => {
    const newItem: TaxonomyItem = {
      id: `tax-${Date.now()}`,
      categoria: category,
      valor: value,
    };
    setTaxonomias((prev) => {
      const updated = [...prev, newItem];
      if (typeof window !== 'undefined') {
        localStorage.setItem('geobras_taxonomias', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleUpdateTaxonomia = (
    id: string,
    oldValue: string,
    newValue: string,
    category: CategoriaTaxonomia
  ) => {
    // 1. Actualizar en lista de taxonomías y guardar en localStorage
    setTaxonomias((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, valor: newValue } : t));
      if (typeof window !== 'undefined') {
        localStorage.setItem('geobras_taxonomias', JSON.stringify(updated));
      }
      return updated;
    });

    // 2. Cascada: actualizar registros existentes para conservar coherencia
    if (category === 'TIPO_VISITA') {
      setVisitas((prev) =>
        prev.map((v) => (v.tipoVisita === oldValue ? { ...v, tipoVisita: newValue } : v))
      );
    } else if (category === 'LINEA_PRODUCTO') {
      setObras((prev) =>
        prev.map((o) =>
          o.lineaProductoPrincipal === oldValue
            ? { ...o, lineaProductoPrincipal: newValue }
            : o
        )
      );
      setVisitas((prev) =>
        prev.map((v) =>
          v.lineaProducto === oldValue ? { ...v, lineaProducto: newValue } : v
        )
      );
    } else if (category === 'TIPO_OBRA') {
      setObras((prev) =>
        prev.map((o) => (o.tipoObra === oldValue ? { ...o, tipoObra: newValue } : o))
      );
    }
  };

  const handleDeleteTaxonomia = (id: string) => {
    setTaxonomias((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('geobras_taxonomias', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleResetTaxonomias = () => {
    setTaxonomias(TAXONOMIAS_INICIALES);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('geobras_taxonomias');
    }
  };

  const handleCreateTaxonomy = (category: 'LINEA_PRODUCTO' | 'TIPO_OBRA' | 'TIPO_VISITA', value: string) => {
    handleAddTaxonomia(category, value);
  };

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

  // Obra seleccionada activa
  const selectedObra = activeObras.find((o) => o.id === selectedObraId) || activeObras[0] || null;

  // Selección de obra (abre la tarjeta flotante táctil en móvil o actualiza el expediente en PC)
  const handleSelectObra = (id: string) => {
    setSelectedObraId(id);
    setMobileSheetDismissed(false);
  };

  // Apertura directa del expediente (para móvil y PC)
  const handleOpenExpediente = (id?: string) => {
    if (id) {
      setSelectedObraId(id);
    }
    setMobileSheetDismissed(false);
    setMobileExpedienteOpen(true);
  };

  // Elementos eliminados (Papelera)
  const deletedObras = obras.filter((o) => o.isDeleted);
  const deletedDocumentos = documentos.filter((d) => d.isDeleted);

  // Soft Delete y Restauración con persistencia
  const handleSoftDeleteObra = (obraId: string) => {
    if (!confirm('¿Deseas enviar esta obra a la Papelera de reciclaje? Podrás restaurarla en cualquier momento.')) return;
    setObras((prev) => {
      const updated = prev.map((o) =>
        o.id === obraId
          ? { ...o, isDeleted: true, deletedAt: new Date().toLocaleTimeString('es-ES'), deletedBy: currentUser?.name || 'Admin' }
          : o
      );
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('geobras_obras_list', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    setMobileExpedienteOpen(false);
  };

  const handleRestoreObra = (obraId: string) => {
    setObras((prev) => {
      const updated = prev.map((o) => (o.id === obraId ? { ...o, isDeleted: false, deletedAt: undefined, deletedBy: undefined } : o));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('geobras_obras_list', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const handleSoftDeleteDocumento = (docId: string) => {
    setDocumentos((prev) => {
      const updated = prev.map((d) => (d.id === docId ? { ...d, isDeleted: true } : d));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('geobras_documentos_list', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const handleRestoreDocumento = (docId: string) => {
    setDocumentos((prev) => {
      const updated = prev.map((d) => (d.id === docId ? { ...d, isDeleted: false } : d));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('geobras_documentos_list', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  // Guardar nueva Visita con soporte de fotografías adjuntas y persistencia
  const handleSaveVisita = (
    nuevaVisitaData: Partial<VisitaReport>,
    attachedFotos: Partial<FotoGPS>[] = []
  ) => {
    const id = `vis-${Date.now()}`;
    const authorName = currentUser?.name || 'Técnico';
    const assignedTecnico = nuevaVisitaData.tecnicoNombre || authorName;

    // Procesar y registrar fotos adjuntas tomadas in situ
    const createdFotoIds: string[] = [];
    const newFotosList: FotoGPS[] = [];

    if (attachedFotos && attachedFotos.length > 0) {
      attachedFotos.forEach((af, idx) => {
        const fotoId = `foto-${Date.now()}-${idx}`;
        createdFotoIds.push(fotoId);
        const fullFoto: FotoGPS = {
          id: fotoId,
          obraId: nuevaVisitaData.obraId || selectedObra?.id || '',
          visitaId: id,
          url: af.url || '',
          miniaturaUrl: af.miniaturaUrl || af.url || '',
          titulo: af.titulo || `Foto de visita: ${nuevaVisitaData.tipoVisita || 'Inspección'}`,
          lat: af.lat || nuevaVisitaData.lat || selectedObra?.lat || 40.4168,
          lng: af.lng || nuevaVisitaData.lng || selectedObra?.lng || -3.7038,
          altitud: af.altitud || 650,
          fechaCaptura: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
          subidoPor: assignedTecnico,
          distanciaMetrosAObra: af.distanciaMetrosAObra || 5,
        };
        newFotosList.push(fullFoto);
      });

      setFotos((prev) => {
        const updated = [...newFotosList, ...prev];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('geobras_fotos_list', JSON.stringify(updated));
          } catch {}
        }
        return updated;
      });
    }

    const newVis: VisitaReport = {
      id,
      obraId: nuevaVisitaData.obraId || selectedObra?.id || '',
      tecnicoId: nuevaVisitaData.tecnicoId || currentUser?.id || 'usr-1',
      tecnicoNombre: assignedTecnico,
      registradoPorNombre: authorName,
      registradoEn: new Date().toISOString(),
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
      fotosIds: createdFotoIds,
      documentosIds: nuevaVisitaData.documentosIds || [],
    };

    setVisitas((prev) => {
      const updated = [newVis, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('geobras_visitas_list', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    const fotoSnippet = createdFotoIds.length > 0 ? ` (Incluye ${createdFotoIds.length} foto${createdFotoIds.length > 1 ? 's' : ''} con GPS)` : '';
    const newTl: TimelineEvent = {
      id: `tl-${Date.now()}`,
      obraId: newVis.obraId,
      eventType: 'VISITA',
      titulo: `${newVis.tipoVisita} - ${newVis.tituloResumen}`,
      descripcion: `Visita realizada por ${assignedTecnico}. Conclusiones: ${newVis.conclusiones}${fotoSnippet}`,
      autorNombre: authorName,
      autorRol: currentRole,
      fecha: `${newVis.fechaVisita} ${newVis.horaSalida}`,
      referenciaId: id,
      badge: 'Nueva Visita',
    };
    setTimeline((prev) => [newTl, ...prev]);

    if (nuevaVisitaData.estadoResultante && selectedObra) {
      setObras((prev) => {
        const updated = prev.map((o) => (o.id === selectedObra.id ? { ...o, estado: nuevaVisitaData.estadoResultante! } : o));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('geobras_obras_list', JSON.stringify(updated));
          } catch {}
        }
        return updated;
      });
    }
  };

  // Guardar nueva Obra con persistencia
  const handleSaveObra = (nuevaObraData: Partial<Obra>) => {
    const id = `obr-${Date.now()}`;
    const authorName = currentUser?.name || 'Admin';
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
      responsableId: nuevaObraData.responsableId || currentUser?.id || 'usr-1',
      responsableNombre: nuevaObraData.responsableNombre || authorName,
      lineaProductoPrincipal: nuevaObraData.lineaProductoPrincipal || 'Climatización y Aerotermia',
      tipoObra: nuevaObraData.tipoObra || 'Residencial Multifamiliar',
      presupuestoAdjudicacion: nuevaObraData.presupuestoAdjudicacion || 0,
      importeEjecutado: 0,
      porcentajeAvance: nuevaObraData.porcentajeAvance || 5,
      createdAt: new Date().toISOString(),
    };

    setObras((prev) => {
      const updated = [newOb, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('geobras_obras_list', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    setSelectedObraId(id);
    setMobileSheetDismissed(false);

    const newTl: TimelineEvent = {
      id: `tl-${Date.now()}`,
      obraId: id,
      eventType: 'CREACION',
      titulo: 'Expediente dado de alta',
      descripcion: `Obra registrada por ${authorName} con código ${newOb.codigo}. Responsable: ${newOb.responsableNombre}`,
      autorNombre: authorName,
      autorRol: currentRole,
      fecha: new Date().toLocaleString('es-ES'),
    };
    setTimeline((prev) => [newTl, ...prev]);
  };

  // Guardar Documento con soporte de archivo real y persistencia
  const handleUploadDocumento = (docData: Partial<Documento>) => {
    if (!selectedObra) return;
    const id = `doc-${Date.now()}`;
    const authorName = currentUser?.name || 'Técnico';
    const newDoc: Documento = {
      id,
      obraId: selectedObra.id,
      categoria: docData.categoria || 'FACTURA',
      nombreArchivo: docData.nombreArchivo || 'documento.pdf',
      formato: docData.formato || 'PDF',
      tamanoBytes: docData.tamanoBytes || 1024000,
      urlDescarga: docData.urlDescarga || '#',
      importeAsociado: docData.importeAsociado,
      fechaDocumento: docData.fechaDocumento || new Date().toISOString().split('T')[0],
      subidoPor: authorName,
      notas: docData.notas,
    };

    setDocumentos((prev) => {
      const updated = [newDoc, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('geobras_documentos_list', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    let eventType: any = 'FACTURA';
    if (newDoc.categoria === 'OFERTA_PRESUPUESTO') eventType = 'OFERTA';
    if (newDoc.categoria === 'EMAIL_REGISTRADO') eventType = 'EMAIL';

    const newTl: TimelineEvent = {
      id: `tl-${Date.now()}`,
      obraId: selectedObra.id,
      eventType,
      titulo: `${newDoc.categoria}: ${newDoc.nombreArchivo}`,
      descripcion: newDoc.notas || 'Documento adjuntado al expediente.',
      autorNombre: authorName,
      autorRol: currentRole,
      fecha: new Date().toLocaleString('es-ES'),
      referenciaId: id,
      metadata: newDoc.importeAsociado ? { importe: newDoc.importeAsociado } : undefined,
    };
    setTimeline((prev) => [newTl, ...prev]);
  };

  // Guardar Foto GPS con soporte de archivo/cámara real y persistencia
  const handleAddFoto = (fotoData: Partial<FotoGPS>) => {
    if (!selectedObra) return;
    const id = `fot-${Date.now()}`;
    const authorName = currentUser?.name || 'Técnico';
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
      subidoPor: authorName,
      distanciaMetrosAObra: fotoData.distanciaMetrosAObra || 5,
    };

    setFotos((prev) => {
      const updated = [newFoto, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('geobras_fotos_list', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    const newTl: TimelineEvent = {
      id: `tl-${Date.now()}`,
      obraId: selectedObra.id,
      eventType: 'FOTO_GPS',
      titulo: `Foto GPS: ${newFoto.titulo}`,
      descripcion: `Coordenadas extraídas: ${newFoto.lat.toFixed(5)}, ${newFoto.lng.toFixed(5)} (${newFoto.distanciaMetrosAObra}m de la obra).`,
      autorNombre: authorName,
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
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans select-none overflow-hidden pt-14 sm:pt-16 pb-14 lg:pb-11">
      
      {/* 1. Barra de Navegación Compacta */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        deletedCount={deletedObras.length + deletedDocumentos.length}
        onOpenTrash={() => setShowTrashModal(true)}
        onOpenNewObra={() => setShowNuevaObraModal(true)}
        onExportExcel={handleExportExcel}
        onOpenAdminRoles={() => setShowAdminRolesModal(true)}
        onOpenTaxonomias={() => handleOpenTaxonomias('TIPO_VISITA')}
        activeView={activeView}
        setActiveView={setActiveView}
        onGoHome={handleGoHome}
        onLogout={handleLogout}
        currentUser={currentUser || undefined}
      />

      {/* 2. Panel de Indicadores KPI (Visible ÚNICAMENTE en Escritorio para no estorbar en móviles) */}
      <div className="hidden lg:block max-w-7xl w-full mx-auto px-6 pt-3 pb-1 shrink-0">
        <div className="grid grid-cols-4 gap-3">
          
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Obras Activas</div>
              <div className="text-sm font-bold text-slate-900">{activeObras.length}</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Presupuesto en Zona</div>
              <div className="text-sm font-bold text-slate-900">
                {permisos.verDatosEconomicos ? formatCurrency(totalPresupuesto) : '•••••••• €'}
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Visitas Registradas</div>
              <div className="text-sm font-bold text-slate-900">{totalVisitas}</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Fotos con GPS</div>
              <div className="text-sm font-bold text-slate-900">{totalFotos}</div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Contenedor Principal Adaptativo */}
      <main className="flex-1 w-full h-[calc(100dvh-112px)] lg:h-[calc(100vh-184px)] flex flex-col relative overflow-hidden">
        
        {/* ============================================================== */}
        {/* VISTA MÓVIL (< lg): MAPA CENTRAL A PANTALLA COMPLETA O LISTADO */}
        {/* ============================================================== */}
        <div className="lg:hidden flex-1 relative w-full h-full flex flex-col overflow-hidden">
          
          {/* MODO MAPA A PANTALLA COMPLETA */}
          {activeView === 'mapa' && (
            <div className="relative w-full h-full flex-1">
              
              {/* Buscador y Filtro Rápido Flotante Superior */}
              <div className="absolute top-2.5 left-2.5 right-14 z-30 pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-1.5 flex flex-col gap-1.5">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar obra, municipio o producto..."
                      className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50/80 rounded-xl focus:outline-none focus:bg-white text-slate-800 placeholder-slate-400"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filtro horizontal táctil por estado */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {['TODOS', 'EN_EJECUCION', 'PLANIFICACION', 'PARALIZADA'].map((est) => (
                      <button
                        key={est}
                        onClick={() => setEstadoFilter(est)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 transition-smooth ${
                          estadoFilter === est
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {est === 'TODOS' ? `Todos (${activeObras.length})` : est.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mapa Interactivo */}
              <MapView
                obras={activeObras}
                fotos={selectedFotos}
                selectedObraId={selectedObra?.id || null}
                onSelectObra={handleSelectObra}
                onOpenExpediente={handleOpenExpediente}
                userRole={currentRole}
                topOffsetClassName="top-2.5"
              />
            </div>
          )}

          {/* MODO LISTADO COMPACTO DE OBRAS (MÓVIL) */}
          {activeView === 'listado' && (
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
              
              {/* Buscador superior en lista */}
              <div className="p-3 bg-white border-b border-slate-200 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar obra, municipio o producto..."
                    className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-2 p-0.5 text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {['TODOS', 'EN_EJECUCION', 'PLANIFICACION', 'PARALIZADA', 'FINALIZADA'].map((est) => (
                    <button
                      key={est}
                      onClick={() => setEstadoFilter(est)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full shrink-0 transition-smooth ${
                        estadoFilter === est
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {est === 'TODOS' ? `Todos (${activeObras.length})` : est.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista Scrollable de Obras */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-24">
                {activeObras.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No se encontraron obras con el criterio seleccionado.
                  </div>
                ) : (
                  activeObras.map((obra) => {
                    const isSelected = obra.id === selectedObra?.id;
                    return (
                      <div
                        key={obra.id}
                        onClick={() => {
                          setSelectedObraId(obra.id);
                          setMobileExpedienteOpen(true);
                        }}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all bg-white ${
                          isSelected
                            ? 'border-sky-500 shadow-md ring-1 ring-sky-500/20'
                            : 'border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                            {obra.codigo}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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

                        <div className="mt-1 text-[10px] text-indigo-700 font-medium">
                          Responsable: {obra.responsableNombre}
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100">
                          <span>Avance: <strong>{obra.porcentajeAvance}%</strong></span>
                          {permisos.verDatosEconomicos ? (
                            <span className="text-emerald-700 font-semibold">{formatCurrency(obra.presupuestoAdjudicacion)}</span>
                          ) : (
                            <span className="text-slate-400 italic">Económico privado</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* VISTA DESLIZABLE DE EXPEDIENTE COMPLETO EN MÓVIL */}
          {mobileExpedienteOpen && selectedObra && (
            <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col animate-in slide-in-from-bottom duration-200 pb-14 sm:pb-0">
              
              {/* Cabecera Móvil del Expediente */}
              <div className="bg-slate-900 text-white px-3 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
                <button
                  onClick={() => setMobileExpedienteOpen(false)}
                  className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 px-2 py-1 rounded-lg bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Mapa</span>
                </button>

                <div className="text-center truncate px-2">
                  <span className="font-mono text-[10px] text-sky-300 block">{selectedObra.codigo}</span>
                  <span className="text-xs font-bold truncate block max-w-[180px]">{selectedObra.titulo}</span>
                </div>

                <div className="flex items-center gap-1">
                  {permisos.exportarDossier && (
                    <button
                      onClick={() => setShowDossierModal(true)}
                      className="p-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-white"
                      title="Exportar dossier"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                  )}
                  {permisos.borrarObras && (
                    <button
                      onClick={() => handleSoftDeleteObra(selectedObra.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                      title="Borrar obra"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Responsable de Obra en la cabecera del expediente */}
              <div className="bg-indigo-900 text-indigo-100 px-3 py-1.5 text-xs flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Responsable: <strong>{selectedObra.responsableNombre}</strong></span>
                </div>
                <span className="text-[10px] text-indigo-300">{selectedObra.lineaProductoPrincipal}</span>
              </div>

              {/* Pestañas de Navegación del Expediente (Scroll horizontal táctil) */}
              <div className="bg-white border-b border-slate-200 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button
                  onClick={() => setActiveTabDetail('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth shrink-0 flex items-center gap-1.5 ${
                    activeTabDetail === 'timeline' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timeline ({selectedTimeline.length})</span>
                </button>

                <button
                  onClick={() => setActiveTabDetail('visitas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth shrink-0 flex items-center gap-1.5 ${
                    activeTabDetail === 'visitas' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Visitas ({selectedVisitas.length})</span>
                </button>

                <button
                  onClick={() => setActiveTabDetail('fotos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth shrink-0 flex items-center gap-1.5 ${
                    activeTabDetail === 'fotos' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-50'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Fotos GPS ({selectedFotos.length})</span>
                </button>

                <button
                  onClick={() => setActiveTabDetail('documentos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth shrink-0 flex items-center gap-1.5 ${
                    activeTabDetail === 'documentos' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-50'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Documentos ({selectedDocs.length})</span>
                </button>
              </div>

              {/* Botón flotante para Registrar Visita en móvil */}
              {permisos.crearVisitas && (
                <div className="bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <span className="text-[11px] text-slate-500">
                    Avance: <strong>{selectedObra.porcentajeAvance}%</strong>
                  </span>
                  <button
                    onClick={() => setShowVisitaModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Visita</span>
                  </button>
                </div>
              )}

              {/* Contenido Dinámico de la Pestaña Móvil */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {activeTabDetail === 'timeline' && (
                  <TimelineFeed
                    events={selectedTimeline}
                    userRole={currentRole}
                    onOpenVisita={() => setActiveTabDetail('visitas')}
                  />
                )}

                {activeTabDetail === 'visitas' && (
                  <div className="space-y-3">
                    {selectedVisitas.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        No hay visitas registradas aún. Pulsa &quot;Nueva Visita&quot; para registrar la primera.
                      </div>
                    ) : (
                      selectedVisitas.map((v) => (
                        <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="font-bold text-slate-900 text-sm">{v.tipoVisita}</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                              GPS Validado
                            </span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            {formatDate(v.fechaVisita)} • {v.horaEntrada} - {v.horaSalida}
                          </div>
                          <p className="text-slate-700 font-semibold">{v.tituloResumen}</p>
                          <p className="text-slate-600 italic text-[11px]">{v.conclusiones}</p>
                          
                          {v.checklist && v.checklist.length > 0 && (
                            <div className="mt-1 pt-1.5 border-t border-slate-100">
                              <span className="font-bold text-[10px] text-slate-700 block mb-1">Checklist Técnico:</span>
                              <div className="grid grid-cols-1 gap-1">
                                {v.checklist.map((item) => (
                                  <div key={item.id} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                                    <CheckCircle2 className={`w-3 h-3 ${item.conforme ? 'text-emerald-600' : 'text-rose-600'}`} />
                                    <span>{item.pregunta}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Trazabilidad de Compañero y Registro */}
                          <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-100 flex flex-col gap-0.5">
                            <div className="flex items-center justify-between">
                              <span>👷 Visita: <strong className="text-slate-800">{v.tecnicoNombre}</strong></span>
                              <span className="text-sky-700 font-medium">{v.lineaProducto}</span>
                            </div>
                            <div className="text-[9px] text-slate-400">
                              Registrado por: <strong>{v.registradoPorNombre || v.tecnicoNombre}</strong> {v.registradoEn ? `el ${formatDate(v.registradoEn)}` : ''}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTabDetail === 'fotos' && (
                  <FotosGallery
                    fotos={selectedFotos}
                    userRole={currentRole}
                    obraTitulo={selectedObra.titulo}
                    obraLat={selectedObra.lat}
                    obraLng={selectedObra.lng}
                    onAddFoto={handleAddFoto}
                    currentUserNombre={currentUser?.name || 'Técnico'}
                  />
                )}

                {activeTabDetail === 'documentos' && (
                  <DocumentosManager
                    documentos={selectedDocs}
                    userRole={currentRole}
                    onUploadDocumento={handleUploadDocumento}
                    onDeleteDocumento={handleSoftDeleteDocumento}
                    currentUserNombre={currentUser?.name || 'Técnico'}
                  />
                )}
              </div>

            </div>
          )}

        </div>

        {/* ============================================================== */}
        {/* VISTA ESCRITORIO (lg:grid): 3 PARTES SIMULTÁNEAS               */}
        {/* 1. Izquierda Superior: Mapa interactivo                        */}
        {/* 2. Derecha: Flujo e histórico de la línea temporal (Timeline)  */}
        {/* 3. Izquierda Inferior: Lista de obras disponibles o filtradas  */}
        {/* ============================================================== */}
        <div className="hidden lg:grid grid-cols-12 gap-4 max-w-7xl w-full mx-auto px-6 py-2 flex-1 min-h-0">
          
          {/* COLUMNA IZQUIERDA (col-span-6): DIVIDIDA EN 2 PARTES VERTICALES */}
          <div className="col-span-6 flex flex-col gap-3 min-h-0">
            
            {/* 1. IZQUIERDA SUPERIOR: MAPA INTERACTIVO */}
            <div className="flex-[5] min-h-[280px] relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-900 flex flex-col">
              {/* Barra de Filtros Flotante Sobre el Mapa en PC */}
              <div className="absolute top-2.5 left-2.5 right-14 z-30 pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-slate-200/90 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar obra, municipio..."
                      className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-sky-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1.5 p-0.5 text-slate-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <select
                    value={estadoFilter}
                    onChange={(e) => setEstadoFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl py-1 px-2 text-slate-700 font-semibold"
                  >
                    <option value="TODOS">Todas ({activeObras.length})</option>
                    <option value="EN_EJECUCION">En Ejecución</option>
                    <option value="PLANIFICACION">Planificación</option>
                    <option value="PARALIZADA">Paralizada</option>
                    <option value="FINALIZADA">Finalizada</option>
                  </select>
                </div>
              </div>

              {/* Mapa */}
              <div className="w-full h-full flex-1">
                <MapView
                  obras={activeObras}
                  fotos={selectedFotos}
                  selectedObraId={selectedObra?.id || null}
                  onSelectObra={handleSelectObra}
                  onOpenExpediente={handleOpenExpediente}
                  userRole={currentRole}
                  topOffsetClassName="top-12"
                />
              </div>
            </div>

            {/* 3. IZQUIERDA INFERIOR (DEBAJO DEL MAPA): LISTA DE OBRAS DISPONIBLES O FILTRADAS */}
            <div className="flex-[4] min-h-[220px] bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col min-h-0 overflow-hidden">
              {/* Cabecera del panel de obras */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Obras Disponibles <span className="text-indigo-600 font-semibold">({activeObras.length})</span>
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Clic para seleccionar</span>
              </div>

              {/* Lista con scroll vertical */}
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 pt-2">
                {activeObras.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron obras con el filtro actual.
                  </div>
                ) : (
                  activeObras.map((obra) => {
                    const isSelected = obra.id === selectedObra?.id;
                    return (
                      <div
                        key={obra.id}
                        onClick={() => handleSelectObra(obra.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-sky-50/90 border-sky-500 shadow-xs ring-1 ring-sky-400/40'
                            : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded">
                              {obra.codigo}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {obra.municipio}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            obra.estado === 'EN_EJECUCION' ? 'bg-emerald-100 text-emerald-800' :
                            obra.estado === 'PLANIFICACION' ? 'bg-sky-100 text-sky-800' :
                            obra.estado === 'PARALIZADA' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {obra.estado.replace('_', ' ')}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 line-clamp-1 text-xs">{obra.titulo}</h4>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>Resp: <strong className="text-slate-700">{obra.responsableNombre}</strong></span>
                          <div className="flex items-center gap-2">
                            <span>Avance: <strong>{obra.porcentajeAvance}%</strong></span>
                            {permisos.verDatosEconomicos ? (
                              <span className="font-bold text-emerald-700">{formatCurrency(obra.presupuestoAdjudicacion)}</span>
                            ) : (
                              <span className="text-slate-400 italic">Económico privado</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA (col-span-6): 2. DERECHA — FLUJO E HISTÓRICO DE LA LÍNEA TEMPORAL Y EXPEDIENTE */}
          <div className="col-span-6 flex flex-col min-h-0">
            {selectedObra ? (
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex-1 flex flex-col min-h-0 space-y-3 overflow-hidden">
                
                {/* Cabecera del expediente */}
                <div className="flex items-start justify-between flex-wrap gap-2 pb-3 border-b border-slate-200 shrink-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {selectedObra.codigo}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {selectedObra.municipio} ({selectedObra.provincia})
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900">{selectedObra.titulo}</h2>
                    <p className="text-xs text-slate-600 mt-0.5 max-w-xl line-clamp-2">
                      {selectedObra.descripcion}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {permisos.exportarDossier && (
                      <button
                        onClick={() => setShowDossierModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
                        title="Generar Dossier Oficial Formato DIN A4"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Exportar Dossier</span>
                      </button>
                    )}

                    {permisos.crearVisitas && (
                      <button
                        onClick={() => setShowVisitaModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Registrar Visita</span>
                      </button>
                    )}

                    {permisos.borrarObras && (
                      <button
                        onClick={() => handleSoftDeleteObra(selectedObra.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                        title="Enviar a la Papelera"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Ficha Resumen de Parámetros */}
                <div className="grid grid-cols-5 gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Responsable</span>
                    <strong className="text-indigo-900 font-bold text-[11px] truncate block mt-0.5">
                      {selectedObra.responsableNombre}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Línea de Producto</span>
                    <strong className="text-slate-800 text-[11px] truncate block mt-0.5">
                      {selectedObra.lineaProductoPrincipal}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Tipología</span>
                    <strong className="text-slate-800 text-[11px] truncate block mt-0.5">
                      {selectedObra.tipoObra}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Avance Físico</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: `${selectedObra.porcentajeAvance}%` }}></div>
                      </div>
                      <strong className="text-slate-900">{selectedObra.porcentajeAvance}%</strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Presupuesto</span>
                    <strong className="text-emerald-700 font-bold text-[11px] block mt-0.5">
                      {permisos.verDatosEconomicos ? formatCurrency(selectedObra.presupuestoAdjudicacion) : '•••••••• €'}
                    </strong>
                  </div>
                </div>

                {/* Pestañas de Navegación del Expediente (Foco Principal en Línea de Tiempo) */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar shrink-0">
                  <button
                    onClick={() => setActiveTabDetail('timeline')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth flex items-center gap-1.5 shrink-0 ${
                      activeTabDetail === 'timeline'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Flujo e Histórico ({selectedTimeline.length})</span>
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

                {/* Contenido del Expediente */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                  {activeTabDetail === 'timeline' && (
                    <TimelineFeed
                      events={selectedTimeline}
                      userRole={currentRole}
                      onSelectEvent={() => {}}
                    />
                  )}

                  {activeTabDetail === 'visitas' && (
                    <div className="space-y-3">
                      {selectedVisitas.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                          No hay visitas registradas aún. Pulsa &quot;Registrar Visita&quot; para dar de alta la primera.
                        </div>
                      ) : (
                        selectedVisitas.map((v) => (
                          <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{v.tipoVisita}</span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                                GPS Validado
                              </span>
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              {formatDate(v.fechaVisita)} • {v.horaEntrada} - {v.horaSalida}
                            </div>
                            <p className="text-slate-700 font-semibold">{v.tituloResumen}</p>
                            <p className="text-slate-600 italic text-[11px]">{v.conclusiones}</p>

                            {v.checklist && v.checklist.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100">
                                <span className="font-bold text-[10px] text-slate-700 block mb-1">Checklist Técnico:</span>
                                <div className="grid grid-cols-1 gap-1">
                                  {v.checklist.map((item) => (
                                    <div key={item.id} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                                      <CheckCircle2 className={`w-3 h-3 ${item.conforme ? 'text-emerald-600' : 'text-rose-600'}`} />
                                      <span>{item.pregunta}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Trazabilidad de Compañero y Registro */}
                            <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-100 flex flex-col gap-0.5">
                              <div className="flex items-center justify-between">
                                <span>👷 Visita: <strong className="text-slate-800">{v.tecnicoNombre}</strong></span>
                                <span className="text-sky-700 font-medium">{v.lineaProducto}</span>
                              </div>
                              <div className="text-[9px] text-slate-400">
                                Registrado por: <strong>{v.registradoPorNombre || v.tecnicoNombre}</strong> {v.registradoEn ? `el ${formatDate(v.registradoEn)}` : ''}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTabDetail === 'fotos' && (
                    <FotosGallery
                      fotos={selectedFotos}
                      userRole={currentRole}
                      obraTitulo={selectedObra.titulo}
                      obraLat={selectedObra.lat}
                      obraLng={selectedObra.lng}
                      onAddFoto={handleAddFoto}
                      currentUserNombre={currentUser?.name || 'Técnico'}
                    />
                  )}

                  {activeTabDetail === 'documentos' && (
                    <DocumentosManager
                      documentos={selectedDocs}
                      userRole={currentRole}
                      onUploadDocumento={handleUploadDocumento}
                      onDeleteDocumento={handleSoftDeleteDocumento}
                      currentUserNombre={currentUser?.name || 'Técnico'}
                    />
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 flex-1 flex flex-col items-center justify-center">
                <Building2 className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Selecciona una obra de la lista para ver su expediente</p>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* ============================================================== */}
      {/* TARJETA DE OBRA FLOTANTE ANCLADA (MÓVIL Y TABLET)             */}
      {/* Totalmente fija sobre el mapa: no se desplaza con el scroll   */}
      {/* ============================================================== */}
      {selectedObra && !mobileSheetDismissed && activeView === 'mapa' && !mobileExpedienteOpen && (
        <div className="lg:hidden fixed bottom-[68px] left-3 right-3 sm:left-6 sm:right-auto sm:w-[420px] z-50 bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-4 duration-200 select-none pointer-events-auto">
          
          {/* Tirador y cabecera de la tarjeta (Clic para abrir expediente) */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div
              onClick={() => handleOpenExpediente(selectedObra.id)}
              className="flex items-center gap-1.5 flex-wrap cursor-pointer flex-1 group"
              title="Clic para abrir el expediente completo"
            >
              <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                {selectedObra.codigo}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                selectedObra.estado === 'EN_EJECUCION' ? 'bg-emerald-100 text-emerald-800' :
                selectedObra.estado === 'PLANIFICACION' ? 'bg-sky-100 text-sky-800' :
                selectedObra.estado === 'PARALIZADA' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {selectedObra.estado.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                {selectedObra.municipio}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileSheetDismissed(true);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Cerrar tarjeta flotante"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo clickeable de la tarjeta: abre directamente el expediente */}
          <div
            onClick={() => handleOpenExpediente(selectedObra.id)}
            className="cursor-pointer group hover:bg-slate-50/80 active:bg-slate-100 -mx-1.5 px-1.5 py-1 rounded-xl transition-colors"
            title="Toca para abrir el expediente de la obra"
          >
            {/* Título de la obra */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <h3 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-sky-700 transition-colors">
                {selectedObra.titulo}
              </h3>
              <span className="text-[10px] text-sky-600 font-bold shrink-0 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Expediente →
              </span>
            </div>

            {/* Responsable de la obra */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1.5">
              <UserIcon className="w-3 h-3 text-indigo-600 shrink-0" />
              <span>Responsable: <strong className="text-slate-800">{selectedObra.responsableNombre}</strong></span>
            </div>

            {/* Barra de progreso y presupuesto */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <div className="flex items-center gap-1.5 flex-1 mr-3">
                <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: `${selectedObra.porcentajeAvance}%` }}></div>
                </div>
                <span className="font-bold text-slate-700">{selectedObra.porcentajeAvance}%</span>
              </div>

              <div>
                {permisos.verDatosEconomicos ? (
                  <span className="font-bold text-emerald-700">{formatCurrency(selectedObra.presupuestoAdjudicacion)}</span>
                ) : (
                  <span className="text-slate-400 italic">Económico privado</span>
                )}
              </div>
            </div>
          </div>

          {/* Botones de Acción Directa (Acceso en 1 clic asegurado) */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 mt-1">
            <button
              onClick={() => handleOpenExpediente(selectedObra.id)}
              className="col-span-1 py-2 px-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-transform"
              title="Abrir expediente completo de la obra"
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Expediente</span>
            </button>

            {permisos.crearVisitas && (
              <button
                onClick={() => setShowVisitaModal(true)}
                className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-transform"
                title="Registrar nueva visita a pie de obra"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Visita</span>
              </button>
            )}

            {permisos.exportarDossier && (
              <button
                onClick={() => setShowDossierModal(true)}
                className="py-2 px-2 bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-700 border border-sky-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-transform"
                title="Descargar dossier técnico en PDF DIN A4"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Dossier</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* BARRA INFERIOR MÓVIL Y TABLET (Fondo Oscuro Sólido Slate-900)  */}
      {/* ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-around h-14 select-none px-1 shadow-2xl">
        <button
          onClick={handleGoHome}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeView === 'mapa' && !mobileExpedienteOpen ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Ir al mapa de inicio"
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Inicio</span>
        </button>

        <button
          onClick={() => {
            setActiveView('listado');
            setMobileExpedienteOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeView === 'listado' && !mobileExpedienteOpen ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Ver listado de obras"
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Obras</span>
        </button>

        {permisos.editarObras && (
          <button
            onClick={() => setShowNuevaObraModal(true)}
            className="flex flex-col items-center justify-center flex-1 h-full text-white active:scale-95 transition-transform"
            title="Dar de alta una nueva obra"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/30">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-[9px] mt-0.5 font-bold text-sky-300">Nueva</span>
          </button>
        )}

        <button
          onClick={() => handleOpenTaxonomias('TIPO_VISITA')}
          className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 hover:text-amber-300 transition-colors"
          title="Personalizar denominaciones y conceptos"
        >
          <Tag className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] mt-0.5">Conceptos</span>
        </button>

        <button
          onClick={() => setShowLoginModal(true)}
          className="flex flex-col items-center justify-center flex-1 h-full text-slate-400 hover:text-white transition-colors"
          title="Ver usuario o cambiar de sesión"
        >
          <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-[9px] font-bold border border-slate-700">
            {currentUser ? currentUser.avatar : '??'}
          </div>
          <span className="text-[10px] mt-0.5">{currentUser ? 'Perfil' : 'Entrar'}</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* BARRA INFERIOR ESCRITORIO PC (Fondo Oscuro Sólido Slate-900)   */}
      {/* ============================================================== */}
      <footer className="hidden lg:flex fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-white border-t border-slate-800 h-11 px-6 items-center justify-between select-none shadow-2xl text-xs">
        {/* Izquierda: Indicador de estado del sistema */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-200 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>GEOBRAS Central</span>
          </div>
          <span className="text-slate-700">•</span>
          <span className="text-slate-400 text-[11px]">
            {activeObras.length} obras en seguimiento | {totalVisitas} visitas | {totalFotos} fotos GPS
          </span>
        </div>

        {/* Centro: Accesos directos nítidos */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-sky-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-smooth"
            title="Volver a la vista de inicio del mapa"
          >
            <Home className="w-3.5 h-3.5 text-sky-400" />
            <span>Inicio (Mapa)</span>
          </button>
          <button
            onClick={() => handleOpenTaxonomias('TIPO_VISITA')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-slate-700 transition-smooth"
            title="Gestionar denominaciones y conceptos"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Conceptos</span>
          </button>
          {permisos.editarObras && (
            <button
              onClick={() => setShowNuevaObraModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-smooth"
              title="Dar de alta una nueva obra"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Obra</span>
            </button>
          )}
        </div>

        {/* Derecha: Usuario conectado y sesión */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-200 transition-smooth"
            title="Ver perfil de usuario o cambiar de sesión"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              {currentUser ? currentUser.avatar : '??'}
            </div>
            <span className="text-[11px] font-medium">{currentUser?.name || 'Invitado'}</span>
            <span className="text-[10px] text-sky-400 font-mono">({currentRole})</span>
          </button>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* MODALES DEL SISTEMA */}
      {/* ============================================================== */}
      
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
          currentUserNombre={currentUser?.name || 'Técnico'}
          users={users}
          onOpenManageTaxonomias={handleOpenTaxonomias}
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

      {/* 4. Modal de Nueva Obra (con selector de responsable y GPS asistido) */}
      <NuevaObraModal
        isOpen={showNuevaObraModal}
        onClose={() => setShowNuevaObraModal(false)}
        onSaveObra={handleSaveObra}
        lineasProductoOptions={lineasProductoOptions}
        tiposObraOptions={tiposObraOptions}
        onCreateOption={handleCreateTaxonomy}
        currentUserNombre={currentUser?.name || 'Administrador'}
        users={users}
        onOpenManageTaxonomias={handleOpenTaxonomias}
      />

      {/* 5. Modal de Gestión de Usuarios y Roles (SOLO ADMINISTRADOR) */}
      {currentRole === 'ADMIN' && (
        <AdminUsersRolesModal
          isOpen={showAdminRolesModal}
          onClose={() => setShowAdminRolesModal(false)}
          users={users}
          onUpdateUserRole={handleUpdateUserRole}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          permisosRoles={permisosRoles}
          onTogglePermiso={handleTogglePermiso}
        />
      )}

      {/* 6. Modal de Login / Autenticación (Página de Inicio) */}
      <LoginModal
        isOpen={showLoginModal}
        users={users}
        onLogin={handleLogin}
        onClose={handleCloseLoginModal}
      />

      {/* 7. Modal de Gestión Personal de Vocabulario y Taxonomías */}
      <TaxonomiasModal
        isOpen={showTaxonomiasModal}
        onClose={() => setShowTaxonomiasModal(false)}
        initialCategory={taxonomiasModalCategory}
        taxonomias={taxonomias}
        onAdd={handleAddTaxonomia}
        onUpdate={handleUpdateTaxonomia}
        onDelete={handleDeleteTaxonomia}
        onResetDefaults={handleResetTaxonomias}
      />

    </div>
  );
}
