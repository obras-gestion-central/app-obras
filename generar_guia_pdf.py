import os
import shutil
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
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
        print(f"Total paginas generadas: {num_pages}")
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Pie de página institucional
        footer_text = "GEOBRAS 2.0 • Guía de Socorro, Pruebas y Directrices | OneDrive: C:\\Users\\gemay\\OneDrive\\Documents\\APP_OBRAS\\"
        page_text = f"Página {self._pageNumber} de {page_count}"
        
        self.drawString(14 * mm, 8.5 * mm, footer_text)
        self.drawRightString(A4[0] - 14 * mm, 8.5 * mm, page_text)
        
        # Línea de pie
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(14 * mm, 11.5 * mm, A4[0] - 14 * mm, 11.5 * mm)
        self.restoreState()

def create_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=12 * mm,
        bottomMargin=15 * mm
    )

    styles = getSampleStyleSheet()

    # Estilos tipográficos modernos
    badge_style = ParagraphStyle(
        'Badge',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#ffffff'),
        backColor=colors.HexColor('#0f172a'),
        alignment=0
    )

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=15.5,
        leading=19,
        textColor=colors.HexColor('#0f172a')
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#475569')
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#64748b'),
        alignment=2
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#0369a1'),
        spaceBefore=5,
        spaceAfter=3
    )

    h3_style = ParagraphStyle(
        'SectionH3',
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )

    body_style = ParagraphStyle(
        'BodyDark',
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.2,
        textColor=colors.HexColor('#334155')
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10.2,
        textColor=colors.HexColor('#0f172a')
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        fontName='Courier-Bold',
        fontSize=7.8,
        leading=10,
        textColor=colors.HexColor('#0f172a')
    )

    code_mono_sm = ParagraphStyle(
        'CodeMonoSm',
        fontName='Courier',
        fontSize=6.8,
        leading=8.8,
        textColor=colors.HexColor('#0f172a')
    )

    alert_style = ParagraphStyle(
        'AlertText',
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#991b1b')
    )

    story = []

    # =========================================================================
    # PÁGINA 1: ACCESO, ROLES, DIRECTRIZ DE CACHÉ Y PROTOCOLO DE PRUEBAS
    # =========================================================================
    
    # 1. Cabecera Corporativa
    header_data = [
        [
            Paragraph("<b>GEOBRAS 2.0 • PROTOCOLO DE VALIDACIÓN, ACCESO Y DIRECTRICES</b>", badge_style),
            Paragraph("<b>Versión:</b> 2.2 (Persistencia Blindada) | <b>Fecha:</b> Septiembre 2026<br/><b>OneDrive:</b> <font name='Courier'>...\\APP_OBRAS</font>", meta_style)
        ]
    ]
    t_header = Table(header_data, colWidths=[118 * mm, 64 * mm])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_header)

    story.append(Paragraph("Guía de Acceso, Pruebas y Directrices Operativas", title_style))
    story.append(Paragraph("Manual para validación técnica, credenciales autorizadas, reglas de persistencia y prevención de pérdida de datos", subtitle_style))
    story.append(Spacer(1, 2 * mm))

    # 2. Caja destacada de enlace y directorio de sincronización
    url_box = [
        [
            Paragraph(
                "<font color='#0369a1'><b>ENLACE DIRECTO DE ACCESO (ONLINE):</b></font><br/>"
                "<font size='9.5' color='#0284c7'><b><u>https://obras-gestion-central.github.io/app-obras/</u></b></font><br/>"
                "<font size='7.2' color='#475569'>Aplicación web progresiva (PWA): accesible desde cualquier PC, tablet o móvil (Chrome, Edge, Safari, Firefox).<br/>"
                "<b>Directorio de Sincronización Local (OneDrive):</b> <font name='Courier-Bold'>C:\\Users\\gemay\\OneDrive\\Documents\\APP_OBRAS\\</font></font>",
                body_style
            )
        ]
    ]
    t_url = Table(url_box, colWidths=[182 * mm])
    t_url.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0f9ff')),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#38bdf8')),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t_url)
    story.append(Spacer(1, 2 * mm))

    # 3. DIRECTRIZ CRÍTICA DE REFRESCO VS BORRADO DE DATOS (NUEVA Y VITAL)
    cache_notice = [
        [
            Paragraph(
                "<b>DIRECTRIZ CRÍTICA: CÓMO ACTUALIZAR SIN BORRAR DATOS (REFRESCO SEGURO VS LIMPIEZA DE NAVEGADOR)</b><br/>"
                "• <b>Para cargar actualizaciones de código:</b> Pulsa el botón circular <b>'Refrescar Pantalla'</b> en la barra superior o presiona <b>Ctrl + F5</b> en tu teclado. Esto recarga la versión más reciente publicada en GitHub Pages <u>sin alterar en absoluto tus obras, visitas ni usuarios</u>.<br/>"
                "• <b>¡ADVERTENCIA ESTRICTA!</b> Nunca utilices la opción de tu navegador <i>'Borrar cookies y otros datos de sitios'</i>, ya que los navegadores consideran la base de datos interna local (IndexedDB) como datos del sitio. Si necesitas realizar mantenimiento en tu PC, asegúrate antes de descargar una copia con <b>'Descargar Todo en ZIP'</b> o <b>'Exportar Copia de Seguridad (.json)'</b> a tu carpeta de OneDrive.",
                alert_style
            )
        ]
    ]
    t_cache = Table(cache_notice, colWidths=[182 * mm])
    t_cache.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fff1f2')),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#f43f5e')),
        ('LINELEFT', (0,0), (0,0), 3.5, colors.HexColor('#e11d48')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t_cache)
    story.append(Spacer(1, 1.5 * mm))

    # 4. Tabla de Credenciales Autorizadas
    story.append(Paragraph("1. Credenciales de Acceso Autorizadas (Perfiles y Roles Blindados)", h2_style))

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
            Paragraph("Control total, gestión de usuarios, roles, taxonomías, copias de seguridad y descargas ZIP.", body_style)
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
            Paragraph("Partes de visita en obra, fotos geolocalizadas con GPS, checklist de seguridad y firma táctil.", body_style)
        ],
        [
            Paragraph("<font color='#475569'><b>CONSULTOR EXTERNO</b></font>", body_style),
            Paragraph("ana.martinez@empresa.com", body_style),
            Paragraph("consultor123", code_style),
            Paragraph("Vista de consulta para clientes o auditores. Datos económicos y presupuestos ocultos.", body_style)
        ]
    ]

    t_cred = Table(cred_data, colWidths=[38 * mm, 46 * mm, 24 * mm, 74 * mm])
    t_cred.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#faf5ff')),
        ('BACKGROUND', (0,2), (-1,2), colors.HexColor('#f0f9ff')),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#f0fdf4')),
        ('BACKGROUND', (0,4), (-1,4), colors.HexColor('#f8fafc')),
    ]))
    story.append(t_cred)
    story.append(Spacer(1, 1.5 * mm))

    # 5. Batería de Pruebas Recomendadas
    story.append(Paragraph("2. Protocolo de Pruebas Recomendadas para los Usuarios", h2_style))

    tests_data = [
        [
            [
                Paragraph("<b>1. Acceso y Control de Roles (RBAC)</b>", h3_style),
                Paragraph("• Inicia sesión con diferentes perfiles autorizados.<br/>"
                          "• Comprueba cómo el Consultor tiene ocultos los importes.<br/>"
                          "• Como Administrador, abre 'Usuarios y Roles' y crea un usuario.", body_style)
            ],
            [
                Paragraph("<b>2. Persistencia Real (Refresco Seguro F5)</b>", h3_style),
                Paragraph("• Tras crear o modificar una obra, <b>pulsa F5 en el navegador</b>.<br/>"
                          "• Verifica que los cambios permanecen intactos y ya no se pierden.<br/>"
                          "• La base de datos interna (IndexedDB) protege toda la información.", body_style)
            ]
        ],
        [
            [
                Paragraph("<b>3. Ficheros Grandes y Fotografías GPS</b>", h3_style),
                Paragraph("• Adjunta documentos (PDF, Word, Excel) dentro de cualquier obra.<br/>"
                          "• Sube fotografías desde tu equipo o cámara móvil.<br/>"
                          "• Recarga la web: los archivos siguen disponibles de inmediato.", body_style)
            ],
            [
                Paragraph("<b>4. Partes de Visita y Timeline</b>", h3_style),
                Paragraph("• Pulsa 'Registrar Visita' en una obra seleccionada.<br/>"
                          "• Rellena observaciones, firma con ratón/dedo y asigna estado.<br/>"
                          "• Observa cómo se genera el hito en el timeline cronológico.", body_style)
            ]
        ],
        [
            [
                Paragraph("<b>5. Exportación a Excel y ZIP Completo</b>", h3_style),
                Paragraph("• Pulsa <b>'Excel'</b> en la barra superior para descargar el CSV.<br/>"
                          "• En 'Usuarios y Roles' &rarr; 'Base de Datos y Nube', pulsa <b>'Descargar Todo en ZIP'</b>.<br/>"
                          "• Abre el ZIP: obtendrás carpetas por obra con sus fotos y planos reales.", body_style)
            ],
            [
                Paragraph("<b>6. Prueba en Teléfono Móvil (PWA)</b>", h3_style),
                Paragraph("• Abre el enlace en tu smartphone Android o iPhone.<br/>"
                          "• Prueba la navegación táctil, el mapa GPS y el modo campo.<br/>"
                          "• El botón <b>'En Nube'</b> te confirma la sincronización en vivo.", body_style)
            ]
        ]
    ]

    t_tests = Table(tests_data, colWidths=[90 * mm, 92 * mm])
    t_tests.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ffffff')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_tests)

    # =========================================================================
    # PÁGINA 2: PROCEDIMIENTO DE CUSTODIA Y RECUPERACIÓN OFFLINE
    # =========================================================================
    story.append(PageBreak())

    p2_header = [
        [
            Paragraph("<b>GEOBRAS 2.0 • CUSTODIA Y RECUPERACIÓN DE DATOS</b>", badge_style),
            Paragraph("<b>Procedimientos de Respaldo</b>", meta_style)
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
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph("3. Custodia de Datos en OneDrive, Google Drive o Synology", h2_style))
    story.append(Paragraph(
        "Cualquier responsable o administrador puede extraer de forma periódica copias de seguridad completas de toda la empresa y archivarlas en la carpeta local de sincronización con OneDrive (<b>C:\\Users\\gemay\\OneDrive\\Documents\\APP_OBRAS\\</b>), Google Drive o NAS Synology:",
        body_style
    ))
    story.append(Spacer(1, 1.5 * mm))

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
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- <i>Carpeta Fotografias:</i> Fotos reales en formato JPG con archivo de coordenadas GPS.<br/><br/>"
                "<b>Ubicación local recomendada para guardar el ZIP:</b> <font name='Courier-Bold'>C:\\Users\\gemay\\OneDrive\\Documents\\APP_OBRAS\\BACKUPS\\</font>",
                body_style
            )
        ]
    ]
    t_box1 = Table(backup_boxes, colWidths=[182 * mm])
    t_box1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ecfdf5')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#a7f3d0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t_box1)
    story.append(Spacer(1, 2 * mm))

    box2_content = [
        [
            Paragraph("<b>OPCIÓN 2: COPIA MAESTRA (.JSON) Y EXTRACTOR OFFLINE DE EMERGENCIA</b>", h3_style)
        ],
        [
            Paragraph(
                "El botón <b>'Exportar Copia de Seguridad (.json)'</b> descarga un archivo único con el estado íntegro del sistema, idóneo para restauraciones automáticas inmediatas desde la propia aplicación.<br/><br/>"
                "<b>¿Y si en el futuro ocurre un problema grave y no puedes acceder a la web?</b><br/>"
                "Cualquier usuario sin conocimientos informáticos puede utilizar la herramienta <b>recuperador.html</b> (disponible online en <u>https://obras-gestion-central.github.io/app-obras/recuperador.html</u> y guardada en local en <font name='Courier'>C:\\Users\\gemay\\OneDrive\\Documents\\APP_OBRAS\\public\\recuperador.html</font>).<br/>"
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
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t_box2)
    story.append(Spacer(1, 2 * mm))

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
                      "Por favor, anota el usuario o rol utilizado, el dispositivo (PC con Windows/Mac o móvil Android/iPhone), el navegador empleado y los pasos realizados para que el equipo de soporte pueda resolver cualquier detalle con máxima agilidad.", body_style)
        ]
    ]
    t_faq = Table(faq_data, colWidths=[182 * mm])
    t_faq.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#f1f5f9')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t_faq)

    # =========================================================================
    # PÁGINA 3: GUÍA DE SOCORRO (DRP), INFRAESTRUCTURA TÉCNICA Y CONTINUIDAD
    # =========================================================================
    story.append(PageBreak())

    p3_header = [
        [
            Paragraph("<b>GEOBRAS 2.0 • GUÍA DE SOCORRO (DRP), INFRAESTRUCTURA Y SOPORTE</b>", badge_style),
            Paragraph("<b>Protocolo de Emergencia y Continuidad</b>", meta_style)
        ]
    ]
    t_p3_header = Table(p3_header, colWidths=[122 * mm, 60 * mm])
    t_p3_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_p3_header)
    story.append(Spacer(1, 2 * mm))

    # SECCIÓN DE SOCORRO INMEDIATO ANTE PROBLEMAS
    story.append(Paragraph("5. Protocolo de Socorro Inmediato ante Incidencias Técnicas", h2_style))
    story.append(Paragraph(
        "Si experimentas cualquier anomalía, bloqueo o sospecha de pérdida de información, sigue este protocolo escalonado:",
        body_style
    ))
    story.append(Spacer(1, 1.5 * mm))

    socorro_data = [
        [
            Paragraph("<b>NIVEL DE SOCORRO</b>", body_bold),
            Paragraph("<b>SÍNTOMA IDENTIFICADO</b>", body_bold),
            Paragraph("<b>ACCIÓN DE SOCORRO INMEDIATA (PASO A PASO)</b>", body_bold),
        ],
        [
            Paragraph("<font color='#0284c7'><b>NIVEL 1: Visual</b></font>", body_style),
            Paragraph("Pantalla desactualizada o no se ven los últimos cambios de la web.", body_style),
            Paragraph("Pulsa el botón circular <b>'Refrescar Pantalla'</b> en la barra superior o presiona <b>Ctrl + F5</b>. Esto recarga el código fresco sin tocar tus datos.", body_style)
        ],
        [
            Paragraph("<font color='#059669'><b>NIVEL 2: Datos</b></font>", body_style),
            Paragraph("Un cambio realizado en el móvil no aparece aún en el PC de la oficina.", body_style),
            Paragraph("Pulsa el botón <b>'En Nube'</b> en la barra superior de ambos dispositivos. El indicador parpadeará en amarillo y forzará la descarga instantánea.", body_style)
        ],
        [
            Paragraph("<font color='#d97706'><b>NIVEL 3: Dispositivo</b></font>", body_style),
            Paragraph("Se ha cambiado de ordenador o se formateó el navegador por error.", body_style),
            Paragraph("Accede a la web, entra en 'Usuarios y Roles' &rarr; 'Base de Datos y Nube', pulsa <b>'Restaurar Copia desde Archivo'</b> y elige el <code>.json</code> guardado en OneDrive.", body_style)
        ],
        [
            Paragraph("<font color='#dc2626'><b>NIVEL 4: Emergencia</b></font>", body_style),
            Paragraph("Caída total de internet o imposibilidad de acceder a GitHub Pages.", body_style),
            Paragraph("Haz doble clic en <code>recuperador.html</code> (en <font name='Courier'>...\\APP_OBRAS\\public\\recuperador.html</font>). Arrastra tu <code>.json</code> y pulsa 'Descargar Todo en ZIP' para extraer todos tus PDFs y JPGs al disco duro.", body_style)
        ]
    ]

    t_socorro = Table(socorro_data, colWidths=[38 * mm, 50 * mm, 94 * mm])
    t_socorro.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#f0f9ff')),
        ('BACKGROUND', (0,2), (-1,2), colors.HexColor('#f0fdf4')),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#fffbeb')),
        ('BACKGROUND', (0,4), (-1,4), colors.HexColor('#fef2f2')),
    ]))
    story.append(t_socorro)
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph("6. Infraestructura de Almacenamiento en la Nube y Local", h2_style))

    storage_table_data = [
        [
            Paragraph("<b>NIVEL DE ALMACENAMIENTO</b>", body_bold),
            Paragraph("<b>UBICACIÓN / ENDPOINT / PROTOCOLO</b>", body_bold),
            Paragraph("<b>DESCRIPCIÓN Y CLAVES INTERNAS</b>", body_bold),
        ],
        [
            Paragraph("<b>Directorio Local y Sincronización OneDrive</b>", body_style),
            Paragraph("<b>Ruta en este equipo (OneDrive):</b><br/><font size='6.3' name='Courier-Bold'>C:\\Users\\gemay\\OneDrive\\Documents\\APP_OBRAS\\</font>", body_style),
            Paragraph("Directorio raíz donde reside el proyecto, el código fuente y el documento PDF de esta guía (<font name='Courier'>Guia_Pruebas_GEOBRAS.pdf</font>). Microsoft OneDrive sincroniza automáticamente todo su contenido con la nube corporativa.", body_style)
        ],
        [
            Paragraph("<b>Persistencia Local en Dispositivo</b>", body_style),
            Paragraph("<b>IndexedDB</b> (Base: <font name='Courier'>geobras_db</font>)<br/>Fallback: <font name='Courier'>localStorage</font>", code_mono_sm),
            Paragraph("Almacenamiento seguro en el navegador sin límite de 5MB. Retiene planos PDF, documentos, fotos GPS en Base64 y usuarios de forma persistente en cada equipo o móvil.", body_style)
        ],
        [
            Paragraph("<b>Canal Central en la Nube (REST + SSE)</b>", body_style),
            Paragraph("<b>Canal en Vivo (SSE + REST):</b><br/><font size='6.1' color='#0284c7'>https://ntfy.sh/geobras_obras_central_database_v1</font><br/><b>Canal Persistente (kvdb):</b><br/><font size='6.1' color='#0284c7'>https://kvdb.io/35hEgoCjGZugMmoFEzUK9R/obras_central_database</font>", body_style),
            Paragraph("Doble canal: Actualización en vivo instantánea multi-dispositivo mediante Server-Sent Events (SSE) y persistencia en la nube compartida entre PCs, móviles y tablets.", body_style)
        ],
        [
            Paragraph("<b>Carpeta de Custodia para Respaldos</b>", body_style),
            Paragraph("Subcarpeta recomendada en OneDrive:<br/><font size='6.3' name='Courier-Bold'>...\\APP_OBRAS\\BACKUPS\\</font>", body_style),
            Paragraph("Ubicación recomendada para archivar semanalmente los ficheros <font name='Courier'>.zip</font> y <font name='Courier'>.json</font> descargados desde la aplicación para su inmediata sincronización en OneDrive.", body_style)
        ]
    ]

    t_storage = Table(storage_table_data, colWidths=[42 * mm, 66 * mm, 74 * mm])
    t_storage.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#eff6ff')),
        ('BACKGROUND', (0,2), (-1,2), colors.HexColor('#ffffff')),
        ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (0,4), (-1,4), colors.HexColor('#ffffff')),
    ]))
    story.append(t_storage)
    story.append(Spacer(1, 2 * mm))

    # 7. Datos de GitHub, CI/CD y Soporte Continuo
    story.append(Paragraph("7. Datos de Repositorio GitHub, CI/CD y Soporte de Continuidad", h2_style))

    github_data = [
        [
            Paragraph("<b>Organización / Usuario GitHub:</b>", body_bold),
            Paragraph("<font color='#0f172a'><b>obras-gestion-central</b></font>", body_style),
            Paragraph("<b>Repositorio Oficial:</b>", body_bold),
            Paragraph("<font color='#0284c7'><b>app-obras</b></font>", body_style)
        ],
        [
            Paragraph("<b>URL Repositorio (Código):</b>", body_bold),
            Paragraph("<font size='6.8' color='#0284c7'><u>https://github.com/obras-gestion-central/app-obras</u></font>", body_style),
            Paragraph("<b>Rama de Producción:</b>", body_bold),
            Paragraph("<font name='Courier-Bold'>main</font>", body_style)
        ],
        [
            Paragraph("<b>URL de Publicación Web:</b>", body_bold),
            Paragraph("<font size='6.8' color='#0284c7'><u>https://obras-gestion-central.github.io/app-obras/</u></font>", body_style),
            Paragraph("<b>Herramienta Offline:</b>", body_bold),
            Paragraph("<font size='6.8' color='#0284c7'><u>.../recuperador.html</u></font>", body_style)
        ],
        [
            Paragraph("<b>Cuentas de Soporte / Admin:</b>", body_bold),
            Paragraph("<b>obras.gestion.central@gmail.com</b><br/><b>david.perez@empresa.com</b>", body_style),
            Paragraph("<b>Hosting Web:</b>", body_bold),
            Paragraph("GitHub Pages (SSL y CI/CD automático)", body_style)
        ]
    ]

    t_gh = Table(github_data, colWidths=[42 * mm, 56 * mm, 38 * mm, 46 * mm])
    t_gh.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_gh)

    # Construir el documento con NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado con éxito en: {filename}")

if __name__ == '__main__':
    base_dir = r"c:\Users\gemay\OneDrive\Documents\APP_OBRAS"
    out_pdf = os.path.join(base_dir, "Guia_Pruebas_GEOBRAS.pdf")
    create_pdf(out_pdf)

    # Copiar también a public/ para descarga directa desde la web
    public_pdf = os.path.join(base_dir, "public", "Guia_Pruebas_GEOBRAS.pdf")
    try:
        shutil.copyfile(out_pdf, public_pdf)
        print(f"Copia creada en: {public_pdf}")
    except Exception as e:
        print(f"Aviso al copiar a public/: {e}")

    # Copiar a out/ si existe la carpeta de compilación estática
    out_dir_pdf = os.path.join(base_dir, "out", "Guia_Pruebas_GEOBRAS.pdf")
    if os.path.exists(os.path.join(base_dir, "out")):
        try:
            shutil.copyfile(out_pdf, out_dir_pdf)
            print(f"Copia creada en: {out_dir_pdf}")
        except Exception as e:
            print(f"Aviso al copiar a out/: {e}")
