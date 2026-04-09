#!/bin/bash

# Configuración
OTA_FOLDER="$HOME/ota-server"
BUNDLE_OUTPUT="android/app/src/main/assets/index.android.bundle"

echo "📦 Generando nuevo JS Bundle..."
npx expo export:embed --platform android --dev false --entry-file index.js --bundle-output $BUNDLE_OUTPUT --assets-dest android/app/src/main/res/

echo "🚚 Copiando bundle al servidor local..."
cp $BUNDLE_OUTPUT $OTA_FOLDER/index.android.bundle

echo "✅ ¡Listo! El launcher detectará la actualización al abrir Ajustes."
