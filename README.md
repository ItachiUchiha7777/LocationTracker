# 📡 Live Location Tracker

A React Native mobile application built with **Expo** and **JavaScript** to track your location in real time, display paths on a map, and save route session history.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Install the project dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm run start
   ```

3. Open the application:
   - **Android:** Scan the QR code with the Expo Go app, or press `a` to run on an emulator/connected device.
   - **iOS:** Scan the QR code using your iPhone's camera app, or press `i` to run on an iOS simulator.

---

## 🎯 Location Accuracy Optimizations

Consumer-grade mobile GPS chips suffer from constant signal noise and accuracy fluctuations (GPS jitter), particularly in indoor environments, around tall buildings, or when the user is stationary. In basic tracking apps, this noise accumulates as false movement, causing the total distance to drift (often adding 200+ meters even when you are standing still).

To solve this, this project implements a multi-stage location filtering pipeline:

### 1. Accuracy Threshold Filter
Every location update from the GPS is checked for its uncertainty radius (`coords.accuracy` in meters). Updates with an accuracy error radius greater than **20 meters** are discarded immediately before they can contaminate the calculations or the map.

### 2. Flat Metrical Tangent Projection
GPS reports coordinates in spherical angles (Latitude and Longitude degrees). Because Earth is spherical, degrees represent different distances in meters depending on your latitude. 
Before filtering, the app projects coordinates onto a flat 2D tangent plane (in meters) relative to the start position:
$$y_{raw} = (\text{lat} - \text{lat}_0) \times \frac{\pi}{180} \times R_{earth}$$
$$x_{raw} = (\text{lng} - \text{lng}_0) \times \frac{\pi}{180} \times R_{earth} \times \cos(\text{lat}_0)$$
This allows the noise filter to operate directly in physical metric units (meters) rather than spherical degrees.

### 3. Adaptive 2D Kalman Filter
We apply a 1D Kalman Filter independently on the metric X and Y coordinates. The filter balances the previous estimate against the new coordinate update using the sensor's reported measurement noise ($R = \text{accuracy}^2$).

To prevent lag while moving and maximize smoothing while stationary, we calculate the process noise ($Q$) **adaptively based on the user's reported speed**:
$$Q = \max(1.5, \text{speed}^2 \times 2)$$
- **Stationary/Slow walking:** Process noise is low ($Q = 1.5$), so the filter heavily smooths out the coordinates and ignores jitter.
- **Running/Driving:** Process noise increases dynamically, causing the filter to follow the user's actual path quickly without lagging behind.

### 4. Minimum Movement Threshold (4m)
To eliminate any residual stationary drift, the app implements a **4-meter minimum movement threshold**. 
- The map marker updates visually using the Kalman-smoothed coordinates for real-time responsiveness.
- A new point is appended to the track path and added to the total distance calculation **only** if the distance between the filtered coordinate and the last accepted point is **$\ge 4$ meters**.

---

## 🛠️ Project Structure

```
├── App.js                 # Main entry point and Tab Navigator
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
└── src
    ├── components         # UI Components (LocationInfo, TrackingControls)
    ├── hooks
    │   └── useLocation.js # Main custom hook handling GPS streams & filters
    ├── screens
    │   ├── HistoryScreen.js # Route history and stats screen
    │   └── MapScreen.js   # Live Map Tracking screen
    └── utils
        ├── KalmanFilter.js # Kalman noise filter utility
        └── storage.js     # AsyncStorage and distance helpers
```

## 📦 Tech Stack

- **Framework:** [Expo](https://expo.dev) (v54) / React Native
- **Map:** [React Native Maps](https://github.com/react-native-maps/react-native-maps) (Google Maps on Android, Apple Maps on iOS)
- **State & Storage:** [AsyncStorage](https://github.com/react-native-async-storage/async-storage) for local route history
- **Navigation:** [React Navigation v7](https://reactnavigation.org/)
