export const RUTAS = {
  andes: 'Andes',
  amazonia: 'Amazonía',
  bafin: 'Bafín',
  yakarta: 'Yakarta',
  volcan: 'Hayli Gubbi'
}

export const MISIONES = [
  {
    id: 'andes',
    lugar: 'Laguna San Nicolás',
    titulo: 'Dinámica hídrica en Namora',
    historia: 'Namora, Cajamarca (Perú). En la orilla de la Laguna San Nicolás, una poza somera ha perdido su lámina de agua en 12 días, dejando sedimentos expuestos y pastos húmedos.',
    leccion: 'El radar NISAR en Banda L (23.8 cm) emite microondas que penetran nubes y vegetación. El agua calma refleja la señal lejos (reflexión especular), mientras que el barro rugoso y la totora inundada devuelven un fuerte eco al sensor.',
    magnitud: 'Intensidad del eco HH (Banda L)',
    unidad: 'dB',
    antes: -22,
    despues: -10,
    fecha1: '24/10/2026',
    fecha2: '05/11/2026',
    pista: 'El eco HH aumentó 12 dB entre el 24/10 y el 05/11 (Track 092). El agua libre produce poca retrodispersión. Al quedar expuesto el lecho rugoso húmedo y vegetación emergente con tallos verticales (doble rebote), la señal recibida se incrementa.',
    campo: 'El lodo expuesto y los bofedales circundantes aumentan la rugosidad en Banda L. En la compuerta, ramas caídas cortaron el ingreso de agua desde la laguna principal.',
    pregunta: '¿Qué proceso físico explica el incremento de retrodispersión en la poza?',
    opciones: [
      'El agua se congeló por completo en toda la laguna.',
      'El lecho rugoso húmedo y el corte de agua aumentaron la dispersión radar.',
      'El viento encrespó temporalmente el agua profunda.'
    ],
    correcta: 1,
    cierre: 'La cuadrilla retira las ramas del canal. Al restablecerse el flujo, el lecho recupera su lámina especular (retrodispersión baja en HH). El sensor NISAR demostró su capacidad para monitorear bofedales y seguridad hídrica en Cajamarca.',
    efecto: 'La poza recupera el agua',
    fuente: 'https://science.nasa.gov/mission/nisar/'
  },
  {
    id: 'amazonia',
    lugar: 'La Pampa / Madre de Dios',
    titulo: 'Vigilancia forestal bajo las nubes',
    historia: 'Madre de Dios, Amazonía Peruana. En la zona de amortiguamiento de Tambopata, la nubosidad persistente impide capturas ópticas. La guardabosques nota claros recientes a lo largo de una trocha.',
    leccion: 'En la polarización cruzada HV (transmisión horizontal, recepción vertical), las copas y ramas actúan como dispersores volumétricos. Al desaparecer los árboles, la despolarización disminuye drásticamente.',
    magnitud: 'Intensidad del eco HV (Banda L)',
    unidad: 'dB',
    antes: -12,
    despues: -19,
    fecha1: '20/10/2026',
    fecha2: '27/10/2026',
    pista: 'El eco HV cayó 7 dB en una semana (Track 171). El dosel denso dispersa la señal en polarización cruzada. Al talar el bosque o abrir pozas mineras, el suelo desnudo no despolariza y la energía HV se desploma.',
    campo: 'En el claro talado quedan tocones con marcas de maquinaria minera. El bosque primario vecino mantiene su dosel continuo con alta dispersión volumétrica HV.',
    pregunta: '¿Por qué la pérdida de bosque reduce la señal en el canal HV?',
    opciones: [
      'Aumentó la humedad atmosférica en la selva.',
      'El río inundó todas las raíces de los árboles.',
      'Desaparecieron las ramas y hojas que producían dispersión volumétrica.'
    ],
    correcta: 2,
    cierre: 'La guardabosques delimita la parcela deforestada para su restauración. Las pasadas regulares cada 12 días de NISAR permiten fiscalizar la minería ilegal y la pérdida de biomasa en la Amazonía sin verse limitadas por las nubes.',
    efecto: 'Parcela de restauración delimitada',
    fuente: 'https://science.nasa.gov/earth/earth-observatory/tracking-peruvian-forest-loss-from-space-144841/'
  },
  {
    id: 'bafin',
    lugar: 'Casquete Glaciar Barnes',
    titulo: 'Flujo del casquete ártico',
    historia: 'Isla de Bafín, Nunavut (Canadá). Sobre el casquete Barnes, una baliza clavada en el hielo y una red de grietas se han desplazado respecto a la referencia de roca madre fija.',
    leccion: 'El seguimiento de texturas radar (speckle tracking) y la interferometría InSAR comparan adquisiciones consecutivas para medir el desplazamiento milimétrico y métrico del hielo sobre terreno estable.',
    magnitud: 'Desplazamiento del hielo hacia el este',
    unidad: 'm',
    antes: 0,
    despues: 12,
    fecha1: '19/10/2026',
    fecha2: '31/10/2026',
    pista: 'El patrón de grietas y textura superficial del hielo avanzó 12 m hacia el este en el intervalo orbital de 12 días de NISAR. La roca base fija se mantiene inmóvil y sirve de referencia geodésica.',
    campo: 'La grieta y la baliza clavada conservaron su distancia mutua y avanzaron al este. La señal de referencia grabada en roca madre no varió, confirmando el flujo glacial superficial.',
    pregunta: '¿Qué evidencia física confirma el movimiento del glaciar?',
    opciones: [
      'El desplazamiento solidario de grietas y baliza respecto al afloramiento rocoso fijo.',
      'El movimiento simultáneo de todo el continente y el refugio.',
      'Un cambio exclusivo en la baliza sin deformación del hielo.'
    ],
    correcta: 0,
    cierre: 'El equipo calcula una velocidad de flujo de 1 metro por día durante el ciclo de NISAR. La sinergia con el archivo histórico de RADARSAT-1 y los productos GUNW garantiza el monitoreo a largo plazo del casquete Barnes.',
    efecto: 'Balizas y perfil de flujo instalados',
    fuente: 'https://cryospheric.org/wp-content/uploads/2011/10/vanwychen-et-al-2015-baffin-bylot-velocities-cjes-2015-0087.pdf'
  },
  {
    id: 'yakarta',
    lugar: 'Yakarta Norte',
    titulo: 'Subsidencia costera e inundación',
    historia: 'Yakarta Norte, Java Occidental (Indonesia). En el sector portuario, las mareas altas alcanzan niveles críticos en muelles y viviendas afectadas por extracción intensiva de agua subterránea.',
    leccion: 'La interferometría diferencial SAR (InSAR) analiza la fase de microondas entre pasadas repetidas para medir cambios en la distancia satélite-suelo (línea de vista, LOS). En zonas urbanas, los edificios actúan como reflectores diedros de alta coherencia.',
    magnitud: 'Desplazamiento en línea de vista (InSAR)',
    unidad: 'mm',
    antes: 0,
    despues: -14,
    fecha1: '24/10/2026',
    fecha2: '06/11/2026',
    pista: 'La fase InSAR registra un alejamiento de 14 mm respecto al radar (Track 092). El valor negativo indica subsidencia vertical proyectada sobre la línea de visión inclinada del sensor.',
    campo: 'El banco geodésico sobre estrato profundo permanece estable. La nivelación óptica en el muelle registra un descenso de 18 mm verticales, concordante con la proyección satelital de −14 mm.',
    pregunta: '¿Qué proceso respalda la concordancia entre InSAR y la nivelación?',
    opciones: [
      'Una variación astronómica temporal de la marea marina.',
      'Subsidencia activa del terreno por compactación y extracción freática.',
      'Un corrimiento horizontal sin cambio de cota vertical.'
    ],
    correcta: 1,
    cierre: 'La brigada costera confirma la tasa de hundimiento y calibra la red de defensa marítima. Los productos NISAR GUNW proporcionan un mapa milimétrico continuo para proteger la infraestructura urbana de Yakarta.',
    efecto: 'Punto de nivelación calibrado',
    fuente: 'https://ir.lib.ugm.ac.id/id/eprint/12554/'
  },
  {
    id: 'volcan',
    lugar: 'Volcán Hayli Gubbi, Afar',
    titulo: 'Deformación en Hayli Gubbi',
    historia: 'Cordillera Erta Ale, Depresión de Afar (Etiopía). Tras la erupción de Hayli Gubbi, el observatorio vulcanológico detecta cambios de fase en los flancos del cráter y necesita evaluar la estabilidad del dique magmático.',
    leccion: 'La Banda L de NISAR penetra depósitos piroclásticos y ceniza reciente sin perder coherencia. Los interferogramas InSAR cuantifican el inflado o desinflado de cámaras magmáticas con precisión milimétrica.',
    magnitud: 'Desplazamiento en línea de vista (InSAR)',
    unidad: 'mm',
    antes: 0,
    despues: 26,
    fecha1: '25/02/2026',
    fecha2: '26/02/2026',
    pista: 'El interferograma post-eruptivo (Tracks 082 y 009) registra 26 mm de acercamiento relativo hacia el radar en el domo, mientras que la llanura basáltica exterior permanece inmóvil.',
    campo: 'Dos estaciones GNSS confirman deformación co-eruptiva en el flanco volcánico coherente con la dinámica del dique magmático. El punto de control exterior valida la estabilidad del datum.',
    pregunta: '¿Qué justifica instalar estaciones geodésicas permanentes en Hayli Gubbi?',
    opciones: [
      'El vapor volcánico generó una ilusión óptica sin cambio de terreno.',
      'La erupción ha concluido definitivamente sin actividad magmática remanente.',
      'Existe deformación cortical activa asociada a la contracción del dique que debe vigilarse.'
    ],
    correcta: 2,
    cierre: 'El observatorio geofísico integra los datos de NISAR GUNW con la red GNSS permanente. El seguimiento de Hayli Gubbi demuestra la capacidad de NISAR para la alerta temprana volcánica en zonas remotas de la Tierra.',
    efecto: 'Red GNSS y monitoreo InSAR activos',
    fuente: 'https://volcano.si.edu/volcano.cfm?vn=221090'
  }
]

export const MISIONES_MAP = new Map(MISIONES.map((m) => [m.id, m]))
