import json
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

DESCARGAS = {
    "documentacion": [
        ("arset_2026_nisar_parte2_espanol.pdf", "https://www.earthdata.nasa.gov/s3fs-public/2026-07/arset-2026-nisar-part2-spanish.pdf"),
        ("arset_2026_nisar_parte3_espanol.pdf", "https://www.earthdata.nasa.gov/s3fs-public/2026-07/arset-2026-nisar-part3-spanish.pdf"),
        ("NISAR_Mission_Science_Users_Handbook.pdf", "https://assets.science.nasa.gov/content/dam/science/missions/nisar/nisar-jpl/pdf/NISAR_FINAL_9-6-19.pdf"),
        ("NISAR_Applications_OilSpills.pdf", "https://assets.science.nasa.gov/content/dam/science/missions/nisar/nisar-jpl/pdf/NISAR_Applications_OilSpills1.pdf"),
        ("CONAE_SAOCOM_Manual_Usuario_2026_ES.pdf", "https://catalogos.conae.gov.ar/catalogo/docs/SAOCOM/SUM_Espa%C3%B1ol_Enero-2026.pdf"),
        ("CONAE_SAOCOM_SAR_RGB_Manual_e02.pdf", "https://catalogos.conae.gov.ar/catalogo/docs/saocom/030_CONAE_PRD_SAOCOM_SAR_RGB_ManualUsuarios_e02.pdf"),
    ],
    "imagenes_referencia": [
        ("UAVSAR_postcard_SanFrancisco.pdf", "https://uavsar.jpl.nasa.gov/resources/postcards/UAVSAR-postcard-SF.pdf"),
        ("UAVSAR_postcards_index.html", "https://uavsar.jpl.nasa.gov/education/postcards.html"),
    ],
    "datos_sar": [
        ("CSA_EO_Tutorial_main.zip", "https://github.com/asc-csa/EO-Visualization-and-Search-Tutorial/archive/refs/heads/main.zip"),
    ],
}

PAISES_GEOBOUNDARIES = [
    ("PER", "ADM1", "peru_departamentos_adm1.geojson"),
    ("CAN", "ADM1", "canada_provincias_adm1.geojson"),
    ("IDN", "ADM1", "indonesia_provincias_adm1.geojson"),
    ("ETH", "ADM1", "etiopia_regiones_adm1.geojson"),
]


def bajar_archivo(url: str, destino: Path) -> None:
    if destino.exists():
        print(f"  [OK ya existe] {destino.name}")
        return
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (SpaceApps-NISAR-Research)"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        destino.write_bytes(resp.read())
    print(f"  [Descargado] {destino.name}")


def main() -> None:
    for carpeta, items in DESCARGAS.items():
        dest_dir = BASE_DIR / carpeta
        dest_dir.mkdir(parents=True, exist_ok=True)
        print(f"\n=== Descargando en {carpeta}/ ===")
        for nombre, url in items:
            try:
                bajar_archivo(url, dest_dir / nombre)
            except Exception as exc:
                print(f"  [Error] {nombre}: {exc}")

    print("\n=== Descargando límites GeoJSON desde geoBoundaries API ===")
    sig_dir = BASE_DIR / "capas_sig"
    sig_dir.mkdir(parents=True, exist_ok=True)
    for iso3, adm, nombre_local in PAISES_GEOBOUNDARIES:
        api_url = f"https://www.geoboundaries.org/api/current/gbOpen/{iso3}/{adm}/"
        try:
            req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                meta = json.loads(resp.read().decode("utf-8"))
            gj_url = meta.get("simplifiedGeometryGeoJSON") or meta.get("gjDownloadURL")
            if gj_url:
                bajar_archivo(gj_url, sig_dir / nombre_local)
        except Exception as exc:
            print(f"  [Error geoBoundaries {iso3}]: {exc}")


if __name__ == "__main__":
    main()