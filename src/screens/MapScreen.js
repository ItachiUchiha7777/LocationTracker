import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import useLocation from '../hooks/useLocation';
import PermissionScreen from '../components/PermissionScreen';
import LocationInfo from '../components/LocationInfo';
import TrackingControls from '../components/TrackingControls';

const MapScreen = () => {
  const {
    permissionStatus,
    currentLocation,
    pathCoordinates,
    isTracking,
    isLoading,
    totalDistance,
    startTracking,
    stopTracking,
    requestPermissions,
  } = useLocation();

  const mapRef = useRef(null);

  // Auto-pan map when location updates during tracking
  useEffect(() => {
    if (isTracking && currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        },
        800
      );
    }
  }, [currentLocation, isTracking]);

  // Show permission screen if not granted
  if (isLoading || permissionStatus !== 'granted') {
    return (
      <PermissionScreen isLoading={isLoading} onRetry={requestPermissions} />
    );
  }

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 30.9009,    // Default: Ludhiana
        longitude: 75.8573,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : null}
        initialRegion={initialRegion}
        showsUserLocation={false} // We use custom marker
        showsMyLocationButton={false}
        mapType="standard"
      >
        {/* Draw path polyline */}
        {pathCoordinates.length > 1 && (
          <Polyline
            coordinates={pathCoordinates}
            strokeColor="#4F8EF7"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}

        {/* Start point marker */}
        {pathCoordinates.length > 0 && (
          <Marker
            coordinate={pathCoordinates[0]}
            title="Start"
            pinColor="#4ADE80"
          />
        )}

        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You are here"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.currentMarker}>
              <View style={styles.markerInner} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <LocationInfo
          location={currentLocation}
          totalDistance={totalDistance}
          isTracking={isTracking}
          pathLength={pathCoordinates.length}
        />
        <TrackingControls
          isTracking={isTracking}
          onStart={startTracking}
          onStop={stopTracking}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  map: {
    flex: 1,
  },
  bottomPanel: {
    backgroundColor: '#1A1A2E',
  },
  currentMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 142, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4F8EF7',
  },
  markerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F8EF7',
  },
});

export default MapScreen;
