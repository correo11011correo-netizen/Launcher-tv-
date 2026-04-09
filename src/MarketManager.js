import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

const REPO_URL = 'https://raw.githubusercontent.com/correo11011correo-netizen/Launcher-tv-/master';
const APPS_CATALOG_URL = `${REPO_URL}/market/apps.json`;
const DEFAULT_ICON_URL = `${REPO_URL}/assets/icon.png`; // Icono genérico si no se encuentra uno específico

export const MarketManager = {
  getApps: async () => {
    console.log('[MarketManager] Fetching app catalog from:', APPS_CATALOG_URL);
    try {
      const response = await fetch(APPS_CATALOG_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      console.log('[MarketManager] App catalog fetched:', data);
      return data;
    } catch (error) {
      console.error('[MarketManager] Error fetching app catalog:', error);
      return [];
    }
  },

  downloadAndInstall: async (apkUrl, fileName, onProgress) => {
    console.log('[MarketManager] Starting download and install for APK:', apkUrl);
    try {
      const localUri = `${FileSystem.cacheDirectory}${fileName}.apk`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        apkUrl,
        localUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log('[MarketManager] Download progress:', (progress * 100).toFixed(2), '%');
          if (onProgress) onProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.status === 200) {
        console.log('[MarketManager] Download completed successfully. File saved to:', result.uri);
        const contentUri = await FileSystem.getContentUriAsync(result.uri);
        
        await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
          data: contentUri,
          flags: 1, // Grant read uri permission
          type: 'application/vnd.android.package-archive',
        });
        console.log('[MarketManager] Install activity launched.');
        return true;
      } else {
        console.error('[MarketManager] Download failed with status:', result?.status);
        return false;
      }
    } catch (error) {
      console.error('[MarketManager] Error during download or install:', error);
      alert('Error: ' + error.message);
      return false;
    }
  }
};
