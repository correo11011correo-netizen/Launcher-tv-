import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  StatusBar, 
  Platform, 
  Modal, 
  ActivityIndicator, 
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeIcon, SettingsIcon, AppPlaceholder, UpdateIcon, MarketIcon } from './src/AppIcons';
import { UpdateManager } from './src/UpdateManager';
import { MarketManager } from './src/MarketManager';

const TABS = [
  { id: 'apps', name: 'Mis Apps', icon: HomeIcon },
  { id: 'market', name: 'Market', icon: MarketIcon },
  { id: 'settings', name: 'Ajustes', icon: SettingsIcon },
];

const APPS_DATA = [
  { id: '1', name: 'Netflix', color: '#E50914' },
  { id: '2', name: 'YouTube', color: '#FF0000' },
  { id: '3', name: 'Prime Video', color: '#00A8E1' },
  { id: '4', name: 'Disney+', color: '#113CCF' },
  { id: '5', name: 'Browser', color: '#4CAF50' },
  { id: '6', name: 'Photos', color: '#FF9800' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('apps');
  const [focusedId, setFocusedId] = useState('1');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [marketApps, setMarketApps] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [loadingMarket, setLoadingMarket] = useState(false);

  useEffect(() => {
    checkUpdates();
    loadMarket();
  }, []);

  const checkUpdates = async () => {
    const result = await UpdateManager.checkForUpdates();
    if (result.available) setUpdateInfo(result);
  };

  const loadMarket = async () => {
    setLoadingMarket(true);
    const apps = await MarketManager.getApps();
    setMarketApps(apps);
    setLoadingMarket(false);
  };

  const startDownloadOTA = async () => {
    setIsDownloading(true);
    const success = await UpdateManager.downloadUpdate(updateInfo.bundleUrl, (p) => setDownloadProgress(p));
    if (success) setTimeout(() => UpdateManager.applyUpdate(), 1000);
    else { setIsDownloading(false); alert('Error en actualización OTA'); }
  };

  const installMarketApp = async (app) => {
    setIsDownloading(true);
    const success = await MarketManager.downloadAndInstall(app.apkUrl, app.name.replace(/\s/g, '_'), (p) => setDownloadProgress(p));
    setIsDownloading(false);
    setDownloadProgress(0);
  };

  const renderTab = (tab) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <TouchableOpacity 
        key={tab.id}
        onPress={() => setActiveTab(tab.id)}
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
      >
        <Icon size={24} color={isActive ? "white" : "#888"} />
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderAppsGrid = () => (
    <View style={styles.gridContainer}>
      <Text style={styles.sectionTitle}>Aplicaciones Instaladas</Text>
      <FlatList
        data={APPS_DATA}
        numColumns={Platform.isTV ? 4 : 2}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.appItem, { backgroundColor: item.color }, focusedId === item.id && styles.itemFocused]}
            onFocus={() => setFocusedId(item.id)}
          >
            <AppPlaceholder size={40} color="rgba(255,255,255,0.3)" />
            <Text style={styles.appText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderMarket = () => (
    <View style={styles.gridContainer}>
      <Text style={styles.sectionTitle}>Tienda de Aplicaciones</Text>
      {loadingMarket ? <ActivityIndicator size="large" color="#4CAF50" /> : (
        <FlatList
          data={marketApps}
          numColumns={1}
          renderItem={({ item }) => (
            <View style={styles.marketCard}>
              <View style={styles.marketInfo}>
                <Image source={{ uri: item.icon }} style={styles.appIcon} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.marketAppName}>{item.name}</Text>
                  <Text style={styles.marketAppDesc}>{item.description}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.installButton}
                  onPress={() => installMarketApp(item)}
                >
                  <Text style={styles.installButtonText}>Instalar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );

  const renderSettings = () => (
    <View style={styles.gridContainer}>
      <Text style={styles.sectionTitle}>Ajustes de Sistema</Text>
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Versión del Launcher</Text>
          <Text style={styles.settingValue}>{UpdateManager.getCurrentVersion()}</Text>
        </View>
        <TouchableOpacity style={styles.fullButton} onPress={checkUpdates}>
          <Text style={styles.buttonText}>Buscar Actualización OTA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fullButton, { marginTop: 10 }]} onPress={loadMarket}>
          <Text style={styles.buttonText}>Refrescar Market</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.logoText}>Launcher TV</Text>
        <View style={styles.tabsContainer}>{TABS.map(renderTab)}</View>
      </View>

      <View style={styles.mainContent}>
        {activeTab === 'apps' && renderAppsGrid()}
        {activeTab === 'market' && renderMarket()}
        {activeTab === 'settings' && renderSettings()}
      </View>

      {/* Modales de Actualización y Progreso idénticos a los anteriores pero actualizados... */}
      <Modal visible={!!updateInfo && !isDownloading} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <UpdateIcon size={40} color="#4CAF50" />
             <Text style={styles.modalTitle}>Nueva versión {updateInfo?.version}</Text>
             <Text style={styles.modalNotes}>{updateInfo?.notes}</Text>
             <View style={styles.modalActions}>
               <TouchableOpacity style={styles.modalBtnAction} onPress={startDownloadOTA}><Text style={styles.btnText}>Actualizar</Text></TouchableOpacity>
               <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setUpdateInfo(null)}><Text style={styles.btnText}>Cerrar</Text></TouchableOpacity>
             </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isDownloading} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Descargando...</Text>
            <View style={styles.progressContainer}>
               <View style={[styles.progressBar, { width: `${downloadProgress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(downloadProgress * 100)}%</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  logoText: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  tabsContainer: { flexDirection: 'row' },
  tabButton: { flexDirection: 'row', alignItems: 'center', marginRight: 25, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  tabButtonActive: { backgroundColor: '#333' },
  tabText: { color: '#888', marginLeft: 8, fontSize: 16, fontWeight: '600' },
  tabTextActive: { color: 'white' },
  mainContent: { flex: 1, padding: 15 },
  gridContainer: { flex: 1 },
  sectionTitle: { color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, fontSize: 14 },
  appItem: { flex: 1, margin: 8, height: 110, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  itemFocused: { borderColor: 'white', transform: [{ scale: 1.05 }] },
  appText: { color: 'white', marginTop: 10, fontWeight: 'bold' },
  marketCard: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 15, marginBottom: 10 },
  marketInfo: { flexDirection: 'row', alignItems: 'center' },
  appIcon: { width: 50, height: 50, borderRadius: 10 },
  marketAppName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  marketAppDesc: { color: '#aaa', fontSize: 13, marginTop: 4 },
  installButton: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  installButtonText: { color: 'white', fontWeight: 'bold' },
  settingsCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  settingLabel: { color: '#888' },
  settingValue: { color: 'white', fontWeight: 'bold' },
  fullButton: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#222', width: '85%', padding: 25, borderRadius: 20, alignItems: 'center' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginVertical: 15 },
  modalNotes: { color: '#aaa', textAlign: 'center', marginBottom: 20 },
  modalActions: { flexDirection: 'row', width: '100%' },
  modalBtnAction: { flex: 1, backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, marginRight: 5, alignItems: 'center' },
  modalBtnCancel: { flex: 1, backgroundColor: '#444', padding: 15, borderRadius: 10, marginLeft: 5, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  progressContainer: { width: '100%', height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden', marginTop: 10 },
  progressBar: { height: '100%', backgroundColor: '#4CAF50' },
  progressText: { color: 'white', marginTop: 10, fontWeight: 'bold' }
});
