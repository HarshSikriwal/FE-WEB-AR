import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Timer } from "three/addons/misc/Timer.js";
import GUI from "lil-gui";
import { deviceOrientation } from "./deviceOrientation.js";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight("#ffffff", 1.5);
directionalLight.position.set(0, 4, 0);
scene.add(directionalLight);

// ADD HELPER TO UNDERSTAND WHERE LIGHT IS
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight
);
scene.add(directionalLightHelper);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.set(0, 1.65, 5); // y = 1.65 for eye level
scene.add(camera);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    color: "#fff",
    transparent: true,
    opacity: 0,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.65;

// ADD HELPER TO UNDERSTAND WHERE CAMERA IS
const helper = new THREE.CameraHelper(camera);
scene.add(helper);

scene.add(floor);

// Add a reference cube
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: "#ff0000" })
);
cube.position.set(0, -0.65, 0);
scene.add(cube);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const timer = new Timer();

const tick = () => {
  // Only apply orientation if we have valid calibrated values
  if (deviceOrientation.calibrated && deviceOrientation.beta !== null) {
    // Calculate relative changes from initial position
    const relativeBeta = deviceOrientation.beta - deviceOrientation.initialBeta;
    const relativeGamma =
      deviceOrientation.gamma - deviceOrientation.initialGamma;
    let relativeAlpha = 0;

    // Handle alpha wrapping (0-360 degrees)
    if (
      deviceOrientation.alpha !== null &&
      deviceOrientation.initialAlpha !== null
    ) {
      relativeAlpha = deviceOrientation.alpha - deviceOrientation.initialAlpha;
      // Handle the wrap-around case (crossing 0/360 boundary)
      if (relativeAlpha > 180) relativeAlpha -= 360;
      if (relativeAlpha < -180) relativeAlpha += 360;
    }

    // Apply different scaling factors for each axis
    // 1.0 = full rotation, 0.0 = no rotation
    const betaScale = 1.0; // Full rotation for looking up/down
    const gammaScale = 0.1; // Very limited side-to-side tilt
    const alphaScale = 0.0; // No rotation around vertical axis

    // Convert to radians with scaling
    const betaRad = THREE.MathUtils.degToRad(relativeBeta * betaScale);
    const gammaRad = THREE.MathUtils.degToRad(relativeGamma * gammaScale);
    const alphaRad = THREE.MathUtils.degToRad(relativeAlpha * alphaScale);

    // Create rotation quaternions for each axis
    const quaternionX = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      betaRad
    );
    const quaternionY = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      gammaRad
    );
    const quaternionZ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      alphaRad
    );

    // Combine rotations (order: Y, X, Z)
    const targetQuaternion = new THREE.Quaternion();
    targetQuaternion.multiplyQuaternions(quaternionY, quaternionX);
    targetQuaternion.multiplyQuaternions(targetQuaternion, quaternionZ);

    // Apply the rotation to the camera with smooth transition
    camera.quaternion.slerp(targetQuaternion, 0.1);
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
