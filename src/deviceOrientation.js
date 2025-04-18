// Create an object to store orientation values
export const deviceOrientation = {
  alpha: 0,
  beta: 0,
  gamma: 0,
  initialAlpha: null,
  initialBeta: null,
  initialGamma: null,
  calibrated: false,
};

// Function to handle device orientation events
function handleOrientation(event) {
  // Store initial values on first reading
  if (
    !deviceOrientation.calibrated &&
    event.beta !== null &&
    event.gamma !== null
  ) {
    deviceOrientation.initialAlpha = event.alpha;
    deviceOrientation.initialBeta = event.beta;
    deviceOrientation.initialGamma = event.gamma;
    deviceOrientation.calibrated = true;
    console.log(
      "Initial orientation calibrated:",
      deviceOrientation.initialAlpha,
      deviceOrientation.initialBeta,
      deviceOrientation.initialGamma
    );
  }

  // Always update current values
  deviceOrientation.alpha = event.alpha;
  deviceOrientation.beta = event.beta;
  deviceOrientation.gamma = event.gamma;
}

// Function to request permission for device orientation
function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        console.log(`Permission state: ${permissionState}`);
        if (permissionState === "granted") {
          console.log("Permission granted, adding event listener.");
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          console.log("Permission denied for device orientation.");
        }
      })
      .catch((error) => {
        console.error("Error requesting permission:", error);
      });
  } else {
    // Non-iOS 13+ devices
    console.log("Adding event listener for non-iOS 13+ device.");
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

// Check if the DeviceOrientationEvent is supported
if (window.DeviceOrientationEvent) {
  console.log("DeviceOrientationEvent is supported.");
  // Request permission on user interaction
  document.body.addEventListener("click", requestOrientationPermission, {
    once: true,
  });
} else {
  console.log("DeviceOrientationEvent is not supported on this device.");
}
