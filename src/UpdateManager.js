import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

const REPO_URL = 'https://raw.githubusercontent.com/correo11011correo-netizen/Launcher-tv-/master';
const BUNDLE_FILE_NAME = 'update.bundle';
const VERSION_JSON_URL = `${REPO_URL}/update.json`;
const BUNDLE_URL = `${REPO_URL}/android/app/src/main/assets/index.android.bundle`;

export const UpdateManager = {
  getCurrentVersion: () => {
    const version = Constants.expoConfig?.version || '1.0.0';
    console.log('[UpdateManager] Current App Version:', version);
    return version;
  },

  checkForUpdates: async () => {
    console.log('[UpdateManager] Checking for updates at:', VERSION_JSON_URL);
    try {
      const response = await fetch(VERSION_JSON_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      console.log('[UpdateManager] Update data fetched:', data);
      
      const currentVersion = UpdateManager.getCurrentVersion();

      if (data.version !== currentVersion) {
        console.log(`[UpdateManager] Update available: ${currentVersion} -> ${data.version}`);
        return {
          available: true,
          version: data.version,
          notes: data.notes || 'Mejoras generales.',
          bundleUrl: data.bundleUrl || BUNDLE_URL
        };
      }
      console.log('[UpdateManager] App is up to date.');
      return { available: false };
    } catch (error) {
      console.error('[UpdateManager] Error checking for updates:', error);
      return { available: false, error: error.message };
    }
  },

  downloadUpdate: async (bundleUrl, onProgress) => {
    console.log('[UpdateManager] Starting download for:', bundleUrl);
    try {
      const targetPath = `${FileSystem.documentDirectory}${BUNDLE_FILE_NAME}`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        bundleUrl,
        targetPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log('[UpdateManager] Download progress:', (progress * 100).toFixed(2), '%');
          if (onProgress) onProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.status === 200) {
        console.log('[UpdateManager] Download completed successfully. File saved to:', result.uri);
        return true;
      } else {
        console.error('[UpdateManager] Download failed with status:', result?.status);
        return false;
      }
    } catch (error) {
      console.error('[UpdateManager] Error during download:', error);
      return false;
    }
  },

  applyUpdate: async () => {
    console.log('[UpdateManager] Attempting to apply update (reloading app)...');
    try {
      await Updates.reloadAsync();
      console.log('[UpdateManager] App reload initiated.');
    } catch (error) {
      console.error('[UpdateManager] Error applying update (reload failed):', error);
      // Fallback: If reloadAsync fails, the user might need to restart manually
    }
  }
};
