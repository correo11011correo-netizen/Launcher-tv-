import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

// URLs de GitHub (Raw) para el servidor OTA
const REPO_URL = 'https://raw.githubusercontent.com/correo11011correo-netizen/Launcher-tv-/master';
const BUNDLE_FILE_NAME = 'update.bundle';
const VERSION_JSON_URL = `${REPO_URL}/update.json`;
const BUNDLE_URL = `${REPO_URL}/android/app/src/main/assets/index.android.bundle`;

export const UpdateManager = {
  getCurrentVersion: () => {
    return Constants.expoConfig?.version || '1.0.0';
  },

  checkForUpdates: async () => {
    try {
      console.log('Verificando actualizaciones en GitHub:', VERSION_JSON_URL);
      const response = await fetch(VERSION_JSON_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo conectar a GitHub');
      
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
      return result.status === 200;
    } catch (error) {
      console.error('Error descargando actualización:', error);
      return false;
    }
  },

  applyUpdate: async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error aplicando actualización:', error);
    }
  }
};
