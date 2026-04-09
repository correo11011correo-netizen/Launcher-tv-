#!/bin/bash

# Directorios
MARKET_DIR="market"
APKS_DIR="$MARKET_DIR/apks"
CATALOG_FILE="$MARKET_DIR/apps.json"

echo "--- Generando/Actualizando Catálogo del Market ---"

# 1. Crear directorios si no existen
if [ ! -d "$MARKET_DIR" ]; then
  echo "Creando directorio: $MARKET_DIR"
  mkdir "$MARKET_DIR"
fi
if [ ! -d "$APKS_DIR" ]; then
  echo "Creando directorio: $APKS_DIR"
  mkdir "$APKS_DIR"
fi

# 2. Leer el catálogo existente o crear uno nuevo
if [ -f "$CATALOG_FILE" ]; then
  echo "Catálogo existente encontrado: $CATALOG_FILE"
  # Opcional: Podrías leer el JSON actual y actualizarlo en lugar de sobreescribirlo
  # Por simplicidad, lo sobreescribimos con la lista actual de APKs escaneados
  echo "Sobreescribiendo catálogo con APKs encontrados..."
  echo "[" > "$CATALOG_FILE"
else
  echo "Creando nuevo catálogo: $CATALOG_FILE"
  echo "[" > "$CATALOG_FILE"
fi

# 3. Escanear la carpeta de APKs y añadir entradas al JSON
FIRST_ENTRY=true
shopt -s nullglob # Para que no imprima nada si no hay archivos
for apk_file in "$APKS_DIR"/*.apk; do
  if [ -f "$apk_file" ]; then
    # Extraer nombre del archivo sin extensión
    apk_name=$(basename "$apk_file" .apk)
    
    # Crear URL Raw de GitHub (asegúrate de que la rama sea 'master')
    # NOTA: Esto asume que subirás el APK directamente a la carpeta 'market/apks/' en el repo.
    # Si el APK se sube a otra ruta, ajusta la URL_BASE.
    URL_BASE="https://raw.githubusercontent.com/correo11011correo-netizen/Launcher-tv-/master/$APKS_DIR"
    apk_url="$URL_BASE/$apk_name.apk"
    icon_url="" # Placeholder: Deberás añadir la URL del icono manualmente
    version="1.0.0" # Placeholder: Deberás actualizar la versión manualmente
    description="App descargada automáticamente. Añadir descripción." # Placeholder

    if [ "$FIRST_ENTRY" = false ]; then
      echo "," >> "$CATALOG_FILE"
    fi

    echo "  {" >> "$CATALOG_FILE"
    echo "    "id": "$(echo -n $apk_name | md5sum | awk '{print substr($1,1,8)}' )"," >> "$CATALOG_FILE" # ID único simple
    echo "    "name": "$(echo $apk_name | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')"," >> "$CATALOG_FILE" # Nombre formateado (Ej: MyApp -> My App)
    echo "    "version": "$version"," >> "$CATALOG_FILE"
    echo "    "description": "$description"," >> "$CATALOG_FILE"
    echo "    "icon": "$icon_url"," >> "$CATALOG_FILE"
    echo "    "apkUrl": "$apk_url"" >> "$CATALOG_FILE"
    echo "  }" >> "$CATALOG_FILE"
    
    FIRST_ENTRY=false
  fi
done
shopt -u nullglob # Desactivar nullglob

echo "]" >> "$CATALOG_FILE"

echo "--- Proceso completado. Revisa $CATALOG_FILE ---"
echo "💡 RECUERDA:"
echo "   - Coloca tus APKs en la carpeta '$APKS_DIR/'."
echo "   - Edita '$CATALOG_FILE' para añadir descripciones, iconos y versiones."
echo "   - Luego, haz commit y push de los cambios."
