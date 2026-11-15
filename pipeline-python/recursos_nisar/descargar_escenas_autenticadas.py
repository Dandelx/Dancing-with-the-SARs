import argparse
import getpass
import json
import os
from pathlib import Path
from typing import Any, Dict, List

import asf_search as asf
import requests

BASE_DIR = Path(__file__).resolve().parent
CONFIG_JSON = BASE_DIR / "casos_estudio_nisar.json"
DATOS_SAR_DIR = BASE_DIR / "datos_sar"


def cargar_casos() -> List[Dict[str, Any]]:
    with open(CONFIG_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["casos_estudio"]


def buscar_escenas_caso(caso: Dict[str, Any], max_results: int = 5) -> Dict[str, List[Dict[str, Any]]]:
    wkt = caso["coordenadas"]["wkt_polygon"]
    start, end = caso["fechas_clave"]["ventana_busqueda_asf"]
    resultados_por_producto: Dict[str, List[Dict[str, Any]]] = {}

    # Niveles NISAR relevantes segÃºn el caso
    niveles_nisar = ["GCOV"]
    if any("GUNW" in p for p in caso["productos_sar_recomendados"]):
        niveles_nisar.append("GUNW")
    if any("SME2" in p for p in caso["productos_sar_recomendados"]):
        niveles_nisar.append("SME2")

    for nivel in niveles_nisar:
        print(f"  [ASF] Buscando NISAR {nivel} para {caso['id']}...")
        results = asf.search(
            dataset="NISAR",
            processingLevel=nivel,
            intersectsWith=wkt,
            start=start,
            end=end,
            maxResults=max_results,
        )
        resultados_por_producto[f"NISAR_{nivel}"] = [
            {
                "granuleName": r.properties.get("sceneName"),
                "fileID": r.properties.get("fileID"),
                "startTime": r.properties.get("startTime"),
                "processingLevel": r.properties.get("processingLevel"),
                "url": r.properties.get("url"),
                "browse": r.properties.get("browse", []),
                "bytes": r.properties.get("bytes"),
            }
            for r in results
        ]

    # Para el caso Ã¡rtico, complementar con RADARSAT-1 abierto
    if any("RADARSAT-1" in p for p in caso["productos_sar_recomendados"]):
        print(f"  [ASF] Buscando RADARSAT-1 abierto para {caso['id']}...")
        rsat_results = asf.search(
            platform=[asf.PLATFORM.RADARSAT],
            intersectsWith=wkt,
            maxResults=max_results,
        )
        resultados_por_producto["RADARSAT-1"] = [
            {
                "granuleName": r.properties.get("sceneName"),
                "fileID": r.properties.get("fileID"),
                "startTime": r.properties.get("startTime"),
                "beamMode": r.properties.get("beamModeType"),
                "url": r.properties.get("url"),
                "browse": r.properties.get("browse", []),
                "bytes": r.properties.get("bytes"),
            }
            for r in rsat_results
        ]

    return resultados_por_producto


def descargar_browse_images(caso_id: str, catalogo: Dict[str, List[Dict[str, Any]]]) -> None:
    destino_caso = DATOS_SAR_DIR / caso_id / "browse"
    destino_caso.mkdir(parents=True, exist_ok=True)
    for prod, escenas in catalogo.items():
        for esc in escenas:
            for idx, b_url in enumerate(esc.get("browse") or []):
                nombre = f"{prod}_{esc['granuleName']}_{idx}.png"
                ruta = destino_caso / nombre
                if ruta.exists():
                    continue
                try:
                    resp = requests.get(b_url, timeout=30)
                    if resp.status_code == 200:
                        ruta.write_bytes(resp.content)
                except Exception as exc:
                    print(f"    Aviso: no se pudo descargar browse {b_url}: {exc}")


def autenticar_earthdata() -> asf.ASFSession:
    usuario = os.environ.get("EARTHDATA_USERNAME") or input("Usuario NASA Earthdata: ").strip()
    password = os.environ.get("EARTHDATA_PASSWORD") or getpass.getpass("ContraseÃ±a NASA Earthdata: ")
    session = asf.ASFSession().auth_with_creds(usuario, password)
    return session


def main() -> None:
    parser = argparse.ArgumentParser(description="BÃºsqueda y descarga de escenas NISAR/RADARSAT-1 en ASF")
    parser.add_argument("--solo-buscar", action="store_true", help="Solo consultar metadatos y bajar browse images")
    parser.add_argument("--max-escenas", type=int, default=2, help="MÃ¡ximo de escenas por producto y caso")
    args = parser.parse_args()

    DATOS_SAR_DIR.mkdir(parents=True, exist_ok=True)
    casos = cargar_casos()
    inventario_total: Dict[str, Any] = {}

    for caso in casos:
        cid = caso["id"]
        print(f"\n=== {cid}: {caso['titulo']} ===")
        catalogo = buscar_escenas_caso(caso, max_results=args.max_escenas)
        inventario_total[cid] = catalogo

        caso_dir = DATOS_SAR_DIR / cid
        caso_dir.mkdir(parents=True, exist_ok=True)
        with open(caso_dir / "escenas_asf.json", "w", encoding="utf-8") as f:
            json.dump(catalogo, f, indent=2, ensure_ascii=False)

        descargar_browse_images(cid, catalogo)

    with open(DATOS_SAR_DIR / "inventario_asf_todos_los_casos.json", "w", encoding="utf-8") as f:
        json.dump(inventario_total, f, indent=2, ensure_ascii=False)

    print("\nMetadatos guardados en datos_sar/inventario_asf_todos_los_casos.json")

    if args.solo_buscar:
        print("Modo --solo-buscar activado. Finalizado sin descargar archivos pesados.")
        return

    session = autenticar_earthdata()
    for caso in casos:
        cid = caso["id"]
        wkt = caso["coordenadas"]["wkt_polygon"]
        start, end = caso["fechas_clave"]["ventana_busqueda_asf"]
        destino = DATOS_SAR_DIR / cid
        print(f"\nDescargando escenas NISAR GCOV para {cid} en {destino}...")
        res = asf.search(
            dataset="NISAR",
            processingLevel="GCOV",
            intersectsWith=wkt,
            start=start,
            end=end,
            maxResults=args.max_escenas,
        )
        if len(res) > 0:
            res.download(path=str(destino), session=session, processes=2)
        else:
            print(f"  Sin escenas GCOV disponibles en la ventana para {cid}.")


if __name__ == "__main__":
    main()
