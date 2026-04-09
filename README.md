# Launcher TV (Android TV)

Launcher personalizado desarrollado con React Native y Expo, diseñado específicamente para dispositivos de TV con un sistema de gestión de aplicaciones controlado remotamente.

## 🎯 Objetivos del Proyecto

*   **Interfaz Optimizada:** UI pensada para navegación con D-Pad (control remoto).
*   **Catálogo Curado:** El launcher solo muestra aplicaciones específicas predefinidas o cargadas vía remota. No es un "listador" de todas las apps del sistema por defecto.
*   **Tienda Privada:** Sistema propio de carga de APKs (estilo Play Store interna) para instalar apps autorizadas desde un servidor central.
*   **Modo Autónomo:** Funcionamiento sin dependencia del servidor Metro (JS Bundle embebido).

## 🛠️ Tecnologías y Compilación

*   **Framework:** React Native 0.81.5 / Expo SDK 54.
*   **Plataforma principal:** Android TV.
*   **Sistema de Build:** Gradle (Android Nativo).
*   **Estrategia de Bundle:** JavaScript embebido en los assets nativos para evitar el uso de servidores de desarrollo en producción.

## 🚀 Comandos de Desarrollo

### 1. Iniciar servidor de desarrollo (Metro)
```bash
npm start
```

### 2. Generar el Bundle de JS para Android (Modo Offline)
Este comando empaqueta todo el código JS dentro de la carpeta de assets de Android para que la app no necesite el servidor Metro para arrancar.
```bash
npx expo export:embed --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
```

### 3. Compilar el APK (Debug)
Una vez generado el bundle, puedes crear el instalador:
```bash
cd android
./gradlew assembleDebug
```
El APK se encontrará en: `android/app/build/outputs/apk/debug/app-debug.apk`

## 🚀 Despliegue Local (Tailscale)

Para enviar el APK generado a un dispositivo en la red de Tailscale (por ejemplo, la TV o un PC de pruebas):

```bash
# 1. Asegurar el bundle JS actualizado
npx expo export:embed --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

# 2. Compilar APK
cd android && ./gradlew assembleDebug

# 3. Enviar vía Tailscale (ejemplo IP 100.81.8.76)
sudo tailscale file cp android/app/build/outputs/apk/debug/app-debug.apk 100.81.8.76:
```

## 📡 Arquitectura de Carga Remota (Roadmap)

1.  **API Rest:** El launcher consultará un endpoint para obtener el listado de apps permitidas.
2.  **Módulo Nativo:** Se integrará lógica para consultar las aplicaciones instaladas y filtrar la vista principal.
3.  **Gestor de Descargas:** Implementación de descarga de APKs y prompts de instalación para las apps que falten en el catálogo local.

---
*Nota: Este proyecto utiliza el flujo de trabajo "Prebuild" de Expo, lo que permite modificar código nativo en la carpeta `/android` manteniendo las ventajas de Expo.*
