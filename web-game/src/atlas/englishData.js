export const MISSIONS_EN = {
  andes: {
    lugar: 'San Nicolás Lagoon', titulo: 'Water dynamics in Namora',
    historia: 'Namora, Cajamarca, Peru. A shallow pool beside San Nicolás Lagoon has lost its water over 12 days, exposing sediment and wet grass.',
    leccion: 'NISAR uses L-band microwaves to observe through clouds. Calm water reflects energy away from the sensor, while rough wet ground and flooded vegetation can return a stronger echo.',
    pista: 'The HH echo increased by 12 dB between October 24 and November 5. Exposed wet ground and emergent vegetation can increase radar backscatter.',
    cierre: 'The team clears branches from the channel. As water returns, the pool becomes smoother and its HH backscatter decreases.', efecto: 'Water returns to the pool'
  },
  amazonia: {
    lugar: 'La Pampa / Madre de Dios', titulo: 'Forest monitoring beneath the clouds',
    historia: 'Madre de Dios, Peruvian Amazon. Persistent clouds obscure optical images while a ranger notices new clearings along a forest track.',
    leccion: 'Cross-polarized HV radar responds to volume scattering from branches and vegetation. Removing the forest canopy can reduce this signal.',
    pista: 'The simulated HV echo fell by 7 dB. Dense canopy scatters cross-polarized signals; exposed ground can produce a weaker response.',
    cierre: 'The ranger marks the cleared plot for restoration. Radar observations can help monitor changes despite frequent cloud cover.', efecto: 'Restoration plot marked'
  },
  bafin: {
    lugar: 'Barnes Ice Cap', titulo: 'Arctic ice flow',
    historia: 'Baffin Island, Nunavut, Canada. A marker and a network of cracks on the Barnes Ice Cap have moved relative to fixed bedrock.',
    leccion: 'Radar feature tracking and InSAR compare repeated acquisitions to study ice movement relative to stable terrain.',
    pista: 'In this example, the crack pattern and marker moved 12 m east over 12 days. The bedrock remains fixed as a reference.',
    cierre: 'The team estimates ice flow of one metre per day in this example and establishes reference markers for continued monitoring.', efecto: 'Flow markers installed'
  },
  yakarta: {
    lugar: 'North Jakarta', titulo: 'Coastal subsidence and flooding',
    historia: 'North Jakarta, Indonesia. High tides threaten docks and homes in an area affected by intensive groundwater extraction.',
    leccion: 'InSAR compares the phase of repeat radar signals to measure changes in distance along the satellite’s line of sight.',
    pista: 'In this example, radar observes 14 mm of movement away from the sensor, while ground leveling measures an 18 mm vertical drop.',
    cierre: 'The coastal team checks the subsidence measurements and calibrates its monitoring network.', efecto: 'Leveling point calibrated'
  },
  volcan: {
    lugar: 'Hayli Gubbi Volcano, Afar', titulo: 'Deformation at Hayli Gubbi',
    historia: 'Erta Ale range, Afar Depression, Ethiopia. After the eruption of Hayli Gubbi, a volcano observatory examines changes on the flanks and assesses a magmatic dike.',
    leccion: 'Radar interferometry compares repeated observations to measure deformation along the sensor’s line of sight.',
    pista: 'In this example, the dome moves 26 mm toward the radar relative to a stable reference area.',
    cierre: 'The observatory combines satellite observations with ground-based GNSS monitoring to follow volcanic deformation.', efecto: 'GNSS and InSAR monitoring active'
  }
}

