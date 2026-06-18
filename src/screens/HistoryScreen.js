import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { loadAllRoutes, clearAllRoutes, formatDistance, formatTime, formatDuration } from '../utils/storage';

const HistoryScreen = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reload history every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRoutes();
    }, [])
  );

  const fetchRoutes = async () => {
    setLoading(true);
    const data = await loadAllRoutes();
    setRoutes(data);
    setLoading(false);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Delete all saved routes? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllRoutes();
            setRoutes([]);
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>#{routes.length - index}</Text>
        </View>
        <Text style={styles.cardDate}>{formatTime(item.startTime)}</Text>
      </View>

      {/* Stats grid */}
      <View style={styles.statsRow}>
        <StatItem icon="📏" label="Distance" value={formatDistance(item.distance)} />
        <StatItem icon="⏱️" label="Duration" value={formatDuration(item.duration)} />
        <StatItem icon="📍" label="Points" value={item.pointCount?.toString() ?? '0'} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F8EF7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {routes.length === 0 ? (
        // Empty state
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>No Routes Yet</Text>
          <Text style={styles.emptyMsg}>
            Start tracking on the Map tab.{'\n'}Your routes will be saved here automatically.
          </Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.listHeader}>
            <Text style={styles.count}>{routes.length} session{routes.length !== 1 ? 's' : ''}</Text>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearBtn}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={routes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

const StatItem = ({ icon, label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyMsg: {
    color: '#888899',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A4A',
  },
  count: {
    color: '#AAAACC',
    fontSize: 14,
    fontWeight: '600',
  },
  clearBtn: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    padding: 14,
    gap: 12,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  indexBadge: {
    backgroundColor: '#4F8EF722',
    borderWidth: 1,
    borderColor: '#4F8EF7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  indexText: {
    color: '#4F8EF7',
    fontSize: 11,
    fontWeight: '700',
  },
  cardDate: {
    color: '#AAAACC',
    fontSize: 13,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: '#666688',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default HistoryScreen;
