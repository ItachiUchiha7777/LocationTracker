import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Start / Stop tracking control buttons
const TrackingControls = ({ isTracking, onStart, onStop, disabled }) => {
  if (disabled) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#4F8EF7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isTracking ? (
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStart}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonIcon}>▶</Text>
          <Text style={styles.buttonText}>Start Tracking</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={onStop}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonIcon}>■</Text>
          <Text style={styles.buttonText}>Stop & Save</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1A1A2E',
  },
  startButton: {
    backgroundColor: '#4F8EF7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
    gap: 10,
  },
  stopButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
    gap: 10,
  },
  buttonIcon: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default TrackingControls;
