# Orbit Jump

Juego educativo sobre observaciones SAR y NISAR. La aplicación utiliza React, Vite, Three.js y Leaflet; los metadatos y vistas previas satelitales proceden del catálogo ASF.

## Ejecutar

Desde esta carpeta:

```bash
npm ci
npm run dev
```

Para comprobar el proyecto:

```bash
npm run lint
npm run build
```

En PowerShell, si la política de ejecución bloquea `npm.ps1`, se puede usar `npm.cmd` en los comandos anteriores.

## Datos y pipeline

`public/data/nasa_real_cases.json` y `public/data/sar_browse/` contienen los metadatos y vistas previas usados por la aplicación. Los datos originales y el exportador están en `../pipeline-python/`. Para regenerar los archivos web se requieren las dependencias de `../pipeline-python/requirements.txt` y se ejecuta:

```bash
python ../pipeline-python/exportar_datos_web.py
```

Las escenas de campo y sus cifras son parte de las actividades del juego. No deben interpretarse automáticamente como mediciones derivadas de las vistas previas satelitales.
