# Orbit Jump: Quipu — Atlas of the Echo

NASA Space Apps Challenge 2026 — Challenge: Dancing with the SARs  
Project Repository: https://github.com/dandelx/Dancing-with-the-SARs  
Live Deployment: https://dandelx.github.io/Dancing-with-the-SARs/

---

## Executive Summary

Synthetic Aperture Radar (SAR) is an active remote sensing technology that overcomes the primary limitations of optical sensors. While optical satellites cannot penetrate clouds, rain, smoke, or darkness, microwave radar pulses (such as L-band frequencies, wavelength approximately 23.8 cm) actively illuminate the surface of the Earth to reveal structural, dielectric, and geometric properties of the terrain in all weather conditions.

Orbit Jump: Quipu — Atlas of the Echo is an educational platform and interactive scientific simulation that translates complex microwave physics into accessible exploration. Inspired by the Andean quipu—a tactile mnemonic system of cords and knots historically used to record astronomical, agricultural, and geographical phenomena—the user embarks on a global expedition investigating real NASA Earth science observations.

The application combines a Three.js 3D orbital spaceflight simulation, a 2D open-world pixel-art expedition engine, hands-on physics laboratories, and a polarimetric viewer utilizing authentic NASA-ISRO SAR (NISAR) data products distributed by the Alaska Satellite Facility (ASF).

---

## Live Demonstration

The compiled web application is hosted on GitHub Pages:
https://dandelx.github.io/Dancing-with-the-SARs/

---

## Key System Features

### 1. Three-Dimensional Orbital Flight (Three.js)
- Photorealistic Earth model rendered with custom GLSL shaders.
- Dynamic day-to-night illumination with a smooth terminator transition, specular ocean reflections, and urban night lights.
- Procedural atmospheric rayleigh-scattering simulation and dual-layer animated cloud geometry.
- Geographically accurate satellite trajectory tracking the NISAR orbit over Peru and international observation targets.
- Real-time procedural audio engine synthesized entirely through the browser Web Audio API without external audio files.

### 2. Two-Dimensional Open-World Exploration Engine
- Custom canvas-based pixel-art world featuring five distinct ecological zones (High Andes, Amazon Rainforest, Arctic Glacial Cap, Coastal Megacity, and Volcanic Rift).
- Dual control scheme supporting keyboard navigation (WASD / arrow keys) and mobile touch cruciform controls.
- World navigation chart (shortcut M) displaying real geodetic coordinates (Latitude / Longitude) and direct queries to the Alaska Satellite Facility catalog.
- Interactive expedition field notebook (shortcut B) recording quantitative observational measurements, field notes, and case status.

### 3. Interactive SAR Physics Laboratories
Each regional field station contains an interactive laboratory demonstrating physical microwave interaction mechanisms:
- Specular Reflection versus Double Bounce: Understanding calm water signal loss versus high backscatter from exposed rough mud and flooded vertical reed stems.
- Volume Scattering and Cross-Polarization: Examining how multi-layered forest canopies depolarize incoming waves to generate high HV returns, and how clearings from alluvial gold mining cause rapid signal collapse.
- Glacial Speckle Tracking and InSAR: Tracking surface texture displacement of glacial ice between consecutive 12-day orbital cycles relative to stationary granite bedrock.
- Differential InSAR (DInSAR) Line-of-Sight Displacement: Measuring millimeter-scale subsidence caused by groundwater extraction, alongside dihedron reflection from urban infrastructure.
- Magma Dike Deformation: Analyzing volcanic dome uplift and fringe patterns while demonstrating microwave penetration through fresh pyroclastic ash.

### 4. NASA NISAR Polarimetric Viewer
Within each case file in the expedition notebook, the real observations interface provides:
- Interactive Split Comparison Slider: A draggable split viewer (0% to 100%) enabling side-by-side analysis of co-polarized (HH) and cross-polarized (HV) radar imagery.
- Interactive Leaflet AOI Mapping: Real Area of Interest (AOI) bounding polygons geocoded over global basemaps.
- Zero-API-Key Dual Basemaps: High-resolution optical satellite imagery (Esri World Imagery) and a dark-filtered OpenStreetMap street layer.
- Georeferenced Radar Overlay: Toggle option to drape calibrated SAR backscatter data directly over the terrain.
- Official ASF Earthdata Cloud Metadata: Exact granule identification strings, UTC acquisition timestamps, orbital direction, and direct download links to official HDF5 (.h5) science products.

---

## Summary of the Five Scientific Case Studies

