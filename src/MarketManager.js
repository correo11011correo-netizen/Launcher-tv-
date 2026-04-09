import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

const REPO_URL = 'https://raw.githubusercontent.com/correo11011correo-netizen/Launcher-tv-/master';
const APPS_CATALOG_URL = `${REPO_URL}/market/apps.json`;

export const MarketManager = {
  /**
   * Obtiene la lista de aplicaciones disponibles en el Market
   */
  getApps: async () => {
    try {
      const response = await fetch(APPS_CATALOG_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo cargar el Market');
      return await response.json();
    } catch (error) {
      console.error('Error cargando Market:', error);
      return [];
    }
  },

  /**
   * Descarga e instala un APK
   */
  downloadAndInstall: async (apkUrl, fileName, onProgress) => {
    try {
      const localUri = `${FileSystem.cacheDirectory}${fileName}.apk`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        apkUrl,
        localUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) onProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result.status === 200) {
        // En Android, para instalar un APK necesitamos los permisos de FileProvider
        // getContentUriAsync crea un URI seguro para el instalador
        const contentUri = await FileSystem.getContentUriAsync(result.uri);
        
        await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
          data: contentUri,
          flags: 1, // Grant read uri permission
          type: 'application/vnd.android.package-archive',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error instalando APK:', error);
      alert('Error: ' + error.message);
      return false;
    }
  }
};
