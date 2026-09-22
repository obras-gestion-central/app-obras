import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Pie de página
        footer_text = "GEOBRAS 2.0 • Sistema Integral de Gestión de Obras | Documento Confidencial para Pruebas"
        page_text = f"Página {self._pageNumber} de {page_count}"
        
        self.drawString(14 * mm, 10 * mm, footer_text)
        self.drawRightString(A4[0] - 14 * mm, 10 * mm, page_text)
        
        # Línea de pie
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(14 * mm, 13 * mm, A4[0] - 14 * mm, 13 * mm)
        self.restoreState()

def create_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=14 * mm,
        bottomMargin=18 * mm
    )

    styles = getSampleStyleSheet()

    # Estilos tipográficos modernos
    badge_style = ParagraphStyle(
        'Badge',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#ffffff'),
        backColor=colors.HexColor('#0f172a'),
        alignment=0
    )

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a')
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#475569')
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748b'),
        alignment=2
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#0369a1'),
        spaceBefore=10,
        spaceAfter=5
    )

    h3_style = ParagraphStyle(
        'SectionH3',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#0f172a')
    )

    body_style = ParagraphStyle(
        'BodyDark',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#334155')
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#0f172a')
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )

    story = []

    # =========================================================================
    # PÁGINA 1
    # =========================================================================
    
    # 1. Cabecera Corporativa
    header_data = [
        [
            Paragraph("<b>GEOBRAS 2.0 • VALIDACIÓN Y TESTING</b>", badge_style),
            Paragraph("<b>Versión:</b> 2.1 (Online)<br/><b>Fecha:</b> Septiembre 2026", meta_style)
        ]
    ]
    t_header = Table(header_data, colWidths=[120 * mm, 62 * mm])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_header)

    story.append(Paragraph("Guía de Acceso y Protocolo de Pruebas", title_style))
    story.append(Paragraph("Manual de validación técnica y operativa para usuarios de pruebas", subtitle_style))
    story.append(Spacer(1, 4 * mm))

    # 2. Caja destacada de enlace
    url_box = [
        [
            Paragraph(
                "<font color='#0369a1'><b>ENLACE DIRECTO DE ACCESO (ONLINE):</b></font><br/>"
                "<font size='11' color='#0284c7'><b><u>https://obras-gestion-central.github.io/app-obras/</u></b></font><br/>"
                "<font size='8' color='#475569'>Compatible con cualquier navegador en PC, tablet o móvil (Google Chrome, Edge, Safari, Firefox).</font>",
                body_style
            )
        ]
    ]
    t_url = Table(url_box, colWidths=[182 * mm])
    t_url.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0f9ff')),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#38bdf8')),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_url)
    story.append(Spacer(1, 3 * mm))

    # Aviso de seguridad privada
    sec_notice = [
        [
            Paragraph(
                "<b>SEGURIDAD Y PRIVACIDAD OBLIGATORIA:</b> La aplicación es de acceso estrictamente privado. Ninguna información de obras ni expedientes se muestra de forma pública. Para acceder es imprescindible identificarse con las credenciales asignadas.",
                body_style
            )
        ]
    ]
    t_sec = Table(sec_notice, colWidths=[182 * mm])
    t_sec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('LINELEFT', (0,0), (0,0), 3.5, colors.HexColor('#0284c7')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_sec)
    story.append(Spacer(1, 2 * mm))

    # 3. Tabla de Credenciales
    story.append(Paragraph("1. Credenciales de Acceso para Pruebas (Perfiles y Roles)", h2_style))

    cred_data = [
        [
            Paragraph("<b>ROL CORPORATIVO</b>", body_bold),
            Paragraph("<b>CORREO ELECTRÓNICO</b>", body_bold),
            Paragraph("<b>CONTRASEÑA</b>", body_bold),
            Paragraph("<b>ALCANCE Y PERMISOS PRINCIPALES</b>", body_bold),
        ],
        [
            Paragraph("<font color='#7e22ce'><b>ADMINISTRADOR</b></font>", body_style),
            Paragraph("david.perez@empresa.com", body_style),
            Paragraph("admin123", code_style),
            Paragraph("Control total, creación de usuarios, asignación de permisos, descargas ZIP y copias de seguridad.", body_style)
        ],
        [
            Paragraph("<font color='#0369a1'><b>JEFE DE OBRA</b></font>", body_style),
            Paragraph("laura.gomez@empresa.com", body_style),
            Paragraph("jefe123", code_style),
            Paragraph("Alta y edición de obras, subida de planos y contratos, control de presupuesto y avance.", body_style)
        ],
        [
            Paragraph("<font color='#047857'><b>TÉCNICO DE CAMPO</b></font>", body_style),
            Paragraph("carlos.ruiz@empresa.com", body_style),
            Paragraph("tecnico123", code_style),
            Paragraph("Partes de visita presenciales, fotos geolocalizadas con GPS, checklist de seguridad y firma táctil.", body_style)
        ],
        [
            Paragraph("<font color='#475569'><b>CONSULTOR EXTERNO</b></font>", body_style),
            Paragraph("ana.martinez@empresa.com", body_style),
            Paragraph("consultor123", code_style),
            Paragraph("Vista de consulta para clientes o auditores. Datos económicos y presupuestos ocultos.", body_style)
        ]
    ]

    t_cred = Table(cred_data, colWidths=[40 * mm, 46 * mm, 24 * mm, 72 * mm])
    t_cred.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#faf5ff')),
        ('BACKGROUND', (0,2), (-1,2), colors.HexColor('#f0f9ff')),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#f0fdf4')),
        ('BACKGROUND', (0,4), (-1,4), colors.HexColor('#f8fafc')),
    ]))
    story.append(t_cred)
    story.append(Spacer(1, 2 * mm))

    # 4. Batería de Pruebas
    story.append(Paragraph("2. Protocolo de Pruebas Recomendadas", h2_style))

    tests_data = [
        [
            # Bloque 1
            [
                Paragraph("<b>1. Acceso y Control de Roles (RBAC)</b>", h3_style),
                Paragraph("• Inicia sesión con diferentes perfiles.<br/>"
                          "• Comprueba cómo el rol Consultor tiene ocultos los importes económicos.<br/>"
                          "• Como Administrador, abre 'Usuarios y Roles' y crea un nuevo usuario.", body_style)
            ],
            # Bloque 2
            [
                Paragraph("<b>2. Persistencia Total (Refresco F5)</b>", h3_style),
                Paragraph("• Tras crear o modificar un usuario u obra, <b>pulsa F5 en el navegador</b>.<br/>"
                          "• Verifica que los cambios permanecen intactos y ya no desaparecen.<br/>"
                          "• La base de datos interna (IndexedDB) retiene toda la información.", body_style)
            ]
        ],
        [
            # Bloque 3
            [
                Paragraph("<b>3. Ficheros Grandes y Fotografías</b>", h3_style),
                Paragraph("• Adjunta documentos (PDF, Word, Excel) dentro de cualquier obra.<br/>"
                          "• Sube fotografías desde tu equipo o cámara móvil.<br/>"
                          "• Recarga la web: los archivos siguen disponibles para visualización y descarga.", body_style)
            ],
            # Bloque 4
            [
                Paragraph("<b>4. Partes de Visita y Timeline</b>", h3_style),
                Paragraph("• Pulsa 'Registrar Visita' en una obra seleccionada.<br/>"
                          "• Rellena observaciones, firma con el ratón o dedo y asigna estado.<br/>"
                          "• Observa cómo se genera el evento en el timeline cronológico.", body_style)
            ]
        ],
        [
            # Bloque 5
            [
                Paragraph("<b>5. Exportación a Excel y ZIP Completo</b>", h3_style),
                Paragraph("• Pulsa el botón <b>'Excel'</b> en la barra para descargar el listado CSV.<br/>"
                          "• En 'Usuarios y Roles' &rarr; 'Base de Datos y Nube', pulsa <b>'Descargar Todo en ZIP'</b>.<br/>"
                          "• Abre el ZIP: obtendrás carpetas por obra con sus fotos JPG y PDFs reales.", body_style)
            ],
            # Bloque 6
            [
                Paragraph("<b>6. Prueba en Teléfono Móvil (PWA)</b>", h3_style),
                Paragraph("• Abre el enlace en tu móvil.<br/>"
                          "• Prueba la navegación táctil, el mapa GPS y el modo campo.<br/>"
                          "• El botón <b>'En Nube'</b> te confirma la sincronización entre dispositivos.", body_style)
            ]
        ]
    ]

    t_tests = Table(tests_data, colWidths=[90 * mm, 92 * mm])
    t_tests.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ffffff')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_tests)

    # =========================================================================
    # PÁGINA 2
    # =========================================================================
    story.append(PageBreak())

    # Cabecera pág 2
    p2_header = [
        [
            Paragraph("<b>GEOBRAS 2.0 • CUSTODIA Y RECUPERACIÓN DE DATOS</b>", badge_style),
            Paragraph("<b>Soporte y Procedimientos</b>", meta_style)
        ]
    ]
    t_p2_header = Table(p2_header, colWidths=[120 * mm, 62 * mm])
    t_p2_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_p2_header)
    story.append(Spacer(1, 3 * mm))

    story.append(Paragraph("3. Custodia de Datos en OneDrive, Google Drive o Synology", h2_style))
    story.append(Paragraph(
        "Cualquier responsable o administrador puede extraer de forma periódica copias de seguridad completas de toda la empresa y archivarlas en las carpetas compartidas de la compañía (OneDrive, Drive, Synology o disco local):",
        body_style
    ))
    story.append(Spacer(1, 2 * mm))

    # Cajas de Opción A y B
    backup_boxes = [
        [
            Paragraph("<b>OPCIÓN 1: DESCARGA DIRECTA EN ARCHIVO ZIP (RECOMENDADA)</b>", h3_style)
        ],
        [
            Paragraph(
                "Al pulsar <b>'Descargar Todo en ZIP'</b> desde la pestaña 'Base de Datos y Nube', el sistema empaqueta toda la información en un archivo comprimido estándar. Al hacer doble clic en Windows o Mac, se abre directamente:<br/><br/>"
                "&nbsp;&nbsp;<b>• 00_Listado_Maestro_Obras.csv:</b> Cuadro general que se abre de inmediato en Microsoft Excel.<br/>"
                "&nbsp;&nbsp;<b>• 00_Listado_Visitas.csv:</b> Historial cronológico con técnicos, firmas y observaciones.<br/>"
                "&nbsp;&nbsp;<b>• Carpetas por cada Obra (ej. OBR-1_Hospital_Central):</b><br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- <i>00_Ficha_Resumen_Obra.txt:</i> Datos técnicos, presupuesto y responsable.<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- <i>Carpeta Documentos:</i> PDFs originales (planos), Word y hojas de cálculo.<br/>"
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- <i>Carpeta Fotografias:</i> Fotos reales en formato JPG con archivo de coordenadas GPS.",
                body_style
            )
        ]
    ]
    t_box1 = Table(backup_boxes, colWidths=[182 * mm])
    t_box1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ecfdf5')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#a7f3d0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_box1)
    story.append(Spacer(1, 3 * mm))

    box2_content = [
        [
            Paragraph("<b>OPCIÓN 2: COPIA MAESTRA (.JSON) Y EXTRACTOR OFFLINE DE EMERGENCIA</b>", h3_style)
        ],
        [
            Paragraph(
                "El botón <b>'Exportar Copia de Seguridad (.json)'</b> descarga un archivo único con el estado íntegro del sistema, idóneo para restauraciones automáticas inmediatas desde la propia aplicación.<br/><br/>"
                "<b>¿Y si en el futuro ocurre un problema grave y no puedes acceder a la web?</b><br/>"
                "Cualquier usuario sin conocimientos informáticos puede utilizar la herramienta <b>recuperador.html</b> (disponible online en <u>https://obras-gestion-central.github.io/app-obras/recuperador.html</u> y descargable para usar sin internet).<br/>"
                "Basta con hacer doble clic en el archivo desde cualquier ordenador, arrastrar el fichero <code>.json</code> y pulsar 'Descargar Todo en ZIP' para recuperar todos los documentos y fotos al instante.",
                body_style
            )
        ]
    ]
    t_box2 = Table(box2_content, colWidths=[182 * mm])
    t_box2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#faf5ff')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#faf5ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#d8b4fe')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_box2)
    story.append(Spacer(1, 3 * mm))

    # Preguntas Frecuentes
    story.append(Paragraph("4. Preguntas Frecuentes para Usuarios en Pruebas", h2_style))

    faq_data = [
        [
            Paragraph("<b>¿Qué ocurre si me quedo sin cobertura durante una visita a obra?</b><br/>"
                      "La aplicación almacena automáticamente todos los datos y fotos en el almacenamiento interno de tu móvil (IndexedDB). En cuanto el dispositivo detecta conexión Wi-Fi o datos 4G/5G, se sincroniza en segundo plano sin perder información.", body_style)
        ],
        [
            Paragraph("<b>¿Qué pasa si un usuario introduce mal su contraseña?</b><br/>"
                      "El sistema cuenta con un escudo de seguridad: tras 5 intentos fallidos consecutivos, la cuenta se bloquea automáticamente. Solo el Administrador puede reactivarla desde el panel de gestión.", body_style)
        ],
        [
            Paragraph("<b>¿Cómo reportar incidencias o propuestas de mejora?</b><br/>"
                      "Por favor, anota el usuario o rol utilizado, el dispositivo (PC con Windows/Mac o móvil Android/iPhone), el navegador empleado y los pasos realizados para que el equipo pueda resolver cualquier detalle con máxima agilidad.", body_style)
        ]
    ]
    t_faq = Table(faq_data, colWidths=[182 * mm])
    t_faq.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#f1f5f9')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t_faq)

    # Construir el documento con NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado con éxito en: {filename}")

if __name__ == '__main__':
    out_pdf = os.path.join(r"c:\Users\gemay\OneDrive\Documents\APP_OBRAS", "Guia_Pruebas_GEOBRAS.pdf")
    create_pdf(out_pdf)
