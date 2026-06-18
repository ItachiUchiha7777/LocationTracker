/**
 * A simple 1D Kalman Filter implementation.
 * Used to filter noise from single-dimensional sensor data streams (like X and Y coordinates in meters).
 */
export class KalmanFilter {
  /**
   * @param {number} processNoise (Q) - Process noise covariance. Represents how fast the true state changes.
   * @param {number} measurementNoise (R) - Measurement noise covariance. Represents sensor noise.
   */
  constructor(processNoise = 1, measurementNoise = 1) {
    this.Q = processNoise;
    this.R = measurementNoise;
    this.x = null; // Filtered/estimated state value
    this.p = 1.0;  // Estimation error covariance
  }

  /**
   * Reset the filter state (useful when starting a new tracking session).
   */
  reset() {
    this.x = null;
    this.p = 1.0;
  }

  /**
   * Filter a new measurement.
   * @param {number} measurement - The raw measurement value.
   * @param {number} [measurementNoise] - Optional update to measurement noise covariance (R), e.g. using dynamic GPS accuracy.
   * @returns {number} The filtered/smoothed state value.
   */
  filter(measurement, measurementNoise = null) {
    if (measurementNoise !== null) {
      this.R = measurementNoise;
    }

    // If this is the first measurement, initialize the state
    if (this.x === null) {
      this.x = measurement;
      return measurement;
    }

    // 1. Predict state and error covariance
    // State is assumed to remain constant (random walk model: x_k = x_k-1)
    const predX = this.x;
    const predP = this.p + this.Q;

    // 2. Update/Correct state and error covariance with the measurement
    const K = predP / (predP + this.R); // Kalman Gain
    this.x = predX + K * (measurement - predX);
    this.p = (1.0 - K) * predP;

    return this.x;
  }
}
