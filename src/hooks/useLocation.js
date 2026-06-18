import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { saveRoute, calculateDistance } from '../utils/storage';

const useLocation = () => {
  const [permissionStatus, setPermissionStatus] = useState(null); // null | 'granted' | 'denied'
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pathCoordinates, setPathCoordinates] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStart, setSessionStart] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);

  const locationSubscription = useRef(null);

  // Request location permissions on mount
  useEffect(() => {
    requestPermissions();
    return () => stopTracking(); // cleanup on unmount
  }, []);

  const requestPermissions = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        // Get initial location immediately
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location.coords);
      }
    } catch (error) {
      console.error('Permission error:', error);
      setPermissionStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  // Start real-time location tracking
  const startTracking = useCallback(async () => {
    if (isTracking || permissionStatus !== 'granted') return;

    setIsTracking(true);
    setPathCoordinates([]);
    setTotalDistance(0);
    setSessionStart(new Date().toISOString());

    // Watch position with high accuracy
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,      // Update every 2 seconds
        distanceInterval: 5,      // Or every 5 meters
      },
      (location) => {
        const { latitude, longitude, altitude, speed } = location.coords;
        const newCoord = { latitude, longitude };

        setCurrentLocation({ latitude, longitude, altitude, speed });

        setPathCoordinates((prev) => {
          const updated = [...prev, newCoord];
          setTotalDistance(calculateDistance(updated));
          return updated;
        });
      }
    );
  }, [isTracking, permissionStatus]);

  // Stop tracking and save the session
  const stopTracking = useCallback(async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    if (isTracking) {
      setIsTracking(false);

      // Save session to history if we have a path
      setPathCoordinates((currentPath) => {
        if (currentPath.length > 1) {
          const sessionEnd = new Date().toISOString();
          const distance = calculateDistance(currentPath);
          const durationSeconds = Math.round(
            (new Date(sessionEnd) - new Date(sessionStart)) / 1000
          );

          const routeData = {
            id: Date.now().toString(),
            startTime: sessionStart,
            endTime: sessionEnd,
            coordinates: currentPath,
            distance,
            duration: durationSeconds,
            pointCount: currentPath.length,
          };

          saveRoute(routeData);
        }
        return currentPath;
      });
    }
  }, [isTracking, sessionStart]);

  return {
    permissionStatus,
    currentLocation,
    pathCoordinates,
    isTracking,
    isLoading,
    totalDistance,
    startTracking,
    stopTracking,
    requestPermissions,
  };
};

export default useLocation;
