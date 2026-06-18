import AsyncStorage from '@react-native-async-storage/async-storage';

const ROUTE_HISTORY_KEY = '@location_tracker_routes';

// Save a completed route session to history
export const saveRoute = async (route) => {
  try {
    const existing = await loadAllRoutes();
    const updated = [route, ...existing].slice(0, 20); // Keep last 20 sessions
    await AsyncStorage.setItem(ROUTE_HISTORY_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving route:', error);
    return false;
  }
};

// Load all saved route sessions
export const loadAllRoutes = async () => {
  try {
    const data = await AsyncStorage.getItem(ROUTE_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading routes:', error);
    return [];
  }
};

// Clear all saved route history
export const clearAllRoutes = async () => {
  try {
    await AsyncStorage.removeItem(ROUTE_HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing routes:', error);
    return false;
  }
};

// Format distance in meters or km
export const formatDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

// Calculate total distance of a path
export const calculateDistance = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    total += haversine(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
  }
  return total;
};

// Haversine formula to calculate distance between two lat/lng points in meters
export const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Format a Date object to readable string
export const formatTime = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format duration from seconds
export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
};
