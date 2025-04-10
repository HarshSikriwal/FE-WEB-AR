// src/deviceOrientation.js

// Function to handle device orientation events
function handleOrientation(event) {
  const alpha = event.alpha; // Rotation around the z-axis
  const beta = event.beta; // Rotation around the x-axis
  const gamma = event.gamma; // Rotation around the y-axis

  console.log(`Alpha: ${alpha}, Beta: ${beta}, Gamma: ${gamma}`);
}

// Check if the DeviceOrientationEvent is supported
if (window.DeviceOrientationEvent) {
  // Add an event listener for device orientation changes
  window.addEventListener("deviceorientation", handleOrientation, true);
} else {
  console.log("DeviceOrientationEvent is not supported on this device.");
}