| Biome & Study Site | Coordinates & AOI | NISAR Products | Sensor & Track | Physical Phenomenon & Scattering Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Andes**<br>Laguna San Nicolas, Namora<br>Cajamarca, Peru | Lat: -7.2347 deg<br>Lon: -78.3422 deg | NISAR GCOV (L2)<br>NISAR SME2 (L3) | L-band (23.8 cm)<br>Track 092 (Descending) | **Wetland dynamics and soil moisture:** Open calm water causes specular forward-reflection (dark pixel return in HH). Evaporation and drainage reveal rough damp mud and emergent totora reeds, generating strong double-bounce and surface scattering (+12 dB increase). |
| **Amazon**<br>La Pampa / Tambopata<br>Madre de Dios, Peru | Lat: -12.9000 deg<br>Lon: -69.9500 deg | NISAR GCOV (L2)<br>SAOCOM-1 L-Band | L-band (23.8 cm)<br>Track 171 (Descending) | **Forest degradation under persistent clouds:** Intact primary rainforest canopy produces high volume scattering in the cross-polarized HV channel. Clear-cutting and tailing ponds from illegal mining cause an immediate -7 dB drop in HV intensity. |
| **Arctic**<br>Barnes Ice Cap<br>Baffin Island, Nunavut, Canada | Lat: 69.9500 deg<br>Lon: -73.0000 deg | NISAR GCOV (L2)<br>NISAR GUNW (L2) | L-band (23.8 cm)<br>Track 041 / 148 | **Glacial flow dynamics:** Speckle tracking and coherence correlation measure a 12-meter eastward movement of crevasses and surface ice across 12-day orbital intervals, calibrated against fixed bedrock exposures. |
| **Coastal Megacity**<br>North Jakarta & Jakarta Bay<br>Java, Indonesia | Lat: -6.1500 deg<br>Lon: 106.8200 deg | NISAR GCOV (L2)<br>NISAR GUNW (L2) | L-band (23.8 cm)<br>Track 092 (Descending) | **Land subsidence and sea defense:** Differential InSAR detects -14 mm line-of-sight displacement due to severe groundwater extraction. Vertical concrete seawalls act as dihedron corner reflectors with high HH phase stability. |
| **Volcanic Rift**<br>Hayli Gubbi Volcano<br>Erta Ale, Afar, Ethiopia | Lat: 13.5100 deg<br>Lon: 40.7164 deg | NISAR GUNW (L2)<br>NISAR GCOV (L2) | L-band (23.8 cm)<br>Tracks 082 & 009 | **Co-eruptive magma dike deformation:** L-band microwaves penetrate superficial ash falls, mapping +26 mm dome uplift during the February 2026 eruption, validated by permanent continuous GNSS stations. |

---

## Technical Architecture

```text
Dancing-with-the-SARs/
|-- .github/
|   `-- workflows/
|       `-- deploy.yml           # Automated GitHub Actions deployment pipeline
|-- pipeline-python/             # Python SAR processing and data extraction
|   |-- recursos_nisar/          # Raw scientific inputs, AOIs, and catalog indexes
|   |   |-- capas_sig/           # Study area GeoJSON boundary polygons
|   |   |-- datos_sar/           # Sample radar browse granules and inventories
|   |   `-- casos_estudio_nisar.json # Canonical metadata dictionary
|   |-- exportar_datos_web.py    # Image optimizer converting heavy radar scenes to WebP
|   `-- requirements.txt         # Python dependencies (Pillow, requests)
|-- web-game/                    # React 18 and Vite frontend application
|   |-- public/
|   |   |-- .nojekyll            # Bypasses Jekyll processing on GitHub Pages
|   |   |-- atlas/               # 2D character sprites, biomes, and station interiors
|   |   |-- data/                # Lightweight WebP radar previews (<1.8 MB total)
|   |   |-- geo/                 # Boundary GeoJSON for 3D globe projection
|   |   `-- textures/            # NASA Blue Marble planetary maps
|   |-- src/
|   |   |-- landing/             # Three.js 3D orbital spaceflight and audio engine
|   |   |-- atlas/               # 2D expedition game, physics labs, and SAR viewer
|   |   |   |-- NasaEvidenceTab.jsx  # Leaflet map and HH/HV split slider
|   |   |   |-- LaboratorioView.jsx  # Interactive physics laboratories
|   |   |   |-- WorldMapModal.jsx    # Geodetic coordinates and ASF catalog links
|   |   |   `-- mundoEngine.js       # 2D canvas map renderer and collision system
|   |   |-- utils/
|   |   |   `-- assetUrl.js      # Base URL path normalizer for GitHub Pages
|   |   |-- App.jsx              # View orchestrator and state transitions
|   |   `-- main.jsx             # React entry point
|   |-- vite.config.js           # Vite configuration with base path setting
|   `-- package.json
`-- README.md                    # Project documentation
```

---

## Local Setup and Installation

### System Requirements
- Node.js: version 18.0.0 or higher
- npm: version 9.0.0 or higher
- Python: version 3.10 or higher (optional, only needed for running the data export script)

### 1. Repository Setup
```bash
git clone https://github.com/dandelx/Dancing-with-the-SARs.git
cd Dancing-with-the-SARs
```

### 2. Web Application Execution
```bash
cd web-game
npm install
npm run dev
```
Open your browser and navigate to the local development URL displayed in your terminal (typically `http://localhost:5173/Dancing-with-the-SARs/`).

### 3. Build and Lint Verification
```bash
# Execute linter across the entire project
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### 4. Optional: Python Data Pipeline
To re-process raw radar granules from the Alaska Satellite Facility into lightweight WebP format:
```bash
cd ../pipeline-python
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux or macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python exportar_datos_web.py
```
This script reads the raw datasets, extracts polarimetric channels, resizes the imagery to 1024 px maximum dimension, converts the files to compressed WebP format, and exports `web-game/public/data/nasa_real_cases.json`.

---

## Scientific Data Sources and Acknowledgments

- NASA Earth Science Data Systems (ESDS) and the Alaska Satellite Facility (ASF DAAC): Satellite granule catalogs, metadata endpoints, and simulated NISAR product archives.
- NASA / Jet Propulsion Laboratory (JPL-Caltech) and Indian Space Research Organisation (ISRO): NISAR mission science requirements and radar polarimetry documentation.
- NASA Earth Observatory: Blue Marble and Visible Earth global geographic base maps.
- Natural Earth and OpenStreetMap Contributors: Cartographic boundaries and street layer tiles.
- CONIDA (National Commission for Aerospace Research and Development, Peru): Operational remote sensing context over Peruvian national territory.

---

## License

This project is licensed under the MIT License. Developed for the NASA Space Apps Challenge 2026.
