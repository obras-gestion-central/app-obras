import { Obra, VisitaReport, Documento, TimelineEvent, FotoGPS, UserRole } from '@/types';
import { PERMISOS_POR_ROL } from '@/data/mockData';

export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return '0,00 €';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function generateMarkdownDossier(
  obra: Obra,
  visitas: VisitaReport[],
  documentos: Documento[],
  timeline: TimelineEvent[],
  fotos: FotoGPS[],
  userRole: UserRole
): string {
  const permisos = PERMISOS_POR_ROL[userRole];
  const now = new Date().toLocaleString('es-ES');

  let md = `# DOSSIER TÉCNICO DE SEGUIMIENTO: [${obra.codigo}] ${obra.titulo.toUpperCase()}\n\n`;
  md += `> **Documento Oficial de Expediente de Obra**\n`;
  md += `> **Fecha de Emisión:** ${now} | **Generado por rol:** ${userRole} | **Estado:** ${obra.estado}\n\n`;
  md += `---\n\n`;

  // 1. Ficha General
  md += `## 1. Ficha General de la Obra y Ubicación\n\n`;
  md += `- **Código de Expediente:** \`${obra.codigo}\`\n`;
  md += `- **Denominación:** ${obra.titulo}\n`;
  md += `- **Descripción Técnica:** ${obra.descripcion}\n`;
  md += `- **Dirección:** ${obra.direccion}, ${obra.municipio} (${obra.provincia})\n`;
  md += `- **Coordenadas GPS:** \`${obra.lat.toFixed(6)}, ${obra.lng.toFixed(6)}\` ([Ver en OpenStreetMap](https://www.openstreetmap.org/?mlat=${obra.lat}&mlon=${obra.lng}#map=17/${obra.lat}/${obra.lng}))\n`;
  md += `- **Línea de Producto Principal:** ${obra.lineaProductoPrincipal}\n`;
  md += `- **Tipo de Obra:** ${obra.tipoObra}\n`;
  md += `- **Responsable de Proyecto:** ${obra.responsableNombre}\n`;
  md += `- **Plazo de Ejecución:** ${formatDate(obra.fechaInicio)} hasta ${formatDate(obra.fechaFinPrevista)}\n`;
  md += `- **Porcentaje de Avance Físico:** ${obra.porcentajeAvance}%\n\n`;

  // Datos económicos si tiene permisos
  if (permisos.verDatosEconomicos) {
    md += `### Datos Económicos y Presupuestarios (Confidencial)\n`;
    md += `- **Presupuesto de Adjudicación:** ${formatCurrency(obra.presupuestoAdjudicacion)}\n`;
    md += `- **Importe Ejecutado a la Fecha:** ${formatCurrency(obra.importeEjecutado)}\n`;
    md += `- **Saldo Pendiente de Certificar:** ${formatCurrency(obra.presupuestoAdjudicacion - obra.importeEjecutado)}\n\n`;
  } else {
    md += `*(Información económica y de facturación reservada según nivel de privilegios)*\n\n`;
  }

  md += `---\n\n`;

  // 2. Línea de Tiempo
  md += `## 2. Línea de Tiempo y Trazabilidad Cronológica\n\n`;
  md += `| Fecha | Tipo de Evento | Autor | Descripción del Hito |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  timeline.forEach((ev) => {
    md += `| **${ev.fecha}** | \`${ev.eventType}\` | ${ev.autorNombre} | ${ev.titulo} - ${ev.descripcion} |\n`;
  });
  md += `\n---\n\n`;

  // 3. Informes de Visita Detallados
  md += `## 3. Informes de Visitas a Pie de Obra\n\n`;
  if (visitas.length === 0) {
    md += `*No hay visitas de obra registradas hasta la fecha.*\n\n`;
  } else {
    visitas.forEach((v, idx) => {
      md += `### Visita #${idx + 1}: ${v.tipoVisita} (${formatDate(v.fechaVisita)})\n`;
      md += `- **Técnico Responsable:** ${v.tecnicoNombre} | **Horario:** ${v.horaEntrada} - ${v.horaSalida}\n`;
      md += `- **Línea de Producto:** ${v.lineaProducto}\n`;
      md += `- **Verificación GPS:** ${v.gpsVerificado ? '✅ GPS Validado a pie de obra' : '⚠️ Coordenadas no coincidentes'}\n`;
      md += `- **Resumen de la Actuación:** ${v.tituloResumen}\n`;
      md += `- **Conclusiones Técnicas:** ${v.conclusiones}\n\n`;

      if (v.checklist && v.checklist.length > 0) {
        md += `**Puntos de Control / Checklist Realizado:**\n`;
        v.checklist.forEach((chk) => {
          const mark = chk.conforme === true ? '[x]' : chk.conforme === false ? '[ ] (NO CONFORME)' : '[-] (PENDIENTE)';
          md += `- ${mark} ${chk.pregunta}${chk.observaciones ? ` — *Obs: ${chk.observaciones}*` : ''}\n`;
        });
        md += `\n`;
      }
    });
  }

  md += `---\n\n`;

  // 4. Registro Documental
  md += `## 4. Registro Documental Asociado\n\n`;
  if (documentos.length === 0) {
    md += `*Sin documentación adjunta.*\n\n`;
  } else {
    md += `| Categoría | Nombre de Archivo | Formato | Fecha | Subido por | ${permisos.verDatosEconomicos ? 'Importe' : ''} |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | ${permisos.verDatosEconomicos ? ':--- |' : ''}\n`;
    documentos.forEach((d) => {
      const imp = permisos.verDatosEconomicos && d.importeAsociado ? formatCurrency(d.importeAsociado) : '-';
      md += `| **${d.categoria}** | ${d.nombreArchivo} | \`${d.formato}\` | ${formatDate(d.fechaDocumento)} | ${d.subidoPor} | ${permisos.verDatosEconomicos ? imp + ' |' : ''}\n`;
    });
    md += `\n`;
  }

  md += `---\n\n`;

  // 5. Fotografías Georreferenciadas
  md += `## 5. Reporte Fotográfico Georreferenciado (Metadatos EXIF)\n\n`;
  if (fotos.length === 0) {
    md += `*Sin fotografías geolocalizadas.*\n\n`;
  } else {
    fotos.forEach((f, i) => {
      md += `#### Fotografía #${i + 1}: ${f.titulo}\n`;
      md += `- **Coordenadas de Captura:** Lat \`${f.lat.toFixed(6)}\`, Lng \`${f.lng.toFixed(6)}\` (Altitud: ${f.altitud || 0}m)\n`;
      md += `- **Fecha/Hora de Captura:** ${f.fechaCaptura} | **Técnico:** ${f.subidoPor}\n`;
      md += `- **Distancia al Centro de Obra:** ${f.distanciaMetrosAObra || 0} metros\n`;
      md += `- **Visualización:** ![${f.titulo}](${f.miniaturaUrl})\n\n`;
    });
  }

  md += `---\n`;
  md += `*Fin del informe de expediente - Sistema Integral de Gestión de Obras*\n`;

  return md;
}

