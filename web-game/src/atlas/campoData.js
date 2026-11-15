export const CAMPO = {
  andes: {
    puntos: ['Orilla de la poza (Sedimento y bofedal)', 'Compuerta del canal (Caudal)'],
    notas: [
      'El barro agrietado y los pastos húmedos aumentan la rugosidad superficial en Banda L. La marca del nivel principal sigue húmeda.',
      'Ramas y sedimentos cortaron la entrada de agua hacia la poza. Al otro lado, la laguna principal mantiene su lámina de agua reflectante.'
    ],
    titulo: 'Reconstruye el recorrido del agua',
    instruccion: 'Traza el recorrido desde la reserva de agua hasta el lecho seco. Al acertar, la cuadrilla despejará el paso.'
  },
  amazonia: {
    puntos: ['Bosque de referencia (Dosel primario)', 'Claro talado (Pérdida de biomasa)'],
    notas: [
      'El dosel denso de copas y ramas produce una alta dispersión volumétrica en el canal cruzado HV (alrededor de −12 dB).',
      'En el claro talado desapareció la estructura leñosa: la señal HV cayó a −19 dB revelando suelo desnudo y pozas mineras.'
    ],
    titulo: 'Delimita la parcela afectada',
    instruccion: 'Toca las tres celdas con pérdida marcada de eco HV junto a los tocones. Cada cifra es el cambio en dB. Usa una caída de 5 dB o más para esta escena simulada.'
  },
  bafin: {
    puntos: ['Afloramiento de roca madre fija', 'Grieta con baliza (Flujo glacial)'],
    notas: [
      'El afloramiento rocoso basal sirve como referencia geodésica e interferométrica fija (punto R) sin movimiento.',
      'La baliza y la grieta avanzaron solidariamente 12 metros al este. El seguimiento de texturas radar en Banda L confirma el flujo glacial.'
    ],
    titulo: 'Superpone las huellas del hielo',
    instruccion: 'Desplaza el perfil de la primera fecha hacia el este hasta alinear sus tres picos con la segunda. Lee el desplazamiento en metros.'
  },
  yakarta: {
    puntos: ['Banco geodésico de nivelación', 'Peldaño del muelle costero'],
    notas: [
      'El banco de nivelación está anclado en roca profunda estable para desacoplar la subsidencia local del datum regional.',
      'Respecto al banco, el peldaño descendió de 1000 a 982 mm (−18 mm verticales). El radar NISAR registró −14 mm en la línea de vista.'
    ],
    titulo: 'Nivela el peldaño del muelle',
    instruccion: 'Usa la regla para reproducir la altura final sobre el banco estable. El peldaño partía de 1000 mm. Compara tu medición vertical con la proyección del radar.'
  },
  volcan: {
    puntos: ['Estación exterior en basalto estable', 'Flanco activo de Hayli Gubbi'],
    notas: [
      'El punto exterior sobre terreno basáltico firme permite corregir retardos troposféricos en el interferograma NISAR.',
      'El flanco del domo de Hayli Gubbi registra deformación co-eruptiva compatible con la contracción post-eruptiva del dique magmático.'
    ],
    titulo: 'Diseña el seguimiento de Hayli Gubbi',
    instruccion: 'Escoge dos puntos para vigilar si continúa la deformación. Necesitas medir el cambio local y mantener una comparación estable fuera de él.'
  }
}
