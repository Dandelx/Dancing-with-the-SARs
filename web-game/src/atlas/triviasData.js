export const TRIVIAS = {
  andes: [
    { pregunta: '¿Por qué un radar SAR puede observar la Tierra de noche?', opciones: ['Porque emite su propia señal de microondas.', 'Porque necesita la luz de la Luna.', 'Porque convierte las nubes en luz.'], correcta: 0, explicacion: 'SAR es un sensor activo: emite pulsos de microondas y registra el eco que regresa. Por eso no depende de la luz solar.' },
    { pregunta: '¿Cómo suele verse el agua tranquila en una imagen SAR?', opciones: ['Siempre blanca, porque refleja toda la señal al satélite.', 'Oscura, porque refleja gran parte de la señal lejos del sensor.', 'Invisible, porque el radar no detecta agua.'], correcta: 1, explicacion: 'Una superficie de agua tranquila puede reflejar la señal lejos del sensor y producir un eco débil. El viento y otras condiciones pueden cambiar su aspecto.' }
  ],
  amazonia: [
    { pregunta: '¿Qué ventaja tiene SAR para observar una selva con nubosidad frecuente?', opciones: ['Las microondas pueden atravesar la mayoría de las nubes.', 'El radar elimina físicamente las nubes.', 'El radar necesita cielos despejados.'], correcta: 0, explicacion: 'Las microondas permiten observar a través de la mayoría de las nubes, una ventaja para estudiar regiones con nubosidad frecuente.' },
    { pregunta: '¿Qué puede producir dispersión volumétrica en un bosque?', opciones: ['Las ramas y hojas que dispersan la señal en distintas direcciones.', 'Solo el color verde de las hojas.', 'La luz del Sol reflejada por las nubes.'], correcta: 0, explicacion: 'La vegetación dispersa las ondas en múltiples direcciones. La polarización cruzada puede aportar información sobre su estructura.' }
  ],
  bafin: [
    { pregunta: '¿Qué describe la resolución temporal de un satélite?', opciones: ['El número de colores de una imagen.', 'La frecuencia con que observa una zona.', 'El tamaño de su antena.'], correcta: 1, explicacion: 'La resolución temporal se relaciona con la frecuencia de observación de una zona. Las imágenes de distintas fechas ayudan a estudiar cambios.' },
    { pregunta: '¿Para qué sirve comparar observaciones SAR de distintas fechas?', opciones: ['Para estudiar cambios y, con técnicas adecuadas, movimientos del terreno o hielo.', 'Para detener el movimiento del hielo.', 'Para convertir automáticamente cada imagen en una fotografía óptica.'], correcta: 0, explicacion: 'Las observaciones repetidas permiten estudiar cambios. Según los datos y el método, técnicas como InSAR o el seguimiento de patrones pueden medir desplazamientos.' }
  ],
  yakarta: [
    { pregunta: '¿Qué es la interferometría SAR o InSAR?', opciones: ['Una comparación de la fase de señales SAR de distintas observaciones.', 'Una forma de medir únicamente la temperatura del aire.', 'Una cámara que toma fotos bajo el agua.'], correcta: 0, explicacion: 'InSAR compara la fase de señales SAR de distintas adquisiciones para estudiar cambios en la distancia entre el sensor y la superficie.' },
    { pregunta: '¿Qué información aportan los metadatos de una escena?', opciones: ['Solo el nombre que eligió el jugador.', 'Datos como fecha, sensor y características de la observación.', 'Una garantía de que no existen errores.'], correcta: 1, explicacion: 'Los metadatos describen la adquisición y el producto, por ejemplo el sensor, la fecha y sus características. Ayudan a interpretar y comparar escenas.' }
  ],
  volcan: [
    { pregunta: '¿Por qué un SAR se llama de apertura sintética?', opciones: ['Porque combina señales tomadas mientras el sensor se desplaza para simular una antena mayor.', 'Porque despliega una antena del tamaño de un país.', 'Porque inventa los datos que faltan.'], correcta: 0, explicacion: 'Al combinar señales registradas durante el movimiento del sensor, SAR sintetiza una apertura mayor y mejora la resolución en la dirección de avance.' },
    { pregunta: '¿Qué limitación puede aparecer cuando el radar observa una montaña de lado?', opciones: ['Puede haber sombra radar detrás de zonas que bloquean la señal.', 'La montaña desaparece físicamente.', 'La señal siempre ilumina todas las laderas por igual.'], correcta: 0, explicacion: 'La geometría lateral puede generar sombras radar donde el terreno impide que la señal ilumine la superficie.' }
  ]
}
