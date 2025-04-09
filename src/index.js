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

const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: "red",
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -(Math.PI * 75) / 180;
plane.position.z = -5; // Move the plane in front of the camera

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

camera.position.z = 5;

// Create renderer with transparent background
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true, // This makes the background transparent
  antialias: true,
});

renderer.setClearColor(0x000000, 0); // Set clear color with 0 opacity
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Function to animate the scene
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
animate();