export const FIELD_EN = {
  andes: { puntos: ['Pool shore (sediment and wetland)', 'Channel gate (water flow)'], notas: ['Cracked mud and wet grass increase surface roughness. The main water-level mark remains damp.', 'Branches and sediment block water entering the pool; the main lagoon still holds water.'], titulo: 'Reconstruct the water’s path', instruccion: 'Trace the water from the source to the dry pool so the team can clear the channel.' },
  amazonia: { puntos: ['Reference forest (primary canopy)', 'Cleared area (biomass loss)'], notas: ['Dense branches and canopy produce strong volume scattering in HV.', 'The cleared area has lost woody vegetation; in this example, HV falls to −19 dB.'], titulo: 'Mark the affected plot', instruccion: 'Select the three cells with an HV decrease of at least 5 dB in this simulated scene.' },
  bafin: { puntos: ['Stable bedrock outcrop', 'Crack and marker (ice flow)'], notas: ['The bedrock provides a fixed reference point.', 'The crack and marker moved together 12 metres east in this example.'], titulo: 'Align the ice profiles', instruccion: 'Move the first profile east until its three peaks align with the second. Read the displacement in metres.' },
  yakarta: { puntos: ['Geodetic leveling benchmark', 'Coastal dock step'], notas: ['The benchmark is anchored to stable deep rock.', 'Relative to the benchmark, the step dropped from 1000 to 982 mm in this example.'], titulo: 'Measure the dock step', instruccion: 'Use the ruler to reproduce the final height relative to the stable benchmark. The step started at 1000 mm.' },
  volcan: { puntos: ['Reference station on stable basalt', 'Active flank of Hayli Gubbi'], notas: ['A point on stable basalt provides an external reference.', 'The volcano flank shows deformation consistent with changes in the magmatic dike.'], titulo: 'Plan monitoring at Hayli Gubbi', instruccion: 'Choose two points: one to measure local change and one stable reference outside it.' }
}

export const TRIVIAS_EN = {
  andes: [
    { pregunta: 'Why can SAR observe Earth at night?', opciones: ['It emits its own microwave signal.', 'It needs moonlight.', 'It turns clouds into light.'], correcta: 0, explicacion: 'SAR is an active sensor: it sends microwave pulses and measures their returning echoes, so it does not depend on sunlight.' },
    { pregunta: 'How does calm water usually appear in a SAR image?', opciones: ['Always white, because it reflects all energy back.', 'Dark, because much of the signal reflects away from the sensor.', 'Invisible, because radar cannot detect water.'], correcta: 1, explicacion: 'Calm water can reflect the signal away from the sensor, producing a weak echo. Wind and other conditions can change its appearance.' }
  ],
  amazonia: [
    { pregunta: 'Why is SAR useful in a frequently cloudy rainforest?', opciones: ['Microwaves can pass through most clouds.', 'Radar physically removes clouds.', 'Radar requires clear skies.'], correcta: 0, explicacion: 'Microwaves can observe through most clouds, helping scientists study frequently cloudy regions.' },
    { pregunta: 'What can cause volume scattering in a forest?', opciones: ['Branches and leaves scattering energy in many directions.', 'Only the green colour of leaves.', 'Sunlight reflected by clouds.'], correcta: 0, explicacion: 'Vegetation scatters radar waves in many directions. Cross-polarized signals can provide information about vegetation structure.' }
  ],
  bafin: [
    { pregunta: 'What does temporal resolution describe?', opciones: ['The number of colours in an image.', 'How often an area is observed.', 'The size of the antenna.'], correcta: 1, explicacion: 'Temporal resolution relates to observation frequency. Images from different dates can help reveal change.' },
    { pregunta: 'Why compare SAR observations from different dates?', opciones: ['To study change and, with suitable techniques, ground or ice movement.', 'To stop ice from moving.', 'To turn radar data automatically into optical photographs.'], correcta: 0, explicacion: 'Repeated observations can reveal change. Depending on the data, InSAR and feature tracking can measure movement.' }
  ],
  yakarta: [
    { pregunta: 'What is SAR interferometry (InSAR)?', opciones: ['A comparison of SAR signal phase from different observations.', 'A way to measure only air temperature.', 'An underwater camera.'], correcta: 0, explicacion: 'InSAR compares signal phase across observations to study changes in distance between the sensor and the surface.' },
    { pregunta: 'What do scene metadata tell us?', opciones: ['Only the player’s name.', 'Information such as date, sensor and acquisition characteristics.', 'That the data are guaranteed error-free.'], correcta: 1, explicacion: 'Metadata describe the observation and product, helping users interpret and compare scenes.' }
  ],
  volcan: [
    { pregunta: 'Why is SAR called synthetic aperture radar?', opciones: ['It combines signals collected while moving to simulate a larger antenna.', 'It deploys an antenna as large as a country.', 'It invents missing data.'], correcta: 0, explicacion: 'Signals collected as the sensor moves are combined to synthesize a larger aperture and improve resolution along the flight path.' },
    { pregunta: 'What can happen when radar views a mountain from the side?', opciones: ['Terrain can block the signal, creating a radar shadow.', 'The mountain physically disappears.', 'Every slope is illuminated equally.'], correcta: 0, explicacion: 'Side-looking radar geometry can produce shadows where terrain blocks illumination.' }
  ]
}

