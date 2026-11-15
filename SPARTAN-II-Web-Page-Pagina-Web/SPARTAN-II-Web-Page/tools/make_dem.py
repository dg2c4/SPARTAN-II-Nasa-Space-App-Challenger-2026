#!/usr/bin/env python3
"""Convierte un GeoTIFF global MOLA (equirectangular, lat 90..-90) a data/mola_720x360.json.
Uso:  pip install rasterio numpy
      python tools/make_dem.py RUTA/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif
      (--url URL descarga primero el archivo; --lon360 si el raster va de 0 a 360 E, lo habitual en MOLA)
Fuente oficial: USGS Astrogeology / Astropedia, 'Mars MGS MOLA DEM 463m'. Verifica allí el enlace vigente."""
import argparse,json,sys,urllib.request,numpy as np,rasterio
from rasterio.enums import Resampling
a=argparse.ArgumentParser();a.add_argument("src");a.add_argument("--url");a.add_argument("--lon360",action="store_true");a=a.parse_args()
if a.url: urllib.request.urlretrieve(a.url,a.src)
W,H=720,360
with rasterio.open(a.src) as d:
    z=d.read(1,out_shape=(H,W),resampling=Resampling.average).astype("float64")/ (1000 if abs(np.nanmax(d.read(1,out_shape=(90,180))))>500 else 1)
    nd=d.nodata
if nd is not None: z[z==nd/ (1000 if z.max()<500 and abs(nd)>500 else 1)]=np.nan
z=np.where(np.isfinite(z),z,np.nanmean(z))
if a.lon360: z=np.roll(z,-W//2,axis=1)   # 0..360E -> -180..180
lo,hi=float(z.min()),float(z.max()); e=(z-lo)/(hi-lo)
json.dump({"w":W,"h":H,"km0":round(lo,3),"span":round(hi-lo,3),"e":[round(v,4) for v in e.ravel()],
 "source":"MOLA (MGS) via USGS Astrogeology","units":"km"},open("data/mola_720x360.json","w"),separators=(",",":"))
print("OK: elevación %.2f a %.2f km -> data/mola_720x360.json"%(lo,hi))
