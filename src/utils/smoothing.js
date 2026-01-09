// utils/smoothing.js
export class KalmanFilter {
  constructor(processNoise = 0.008, measurementNoise = 0.1, error = 1) {
    this.processNoise = processNoise;
    this.measurementNoise = measurementNoise;
    this.error = error;
    this.value = null;
    this.velocity = 0;
  }

  update(measurement, dt = 0.016) {
    if (this.value === null) {
      this.value = measurement;
      return this.value;
    }

    // Prediction
    const prediction = this.value + this.velocity * dt;
    const error = this.error + this.processNoise;

    // Update
    const gain = error / (error + this.measurementNoise);
    this.value = prediction + gain * (measurement - prediction);
    this.velocity = (this.value - this.value) / dt;
    this.error = (1 - gain) * error;

    return this.value;
  }
}

export class KalmanFilter3D {
  constructor() {
    this.x = new KalmanFilter();
    this.y = new KalmanFilter();
    this.z = new KalmanFilter();
  }

  update(measurement) {
    return {
      x: this.x.update(measurement.x),
      y: this.y.update(measurement.y),
      z: this.z.update(measurement.z)
    };
  }
}

export function createFilteredLandmarks() {
  const filters = {};

  return {
    update(landmarks) {
      if (!landmarks) return null;

      const filtered = {};

      // Process pose landmarks
      if (landmarks.pose) {
        filtered.pose = {};
        Object.entries(landmarks.pose).forEach(([key, landmark]) => {
          if (!filters[`pose_${key}`]) {
            filters[`pose_${key}`] = new KalmanFilter3D();
          }
          filtered.pose[key] = filters[`pose_${key}`].update(landmark);
        });
      }

      // Process left hand landmarks
      if (landmarks.left_hand) {
        filtered.left_hand = {};
        Object.entries(landmarks.left_hand).forEach(([key, landmark]) => {
          if (!filters[`left_hand_${key}`]) {
            filters[`left_hand_${key}`] = new KalmanFilter3D();
          }
          filtered.left_hand[key] = filters[`left_hand_${key}`].update(landmark);
        });
      }

      // Process right hand landmarks
      if (landmarks.right_hand) {
        filtered.right_hand = {};
        Object.entries(landmarks.right_hand).forEach(([key, landmark]) => {
          if (!filters[`right_hand_${key}`]) {
            filters[`right_hand_${key}`] = new KalmanFilter3D();
          }
          filtered.right_hand[key] = filters[`right_hand_${key}`].update(landmark);
        });
      }

      return filtered;
    }
  };
}