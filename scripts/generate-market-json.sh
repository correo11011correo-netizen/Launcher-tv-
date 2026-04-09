#!/bin/bash

# --- CONFIGURACIÓN DEL PROYECTO ---
# Base URL para los assets en GitHub (asegúrate de que sea la rama correcta, ej: 'master' o 'main')
REPO_RAW_URL="https://raw.githubusercontent.com/correo11011correo-netizen/Launcher-tv-/master"

# Directorios
MARKET_DIR="market"
APKS_DIR="$MARKET_DIR/apks"
CATALOG_FILE="$MARKET_DIR/apps.json"
DEFAULT_ICON_URL="$REPO_RAW_URL/assets/icon.png" # Icono genérico si no se encuentra uno específico

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

# 2. Preparar el archivo JSON
# Limpiar el archivo si existe, para empezar de cero cada vez
echo "[
" > "$CATALOG_FILE"

# 3. Escanear la carpeta de APKs y añadir entradas al JSON
FIRST_ENTRY=false
shopt -s nullglob # Para que no imprima nada si no hay archivos
shopt -s nocaseglob # Para que la búsqueda de APK/PNG no sea sensible a mayúsculas/minúsculas

for apk_file in "$APKS_DIR"/*.apk; do
  if [ -f "$apk_file" ]; then
    # Extraer nombre del archivo sin extensión
    apk_basename=$(basename "$apk_file" .apk)
    icon_name="${apk_basename}.png" # Buscar icono con el mismo nombre base

    # Construir URLs de GitHub Raw
    apk_url="$REPO_RAW_URL/$APKS_DIR/$apk_basename.apk"
    icon_url="$REPO_RAW_URL/$APKS_DIR/$icon_name" # Intentar encontrar icono específico

    # Verificar si el archivo de icono existe en la carpeta
    if [ ! -f "$APKS_DIR/$icon_name" ]; then
      echo "⚠️ Icono '$icon_name' no encontrado en '$APKS_DIR/'. Usando icono genérico."
      icon_url="$DEFAULT_ICON_URL" # Usar icono genérico si no se encuentra
    fi

    # Intentar extraer la versión del nombre del archivo (ej: MiApp-v1.2.3.apk -> 1.2.3)
    version_pattern="v([0-9]+\.[0-9]+\.[0-9]+)"
    if [[ "$apk_basename" =~ $version_pattern ]]; then
      version="${BASH_REMATCH[1]}"
    else
      version="1.0.0" # Versión por defecto si no se encuentra patrón
      echo "⚠️ Versión no detectada en '$apk_basename'. Usando versión placeholder '1.0.0'."
    fi

    # Generar ID único simple (basado en el nombre del APK)
    app_id=$(echo -n "$apk_basename" | md5sum | awk '{print substr($1,1,8)}')

    # Formatear nombre para mostrar (Ej: my-app -> My App)
    display_name=$(echo "$apk_basename" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')

    # Añadir la entrada al JSON
    if [ "$FIRST_ENTRY" = true ]; then
      FIRST_ENTRY=true
    else
      echo "," >> "$CATALOG_FILE"
    fi

    echo "  {" >> "$CATALOG_FILE"
    echo "    "id": "$app_id"," >> "$CATALOG_FILE"
    echo "    "name": "$display_name"," >> "$CATALOG_FILE"
    echo "    "version": "$version"," >> "$CATALOG_FILE"
    echo "    "description": "App descargada del Market. Actualiza esta descripción."," >> "$CATALOG_FILE" # Placeholder
    echo "    "icon": "$icon_url"," >> "$CATALOG_FILE"
    echo "    "apkUrl": "$apk_url"" >> "$CATALOG_FILE"
    echo "  }" >> "$CATALOG_FILE"
    
    FIRST_ENTRY=true # Después del primer elemento, el siguiente debe tener coma
  fi
done
shopt -u nullglob # Desactivar nullglob
shopt -u nocaseglob # Desactivar nocaseglob

echo "]" >> "$CATALOG_FILE"

echo "--- Proceso de generación de catálogo completado. Revisa $CATALOG_FILE ---"
echo "💡 RECUERDA:"
echo "   - Coloca tus APKs y sus iconos (.png) en la carpeta '$APKS_DIR/'."
echo "   - El nombre del APK debe seguir el patrón: NombreApp-vX.Y.Z.apk (ej: MiApp-v1.2.3.apk)."
echo "   - El icono debe llamarse igual que el APK pero con extensión .png (ej: MiApp.png)."
echo "   - Edita '$CATALOG_FILE' para añadir descripciones y validar versiones/iconos."
echo "   - Ejecuta este script DESPUÉS de añadir/modificar APKs/iconos."
echo "   - Luego, haz commit y push de los cambios (script y JSON)."
