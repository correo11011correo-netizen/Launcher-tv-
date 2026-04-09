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
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeIcon, SettingsIcon, AppPlaceholder, UpdateIcon } from './src/AppIcons';
import { UpdateManager } from './src/UpdateManager';

const APPS_DATA = [
  { id: '1', name: 'Netflix', color: '#E50914' },
  { id: '2', name: 'YouTube', color: '#FF0000' },
  { id: '3', name: 'Prime Video', color: '#00A8E1' },
  { id: '4', name: 'Disney+', color: '#113CCF' },
  { id: '5', name: 'Ajustes', color: '#555555', isSettings: true },
  { id: '6', name: 'Browser', color: '#4CAF50' },
  { id: '7', name: 'Photos', color: '#FF9800' },
  { id: '8', name: 'Music', color: '#9C27B0' },
];

const AppItem = ({ item, isFocused, onFocus, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onFocus={onFocus}
    onPress={onPress}
    style={[
      styles.appItem,
      { backgroundColor: item.color },
      isFocused && styles.appItemFocused
    ]}
  >
    {item.isSettings ? <SettingsIcon size={40} /> : <AppPlaceholder size={40} color="rgba(255,255,255,0.3)" />}
    <Text style={styles.appText}>{item.name}</Text>
  </TouchableOpacity>
);

export default function App() {
  const [focusedId, setFocusedId] = useState('1');
  const [showSettings, setShowSettings] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null); // { version, notes, bundleUrl }
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // 1. Chequeo automático al inicio
  useEffect(() => {
    checkUpdates();
  }, []);

  const checkUpdates = async () => {
    const result = await UpdateManager.checkForUpdates();
    if (result.available) {
      setUpdateInfo(result);
    }
  };

  const startDownload = async () => {
    setIsDownloading(true);
    const success = await UpdateManager.downloadUpdate(updateInfo.bundleUrl, (progress) => {
      setDownloadProgress(progress);
    });

    if (success) {
      // Esperar un segundo para que el usuario vea el 100%
      setTimeout(() => {
        UpdateManager.applyUpdate();
      }, 1000);
    } else {
      setIsDownloading(false);
      alert('Error al descargar la actualización. Verifica la conexión con Tailscale.');
    }
  };

  const renderAppList = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Mis Aplicaciones</Text>
      <FlatList
        data={APPS_DATA}
        keyExtractor={(item) => item.id}
        numColumns={Platform.isTV ? 4 : 2}
        renderItem={({ item }) => (
          <AppItem 
            item={item} 
            isFocused={focusedId === item.id && !showSettings && !updateInfo}
            onFocus={() => setFocusedId(item.id)}
            onPress={() => item.isSettings ? setShowSettings(true) : null}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );

  const renderSettings = () => (
    <View style={styles.content}>
      <TouchableOpacity 
        onPress={() => setShowSettings(false)}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>
      
      <Text style={styles.sectionTitle}>Ajustes del Launcher</Text>
      
      <View style={styles.settingsCard}>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Versión Actual</Text>
            <Text style={styles.settingValue}>{UpdateManager.getCurrentVersion()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.button}
            onPress={checkUpdates}
          >
            <Text style={styles.buttonText}>Buscar Actualización</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Servidor OTA</Text>
            <Text style={styles.settingValue}>Tailscale (100.81.8.76)</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Cabecera */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <HomeIcon size={28} />
          <Text style={styles.headerTitle}>Launcher TV</Text>
        </View>
        <Text style={styles.time}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>

      {/* Contenido Principal o Ajustes */}
      {showSettings ? renderSettings() : renderAppList()}

      {/* Modal de Actualización OTA */}
      <Modal
        visible={!!updateInfo && !isDownloading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <UpdateIcon size={32} color="#4CAF50" />
              <Text style={styles.modalTitle}>Nueva Versión {updateInfo?.version}</Text>
            </View>
            
            <Text style={styles.modalSubtitle}>Novedades de esta versión:</Text>
            <ScrollView style={styles.notesScroll}>
              <Text style={styles.modalNotes}>{updateInfo?.notes}</Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.buttonPrimary]}
                onPress={startDownload}
                hasTVPreferredFocus={true}
              >
                <Text style={styles.buttonText}>Actualizar Ahora</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.buttonSecondary]}
                onPress={() => setUpdateInfo(null)}
              >
                <Text style={styles.buttonText}>Más Tarde</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Progreso de Descarga */}
      <Modal
        visible={isDownloading}
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Descargando Actualización...</Text>
            <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 20 }} />
            <View style={styles.progressBarContainer}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginLeft: 10 },
  time: { color: '#888', fontSize: 18 },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { color: '#aaa', fontSize: 16, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  listContent: { paddingBottom: 20 },
  appItem: { flex: 1, margin: 10, height: 120, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 2, borderColor: 'transparent' },
  appItemFocused: { borderColor: 'white', transform: [{ scale: 1.05 }], elevation: 15, shadowColor: 'white', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  appText: { color: 'white', marginTop: 10, fontSize: 16, fontWeight: '600' },
  
  // Ajustes
  backButton: { marginBottom: 20, padding: 10 },
  backButtonText: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },
  settingsCard: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 20 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  settingLabel: { color: '#888', fontSize: 14 },
  settingValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  button: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },

  // Modales
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#222', width: '80%', maxWidth: 500, borderRadius: 20, padding: 30, alignItems: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginLeft: 15 },
  modalSubtitle: { color: '#aaa', fontSize: 16, alignSelf: 'flex-start', marginBottom: 10 },
  notesScroll: { maxHeight: 150, width: '100%', backgroundColor: '#333', borderRadius: 10, padding: 15, marginBottom: 25 },
  modalNotes: { color: '#eee', fontSize: 14, lineHeight: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  buttonPrimary: { backgroundColor: '#4CAF50' },
  buttonSecondary: { backgroundColor: '#444' },
  progressBarContainer: { width: '100%', height: 10, backgroundColor: '#444', borderRadius: 5, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#4CAF50' },
  progressText: { color: 'white', marginTop: 10, fontWeight: 'bold' }
});
