export type UserRole = 'ADMIN' | 'JEFE_OBRA' | 'TECNICO_CAMPO' | 'CONSULTOR_EXTERNO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export type EstadoObra = 'PLANIFICACION' | 'EN_EJECUCION' | 'PARALIZADA' | 'FINALIZADA';

export interface Obra {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  direccion: string;
  municipio: string;
  provincia: string;
  lat: number;
  lng: number;
  estado: EstadoObra;
  fechaInicio: string;
  fechaFinPrevista: string;
  responsableId: string;
  responsableNombre: string;
  lineaProductoPrincipal: string;
  tipoObra: string;
  presupuestoAdjudicacion: number; // Campo protegido (visible según rol)
  importeEjecutado: number;        // Campo protegido
  porcentajeAvance: number;
  datosAdicionales?: Record<string, any>;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
}

export interface FotoGPS {
  id: string;
  obraId: string;
  visitaId?: string;
  url: string;
  miniaturaUrl: string;
  titulo: string;
  lat: number;
  lng: number;
  altitud?: number;
  fechaCaptura: string;
  subidoPor: string;
  distanciaMetrosAObra?: number;
  isDeleted?: boolean;
}

export type TipoDocumento = 'FACTURA' | 'OFERTA_PRESUPUESTO' | 'EMAIL_REGISTRADO' | 'PLANO' | 'ACTA_REUNION' | 'INFORME';

export interface Documento {
  id: string;
  obraId: string;
  visitaId?: string;
  categoria: TipoDocumento;
  nombreArchivo: string;
  formato: string;
  tamanoBytes: number;
  urlDescarga: string;
  urlMiniatura?: string;
  importeAsociado?: number; // Sensible para facturas y ofertas
  fechaDocumento: string;
  subidoPor: string;
  notas?: string;
  isDeleted?: boolean;
}

export interface CheckItem {
  id: string;
  pregunta: string;
  conforme: boolean | null; // true, false, null
  observaciones?: string;
}

export interface VisitaReport {
  id: string;
  obraId: string;
  tecnicoId: string;
  tecnicoNombre: string;
  tipoVisita: string;       // Combobox creatable
  lineaProducto: string;    // Combobox creatable
  fechaVisita: string;
  horaEntrada: string;
  horaSalida: string;
  lat?: number;
  lng?: number;
  gpsVerificado: boolean;
  tituloResumen: string;
  conclusiones: string;
  estadoResultante: EstadoObra;
  checklist: CheckItem[];
  fotosIds: string[];
  documentosIds: string[];
  isDeleted?: boolean;
  deletedAt?: string;
}

export type TipoEventoTimeline = 'VISITA' | 'FOTO_GPS' | 'OFERTA' | 'FACTURA' | 'EMAIL' | 'CAMBIO_ESTADO' | 'CREACION';

export interface TimelineEvent {
  id: string;
  obraId: string;
  eventType: TipoEventoTimeline;
  titulo: string;
  descripcion: string;
  autorNombre: string;
  autorRol: UserRole;
  fecha: string;
  referenciaId?: string;
  badge?: string;
  metadata?: Record<string, any>;
}

export interface TaxonomyItem {
  id: string;
  categoria: 'LINEA_PRODUCTO' | 'TIPO_OBRA' | 'TIPO_VISITA' | 'FASE_OBRA';
  valor: string;
  descripcion?: string;
}

export interface PermisosRol {
  verDatosEconomicos: boolean;
  editarObras: boolean;
  borrarObras: boolean;
  crearVisitas: boolean;
  subirDocumentos: boolean;
  accederPapelera: boolean;
  exportarDossier: boolean;
  exportarExcel: boolean;
}