export const NASA_EN = {
  andes: { region: 'Cajamarca, Peru', resumen: 'Calm water can reflect radar away from the sensor. Wet, rough ground and flooded vegetation can produce stronger surface and double-bounce returns.', hh: 'Sensitive to rough wet ground and double bounce.', hv: 'Sensitive to vegetation structure.', science: 'Open water can appear dark; flooded vegetation may produce strong double-bounce scattering. Soil moisture can increase surface backscatter.', polarizations: ['HH: flooded vegetation and double bounce', 'VV: water roughness and soil moisture', 'HV: vegetation volume scattering'], applications: 'Potential applications include monitoring wetlands and soil moisture for water security and drought assessment.' },
  amazonia: { region: 'Madre de Dios, Peru', resumen: 'Dense forest branches and canopy scatter radar energy. Clearings may show weaker cross-polarized returns.', hh: 'Responds to exposed ground and structure.', hv: 'Responds to vegetation volume scattering.', science: 'Forest canopies scatter L-band energy. Clearing or fire can reduce woody volume scattering and change HV returns.', polarizations: ['HV: woody vegetation and canopy change', 'HH: trunks and potential double bounce', 'HV/HH ratio: forest structure'], applications: 'Potential applications include monitoring forest loss, degradation and land-use change through persistent cloud cover.' },
  bafin: { region: 'Barnes Ice Cap, Baffin Island, Canada', resumen: 'Ice, snow, surface roughness and fractures affect SAR returns. Stable rock can serve as a ground reference.', hh: 'Can highlight surface structure and fractures.', hv: 'Can respond to scattering in ice and snow.', science: 'Dry snow and ice can support subsurface scattering; meltwater can change the microwave response. Different wavelengths have different sensitivities.', polarizations: ['HH: ice and open-water contrast', 'HV: rough or fractured ice'], applications: 'Potential applications include glacier velocity mapping, seasonal melt monitoring and comparison with historical radar observations.' },
  yakarta: { region: 'North Jakarta, Indonesia', resumen: 'Urban structures can create strong double-bounce returns, while calm water often appears dark.', hh: 'Can highlight buildings and docks.', hv: 'Can help distinguish urban vegetation.', science: 'Stable urban reflectors can support repeat-pass interferometry. Flooding may change double-bounce or surface scattering depending on the setting.', polarizations: ['HH and VV: urban returns and potential flood contrast', 'HV: vegetation and infrastructure contrast'], applications: 'Potential applications include monitoring subsidence and mapping floods in coastal cities.' },
  volcan: { region: 'Hayli Gubbi, Afar, Ethiopia', resumen: 'Rough lava and deposits affect radar backscatter; changes between acquisitions can be studied using InSAR.', hh: 'Responds to lava and surface roughness.', hv: 'Can respond to diffuse scattering from deposits.', science: 'Ground movement changes the sensor-to-surface distance and interferometric phase. Fresh deposits and fractures can also alter roughness and coherence.', polarizations: ['HH or VV: co-polarized observations', 'HV: changes in diffuse scattering'], applications: 'Potential applications include monitoring remote volcanoes and tracking post-eruptive deformation.' }
}
