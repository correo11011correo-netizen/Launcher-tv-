import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

// IP de tu servidor en Tailscale (Modificable según sea necesario)
const UPDATE_SERVER_URL = 'http://127.0.0.1:3000'; 
const BUNDLE_FILE_NAME = 'update.bundle';
const VERSION_JSON_URL = `${UPDATE_SERVER_URL}/update.json`;
const BUNDLE_URL = `${UPDATE_SERVER_URL}/index.android.bundle`;

export const UpdateManager = {
  /**
   * Obtiene la versión actual de la aplicación
   */
  getCurrentVersion: () => {
    return Constants.expoConfig?.version || '1.0.0';
  },

  /**
   * Verifica si hay una actualización disponible en el servidor
   */
  checkForUpdates: async () => {
    try {
      console.log('Verificando actualizaciones en:', VERSION_JSON_URL);
      const response = await fetch(VERSION_JSON_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo conectar al servidor de actualizaciones');
      
      const data = await response.json();
      const currentVersion = UpdateManager.getCurrentVersion();

      if (data.version !== currentVersion) {
        return {
          available: true,
          version: data.version,
          notes: data.notes || 'Mejoras de rendimiento y corrección de errores.',
          bundleUrl: data.bundleUrl || BUNDLE_URL
        };
      }
      return { available: false };
    } catch (error) {
      console.error('Error verificando actualizaciones:', error);
      return { available: false, error: error.message };
    }
  },

  /**
   * Descarga el nuevo bundle y lo guarda en la carpeta de documentos
   */
  downloadUpdate: async (bundleUrl, onProgress) => {
    try {
      const targetPath = `${FileSystem.documentDirectory}${BUNDLE_FILE_NAME}`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        bundleUrl,
        targetPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) onProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result.status === 200) {
        console.log('Descarga completada en:', result.uri);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error descargando actualización:', error);
      return false;
    }
  },

  /**
   * Reinicia la aplicación para aplicar el nuevo bundle
   */
  applyUpdate: async () => {
    try {
      // expo-updates reloadAsync reinicia el JS bridge
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error aplicando actualización:', error);
      // Fallback: Si reloadAsync falla, el usuario deberá reiniciar manualmente
    }
  }
};
