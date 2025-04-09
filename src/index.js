import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

const gui = new GUI();
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

scene.add(camera);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Create a raycaster for detecting tap positions
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Create floor plane at the bottom of the screen
const planeWidth = 400; // Make it wider to fill the screen
const planeDepth = 1000000; // Make it deeper for more play area
const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeDepth);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: "red",
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

// Set plane rotation to be floor-like (-90 degrees around X axis)
plane.rotation.x = (Math.PI * 85) / 180;

// Position the plane at the bottom of the view
// Camera is at z=5, we want the plane to be on the ground
plane.position.y = -3.8; // Bottom of the screen when camera is at z=5
plane.position.z = 0; // Directly in front of the camera

scene.add(plane);

gui.add(plane.rotation, "x").min(-3).max(3).step(0.01).name("rotationX");
gui.add(plane.rotation, "y").min(-3).max(3).step(0.01).name("rotationY");
gui.add(plane.rotation, "z").min(-3).max(3).step(0.01).name("rotationZ");

gui.add(plane.position, "x").min(-10).max(10).step(0.01).name("positionX");
gui.add(plane.position, "y").min(-10).max(10).step(0.01).name("positionY");
gui.add(plane.position, "z").min(-10).max(10).step(0.01).name("positionZ");

gui.add(plane.scale, "x").min(0.1).max(20).step(0.01).name("scaleX");
gui.add(plane.scale, "y").min(0.1).max(20).step(0.01).name("scaleY");
gui.add(plane.scale, "z").min(0.1).max(20).step(0.01).name("scaleZ");

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Position camera to look down at the floor plane
camera.position.z = 5;
camera.position.y = 2; // Raise camera to look down at the floor
camera.lookAt(0, -3.8, 0); // Look at the center of the floor plane

// Create renderer with transparent background
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true, // This makes the background transparent
  antialias: true,
});

renderer.setClearColor(0x000000, 0); // Set clear color with 0 opacity
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Function to create a green cube
function createCube(position, distance) {
  // Calculate size based on distance (further = smaller)
  // Map distance from 0-15 to size 1-0.2
  const size = Math.max(0.2, 1 - distance / 20);

  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);

  // Position the cube at the intersection point
  cube.position.copy(position);

  // Position the cube directly on top of the floor plane
  // Since the plane is at y=-3.8 and has rotation.x = -Math.PI/2,
  // we need to place cubes at y=-3.8 + height/2
  cube.position.y = -3.8 + size / 2;

  scene.add(cube);

  // Optional: Add some animation to the cube
  const initialY = cube.position.y;
  cube.userData.animation = {
    initialY,
    phase: Math.random() * Math.PI * 2, // Random starting phase
    jumpHeight: size * 0.5, // Jump height proportional to cube size
  };

  return cube;
}

// Array to store all cubes
const cubes = [];

// Function to handle tap/click events
function onTap(event) {
  // Prevent default behavior
  event.preventDefault();

  // Get normalized device coordinates
  const x = (event.clientX / sizes.width) * 2 - 1;
  const y = -(event.clientY / sizes.height) * 2 + 1;

  pointer.x = x;
  pointer.y = y;

  // Set up the raycaster
  raycaster.setFromCamera(pointer, camera);

  // Check for intersections with the plane
  const intersects = raycaster.intersectObject(plane);

  if (intersects.length > 0) {
    // Get the intersection point
    const intersectionPoint = intersects[0].point;

    // Calculate distance from camera to intersection point
    const distance = camera.position.distanceTo(intersectionPoint);

    // Create a cube at the intersection point
    const cube = createCube(intersectionPoint, distance);

    // Add to the cubes array
    cubes.push(cube);
  }
}

// Add event listeners for mouse and touch
canvas.addEventListener("click", onTap);
canvas.addEventListener(
  "touchend",
  (event) => {
    // Convert touch event to click-like coordinates
    event.preventDefault();
    event.clientX = event.changedTouches[0].clientX;
    event.clientY = event.changedTouches[0].clientY;
    onTap(event);
  },
  false
);

// Function to animate the scene
function animate() {
  requestAnimationFrame(animate);

  // Animate the cubes
  const time = performance.now() * 0.001; // Current time in seconds

  cubes.forEach((cube) => {
    if (cube.userData.animation) {
      // Make cubes jump up and down on the floor
      const { initialY, phase, jumpHeight } = cube.userData.animation;
      // Use absolute value of sine to create a bouncing effect
      cube.position.y =
        initialY + Math.abs(Math.sin(time * 3 + phase)) * jumpHeight;

      // Rotate cubes slowly
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
  });

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
animate();
