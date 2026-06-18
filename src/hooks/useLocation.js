import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { saveRoute, calculateDistance, haversine } from '../utils/storage';
import { KalmanFilter } from '../utils/KalmanFilter';

const useLocation = () => {
  const [permissionStatus, setPermissionStatus] = useState(null); // null | 'granted' | 'denied'
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pathCoordinates, setPathCoordinates] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStart, setSessionStart] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);

  const locationSubscription = useRef(null);

  // Refs for Kalman filter and local projection reference
  const referenceLocationRef = useRef(null);
  const kalmanXRef = useRef(null);
  const kalmanYRef = useRef(null);
  const lastAcceptedCoordRef = useRef(null);

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

    // Reset Kalman and projection refs
    referenceLocationRef.current = null;
    kalmanXRef.current = null;
    kalmanYRef.current = null;
    lastAcceptedCoordRef.current = null;

    // Watch position with high accuracy
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,      // Update every 2 seconds
        distanceInterval: 5,      // Or every 5 meters
      },
      (location) => {
        const { latitude, longitude, altitude, speed, accuracy } = location.coords;

        // 1. Accuracy Filter: reject points with accuracy worse than 20 meters
        if (accuracy && accuracy > 20) {
          return;
        }

        // Initialize Kalman filters on first valid point
        if (!referenceLocationRef.current) {
          referenceLocationRef.current = { latitude, longitude };
          // Initialize with 1.5 process noise, and accuracy^2 measurement noise
          const initialR = (accuracy || 8) ** 2;
          kalmanXRef.current = new KalmanFilter(1.5, initialR);
          kalmanYRef.current = new KalmanFilter(1.5, initialR);

          const initialPoint = { latitude, longitude };
          setCurrentLocation({ latitude, longitude, altitude, speed });
          setPathCoordinates([initialPoint]);
          lastAcceptedCoordRef.current = initialPoint;
          return;
        }

        // Project raw coordinate to flat metric plane relative to start point
        const R_EARTH = 6371000;
        const lat0 = referenceLocationRef.current.latitude;
        const lng0 = referenceLocationRef.current.longitude;
        
        const degToRad = Math.PI / 180;
        const yRaw = (latitude - lat0) * degToRad * R_EARTH;
        const xRaw = (longitude - lng0) * degToRad * R_EARTH * Math.cos(lat0 * degToRad);

        // Calculate dynamic process noise (Q) based on speed to adjust responsiveness
        // For stationary/slow user, Q is small (1.5) for high smoothing.
        // For running/riding user, Q increases to reduce lag.
        const dynamicQ = Math.max(1.5, (speed || 0) ** 2 * 2);
        const currentR = (accuracy || 8) ** 2;

        kalmanXRef.current.Q = dynamicQ;
        kalmanYRef.current.Q = dynamicQ;

        // Apply Kalman filter
        const xFiltered = kalmanXRef.current.filter(xRaw, currentR);
        const yFiltered = kalmanYRef.current.filter(yRaw, currentR);

        // Convert metric coords back to Latitude and Longitude
        const filteredLatitude = lat0 + yFiltered / (R_EARTH * degToRad);
        const filteredLongitude = lng0 + xFiltered / (R_EARTH * degToRad * Math.cos(lat0 * degToRad));
        const filteredPoint = { latitude: filteredLatitude, longitude: filteredLongitude };

        // 2. Minimum Distance Threshold (4 meters)
        let distanceDelta = 0;
        if (lastAcceptedCoordRef.current) {
          distanceDelta = haversine(
            lastAcceptedCoordRef.current.latitude,
            lastAcceptedCoordRef.current.longitude,
            filteredLatitude,
            filteredLongitude
          );
        }

        const MIN_MOVEMENT_METERS = 4;

        if (distanceDelta >= MIN_MOVEMENT_METERS) {
          setCurrentLocation({
            latitude: filteredLatitude,
            longitude: filteredLongitude,
            altitude,
            speed
          });

          setPathCoordinates((prev) => {
            const updated = [...prev, filteredPoint];
            setTotalDistance(calculateDistance(updated));
            return updated;
          });

          lastAcceptedCoordRef.current = filteredPoint;
        } else {
          // If we haven't moved enough, update the current position for map visual smoothness
          // but do NOT append to coordinates or count in total distance.
          setCurrentLocation({
            latitude: filteredLatitude,
            longitude: filteredLongitude,
            altitude,
            speed
          });
        }
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
