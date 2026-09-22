import JSZip from 'jszip';
import { Obra, VisitaReport, Documento, FotoGPS, UserRegistryRecord } from '@/types';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';

function sanitizeFolderName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim().substring(0, 50);
}

function base64ToUint8Array(base64: string): Uint8Array {
  // Elimina encabezados tipo data:application/pdf;base64,
  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Genera un archivo ZIP estructurado con carpetas por obra,
 * documentos originales (PDF, Word, Excel), fotos (JPG) y hojas de cálculo CSV para Excel.
 */
export async function generateFullDatabaseZip(params: {
  obras: Obra[];
  visitas: VisitaReport[];
  documentos: Documento[];
  fotos: FotoGPS[];
  userRegistry?: UserRegistryRecord[];
  onProgress?: (percent: number, status: string) => void;
}): Promise<Blob> {
  const { obras, visitas, documentos, fotos, userRegistry = [], onProgress } = params;
  const zip = new JSZip();

  onProgress?.(5, 'Preparando índices y listados para Excel...');

  // 1. CSV General de Obras (con BOM UTF-8 para apertura directa en Excel sin caracteres extraños)
  const BOM = '\uFEFF';
  const obrasHeader = 'Código;Título;Municipio;Provincia;Estado;Fecha Inicio;Fecha Fin Prevista;Responsable;Presupuesto Adjudicación;Importe Ejecutado;% Avance;Latitud;Longitud\n';
  const obrasRows = obras.map(o => 
    `"${o.codigo || o.id}";"${o.titulo}";"${o.municipio}";"${o.provincia}";"${o.estado}";"${o.fechaInicio}";"${o.fechaFinPrevista}";"${o.responsableNombre}";"${o.presupuestoAdjudicacion}";"${o.importeEjecutado}";"${o.porcentajeAvance}%";"${o.lat}";"${o.lng}"`
  ).join('\n');
  zip.file('00_Listado_Maestro_Obras.csv', BOM + obrasHeader + obrasRows);

  // 2. CSV General de Visitas
  const visitasHeader = 'Fecha Visita;Obra ID;Técnico;Tipo Visita;Estado Resultante;Observaciones;Firma\n';
  const visitasRows = visitas.map(v =>
    `"${v.fechaHora}";"${v.obraId}";"${v.tecnicoNombre}";"${v.tipoVisita}";"${v.estadoResultante || ''}";"${(v.observaciones || '').replace(/"/g, '""')}";"${v.firmaDigital ? 'Firmado' : 'No firmada'}"`
  ).join('\n');
  zip.file('00_Listado_Visitas.csv', BOM + visitasHeader + visitasRows);

  // 3. CSV de Usuarios y Roles (si procede)
  if (userRegistry.length > 0) {
    const usersHeader = 'ID;Nombre;Email;Rol;Activo;Bloqueado;Fecha Registro;Último Acceso\n';
    const usersRows = userRegistry.map(u =>
      `"${u.id}";"${u.name}";"${u.email}";"${u.role}";"${u.activo ? 'Sí' : 'No'}";"${u.bloqueado ? 'Bloqueado' : 'Normal'}";"${u.fechaRegistro}";"${u.ultimoAcceso || 'Nunca'}"`
    ).join('\n');
    zip.file('00_Usuarios_Sistema.csv', BOM + usersHeader + usersRows);
  }

  // 4. Crear carpetas estructuradas por cada Obra
  const obrasFolder = zip.folder('Obras_Expedientes');
  const totalObras = obras.length;

  for (let i = 0; i < totalObras; i++) {
    const obra = obras[i];
    const safeTitle = sanitizeFolderName(`${obra.codigo || obra.id}_${obra.titulo}`);
    const obraDir = obrasFolder?.folder(safeTitle);

    onProgress?.(
      10 + Math.round((i / totalObras) * 70),
      `Procesando expediente ${i + 1}/${totalObras}: ${obra.titulo.substring(0, 25)}...`
    );

    // 4.1 Ficha técnica en texto plano
    const obraVisitas = visitas.filter(v => v.obraId === obra.id && !v.isDeleted);
    const fichaContent = [
      `========================================================================`,
      `FICHA TÉCNICA DE EXPEDIENTE: ${obra.titulo}`,
      `Código: ${obra.codigo || obra.id}`,
      `Estado: ${obra.estado}`,
      `========================================================================`,
      `Ubicación: ${obra.direccion}, ${obra.municipio} (${obra.provincia})`,
      `Coordenadas GPS: Lat ${obra.lat}, Lng ${obra.lng}`,
      `Responsable de Obra: ${obra.responsableNombre}`,
      `Línea de Producto: ${obra.lineaProductoPrincipal || 'No asignada'}`,
      `Tipo de Obra: ${obra.tipoObra || 'General'}`,
      `Fecha Inicio: ${obra.fechaInicio} | Fecha Fin Prevista: ${obra.fechaFinPrevista}`,
      `Presupuesto Adjudicación: ${formatCurrency(obra.presupuestoAdjudicacion)}`,
      `Importe Ejecutado: ${formatCurrency(obra.importeEjecutado)}`,
      `Porcentaje Avance: ${obra.porcentajeAvance}%`,
      `------------------------------------------------------------------------`,
      `DESCRIPCIÓN:`,
      `${obra.descripcion || 'Sin descripción'}`,
      `------------------------------------------------------------------------`,
      `HISTORIAL DE VISITAS REGISTRADAS (${obraVisitas.length}):`,
      ...obraVisitas.map((v, idx) => 
        `  ${idx + 1}. [${v.fechaHora}] Técnico: ${v.tecnicoNombre} | Tipo: ${v.tipoVisita}\n     Observaciones: ${v.observaciones}\n`
      ),
      `========================================================================`
    ].join('\n');

    obraDir?.file('00_Ficha_Resumen_Obra.txt', fichaContent);

    // 4.2 Documentos adjuntos reales (PDF, DOC, XLS)
    const obraDocs = documentos.filter(d => d.obraId === obra.id && !d.isDeleted);
    if (obraDocs.length > 0) {
      const docsDir = obraDir?.folder('Documentos');
      for (const doc of obraDocs) {
        try {
          if (doc.urlDescarga && doc.urlDescarga.startsWith('data:')) {
            const bytes = base64ToUint8Array(doc.urlDescarga);
            docsDir?.file(doc.nombreArchivo || `Documento_${doc.id}.bin`, bytes, { binary: true });
          } else {
            // Si es un enlace externo
            docsDir?.file(`${doc.nombreArchivo || doc.id}_enlace.txt`, `Enlace de descarga del documento:\n${doc.urlDescarga}`);
          }
        } catch (e) {
          console.warn(`Error empaquetando documento ${doc.nombreArchivo}:`, e);
        }
      }
    }

    // 4.3 Fotografías originales (JPG/PNG)
    const obraFotos = fotos.filter(f => f.obraId === obra.id && !f.isDeleted);
    if (obraFotos.length > 0) {
      const fotosDir = obraDir?.folder('Fotografias_GPS');
      for (let fIdx = 0; fIdx < obraFotos.length; fIdx++) {
        const foto = obraFotos[fIdx];
        try {
          const rawUrl = foto.url || foto.miniaturaUrl;
          if (rawUrl && rawUrl.startsWith('data:')) {
            const bytes = base64ToUint8Array(rawUrl);
            const safeFotoTitle = sanitizeFolderName(foto.titulo || `Foto_${fIdx + 1}`);
            const dateStr = (foto.fechaCaptura || '').split('T')[0] || 'captura';
            const filename = `${dateStr}_${safeFotoTitle}.jpg`;
            fotosDir?.file(filename, bytes, { binary: true });

            // Ficha de metadatos GPS asociada a la foto
            if (foto.lat && foto.lng) {
              fotosDir?.file(`${filename}.gps.txt`, 
                `Fotografía: ${foto.titulo}\nFecha: ${foto.fechaCaptura}\nLatitud: ${foto.lat}\nLongitud: ${foto.lng}\nSubido por: ${foto.subidoPor}`
              );
            }
          }
        } catch (e) {
          console.warn(`Error empaquetando foto ${foto.titulo}:`, e);
        }
      }
    }
  }

  onProgress?.(85, 'Generando archivo comprimido ZIP final...');

  const zipBlob = await zip.generateAsync(
    { 
      type: 'blob', 
      compression: 'DEFLATE', 
      compressionOptions: { level: 6 } 
    },
    (metadata) => {
      onProgress?.(85 + Math.round(metadata.percent * 0.15), `Comprimiendo archivo (${Math.round(metadata.percent)}%)...`);
    }
  );

  onProgress?.(100, '¡Archivo ZIP listo para descargar!');
  return zipBlob;
}
