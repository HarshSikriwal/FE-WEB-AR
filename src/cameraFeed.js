// src/cameraFeed.js

// Function to start the camera feed
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoElement = document.getElementById("camera-feed");
    videoElement.srcObject = stream;
  } catch (error) {
    console.error("Error accessing the camera: ", error);
  }
}

// Start the camera when the page loads
window.onload = startCamera;
