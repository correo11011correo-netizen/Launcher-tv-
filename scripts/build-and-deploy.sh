#!/bin/bash

# --- CONFIGURACIÓN ---
DEVICE_IP="100.81.8.76"
PROJECT_ROOT=$(pwd)
APK_PATH="$PROJECT_ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
BUNDLE_OUTPUT="$PROJECT_ROOT/android/app/src/main/assets/index.android.bundle"

echo "------------------------------------------"
echo "🚀 INICIANDO PROCESO DE COMPILACIÓN Y ENVÍO"
echo "------------------------------------------"

# 1. Generar el Bundle de JavaScript (Producción)
echo "📦 [1/3] Generando JS Bundle..."
npx expo export:embed --platform android --dev false --entry-file index.js --bundle-output "$BUNDLE_OUTPUT" --assets-dest "$PROJECT_ROOT/android/app/src/main/res/"

if [ $? -ne 0 ]; then
    echo "❌ Error al generar el bundle. Abortando."
    exit 1
fi

# 2. Compilar el APK con Gradle
echo "🏗️ [2/3] Compilando APK (Debug)..."
cd "$PROJECT_ROOT/android" && ./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "❌ Error en la compilación de Gradle. Abortando."
    exit 1
fi

# 3. Enviar vía Tailscale
echo "📤 [3/3] Enviando APK a $DEVICE_IP vía Tailscale..."
sudo tailscale file cp "$APK_PATH" "$DEVICE_IP:"

if [ $? -eq 0 ]; then
    echo "------------------------------------------"
    echo "✅ ¡PROCESO COMPLETADO CON ÉXITO!"
    echo "📱 El APK ya debería estar en tu dispositivo."
    echo "------------------------------------------"
else
    echo "❌ Error al enviar el archivo por Tailscale."
    exit 1
fi
