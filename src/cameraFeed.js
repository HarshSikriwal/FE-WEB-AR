// src/cameraFeed.js

// Function to start the camera feed
async function startCamera() {
  try {
    // Try to access the back camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } },
    });
    const videoElement = document.getElementById("camera-feed");
    videoElement.srcObject = stream;
  } catch (error) {
    console.warn(
      "Back camera not available, switching to front camera: ",
      error
    );
    try {
      // Fallback to the front camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      const videoElement = document.getElementById("camera-feed");
      videoElement.srcObject = stream;
    } catch (error) {
      console.error("Error accessing the camera: ", error);
    }
  }
}

// Start the camera when the page loads
window.onload = startCamera;
