'use client';

import { useEffect, useRef,useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const wishes = [
    "I believe in my ability to overcome any challenge.",
    "I am open to new opportunities that come my way.",
    "I trust that every setback is a setup for a comeback.",
    "I am worthy of love, success, and happiness.",
    "I embrace change and see it as a path to growth.",
    "I choose to focus on the positives in my life.",
    "I have the strength to pursue my dreams relentlessly.",
    "I am grateful for the journey, not just the destination.",
    "I will make a difference in the lives of others.",
    "I know that my best days are yet to come."
  ];
  
  function getRandomNumber(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomWish(){
    return wishes[getRandomNumber(0,wishes.length-1)];
}


const Scene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  const [popupContent, setPopupContent] = useState<string |null>(null); // State for popup content

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

     const ambientLight = new THREE.AmbientLight(0xffffff, 1);
     scene.add(ambientLight);
 
     const pointLight = new THREE.PointLight(0xffffff, 10);
     pointLight.position.set(5, 5, 5);
     scene.add(pointLight);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if(mountRef.current){
        mountRef.current.appendChild(renderer.domElement);
    }

    const setUserDataRecursively = (object:THREE.Group<THREE.Object3DEventMap>, wish:string) => {
        object.userData = { wish }; // Set userData for the current object
        object.children.forEach((child) => {
          setUserDataRecursively(child as THREE.Group<THREE.Object3DEventMap>, wish); // Set userData for each child
        });
      };

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // An animation for smoother movements
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = true; // Allow panning
    controls.maxPolarAngle = Math.PI; // Allow full vertical rotation
    controls.minDistance = 5; // Minimum zoom distance
    controls.maxDistance = 20000; // Maximum zoom distance


    const loader = new GLTFLoader();
    const modelCount = 50; // Number of models to create
    const models:THREE.Group<THREE.Object3DEventMap>[] = []; // Array to hold models for positioning
    loader.load('/3d-assets/lantern.glb', (gltf) => {
        for (let i = 0; i < modelCount; i++) {
            const modelClone = gltf.scene.clone(); // Clone the loaded model
            // Randomize position
            modelClone.position.set(
              (Math.random() - 0.5) * 50, // X position
              Math.random() * 10,         // Y position (height)
              (Math.random() - 0.5) * 50   // Z position
            );
            const wish = getRandomWish();
            setUserDataRecursively(modelClone, wish);
            scene.add(modelClone);
            models.push(modelClone); // Store model for later use
          }
    });

    camera.position.z = 20;

     // Handle keyboard movement
     const moveSpeed = 5; // Adjust movement speed
     const handleKeyDown = (event:KeyboardEvent) => {
       switch (event.code) {
         case 'ArrowUp':
           camera.position.x -= moveSpeed; // Move forward
           break;
         case 'ArrowDown':
           camera.position.x += moveSpeed; // Move backward
           break;
         case 'ArrowLeft':
           camera.position.y -= moveSpeed; // Move left
           break;
         case 'ArrowRight':
           camera.position.y += moveSpeed; // Move right
           break;
         case 'KeyW':
           camera.position.z += moveSpeed; // Move up
           break;
         case 'KeyS':
           camera.position.z -= moveSpeed; // Move down
           break;
         default:
           break;
       }
     };
 
     window.addEventListener('keydown', handleKeyDown);

     const raycaster = new THREE.Raycaster();
     const mouse = new THREE.Vector2();
 
     const handleMouseClick = (event:MouseEvent) => {
       // Calculate mouse position in normalized device coordinates
       mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
       mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
 
       // Update the raycaster with the camera and mouse position
       raycaster.setFromCamera(mouse, camera);
 
       // Calculate objects intersecting the picking ray
       const intersects = raycaster.intersectObjects(models);
 
       if (intersects.length > 0) {
         const clickedModel = intersects[0].object;
         setPopupContent(clickedModel.userData.wish); 
       }
     };
 
     window.addEventListener('click', handleMouseClick);
 

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    const mountedCurrent = mountRef.current;
    return () => {
        
        if(mountedCurrent){
            mountedCurrent.removeChild(renderer.domElement);
        }
    };
  }, []);

  return <div ref={mountRef}>
          {popupContent && (
        <div className="absolute top-10 left-10 p-4 bg-white border border-gray-300 shadow-lg z-10 rounded-md">
          <p className="text-gray-800">{popupContent}</p>
          <button 
            className="mt-2 px-3 py-1 text-white rounded bg-[#E35A00] hover:bg-[#C64E00]"
            onClick={(e) => {
                e.stopPropagation();
                setPopupContent(null)
            }}
          >
            Close
          </button>
        </div>
      )}
  </div>;
};

export default Scene;
