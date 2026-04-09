#!/bin/bash

# Configuración
DEVICE_IP="100.81.8.76"
BUNDLE_OUTPUT="android/app/src/main/assets/index.android.bundle"

echo "🚀 Iniciando despliegue OTA..."

# 1. Generar el Bundle de JS
echo "📦 Generando JS Bundle..."
npx expo export:embed --platform android --dev false --entry-file index.js --bundle-output $BUNDLE_OUTPUT --assets-dest android/app/src/main/res/

# 2. Enviar el bundle al dispositivo vía Tailscale
echo "📤 Enviando bundle a $DEVICE_IP..."
sudo tailscale file cp $BUNDLE_OUTPUT $DEVICE_IP:

echo "✅ Proceso completado."
echo "💡 RECUERDA: En Termux, mueve el archivo recibido a la carpeta ota-server:"
echo "   mv ~/tailscale-files/index.android.bundle ~/ota-server/"