export function exportObrasToCSV(obras: Obra[], userRole: UserRole): string {
  const permisos = PERMISOS_POR_ROL[userRole];
  const headers = [
    'Codigo',
    'Titulo',
    'Estado',
    'Municipio',
    'Provincia',
    'Latitud',
    'Longitud',
    'Linea_Producto',
    'Tipo_Obra',
    'Responsable',
    'Fecha_Inicio',
    'Fecha_Fin_Prevista',
    'Avance_Porcentaje',
  ];

  if (permisos.verDatosEconomicos) {
    headers.push('Presupuesto_EUR', 'Importe_Ejecutado_EUR');
  }

  const rows = obras
    .filter((o) => !o.isDeleted)
    .map((o) => {
      const baseRow = [
        `"${o.codigo}"`,
        `"${o.titulo.replace(/"/g, '""')}"`,
        `"${o.estado}"`,
        `"${o.municipio}"`,
        `"${o.provincia}"`,
        o.lat,
        o.lng,
        `"${o.lineaProductoPrincipal}"`,
        `"${o.tipoObra}"`,
        `"${o.responsableNombre}"`,
        `"${o.fechaInicio}"`,
        `"${o.fechaFinPrevista}"`,
        o.porcentajeAvance,
      ];

      if (permisos.verDatosEconomicos) {
        baseRow.push(o.presupuestoAdjudicacion, o.importeEjecutado);
      }

      return baseRow.join(';');
    });

  return [headers.join(';'), ...rows].join('\r\n');
}
