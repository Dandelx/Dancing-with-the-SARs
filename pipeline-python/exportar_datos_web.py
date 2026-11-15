import json
import os
import shutil
from pathlib import Path
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
RECURSOS_DIR = BASE_DIR / "recursos_nisar"
CASOS_JSON = RECURSOS_DIR / "casos_estudio_nisar.json"
INVENTARIO_JSON = RECURSOS_DIR / "datos_sar" / "inventario_asf_todos_los_casos.json"
CAPAS_SIG_DIR = RECURSOS_DIR / "capas_sig"
DATOS_SAR_DIR = RECURSOS_DIR / "datos_sar"

DEST_DATA_DIR = BASE_DIR.parent / "web-game" / "public" / "data"
DEST_BROWSE_DIR = DEST_DATA_DIR / "sar_browse"

REGION_MAP = {
    "andes": "caso_1_cajamarca_andes",
    "amazonia": "caso_2_amazonia_madre_de_dios",
    "bafin": "caso_3_artico_barnes_ice_cap",
    "yakarta": "caso_4_costa_yakarta",
    "volcan": "caso_5_volcan_hayli_gubbi"
}


def detectar_polarizacion(granule_name: str) -> str:
    if "_DHDH_" in granule_name:
        return "HH + HV (Dual-Pol)"
    elif "_SHSH_" in granule_name or "_SHNA_" in granule_name or "_SH_" in granule_name:
        return "HH (Single-Pol)"
    elif "_DVDV_" in granule_name:
        return "VV + VH (Dual-Pol)"
    elif "_SV_" in granule_name:
        return "VV (Single-Pol)"
    return "Banda L / Polarimétrico"


def detectar_orbita(granule_name: str) -> str:
    if "_D_" in granule_name:
        return "Descendente"
    elif "_A_" in granule_name:
        return "Ascendente"
    return "Orbital"


def optimizar_a_webp(src_path: Path, dest_path: Path, max_ancho: int = 1024, calidad: int = 82) -> int:
    with Image.open(src_path) as im:
        im = im.convert("RGB")
        w, h = im.size
        if w > max_ancho:
            new_h = int(h * (max_ancho / w))
            im = im.resize((max_ancho, new_h), Image.Resampling.LANCZOS)
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        im.save(dest_path, "WEBP", quality=calidad)
    return dest_path.stat().st_size


