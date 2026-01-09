// import { useEffect, useRef, useState } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
// import * as THREE from 'three';
// import { solveTwoBoneIK } from '../utils/ikSolver';

// // Initialize Human Library
// let human = null;

// const initializeHuman = async () => {
//   if (human) return human;
  
//   if (typeof window.Human === 'undefined') {
//     console.error('❌ Human Library script load nahi hua! index.html check karo.');
//     return null;
//   }

//   // @ts-ignore
//   human = new window.Human.Human({
//     backend: 'webgl',
//     modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models/',
//     face: { enabled: true }, 
//     body: { enabled: true },
//     hand: { enabled: true },
//     filter: { enabled: true },
//   });

//   console.log('✅ Human Library Initialized!');
//   return human;
// };

// // Conversion function
// const convertHumanToThreeJS = (landmark) => {
//   if (!landmark) return null;
//   return {
//     x: (landmark.x - 0.5) * 2.5,
//     y: -(landmark.y - 0.5) * 2.5,
//     z: -landmark.z * 2.5,
//   };
// };

// // Main Avatar Component
// function AvatarModel({ humanData }) {
//   const { scene, nodes } = useGLTF('/models/standing.glb');
//   const smoothing = useRef({});

//   useEffect(() => {
//     scene.traverse((bone) => {
//       if (bone.isBone) {
//         smoothing.current[bone.name] = bone.quaternion.clone();
//       }
//     });
//   }, [scene]);

//   useFrame(() => {
//     if (!humanData?.body?.[0]) return;

//     const body = humanData.body[0].keypoints;
//     const hands = humanData.hand;

//     // LEFT ARM IK
//     if (body[11] && body[13] && body[15]) {
//       const target = convertHumanToThreeJS(body[15]);
//       if (target) {
//         solveTwoBoneIK({
//           root: nodes.mixamorigLeftArm,
//           mid: nodes.mixamorigLeftForeArm,
//           end: nodes.mixamorigLeftHand,
//           target: new THREE.Vector3(target.x, target.y, target.z),
//           pole: new THREE.Vector3(0, 1, 0)
//         });
//       }
//     }

//     // RIGHT ARM IK
//     if (body[12] && body[14] && body[16]) {
//       const target = convertHumanToThreeJS(body[16]);
//       if (target) {
//         solveTwoBoneIK({
//           root: nodes.mixamorigRightArm,
//           mid: nodes.mixamorigRightForeArm,
//           end: nodes.mixamorigRightHand,
//           target: new THREE.Vector3(target.x, target.y, target.z),
//           pole: new THREE.Vector3(0, 1, 0)
//         });
//       }
//     }

//     // 🖐️ HAND ROTATION - THE MAIN FIX
//     if (hands && hands.length > 0) {
//       hands.forEach(hand => {
//         const isRight = hand.label === 'right';
//         const boneName = isRight ? 'mixamorigRightHand' : 'mixamorigLeftHand';
//         const handBone = nodes[boneName];

//         if (handBone && hand.keypoints.length > 12) {
//           const wrist = convertHumanToThreeJS(hand.keypoints[0]);
//           const middleFingerBase = convertHumanToThreeJS(hand.keypoints[9]);

//           if (wrist && middleFingerBase) {
//             // Calculate 3D direction
//             const dir = new THREE.Vector3().subVectors(
//               new THREE.Vector3(middleFingerBase.x, middleFingerBase.y, middleFingerBase.z),
//               new THREE.Vector3(wrist.x, wrist.y, wrist.z)
//             ).normalize();

//             // Create rotation
//             const baseDir = isRight ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0);
//             const targetQuat = new THREE.Quaternion().setFromUnitVectors(baseDir, dir);

//             // Smooth Slerp
//             if (!smoothing.current[boneName]) smoothing.current[boneName] = handBone.quaternion.clone();
//             smoothing.current[boneName].slerp(targetQuat, 0.2);
            
//             handBone.quaternion.copy(smoothing.current[boneName]);
//           }
//         }
//       });
//     }
//   });

//   return <primitive object={scene} scale={1.3} position={[0, -1, 0]} />;
// }

// // Main Canvas Component
// export default function AvatarCanvas() {
//   const videoRef = useRef(null);
//   const [humanData, setHumanData] = useState(null);
//   const [status, setStatus] = useState('Initializing...');

//   useEffect(() => {
//     const runDetection = async () => {
//       const h = await initializeHuman();
//       if (!h) {
//         setStatus('❌ Human Library failed to load');
//         return;
//       }

//       try {
//         // Start Camera
//         const stream = await navigator.mediaDevices.getUserMedia({ 
//           video: { width: 1280, height: 720 } 
//         });
        
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           videoRef.current.play();
//           setStatus('✅ Camera Active');
//         }

//         // Detection Loop
//         const detect = async () => {
//           if (!videoRef.current?.paused && !videoRef.current?.ended) {
//             try {
//               const res = await h.detect(videoRef.current);
//               setHumanData(res);
//               setStatus(`✅ Body: ${res.body?.length || 0} | Hands: ${res.hand?.length || 0}`);
//             } catch (e) {
//               console.error('Detection error:', e);
//             }
//           }
//           requestAnimationFrame(detect);
//         };
//         detect();
//       } catch (err) {
//         setStatus('❌ Camera permission denied or not available');
//         console.error('Camera error:', err);
//       }
//     };

//     runDetection();
//   }, []);

//   return (
//     <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
//       {/* 3D Scene */}
//       <div style={{ flex: 1 }}>
//         <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
//           <ambientLight intensity={0.5} />
//           <directionalLight position={[2, 5, 2]} />
//           <Environment preset="city" />
//           <AvatarModel humanData={humanData} />
//           <OrbitControls target={[0, 1, 0]} />
//         </Canvas>
//       </div>

//       {/* Status & Camera Preview */}
//       <div style={{ 
//         position: 'fixed',
//         top: 20,
//         right: 20,
//         background: 'rgba(0,0,0,0.8)',
//         color: '#0f0',
//         padding: '20px',
//         borderRadius: '10px',
//         fontFamily: 'monospace',
//         fontSize: '12px',
//         zIndex: 100
//       }}>
//         <div>Status: {status}</div>
//       </div>

//       {/* Video feed small preview */}
//       <div style={{ 
//         position: 'fixed',
//         bottom: 20,
//         right: 20,
//         width: 200,
//         border: '2px solid #0f0',
//         borderRadius: 10,
//         overflow: 'hidden'
//       }}>
//         <video ref={videoRef} style={{ width: '100%', height: '100%' }} muted />
//       </div>
//     </div>
//   );
// }
