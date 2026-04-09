# Launcher TV (Android TV) - Plataforma de Gestión Centralizada

Este proyecto es un Launcher optimizado para TV que integra un sistema de actualizaciones Over-The-Air (OTA) y una Tienda de Aplicaciones (Market) privada, todo gestionado a través de GitHub.

## 🚀 Funcionalidades Clave

1.  **Actualizaciones OTA vía GitHub:** El launcher busca automáticamente nuevas versiones del código JavaScript en el repositorio. Si existe una actualización, permite descargarla y aplicarla sin reinstalar el APK.
2.  **Market de Aplicaciones Interno:** Una pestaña dedicada para instalar aplicaciones (APKs) seleccionadas. El launcher gestiona la descarga y lanza el instalador nativo de Android.
3.  **Interfaz de Usuario TV:** Navegación optimizada para control remoto (D-Pad) con sistema de pestañas (Mis Apps, Market, Ajustes).
4.  **Funcionamiento Offline/Standalone:** El APK incluye un bundle base que funciona sin internet; la red solo es necesaria para actualizaciones o descargas del Market.

## 🛠️ Arquitectura Técnica

### Sistema OTA (Actualización de Código)
*   **Lado Nativo:** `MainApplication.kt` sobreescribe `getJSBundleFile()` para buscar `update.bundle` en la carpeta interna de la app (`files/`).
*   **Lado JS:** `UpdateManager.js` consulta `update.json` en GitHub para comparar versiones y descargar el nuevo bundle.

### Sistema de Market (Instalación de Apps)
*   **Catálogo:** Gestionado en `market/apps.json`.
*   **Instalación:** Usa `expo-file-system` para descargar el APK y `expo-intent-launcher` para ejecutar la acción `INSTALL_PACKAGE` de Android.

## 📡 Guía para el Administrador (Gestión vía GitHub)

Para actualizar el launcher o añadir apps al market, solo necesitas modificar los archivos en este repositorio:

### A. Subir una actualización del Launcher (OTA)
1.  Genera el nuevo bundle: `npx expo export:embed --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/`
2.  Sube el archivo generado al repositorio.
3.  Incrementa la versión en `update.json` y añade las novedades en `notes`.

### B. Añadir una App al Market
1.  Sube el archivo `.apk` a la carpeta `market/`.
2.  Añade la entrada correspondiente en `market/apps.json`:
```json
{
  "id": "unique-id",
  "name": "Nombre de la App",
  "version": "1.0.0",
  "description": "Descripción corta",
  "icon": "URL_A_ICONO_PNG",
  "apkUrl": "URL_RAW_AL_ARCHIVO_APK"
}
```

## 📦 Comandos de Compilación y Despliegue

### Compilar el APK Base
```bash
cd android && ./gradlew assembleDebug
```

### Enviar a Dispositivo (Tailscale)
```bash
sudo tailscale file cp android/app/build/outputs/apk/debug/app-debug.apk 100.81.8.76:
```

---
*Desarrollado con React Native, Expo y Kotlin para una experiencia nativa fluida en Android TV.*
