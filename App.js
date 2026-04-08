import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ImageBackground, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeIcon, SettingsIcon, AppPlaceholder } from './src/AppIcons';

const APPS_DATA = [
  { id: '1', name: 'Netflix', color: '#E50914' },
  { id: '2', name: 'YouTube', color: '#FF0000' },
  { id: '3', name: 'Prime Video', color: '#00A8E1' },
  { id: '4', name: 'Disney+', color: '#113CCF' },
  { id: '5', name: 'Settings', color: '#555555', isSettings: true },
  { id: '6', name: 'Browser', color: '#4CAF50' },
  { id: '7', name: 'Photos', color: '#FF9800' },
  { id: '8', name: 'Music', color: '#9C27B0' },
];

const AppItem = ({ item, isFocused, onFocus }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onFocus={onFocus}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <HomeIcon size={28} />
          <Text style={styles.headerTitle}>Launcher TV</Text>
        </View>
        <Text style={styles.time}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Mis Aplicaciones</Text>
        <FlatList
          data={APPS_DATA}
          keyExtractor={(item) => item.id}
          numColumns={Platform.isTV ? 4 : 2}
          renderItem={({ item }) => (
            <AppItem 
              item={item} 
              isFocused={focusedId === item.id}
              onFocus={() => setFocusedId(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  time: {
    color: '#888',
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  appItem: {
    flex: 1,
    margin: 10,
    height: 120,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  appItemFocused: {
    borderColor: 'white',
    transform: [{ scale: 1.05 }],
    elevation: 15,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  appText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});
