import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDistance } from '../utils/storage';

// Info card shown below the map with current coordinates and stats
const LocationInfo = ({ location, totalDistance, isTracking, pathLength }) => {
  const lat = location?.latitude?.toFixed(6) ?? '--';
  const lng = location?.longitude?.toFixed(6) ?? '--';
  const alt = location?.altitude ? `${Math.round(location.altitude)} m` : '--';
  const speed =
    location?.speed && location.speed > 0
      ? `${(location.speed * 3.6).toFixed(1)} km/h`
      : '0 km/h';

  return (
    <View style={styles.container}>
      {/* Live indicator */}
      <View style={styles.headerRow}>
        <View style={[styles.dot, isTracking && styles.dotActive]} />
        <Text style={styles.headerText}>{isTracking ? 'Live Tracking' : 'Idle'}</Text>
        <Text style={styles.pointCount}>{pathLength} pts</Text>
      </View>

      {/* Coordinate row */}
      <View style={styles.row}>
        <InfoBox label="Latitude" value={lat} />
        <InfoBox label="Longitude" value={lng} />
      </View>

      {/* Stats row */}
      <View style={styles.row}>
        <InfoBox label="Altitude" value={alt} />
        <InfoBox label="Speed" value={speed} />
        <InfoBox label="Distance" value={formatDistance(totalDistance)} accent />
      </View>
    </View>
  );
};

const InfoBox = ({ label, value, accent }) => (
  <View style={[styles.box, accent && styles.boxAccent]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#2A2A4A',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555',
    marginRight: 7,
  },
  dotActive: {
    backgroundColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  headerText: {
    color: '#AAAACC',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  pointCount: {
    color: '#555',
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  box: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  boxAccent: {
    backgroundColor: '#1E3A5F',
    borderWidth: 1,
    borderColor: '#4F8EF7',
  },
  label: {
    color: '#666688',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  value: {
    color: '#E0E0FF',
    fontSize: 13,
    fontWeight: '600',
  },
  valueAccent: {
    color: '#4F8EF7',
    fontSize: 14,
  },
});

export default LocationInfo;