def exportar():
    DEST_DATA_DIR.mkdir(parents=True, exist_ok=True)
    DEST_BROWSE_DIR.mkdir(parents=True, exist_ok=True)

    with open(CASOS_JSON, "r", encoding="utf-8") as f:
        casos_data = json.load(f)["casos_estudio"]
    casos_dict = {c["id"]: c for c in casos_data}

    with open(INVENTARIO_JSON, "r", encoding="utf-8") as f:
        inventario_data = json.load(f)

    # Copiar capa AOI GeoJSON
    aoi_src = CAPAS_SIG_DIR / "casos_estudio_5_aois.geojson"
    aoi_dest = DEST_DATA_DIR / "casos_estudio_5_aois.geojson"
    if aoi_src.exists():
        shutil.copy2(aoi_src, aoi_dest)

    with open(aoi_src, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)
    geojson_features = geojson_data.get("features", [])

    resultado = {}

    for idx, (region_id, caso_id) in enumerate(REGION_MAP.items()):
        print(f"\n[Optimizando] Región: {region_id} ({caso_id})...")
        caso_meta = casos_dict.get(caso_id, {})
        asf_caso = inventario_data.get(caso_id, {})

        region_browse_dest = DEST_BROWSE_DIR / region_id
        region_browse_dest.mkdir(parents=True, exist_ok=True)

        browse_src_dir = DATOS_SAR_DIR / caso_id / "browse"
        available_files = [f for f in os.listdir(browse_src_dir) if f.startswith("NISAR_")] if browse_src_dir.exists() else []

        feature = geojson_features[idx] if idx < len(geojson_features) else None

        # Seleccionar las mejores escenas GCOV
        gcov_escenas = asf_caso.get("NISAR_GCOV", [])

        # Buscar escena dual-pol con canales HH (_3.png) y HV (_4.png)
        escena_principal = None
        for esc in gcov_escenas:
            g = esc.get("granuleName", "")
            if any(g in f and f.endswith("_4.png") for f in available_files):
                escena_principal = esc
                break
        if not escena_principal and gcov_escenas:
            escena_principal = gcov_escenas[0]

        vistas_optimizadas = []
        browse_latlon_path = None
        browse_hh_path = None
        browse_hv_path = None

        if escena_principal:
            g_name = escena_principal["granuleName"]
            archivos_escena = [f for f in available_files if g_name in f]

            # Buscar _0.png (latlon), _3.png (hh), _4.png (hv)
            f_latlon = next((f for f in archivos_escena if f.endswith("_0.png")), None)
            f_hh = next((f for f in archivos_escena if f.endswith("_3.png")), None)
            f_hv = next((f for f in archivos_escena if f.endswith("_4.png")), None)

            # Si no hay _4.png en esta escena, buscar en cualquier otra de la región
            if not f_hv:
                f_hv = next((f for f in available_files if f.endswith("_4.png")), None)

            seleccionados = [
                ("latlon", "Vista Previa LatLon", f_latlon),
                ("hh", "Canal HH (Co-Polarizado)", f_hh),
                ("hv", "Canal HV (Polarización Cruzada)", f_hv)
            ]

            for clave, label, fname in seleccionados:
                if not fname:
                    continue
                src_img = browse_src_dir / fname
                dest_img = region_browse_dest / f"{clave}.webp"
                tamano = optimizar_a_webp(src_img, dest_img, max_ancho=1024, calidad=82)
                web_url = f"/data/sar_browse/{region_id}/{dest_img.name}"

                vistas_optimizadas.append({
                    "id": clave,
                    "etiqueta": label,
                    "ruta": web_url,
                    "tamano_bytes": tamano,
                    "archivo_origen": fname
                })

                if clave == "latlon":
                    browse_latlon_path = web_url
                elif clave == "hh":
                    browse_hh_path = web_url
                elif clave == "hv":
                    browse_hv_path = web_url

                print(f"  -> Generado {dest_img.name}: {round(tamano/1024, 1)} KB")

        # Metadatos estructurados de escenas ASF
        escenas_resumen = []
        for esc in gcov_escenas[:3]:
            g = esc.get("granuleName", "")
            escenas_resumen.append({
                "granuleName": g,
                "producto": "NISAR GCOV",
                "startTime": esc.get("startTime"),
                "processingLevel": esc.get("processingLevel", "L2"),
                "polarizaciones": detectar_polarizacion(g),
                "orbita": detectar_orbita(g),
                "url_descarga_asf": esc.get("url")
            })

        resultado[region_id] = {
            "region_id": region_id,
            "caso_id": caso_id,
            "titulo": caso_meta.get("titulo", ""),
            "region_oficial": caso_meta.get("region", ""),
            "fenomeno": caso_meta.get("fenomeno", ""),
            "coordenadas": caso_meta.get("coordenadas", {}),
            "geojson_feature": feature,
            "fechas_clave": caso_meta.get("fechas_clave", {}),
            "hipotesis_fisica": caso_meta.get("hipotesis_fisica", {}),
            "productos_recomendados": caso_meta.get("productos_sar_recomendados", []),
            "consultas_asf": caso_meta.get("consulta_asf_api_publica", {}),
            "browse_latlon": browse_latlon_path or (vistas_optimizadas[0]["ruta"] if vistas_optimizadas else None),
            "browse_hh": browse_hh_path,
            "browse_hv": browse_hv_path,
            "vistas": vistas_optimizadas,
            "escenas": escenas_resumen
        }

    output_json = DEST_DATA_DIR / "nasa_real_cases.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)

    print(f"\n[Completado] Generado: {output_json} ({round(output_json.stat().st_size/1024, 1)} KB)")


if __name__ == "__main__":
    exportar()
