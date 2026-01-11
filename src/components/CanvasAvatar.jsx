// TYR - 1 (good)

// import React, { useState, useEffect, useRef, Suspense } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
// import * as THREE from "three";
// import useLandmarks from "../hooks/useLandmarks";

// // ===== PRELOAD MODEL (IMPORTANT) =====
// useGLTF.preload("/models/standing.glb");

// // ===== MODEL COMPONENT =====
// function Model({ boneRotations, mediaPipeMode, landmarks, onBonesLoaded }) {
//   const { scene, nodes } = useGLTF("/models/standing.glb");
//   const modelRef = useRef();
//   const bonesDetectedRef = useRef(false);

//   // Detect bones once
//   useEffect(() => {
//     if (!bonesDetectedRef.current && scene) {
//       const boneNames = [];
//       scene.traverse((obj) => {
//         if (obj.isBone) {
//           boneNames.push(obj.name);
//         }
//       });
//       onBonesLoaded(boneNames);
//       bonesDetectedRef.current = true;
//       console.log("✅ Bones loaded:", boneNames);
//     }
//   }, [scene, onBonesLoaded]);

//   // MediaPipe helpers
//   const mp = (lm) => ({
//     x: (lm.x - 0.5) * 2,
//     y: -(lm.y - 0.5) * 2,
//     z: -lm.z * 2
//   });

//   const angle2D = (from, to) => Math.atan2(to.y - from.y, to.x - from.x);

//   useFrame(() => {
//     if (!nodes) return;

//     // ===== MANUAL MODE =====
//     if (!mediaPipeMode) {
//       Object.keys(boneRotations).forEach((boneName) => {
//         const node = nodes[boneName];
//         if (node?.isBone) {
//           const { x, y, z } = boneRotations[boneName];
//           node.rotation.x = THREE.MathUtils.degToRad(x);
//           node.rotation.y = THREE.MathUtils.degToRad(y);
//           node.rotation.z = THREE.MathUtils.degToRad(z);
//         }
//       });
//       return;
//     }

//     // ===== MEDIAPIPE MODE =====
//     if (!landmarks?.pose) return;

//     const p = landmarks.pose;

//     // Auto-detect bones
//     const leftArmBone =
//       nodes["LeftArm"] ||
//       nodes["mixamorigLeftArm"] ||
//       nodes["Left_Arm"] ||
//       nodes["LeftShoulder"];

//     const rightArmBone =
//       nodes["RightArm"] ||
//       nodes["mixamorigRightArm"] ||
//       nodes["Right_Arm"] ||
//       nodes["RightShoulder"];

//     const leftForeArmBone =
//       nodes["LeftForeArm"] ||
//       nodes["mixamorigLeftForeArm"] ||
//       nodes["Left_ForeArm"];

//     const rightForeArmBone =
//       nodes["RightForeArm"] ||
//       nodes["mixamorigRightForeArm"] ||
//       nodes["Right_ForeArm"];

//     // LEFT ARM
//     if (p.LEFT_SHOULDER && p.LEFT_ELBOW && leftArmBone?.isBone) {
//       const s = mp(p.LEFT_SHOULDER);
//       const e = mp(p.LEFT_ELBOW);
//       const angle = angle2D(s, e);
//       leftArmBone.rotation.z = THREE.MathUtils.clamp(
//         -angle - Math.PI / 4,
//         -Math.PI,
//         Math.PI / 2
//       );
//     }

//     // RIGHT ARM
//     if (p.RIGHT_SHOULDER && p.RIGHT_ELBOW && rightArmBone?.isBone) {
//       const s = mp(p.RIGHT_SHOULDER);
//       const e = mp(p.RIGHT_ELBOW);
//       const angle = angle2D(s, e);
//       rightArmBone.rotation.z = THREE.MathUtils.clamp(
//         angle + Math.PI / 4,
//         -Math.PI / 2,
//         Math.PI
//       );
//     }

//     // LEFT FOREARM
//     if (p.LEFT_ELBOW && p.LEFT_WRIST && leftForeArmBone?.isBone) {
//       const e = mp(p.LEFT_ELBOW);
//       const w = mp(p.LEFT_WRIST);
//       const angle = angle2D(e, w);
//       leftForeArmBone.rotation.z = THREE.MathUtils.clamp(
//         -angle,
//         -Math.PI / 2,
//         Math.PI / 4
//       );
//     }

//     // RIGHT FOREARM
//     if (p.RIGHT_ELBOW && p.RIGHT_WRIST && rightForeArmBone?.isBone) {
//       const e = mp(p.RIGHT_ELBOW);
//       const w = mp(p.RIGHT_WRIST);
//       const angle = angle2D(e, w);
//       rightForeArmBone.rotation.z = THREE.MathUtils.clamp(
//         angle,
//         -Math.PI / 4,
//         Math.PI / 2
//       );
//     }
//   });

//   return (
//     <primitive
//       ref={modelRef}
//       object={scene}
//       scale={1.5}
//       position={[0, -0.5, 0]}
//     />
//   );
// }

// // ===== LOADING FALLBACK =====
// function Loader() {
//   return (
//     <mesh>
//       <boxGeometry args={[1, 2, 0.5]} />
//       <meshStandardMaterial color="hotpink" />
//     </mesh>
//   );
// }

// // ===== MAIN APP =====
// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();
//   const [bonesList, setBonesList] = useState([]);
//   const [selectedBone, setSelectedBone] = useState(null);
//   const [boneRotations, setBoneRotations] = useState({});
//   const [mediaPipeMode, setMediaPipeMode] = useState(true);

//   const updateRotation = (axis, value) => {
//     if (!selectedBone) return;
//     setBoneRotations((prev) => ({
//       ...prev,
//       [selectedBone]: {
//         ...(prev[selectedBone] || { x: 0, y: 0, z: 0 }),
//         [axis]: parseFloat(value),
//       },
//     }));
//   };

//   const getRotation = (bone, axis) => {
//     return boneRotations[bone]?.[axis] || 0;
//   };

//   const resetBone = () => {
//     if (!selectedBone) return;
//     setBoneRotations(prev => ({
//       ...prev,
//       [selectedBone]: { x: 0, y: 0, z: 0 }
//     }));
//   };

//   const resetAll = () => {
//     setBoneRotations({});
//   };

//   return (
//     <div style={{
//       width: "100%",
//       height: "100vh",
//       display: "flex",
//       backgroundColor: "#1a1a1a",
//       color: "white",
//       fontFamily: "sans-serif"
//     }}>

//       {/* ===== 3D VIEWPORT ===== */}
//       <div style={{ flex: 1, position: "relative" }}>
//         <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
//           <ambientLight intensity={0.6} />
//           <directionalLight position={[5, 10, 7]} intensity={1.2} />
//           <directionalLight position={[-5, 5, -7]} intensity={0.6} />
//           <Environment preset="city" />

//           <Suspense fallback={<Loader />}>
//             <Model
//               boneRotations={boneRotations}
//               mediaPipeMode={mediaPipeMode}
//               landmarks={landmarks}
//               onBonesLoaded={setBonesList}
//             />
//           </Suspense>

//           <ContactShadows
//             opacity={0.4}
//             scale={10}
//             blur={1.5}
//             far={10}
//             resolution={256}
//             color="#000000"
//           />
//           <OrbitControls target={[0, 1, 0]} />
//         </Canvas>

//         {/* Status Badge */}
//         <div style={{
//           position: "absolute",
//           top: 15,
//           left: 15,
//           background: mediaPipeMode && landmarks?.pose ? "#1e5128" : "#333",
//           color: "white",
//           padding: "10px 15px",
//           borderRadius: "8px",
//           fontSize: "13px",
//           fontWeight: "600",
//           boxShadow: "0 2px 10px rgba(0,0,0,0.5)"
//         }}>
//           {mediaPipeMode ? (
//             <>
//               📡 MediaPipe Mode {landmarks?.pose ? "✅" : "⏳"}
//             </>
//           ) : (
//             <>
//               🎮 Manual Mode
//             </>
//           )}
//         </div>
//       </div>

//       {/* ===== CONTROLS SIDEBAR ===== */}
//       <div style={{
//         width: "350px",
//         overflowY: "auto",
//         borderLeft: "1px solid #333",
//         padding: "20px",
//         backgroundColor: "#222"
//       }}>
//         <h2 style={{ marginTop: 0, marginBottom: "10px" }}>🦴 Bone Controls</h2>
//         <p style={{
//           fontSize: "12px",
//           color: "#888",
//           marginTop: 0
//         }}>
//           Found {bonesList.length} bones
//         </p>

//         {/* Mode Toggle */}
//         <div style={{
//           marginBottom: "20px",
//           padding: "15px",
//           background: "#333",
//           borderRadius: "8px"
//         }}>
//           <label style={{
//             display: "flex",
//             alignItems: "center",
//             cursor: "pointer",
//             gap: "10px"
//           }}>
//             <input
//               type="checkbox"
//               checked={mediaPipeMode}
//               onChange={(e) => setMediaPipeMode(e.target.checked)}
//               style={{ width: "20px", height: "20px", cursor: "pointer" }}
//             />
//             <span style={{ fontSize: "14px", fontWeight: "600" }}>
//               Enable MediaPipe Tracking
//             </span>
//           </label>
//           <p style={{
//             margin: "10px 0 0 0",
//             fontSize: "11px",
//             color: "#888"
//           }}>
//             {mediaPipeMode
//               ? "Avatar follows your movements in real-time"
//               : "Use sliders to manually control bones"
//             }
//           </p>
//         </div>

//         {/* Bone Selector */}
//         {!mediaPipeMode && bonesList.length > 0 && (
//           <>
//             <div style={{
//               marginBottom: "15px",
//               maxHeight: "250px",
//               overflowY: "scroll",
//               border: "1px solid #444",
//               borderRadius: "6px"
//             }}>
//               {bonesList.map((boneName) => (
//                 <div
//                   key={boneName}
//                   onClick={() => setSelectedBone(boneName)}
//                   style={{
//                     padding: "10px 12px",
//                     cursor: "pointer",
//                     backgroundColor: selectedBone === boneName ? "#4488ff" : "transparent",
//                     color: selectedBone === boneName ? "white" : "#ddd",
//                     borderBottom: "1px solid #333",
//                     fontSize: "13px",
//                     transition: "all 0.2s"
//                   }}
//                 >
//                   {boneName.replace("mixamorig", "").replace(/_/g, " ")}
//                 </div>
//               ))}
//             </div>

//             {/* Rotation Sliders */}
//             {selectedBone ? (
//               <div style={{
//                 backgroundColor: "#333",
//                 padding: "18px",
//                 borderRadius: "8px"
//               }}>
//                 <h3 style={{
//                   marginTop: 0,
//                   color: "#4488ff",
//                   fontSize: "16px",
//                   marginBottom: "15px"
//                 }}>
//                   {selectedBone.replace("mixamorig", "").replace(/_/g, " ")}
//                 </h3>

//                 {["x", "y", "z"].map((axis) => (
//                   <div key={axis} style={{ marginBottom: "18px" }}>
//                     <div style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       marginBottom: "6px"
//                     }}>
//                       <label style={{
//                         textTransform: "uppercase",
//                         fontWeight: "bold",
//                         fontSize: "12px",
//                         color: "#aaa"
//                       }}>
//                         Rotation {axis}
//                       </label>
//                       <span style={{
//                         fontSize: "13px",
//                         color: "#4488ff",
//                         fontWeight: "600"
//                       }}>
//                         {getRotation(selectedBone, axis).toFixed(0)}°
//                       </span>
//                     </div>
//                     <input
//                       type="range"
//                       min="-180"
//                       max="180"
//                       step="1"
//                       value={getRotation(selectedBone, axis)}
//                       onChange={(e) => updateRotation(axis, e.target.value)}
//                       style={{
//                         width: "100%",
//                         cursor: "pointer",
//                         height: "6px"
//                       }}
//                     />
//                   </div>
//                 ))}

//                 <div style={{ display: "flex", gap: "10px" }}>
//                   <button
//                     onClick={resetBone}
//                     style={{
//                       flex: 1,
//                       padding: "10px",
//                       background: "#444",
//                       color: "white",
//                       border: "none",
//                       borderRadius: "6px",
//                       cursor: "pointer",
//                       fontWeight: "600",
//                       fontSize: "13px"
//                     }}
//                   >
//                     Reset Bone
//                   </button>
//                   <button
//                     onClick={resetAll}
//                     style={{
//                       flex: 1,
//                       padding: "10px",
//                       background: "#ff4444",
//                       color: "white",
//                       border: "none",
//                       borderRadius: "6px",
//                       cursor: "pointer",
//                       fontWeight: "600",
//                       fontSize: "13px"
//                     }}
//                   >
//                     Reset All
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div style={{
//                 padding: "30px",
//                 textAlign: "center",
//                 color: "#666",
//                 border: "2px dashed #444",
//                 borderRadius: "8px"
//               }}>
//                 ☝️ Select a bone above
//               </div>
//             )}
//           </>
//         )}

//         {/* MediaPipe Info */}
//         {mediaPipeMode && (
//           <div style={{
//             marginTop: "20px",
//             padding: "15px",
//             background: "#1a3a1a",
//             borderRadius: "8px",
//             border: "1px solid #2a5a2a"
//           }}>
//             <h4 style={{ margin: "0 0 10px 0", color: "#4f4" }}>
//               📊 Live Tracking Data
//             </h4>
//             {landmarks?.pose ? (
//               <>
//                 <div style={{ fontSize: "12px", marginBottom: "5px" }}>
//                   ✅ Pose landmarks: {Object.keys(landmarks.pose).length}
//                 </div>
//                 {landmarks.left_hand && (
//                   <div style={{ fontSize: "12px", marginBottom: "5px" }}>
//                     🤚 Left hand: {Object.keys(landmarks.left_hand).length} points
//                   </div>
//                 )}
//                 {landmarks.right_hand && (
//                   <div style={{ fontSize: "12px", marginBottom: "5px" }}>
//                     🤚 Right hand: {Object.keys(landmarks.right_hand).length} points
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div style={{ fontSize: "12px", color: "#888" }}>
//                 ⏳ Waiting for camera data...
//               </div>
//             )}
//           </div>
//         )}

//         {/* Loading State */}
//         {bonesList.length === 0 && (
//           <div style={{
//             marginTop: "20px",
//             padding: "20px",
//             background: "#333",
//             borderRadius: "8px",
//             textAlign: "center",
//             color: "#888"
//           }}>
//             ⏳ Loading model...
//           </div>
//         )}

//         {/* Instructions */}
//         <div style={{
//           marginTop: "20px",
//           padding: "12px",
//           background: "#2a2a2a",
//           borderRadius: "6px",
//           fontSize: "11px",
//           color: "#888",
//           lineHeight: "1.6"
//         }}>
//           <strong style={{ color: "#aaa" }}>💡 Tips:</strong><br/>
//           • Toggle MediaPipe for real-time tracking<br/>
//           • Use manual mode to test poses<br/>
//           • Right-click + drag to rotate camera
//         </div>
//       </div>
//     </div>
//   );
// }

//TYR - 2 (not good)

// import React, { useState, useEffect, useRef, Suspense } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
// import * as THREE from "three";
// import useLandmarks from "../hooks/useLandmarks";

// useGLTF.preload("/models/standing.glb");

// function Model({ boneRotations, mediaPipeMode, landmarks, onBonesLoaded }) {
//   const { scene, nodes } = useGLTF("/models/standing.glb");
//   const modelRef = useRef();
//   const restPoseRef = useRef({});
//   const bonesDetectedRef = useRef(false);

//   // DETECT BONES AND CAPTURE REST POSE
//   useEffect(() => {
//     if (!bonesDetectedRef.current && scene && nodes) {
//       const restPose = {};
//       const boneList = [];

//       scene.traverse((obj) => {
//         if (obj.isBone) {
//           boneList.push(obj.name);
//           // Clone both quaternion and euler
//           restPose[obj.name] = {
//             quat: obj.quaternion.clone(),
//             euler: new THREE.Euler(obj.rotation.x, obj.rotation.y, obj.rotation.z, obj.rotation.order)
//           };
//         }
//       });

//       restPoseRef.current = restPose;
//       onBonesLoaded(boneList);
//       bonesDetectedRef.current = true;

//       console.log("✅ REST POSE CAPTURED FOR", Object.keys(restPose).length, "BONES");
//     }
//   }, [scene, nodes, onBonesLoaded]);

//   // HELPER: Find bone by name patterns
//   const findBone = (names) => {
//     if (typeof names === "string") names = [names];
//     for (const name of names) {
//       if (nodes[name]) return nodes[name];
//     }
//     return null;
//   };

//   // MediaPipe coordinate conversion
//   const mp = (lm) => ({
//     x: (lm.x - 0.5) * 2,
//     y: -(lm.y - 0.5) * 2,
//     z: -lm.z * 2
//   });

//   // Calculate angle between two 2D points
//   const angle2D = (from, to) => {
//     const dx = to.x - from.x;
//     const dy = to.y - from.y;
//     return Math.atan2(dy, dx);
//   };

//   // Distance between points
//   const distance = (p1, p2) => {
//     const dx = p2.x - p1.x;
//     const dy = p2.y - p1.y;
//     const dz = p2.z - p1.z;
//     return Math.sqrt(dx * dx + dy * dy + dz * dz);
//   };

//   // Apply rotation with rest pose
//   const rotateBone = (boneName, axis, angle, clampMin, clampMax) => {
//     const bone = nodes[boneName];
//     if (!bone || !bone.isBone) return;

//     const restPose = restPoseRef.current[boneName];
//     if (!restPose) return;

//     const clampedAngle = THREE.MathUtils.clamp(angle, clampMin, clampMax);
//     const tempQuat = new THREE.Quaternion();
//     tempQuat.setFromAxisAngle(axis, clampedAngle);

//     // Apply rotation on top of rest pose
//     bone.quaternion.copy(restPose.quat).multiply(tempQuat);
//   };

//   useFrame(() => {
//     if (!nodes) return;

//     // ===== MANUAL MODE =====
//     if (!mediaPipeMode) {
//       Object.keys(boneRotations).forEach((boneName) => {
//         const bone = nodes[boneName];
//         if (bone?.isBone) {
//           const { x, y, z } = boneRotations[boneName];
//           bone.rotation.x = THREE.MathUtils.degToRad(x);
//           bone.rotation.y = THREE.MathUtils.degToRad(y);
//           bone.rotation.z = THREE.MathUtils.degToRad(z);
//         }
//       });
//       return;
//     }

//     // ===== MEDIAPIPE MODE =====
//     if (!landmarks?.pose) return;

//     const p = landmarks.pose;
//     const lh = landmarks.left_hand || {};
//     const rh = landmarks.right_hand || {};

//     const axisX = new THREE.Vector3(1, 0, 0);
//     const axisY = new THREE.Vector3(0, 1, 0);
//     const axisZ = new THREE.Vector3(0, 0, 1);

//     // ===== HEAD (nose + ears) =====
//     if (p.NOSE && p.LEFT_EAR && p.RIGHT_EAR) {
//       const headBones = ["Head", "head", "mixamorigHead"];
//       const head = findBone(headBones);

//       if (head?.isBone) {
//         const nose = mp(p.NOSE);
//         const leftEar = mp(p.LEFT_EAR);
//         const rightEar = mp(p.RIGHT_EAR);

//         // Head tilt based on ears
//         const headTilt = angle2D(leftEar, rightEar);
//         rotateBone(head.name, axisZ, headTilt, -Math.PI / 4, Math.PI / 4);
//       }
//     }

//     // ===== SPINE (shoulder to hip angle) =====
//     if (p.LEFT_SHOULDER && p.RIGHT_SHOULDER && p.LEFT_HIP && p.RIGHT_HIP) {
//       const spineBones = ["Spine", "spine", "mixamorigSpine"];
//       const spine = findBone(spineBones);

//       if (spine?.isBone) {
//         const leftShoulder = mp(p.LEFT_SHOULDER);
//         const rightShoulder = mp(p.RIGHT_SHOULDER);
//         const leftHip = mp(p.LEFT_HIP);
//         const rightHip = mp(p.RIGHT_HIP);

//         const shoulderAngle = angle2D(leftShoulder, rightShoulder);
//         const hipAngle = angle2D(leftHip, rightHip);
//         const spineRotation = (shoulderAngle - hipAngle) * 0.2;

//         rotateBone(spine.name, axisZ, spineRotation, -Math.PI / 6, Math.PI / 6);
//       }
//     }

//     // ===== LEFT ARM CHAIN =====
//     if (p.LEFT_SHOULDER && p.LEFT_ELBOW && p.LEFT_WRIST) {
//       const s = mp(p.LEFT_SHOULDER);
//       const e = mp(p.LEFT_ELBOW);
//       const w = mp(p.LEFT_WRIST);

//       const armAngle = angle2D(s, e);
//       const forearmAngle = angle2D(e, w);

//       // Upper arm
//       const leftArmBones = ["LeftArm", "mixamorigLeftArm", "Left_Arm"];
//       const leftArm = findBone(leftArmBones);
//       if (leftArm?.isBone) {
//         rotateBone(
//           leftArm.name,
//           axisZ,
//           -armAngle - Math.PI / 4,
//           -Math.PI,
//           Math.PI / 2
//         );
//       }

//       // Forearm
//       const leftForearmBones = ["LeftForeArm", "mixamorigLeftForeArm", "Left_ForeArm"];
//       const leftForearm = findBone(leftForearmBones);
//       if (leftForearm?.isBone) {
//         rotateBone(
//           leftForearm.name,
//           axisZ,
//           -forearmAngle + Math.PI / 2,
//           -Math.PI / 2,
//           Math.PI / 4
//         );
//       }

//       // Hand
//       const leftHandBones = ["LeftHand", "mixamorigLeftHand"];
//       const leftHand = findBone(leftHandBones);
//       if (leftHand?.isBone && p.LEFT_INDEX && p.LEFT_PINKY) {
//         const index = mp(p.LEFT_INDEX);
//         const pinky = mp(p.LEFT_PINKY);
//         const handAngle = angle2D(pinky, index);
//         rotateBone(leftHand.name, axisZ, -handAngle, -Math.PI, Math.PI);
//       }
//     }

//     // ===== RIGHT ARM CHAIN =====
//     if (p.RIGHT_SHOULDER && p.RIGHT_ELBOW && p.RIGHT_WRIST) {
//       const s = mp(p.RIGHT_SHOULDER);
//       const e = mp(p.RIGHT_ELBOW);
//       const w = mp(p.RIGHT_WRIST);

//       const armAngle = angle2D(s, e);
//       const forearmAngle = angle2D(e, w);

//       // Upper arm
//       const rightArmBones = ["RightArm", "mixamorigRightArm", "Right_Arm"];
//       const rightArm = findBone(rightArmBones);
//       if (rightArm?.isBone) {
//         rotateBone(
//           rightArm.name,
//           axisZ,
//           armAngle + Math.PI / 4,
//           -Math.PI / 2,
//           Math.PI
//         );
//       }

//       // Forearm
//       const rightForearmBones = ["RightForeArm", "mixamorigRightForeArm", "Right_ForeArm"];
//       const rightForearm = findBone(rightForearmBones);
//       if (rightForearm?.isBone) {
//         rotateBone(
//           rightForearm.name,
//           axisZ,
//           forearmAngle - Math.PI / 2,
//           -Math.PI / 4,
//           Math.PI / 2
//         );
//       }

//       // Hand
//       const rightHandBones = ["RightHand", "mixamorigRightHand"];
//       const rightHand = findBone(rightHandBones);
//       if (rightHand?.isBone && p.RIGHT_INDEX && p.RIGHT_PINKY) {
//         const index = mp(p.RIGHT_INDEX);
//         const pinky = mp(p.RIGHT_PINKY);
//         const handAngle = angle2D(pinky, index);
//         rotateBone(rightHand.name, axisZ, handAngle, -Math.PI, Math.PI);
//       }
//     }

//     // ===== LEFT HAND FINGERS =====
//     if (Object.keys(lh).length > 5) {
//       const fingerConfig = [
//         { name: "Thumb", start: 2, end: 4, bones: ["LeftThumb", "mixamorigLeftHandThumb1"] },
//         { name: "Index", start: 6, end: 8, bones: ["LeftIndex", "mixamorigLeftHandIndex1"] },
//         { name: "Middle", start: 10, end: 12, bones: ["LeftMiddle", "mixamorigLeftHandMiddle1"] },
//         { name: "Ring", start: 14, end: 16, bones: ["LeftRing", "mixamorigLeftHandRing1"] },
//         { name: "Pinky", start: 18, end: 20, bones: ["LeftPinky", "mixamorigLeftHandPinky1"] },
//       ];

//       fingerConfig.forEach(({ start, end, bones }) => {
//         const p1 = lh[start];
//         const p2 = lh[end];

//         if (p1 && p2) {
//           const mp1 = mp(p1);
//           const mp2 = mp(p2);
//           const angle = angle2D(mp1, mp2);

//           const finger = findBone(bones);
//           if (finger?.isBone) {
//             rotateBone(finger.name, axisZ, -angle, -Math.PI, Math.PI);
//           }
//         }
//       });
//     }

//     // ===== RIGHT HAND FINGERS =====
//     if (Object.keys(rh).length > 5) {
//       const fingerConfig = [
//         { name: "Thumb", start: 2, end: 4, bones: ["RightThumb", "mixamorigRightHandThumb1"] },
//         { name: "Index", start: 6, end: 8, bones: ["RightIndex", "mixamorigRightHandIndex1"] },
//         { name: "Middle", start: 10, end: 12, bones: ["RightMiddle", "mixamorigRightHandMiddle1"] },
//         { name: "Ring", start: 14, end: 16, bones: ["RightRing", "mixamorigRightHandRing1"] },
//         { name: "Pinky", start: 18, end: 20, bones: ["RightPinky", "mixamorigRightHandPinky1"] },
//       ];

//       fingerConfig.forEach(({ start, end, bones }) => {
//         const p1 = rh[start];
//         const p2 = rh[end];

//         if (p1 && p2) {
//           const mp1 = mp(p1);
//           const mp2 = mp(p2);
//           const angle = angle2D(mp1, mp2);

//           const finger = findBone(bones);
//           if (finger?.isBone) {
//             rotateBone(finger.name, axisZ, angle, -Math.PI, Math.PI);
//           }
//         }
//       });
//     }

//     // ===== LEGS =====
//     if (p.LEFT_HIP && p.LEFT_KNEE && p.LEFT_ANKLE) {
//       const h = mp(p.LEFT_HIP);
//       const k = mp(p.LEFT_KNEE);
//       const a = mp(p.LEFT_ANKLE);

//       const hipKneeAngle = angle2D(h, k);
//       const kneeAnkleAngle = angle2D(k, a);

//       const leftUplegBones = ["LeftUpLeg", "mixamorigLeftUpLeg"];
//       const leftUpleg = findBone(leftUplegBones);
//       if (leftUpleg?.isBone) {
//         rotateBone(leftUpleg.name, axisX, hipKneeAngle * 0.3, -Math.PI / 2, 0);
//       }

//       const leftLegBones = ["LeftLeg", "mixamorigLeftLeg"];
//       const leftLeg = findBone(leftLegBones);
//       if (leftLeg?.isBone) {
//         rotateBone(leftLeg.name, axisX, kneeAnkleAngle * 0.3, 0, Math.PI / 2);
//       }
//     }

//     if (p.RIGHT_HIP && p.RIGHT_KNEE && p.RIGHT_ANKLE) {
//       const h = mp(p.RIGHT_HIP);
//       const k = mp(p.RIGHT_KNEE);
//       const a = mp(p.RIGHT_ANKLE);

//       const hipKneeAngle = angle2D(h, k);
//       const kneeAnkleAngle = angle2D(k, a);

//       const rightUplegBones = ["RightUpLeg", "mixamorigRightUpLeg"];
//       const rightUpleg = findBone(rightUplegBones);
//       if (rightUpleg?.isBone) {
//         rotateBone(rightUpleg.name, axisX, hipKneeAngle * 0.3, -Math.PI / 2, 0);
//       }

//       const rightLegBones = ["RightLeg", "mixamorigRightLeg"];
//       const rightLeg = findBone(rightLegBones);
//       if (rightLeg?.isBone) {
//         rotateBone(rightLeg.name, axisX, kneeAnkleAngle * 0.3, 0, Math.PI / 2);
//       }
//     }
//   });

//   return (
//     <primitive
//       ref={modelRef}
//       object={scene}
//       scale={1.3}
//       position={[0, 0, 0]}
//     />
//   );
// }

// function Loader() {
//   return (
//     <mesh>
//       <boxGeometry args={[1, 2, 0.5]} />
//       <meshStandardMaterial color="hotpink" />
//     </mesh>
//   );
// }

// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();
//   const [bonesList, setBonesList] = useState([]);
//   const [selectedBone, setSelectedBone] = useState(null);
//   const [boneRotations, setBoneRotations] = useState({});
//   const [mediaPipeMode, setMediaPipeMode] = useState(true);
//   const [trackingStats, setTrackingStats] = useState({});

//   useEffect(() => {
//     if (landmarks) {
//       setTrackingStats({
//         pose: landmarks.pose ? Object.keys(landmarks.pose).length : 0,
//         leftHand: landmarks.left_hand ? Object.keys(landmarks.left_hand).length : 0,
//         rightHand: landmarks.right_hand ? Object.keys(landmarks.right_hand).length : 0,
//       });
//     }
//   }, [landmarks]);

//   const updateRotation = (axis, value) => {
//     if (!selectedBone) return;
//     setBoneRotations((prev) => ({
//       ...prev,
//       [selectedBone]: {
//         ...(prev[selectedBone] || { x: 0, y: 0, z: 0 }),
//         [axis]: parseFloat(value),
//       },
//     }));
//   };

//   const getRotation = (bone, axis) => {
//     return boneRotations[bone]?.[axis] || 0;
//   };

//   const resetBone = () => {
//     if (!selectedBone) return;
//     setBoneRotations(prev => ({
//       ...prev,
//       [selectedBone]: { x: 0, y: 0, z: 0 }
//     }));
//   };

//   const resetAll = () => {
//     setBoneRotations({});
//   };

//   return (
//     <div style={{
//       width: "100%",
//       height: "100vh",
//       display: "flex",
//       backgroundColor: "#1a1a1a",
//       color: "white",
//       fontFamily: "sans-serif"
//     }}>

//       <div style={{ flex: 1, position: "relative" }}>
//         <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
//           <ambientLight intensity={0.6} />
//           <directionalLight position={[5, 10, 7]} intensity={1.2} />
//           <directionalLight position={[-5, 5, -7]} intensity={0.6} />
//           <Environment preset="city" />

//           <Suspense fallback={<Loader />}>
//             <Model
//               boneRotations={boneRotations}
//               mediaPipeMode={mediaPipeMode}
//               landmarks={landmarks}
//               onBonesLoaded={setBonesList}
//             />
//           </Suspense>

//           <ContactShadows
//             opacity={0.4}
//             scale={10}
//             blur={1.5}
//             far={10}
//             resolution={256}
//             color="#000000"
//           />
//           <OrbitControls target={[0, 1, 0]} />
//         </Canvas>

//         <div style={{
//           position: "absolute",
//           top: 15,
//           left: 15,
//           background: mediaPipeMode && landmarks?.pose ? "#1e5128" : "#333",
//           color: "white",
//           padding: "12px 18px",
//           borderRadius: "8px",
//           fontSize: "13px",
//           fontWeight: "600",
//           boxShadow: "0 2px 10px rgba(0,0,0,0.5)"
//         }}>
//           {mediaPipeMode ? (
//             <>
//               📡 Full Body {landmarks?.pose ? "✅" : "⏳"}
//             </>
//           ) : (
//             <>
//               🎮 Manual Mode
//             </>
//           )}
//         </div>

//         <div style={{
//           position: "absolute",
//           bottom: 15,
//           left: 15,
//           background: "rgba(0,0,0,0.7)",
//           color: "#0f0",
//           padding: "12px",
//           borderRadius: "8px",
//           fontSize: "11px",
//           fontFamily: "monospace",
//           border: "1px solid #0f0"
//         }}>
//           <div>📊 Pose: {trackingStats.pose}</div>
//           <div>🤚 L-Hand: {trackingStats.leftHand}</div>
//           <div>🤚 R-Hand: {trackingStats.rightHand}</div>
//         </div>
//       </div>

//       <div style={{
//         width: "350px",
//         overflowY: "auto",
//         borderLeft: "1px solid #333",
//         padding: "20px",
//         backgroundColor: "#222"
//       }}>
//         <h2 style={{ marginTop: 0, marginBottom: "10px" }}>🦴 Full Body</h2>

//         <div style={{
//           marginBottom: "20px",
//           padding: "15px",
//           background: "#333",
//           borderRadius: "8px"
//         }}>
//           <label style={{
//             display: "flex",
//             alignItems: "center",
//             cursor: "pointer",
//             gap: "10px"
//           }}>
//             <input
//               type="checkbox"
//               checked={mediaPipeMode}
//               onChange={(e) => setMediaPipeMode(e.target.checked)}
//               style={{ width: "20px", height: "20px" }}
//             />
//             <span>Enable Tracking</span>
//           </label>
//         </div>

//         {!mediaPipeMode && bonesList.length > 0 && (
//           <>
//             <div style={{
//               marginBottom: "15px",
//               maxHeight: "200px",
//               overflowY: "scroll",
//               border: "1px solid #444",
//               borderRadius: "6px"
//             }}>
//               {bonesList.map((boneName) => (
//                 <div
//                   key={boneName}
//                   onClick={() => setSelectedBone(boneName)}
//                   style={{
//                     padding: "8px 12px",
//                     cursor: "pointer",
//                     backgroundColor: selectedBone === boneName ? "#4488ff" : "transparent",
//                     color: selectedBone === boneName ? "white" : "#ddd",
//                     borderBottom: "1px solid #333",
//                     fontSize: "12px"
//                   }}
//                 >
//                   {boneName}
//                 </div>
//               ))}
//             </div>

//             {selectedBone && (
//               <div style={{ backgroundColor: "#333", padding: "15px", borderRadius: "8px" }}>
//                 <h4 style={{ marginTop: 0, color: "#4488ff" }}>{selectedBone}</h4>
//                 {["x", "y", "z"].map((axis) => (
//                   <div key={axis} style={{ marginBottom: "12px" }}>
//                     <label style={{ fontSize: "12px" }}>Rotation {axis}: {getRotation(selectedBone, axis).toFixed(0)}°</label>
//                     <input
//                       type="range"
//                       min="-180"
//                       max="180"
//                       step="1"
//                       value={getRotation(selectedBone, axis)}
//                       onChange={(e) => updateRotation(axis, e.target.value)}
//                       style={{ width: "100%", cursor: "pointer" }}
//                     />
//                   </div>
//                 ))}
//                 <button onClick={resetAll} style={{ width: "100%", padding: "8px", background: "#ff4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Reset All</button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

//TRY - 3 (fingers aur moving but not good)
// import React, { useState, useEffect, useRef, Suspense } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
// import * as THREE from "three";
// import useLandmarks from "../hooks/useLandmarks";
// import { solveTwoBoneIK } from "../utils/ikSolver";
// useGLTF.preload("/models/standing.glb");

// function Model({ boneRotations, mediaPipeMode, landmarks, onBonesLoaded }) {
//   const { scene, nodes } = useGLTF("/models/standing.glb");
//   const modelRef = useRef();
//   const restPoseRef = useRef({});
//   const bonesDetectedRef = useRef(false);

//   // DETECT BONES AND CAPTURE REST POSE
//   useEffect(() => {
//     if (!bonesDetectedRef.current && scene && nodes) {
//       const restPose = {};
//       const boneList = [];

//       scene.traverse((obj) => {
//         if (obj.isBone) {
//           boneList.push(obj.name);
//           restPose[obj.name] = {
//             quat: obj.quaternion.clone(),
//             euler: new THREE.Euler(obj.rotation.x, obj.rotation.y, obj.rotation.z, obj.rotation.order)
//           };
//         }
//       });

//       restPoseRef.current = restPose;
//       onBonesLoaded(boneList);
//       bonesDetectedRef.current = true;
//       console.log("✅ REST POSE CAPTURED FOR", Object.keys(restPose).length, "BONES");
//     }
//   }, [scene, nodes, onBonesLoaded]);

//   // MediaPipe coordinate conversion
//   const mp = (lm) => ({
//     x: (lm.x - 0.5) * 2,
//     y: -(lm.y - 0.5) * 2,
//     z: -lm.z * 2
//   });

//   const angle2D = (from, to) => {
//     const dx = to.x - from.x;
//     const dy = to.y - from.y;
//     return Math.atan2(dy, dx);
//   };

//   const distance = (p1, p2) => {
//     const dx = p2.x - p1.x;
//     const dy = p2.y - p1.y;
//     const dz = p2.z - p1.z;
//     return Math.sqrt(dx * dx + dy * dy + dz * dz);
//   };

//   // Apply rotation with rest pose
//   const rotateBone = (boneName, axis, angle, clampMin, clampMax) => {
//     const bone = nodes[boneName];
//     if (!bone || !bone.isBone) return false;

//     const restPose = restPoseRef.current[boneName];
//     if (!restPose) return false;

//     const clampedAngle = THREE.MathUtils.clamp(angle, clampMin, clampMax);
//     const tempQuat = new THREE.Quaternion();
//     tempQuat.setFromAxisAngle(axis, clampedAngle);

//     bone.quaternion.copy(restPose.quat).multiply(tempQuat);
//     return true;
//   };

//   useFrame(() => {
//     if (!nodes) return;

//     // ===== MANUAL MODE =====
//     if (!mediaPipeMode) {
//       Object.keys(boneRotations).forEach((boneName) => {
//         const bone = nodes[boneName];
//         if (bone?.isBone) {
//           const { x, y, z } = boneRotations[boneName];
//           bone.rotation.x = THREE.MathUtils.degToRad(x);
//           bone.rotation.y = THREE.MathUtils.degToRad(y);
//           bone.rotation.z = THREE.MathUtils.degToRad(z);
//         }
//       });
//       return;
//     }

//     // ===== MEDIAPIPE MODE =====
//     if (!landmarks?.pose) return;

//     const p = landmarks.pose;
//     const lh = landmarks.left_hand || {};
//     const rh = landmarks.right_hand || {};

//     const axisX = new THREE.Vector3(1, 0, 0);
//     const axisY = new THREE.Vector3(0, 1, 0);
//     const axisZ = new THREE.Vector3(0, 0, 1);

//     // ===== HEAD (nose + ears) =====
//     if (p.NOSE && p.LEFT_EAR && p.RIGHT_EAR) {
//       const nose = mp(p.NOSE);
//       const leftEar = mp(p.LEFT_EAR);
//       const rightEar = mp(p.RIGHT_EAR);

//       const headTilt = angle2D(leftEar, rightEar);
//       rotateBone("mixamorigHead", axisZ, headTilt, -Math.PI / 4, Math.PI / 4);
//     }

//     // ===== NECK =====
//     if (p.NOSE && p.LEFT_SHOULDER && p.RIGHT_SHOULDER) {
//       const nose = mp(p.NOSE);
//       const leftShoulder = mp(p.LEFT_SHOULDER);
//       const rightShoulder = mp(p.RIGHT_SHOULDER);

//       const shoulderMid = {
//         x: (leftShoulder.x + rightShoulder.x) / 2,
//         y: (leftShoulder.y + rightShoulder.y) / 2,
//         z: (leftShoulder.z + rightShoulder.z) / 2
//       };

//       const neckTilt = angle2D(shoulderMid, nose);
//       rotateBone("mixamorigNeck", axisZ, neckTilt, -Math.PI / 6, Math.PI / 6);
//     }

//     // ===== SPINE (shoulder to hip angle) =====
//     if (p.LEFT_SHOULDER && p.RIGHT_SHOULDER && p.LEFT_HIP && p.RIGHT_HIP) {
//       const leftShoulder = mp(p.LEFT_SHOULDER);
//       const rightShoulder = mp(p.RIGHT_SHOULDER);
//       const leftHip = mp(p.LEFT_HIP);
//       const rightHip = mp(p.RIGHT_HIP);

//       const shoulderAngle = angle2D(leftShoulder, rightShoulder);
//       const hipAngle = angle2D(leftHip, rightHip);
//       const spineRotation = (shoulderAngle - hipAngle) * 0.15;

//       rotateBone("mixamorigSpine", axisZ, spineRotation, -Math.PI / 6, Math.PI / 6);
//       rotateBone("mixamorigSpine1", axisZ, spineRotation * 0.7, -Math.PI / 8, Math.PI / 8);
//       rotateBone("mixamorigSpine2", axisZ, spineRotation * 0.5, -Math.PI / 10, Math.PI / 10);
//     }

//     // ===== LEFT ARM CHAIN =====
//     if (p.LEFT_SHOULDER && p.LEFT_ELBOW && p.LEFT_WRIST) {
//       const s = mp(p.LEFT_SHOULDER);
//       const e = mp(p.LEFT_ELBOW);
//       const w = mp(p.LEFT_WRIST);

//       const armAngle = angle2D(s, e);
//       const forearmAngle = angle2D(e, w);

//       rotateBone("mixamorigLeftArm", axisZ, -armAngle - Math.PI / 4, -Math.PI, Math.PI / 2);
//       rotateBone("mixamorigLeftForeArm", axisZ, -forearmAngle + Math.PI / 2, -Math.PI / 2, Math.PI / 4);

//       // Hand
//       if (p.LEFT_INDEX && p.LEFT_PINKY) {
//         const index = mp(p.LEFT_INDEX);
//         const pinky = mp(p.LEFT_PINKY);
//         const handAngle = angle2D(pinky, index);
//         rotateBone("mixamorigLeftHand", axisZ, -handAngle, -Math.PI, Math.PI);
//       }
//     }

//     // ===== RIGHT ARM CHAIN =====
//     if (p.RIGHT_SHOULDER && p.RIGHT_ELBOW && p.RIGHT_WRIST) {
//       const s = mp(p.RIGHT_SHOULDER);
//       const e = mp(p.RIGHT_ELBOW);
//       const w = mp(p.RIGHT_WRIST);

//       const armAngle = angle2D(s, e);
//       const forearmAngle = angle2D(e, w);

//       rotateBone("mixamorigRightArm", axisZ, armAngle + Math.PI / 4, -Math.PI / 2, Math.PI);
//       rotateBone("mixamorigRightForeArm", axisZ, forearmAngle - Math.PI / 2, -Math.PI / 4, Math.PI / 2);

//       // Hand
//       if (p.RIGHT_INDEX && p.RIGHT_PINKY) {
//         const index = mp(p.RIGHT_INDEX);
//         const pinky = mp(p.RIGHT_PINKY);
//         const handAngle = angle2D(pinky, index);
//         rotateBone("mixamorigRightHand", axisZ, handAngle, -Math.PI, Math.PI);
//       }
//     }

//     // ===== LEFT HAND FINGERS (MediaPipe 21 landmarks) =====
//     if (Object.keys(lh).length > 10) {
//       // Thumb (indices 1-4, using 2 and 4 for angle)
//       if (lh[2] && lh[4]) {
//         const p1 = mp(lh[2]);
//         const p2 = mp(lh[4]);
//         const angle = angle2D(p1, p2);
//         rotateBone("mixamorigLeftHandThumb1", axisZ, angle, -Math.PI, Math.PI);
//         rotateBone("mixamorigLeftHandThumb2", axisZ, angle * 0.7, -Math.PI, Math.PI);
//         rotateBone("mixamorigLeftHandThumb3", axisZ, angle * 0.5, -Math.PI, Math.PI);
//       }

//       // Index (indices 5-8, using 6 and 8)
//       if (lh[6] && lh[8]) {
//         const p1 = mp(lh[6]);
//         const p2 = mp(lh[8]);
//         const angle = angle2D(p1, p2);
//         rotateBone("mixamorigLeftHandIndex1", axisZ, -angle, -Math.PI, Math.PI);
//         rotateBone("mixamorigLeftHandIndex2", axisZ, -angle * 0.8, -Math.PI, Math.PI);
//         rotateBone("mixamorigLeftHandIndex3", axisZ, -angle * 0.6, -Math.PI, Math.PI);
//       }

//       // Middle (indices 9-12, using 10 and 12)
//       if (lh[10] && lh[12]) {
//         const p1 = mp(lh[10]);
//         const p2 = mp(lh[12]);
//         const angle = angle2D(p1, p2);
//         rotateBone("mixamorigLeftHandMiddle1", axisZ, -angle, -Math.PI, Math.PI);
//         rotateBone("mixamorigLeftHandMiddle2", axisZ, -angle * 0.8, -Math.PI, Math.PI);
//         rotateBone("mixamorigLeftHandMiddle3", axisZ, -angle * 0.6, -Math.PI, Math.PI);
//       }

//       // Ring (indices 13-16, using 14 and 16)
//       if (lh[14] && lh[16]) {
//         const p1 = mp(lh[14]);
//         const p2 = mp(lh[16]);
//         const angle = angle2D(p1, p2);
//         rotateBone("mixamorigLeftHandRing1", axisZ, -angle, -Math.PI, Math.PI);
//         rotateBone("mixamorigLeftHandRing2", axisZ, -angle * 0.8, -Math.PI, Math.PI);
//         rotateBone("mixamorigLeftHandRing3", axisZ, -angle * 0.6, -Math.PI, Math.PI);
//       }

//       // Pinky (indices 17-20, using 18 and 20)
//       if (lh[18] && lh[20]) {
//         const p1 = mp(lh[18]);
//         const p2 = mp(lh[20]);
//         const angle = angle2D(p1, p2);
//         rotateBone("mixamorigLeftHandPinky1", axisZ, -angle, -Math.PI, Math.PI);
//         rotateBone("mixamorigLeftHandPinky2", axisZ, -angle * 0.8, -Math.PI, Math.PI);
//         rotateBone("mixamorigLeftHandPinky3", axisZ, -angle * 0.6, -Math.PI, Math.PI);
//       }
//     }

//     // ===== RIGHT HAND FINGERS =====
//     if (Object.keys(rh).length > 10) {
//       // Thumb
//       if (rh[2] && rh[4]) {
//         const p1 = mp(rh[2]);
//         const p2 = mp(rh[4]);
//         const angle = angle2D(p1, p2);
//         rotateBone("mixamorigRightHandThumb1", axisZ, -angle, -Math.PI, Math.PI);
//         rotateBone("mixamorigRightHandThumb2", axisZ, -angle * 0.7, -Math.PI, Math.PI);
//         rotateBone("mixamorigRightHandThumb3", axisZ, -angle * 0.5, -Math.PI, Math.PI);
//       }

//       // Index
//       if (rh[6] && rh[8]) {
//         const p1 = mp(rh[6]);
//         const p2 = mp(rh[8]);
//         const angle = angle2D(p1, p2);
//         rotateBone("mixamorigRightHandIndex1", axisZ, angle, -Math.PI, Math.PI);
//         rotateBone("mixamorigRightHandIndex2", axisZ, angle * 0.8, -Math.PI, Math.PI);
//         rotateBone("mixamorigRightHandIndex3", axisZ, angle * 0.6, -Math.PI, Math.PI);
//       }

//       // Middle
//       if (rh[10] && rh[12]) {
//         const p1 = mp(rh[10]);
//         const p2 = mp(rh[12]);
//         const angle = angle2D(p1, p2);
//         rotateBone("mixamorigRightHandMiddle1", axisZ, angle, -Math.PI, Math.PI);
//         rotateBone("mixamorigRightHandMiddle2", axisZ, angle * 0.8, -Math.PI, Math.PI);
//         rotateBone("mixamorigRightHandMiddle3", axisZ, angle * 0.6, -Math.PI, Math.PI);
//       }

//       // Ring
//       if (rh[14] && rh[16]) {
//         const p1 = mp(rh[14]);
//         const p2 = mp(rh[16]);
//         const angle = angle2D(p1, p2);
//         rotateBone("mixamorigRightHandRing1", axisZ, angle, -Math.PI, Math.PI);
//         rotateBone("mixamorigRightHandRing2", axisZ, angle * 0.8, -Math.PI, Math.PI);
//         rotateBone("mixamorigRightHandRing3", axisZ, angle * 0.6, -Math.PI, Math.PI);
//       }

//       // Pinky
//       if (rh[18] && rh[20]) {
//         const p1 = mp(rh[18]);
//         const p2 = mp(rh[20]);
//         const angle = angle2D(p1, p2);
//         rotateBone("mixamorigRightHandPinky1", axisZ, angle, -Math.PI, Math.PI);
//         rotateBone("mixamorigRightHandPinky2", axisZ, angle * 0.8, -Math.PI, Math.PI);
//         rotateBone("mixamorigRightHandPinky3", axisZ, angle * 0.6, -Math.PI, Math.PI);
//       }
//     }

//     // ===== LEGS =====
//     if (p.LEFT_HIP && p.LEFT_KNEE && p.LEFT_ANKLE) {
//       const h = mp(p.LEFT_HIP);
//       const k = mp(p.LEFT_KNEE);
//       const a = mp(p.LEFT_ANKLE);

//       const hipKneeAngle = angle2D(h, k);
//       const kneeAnkleAngle = angle2D(k, a);

//       rotateBone("mixamorigLeftUpLeg", axisX, hipKneeAngle * 0.4, -Math.PI / 2, 0);
//       rotateBone("mixamorigLeftLeg", axisX, kneeAnkleAngle * 0.4, 0, Math.PI / 2);
//       rotateBone("mixamorigLeftFoot", axisX, kneeAnkleAngle * 0.2, -Math.PI / 4, Math.PI / 4);
//     }

//     if (p.RIGHT_HIP && p.RIGHT_KNEE && p.RIGHT_ANKLE) {
//       const h = mp(p.RIGHT_HIP);
//       const k = mp(p.RIGHT_KNEE);
//       const a = mp(p.RIGHT_ANKLE);

//       const hipKneeAngle = angle2D(h, k);
//       const kneeAnkleAngle = angle2D(k, a);

//       rotateBone("mixamorigRightUpLeg", axisX, hipKneeAngle * 0.4, -Math.PI / 2, 0);
//       rotateBone("mixamorigRightLeg", axisX, kneeAnkleAngle * 0.4, 0, Math.PI / 2);
//       rotateBone("mixamorigRightFoot", axisX, kneeAnkleAngle * 0.2, -Math.PI / 4, Math.PI / 4);
//     }
//   });

//   return (
//     <primitive
//       ref={modelRef}
//       object={scene}
//       scale={1.3}
//       position={[0, -0.5, 0]}
//     />
//   );
// }

// function Loader() {
//   return (
//     <mesh>
//       <boxGeometry args={[1, 2, 0.5]} />
//       <meshStandardMaterial color="hotpink" />
//     </mesh>
//   );
// }

// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();
//   const [bonesList, setBonesList] = useState([]);
//   const [selectedBone, setSelectedBone] = useState(null);
//   const [boneRotations, setBoneRotations] = useState({});
//   const [mediaPipeMode, setMediaPipeMode] = useState(true);
//   const [trackingStats, setTrackingStats] = useState({});

//   useEffect(() => {
//     if (landmarks) {
//       setTrackingStats({
//         pose: landmarks.pose ? Object.keys(landmarks.pose).length : 0,
//         leftHand: landmarks.left_hand ? Object.keys(landmarks.left_hand).length : 0,
//         rightHand: landmarks.right_hand ? Object.keys(landmarks.right_hand).length : 0,
//       });
//     }
//   }, [landmarks]);

//   const updateRotation = (axis, value) => {
//     if (!selectedBone) return;
//     setBoneRotations((prev) => ({
//       ...prev,
//       [selectedBone]: {
//         ...(prev[selectedBone] || { x: 0, y: 0, z: 0 }),
//         [axis]: parseFloat(value),
//       },
//     }));
//   };

//   const getRotation = (bone, axis) => {
//     return boneRotations[bone]?.[axis] || 0;
//   };

//   const resetBone = () => {
//     if (!selectedBone) return;
//     setBoneRotations(prev => ({
//       ...prev,
//       [selectedBone]: { x: 0, y: 0, z: 0 }
//     }));
//   };

//   const resetAll = () => {
//     setBoneRotations({});
//   };

//   return (
//     <div style={{
//       width: "100%",
//       height: "100vh",
//       display: "flex",
//       backgroundColor: "#1a1a1a",
//       color: "white",
//       fontFamily: "sans-serif"
//     }}>

//       <div style={{ flex: 1, position: "relative" }}>
//         <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
//           <ambientLight intensity={0.6} />
//           <directionalLight position={[5, 10, 7]} intensity={1.2} />
//           <directionalLight position={[-5, 5, -7]} intensity={0.6} />
//           <Environment preset="city" />

//           <Suspense fallback={<Loader />}>
//             <Model
//               boneRotations={boneRotations}
//               mediaPipeMode={mediaPipeMode}
//               landmarks={landmarks}
//               onBonesLoaded={setBonesList}
//             />
//           </Suspense>

//           <ContactShadows
//             opacity={0.4}
//             scale={10}
//             blur={1.5}
//             far={10}
//             resolution={256}
//             color="#000000"
//           />
//           <OrbitControls target={[0, 1, 0]} />
//         </Canvas>

//         <div style={{
//           position: "absolute",
//           top: 15,
//           left: 15,
//           background: mediaPipeMode && landmarks?.pose ? "#1e5128" : "#333",
//           color: "white",
//           padding: "12px 18px",
//           borderRadius: "8px",
//           fontSize: "13px",
//           fontWeight: "600",
//           boxShadow: "0 2px 10px rgba(0,0,0,0.5)"
//         }}>
//           {mediaPipeMode ? (
//             <>
//               📡 Full Body {landmarks?.pose ? "✅" : "⏳"}
//             </>
//           ) : (
//             <>
//               🎮 Manual Mode
//             </>
//           )}
//         </div>

//         <div style={{
//           position: "absolute",
//           bottom: 15,
//           left: 15,
//           background: "rgba(0,0,0,0.7)",
//           color: "#0f0",
//           padding: "12px",
//           borderRadius: "8px",
//           fontSize: "11px",
//           fontFamily: "monospace",
//           border: "1px solid #0f0"
//         }}>
//           <div>📊 Pose: {trackingStats.pose}</div>
//           <div>🤚 L-Hand: {trackingStats.leftHand}</div>
//           <div>🤚 R-Hand: {trackingStats.rightHand}</div>
//         </div>
//       </div>

//       <div style={{
//         width: "350px",
//         overflowY: "auto",
//         borderLeft: "1px solid #333",
//         padding: "20px",
//         backgroundColor: "#222"
//       }}>
//         <h2 style={{ marginTop: 0, marginBottom: "10px" }}>🦴 Full Body</h2>

//         <div style={{
//           marginBottom: "20px",
//           padding: "15px",
//           background: "#333",
//           borderRadius: "8px"
//         }}>
//           <label style={{
//             display: "flex",
//             alignItems: "center",
//             cursor: "pointer",
//             gap: "10px"
//           }}>
//             <input
//               type="checkbox"
//               checked={mediaPipeMode}
//               onChange={(e) => setMediaPipeMode(e.target.checked)}
//               style={{ width: "20px", height: "20px" }}
//             />
//             <span>Enable Tracking</span>
//           </label>
//           <p style={{ margin: "10px 0 0 0", fontSize: "11px", color: "#888" }}>
//             {mediaPipeMode
//               ? "✅ Tracking: Head, Spine, Arms, Fingers, Legs"
//               : "Use sliders to manually control bones"
//             }
//           </p>
//         </div>

//         {!mediaPipeMode && bonesList.length > 0 && (
//           <>
//             <div style={{
//               marginBottom: "15px",
//               maxHeight: "200px",
//               overflowY: "scroll",
//               border: "1px solid #444",
//               borderRadius: "6px"
//             }}>
//               {bonesList.map((boneName) => (
//                 <div
//                   key={boneName}
//                   onClick={() => setSelectedBone(boneName)}
//                   style={{
//                     padding: "8px 12px",
//                     cursor: "pointer",
//                     backgroundColor: selectedBone === boneName ? "#4488ff" : "transparent",
//                     color: selectedBone === boneName ? "white" : "#ddd",
//                     borderBottom: "1px solid #333",
//                     fontSize: "11px"
//                   }}
//                 >
//                   {boneName}
//                 </div>
//               ))}
//             </div>

//             {selectedBone && (
//               <div style={{ backgroundColor: "#333", padding: "15px", borderRadius: "8px" }}>
//                 <h4 style={{ marginTop: 0, color: "#4488ff", fontSize: "13px" }}>{selectedBone}</h4>
//                 {["x", "y", "z"].map((axis) => (
//                   <div key={axis} style={{ marginBottom: "12px" }}>
//                     <label style={{ fontSize: "11px" }}>Rotation {axis}: {getRotation(selectedBone, axis).toFixed(0)}°</label>
//                     <input
//                       type="range"
//                       min="-180"
//                       max="180"
//                       step="1"
//                       value={getRotation(selectedBone, axis)}
//                       onChange={(e) => updateRotation(axis, e.target.value)}
//                       style={{ width: "100%", cursor: "pointer", height: "6px" }}
//                     />
//                   </div>
//                 ))}
//                 <div style={{ display: "flex", gap: "8px" }}>
//                   <button onClick={resetBone} style={{ flex: 1, padding: "8px", background: "#444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Reset</button>
//                   <button onClick={resetAll} style={{ flex: 1, padding: "8px", background: "#ff4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Clear All</button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}

//         <div style={{
//           marginTop: "20px",
//           padding: "12px",
//           background: "#2a2a2a",
//           borderRadius: "6px",
//           fontSize: "11px",
//           color: "#888",
//           lineHeight: "1.6"
//         }}>
//           <strong style={{ color: "#aaa" }}>🚀 Tracking:</strong><br/>
//           ✅ Head & Neck<br/>
//           ✅ Spine & Chest<br/>
//           ✅ Arms & Elbows<br/>
//           ✅ All 5 Fingers<br/>
//           ✅ Legs & Feet
//         </div>
//       </div>
//     </div>
//   );
// }


//TRY - 5 (not good)

// import React, { useState, useEffect, useRef, Suspense } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
// import * as THREE from "three";
// import useLandmarks from "../hooks/useLandmarks";

// useGLTF.preload("/models/standing.glb");

// /* ===========================
//    MODEL
// =========================== */
// function Model({ landmarks }) {
//   const { scene, nodes } = useGLTF("/models/standing.glb");
//   const restPose = useRef({});
//   const smooth = useRef({});
//   const ready = useRef(false);

//   /* ---- Capture Rest Pose ---- */
//   useEffect(() => {
//     scene.traverse((o) => {
//       if (o.isBone) {
//         restPose.current[o.name] = o.quaternion.clone();
//         smooth.current[o.name] = o.quaternion.clone();
//       }
//     });
//     ready.current = true;
//     console.log("✅ Rest pose captured");
//   }, [scene]);

//   /* ---- Helpers ---- */
//   const mp = (lm) => ({
//     x: (lm.x - 0.5) * 2,
//     y: -(lm.y - 0.5) * 2,
//     z: -lm.z * 2,
//   });

//   const angle2D = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

//   const apply = (bone, axis, angle, clamp = Math.PI) => {
//     if (!nodes[bone]) return;
//     const q = new THREE.Quaternion();
//     q.setFromAxisAngle(axis, THREE.MathUtils.clamp(angle, -clamp, clamp));
//     smooth.current[bone].slerp(
//       restPose.current[bone].clone().multiply(q),
//       0.25
//     );
//     nodes[bone].quaternion.copy(smooth.current[bone]);
//   };

//   /* ---- Animation ---- */
//   useFrame(() => {
//     if (!ready.current || !landmarks?.pose) return;
//     const p = landmarks.pose;

//     const X = new THREE.Vector3(1, 0, 0);
//     const Y = new THREE.Vector3(0, 1, 0);
//     const Z = new THREE.Vector3(0, 0, 1);

//     /* ===== ROOT LOCK ===== */
//     if (nodes.mixamorigHips) {
//       nodes.mixamorigHips.position.set(0, 0, 0);
//     }

//     /* ===== HEAD ===== */
//     if (p.LEFT_EAR && p.RIGHT_EAR) {
//       const a = mp(p.LEFT_EAR);
//       const b = mp(p.RIGHT_EAR);
//       apply("mixamorigHead", Z, angle2D(a, b), Math.PI / 6);
//     }

//     /* ===== ARMS ===== */
//     if (p.LEFT_SHOULDER && p.LEFT_ELBOW) {
//       apply(
//         "mixamorigLeftArm",
//         Z,
//         -angle2D(mp(p.LEFT_SHOULDER), mp(p.LEFT_ELBOW)) - Math.PI / 4
//       );
//     }

//     if (p.RIGHT_SHOULDER && p.RIGHT_ELBOW) {
//       apply(
//         "mixamorigRightArm",
//         Z,
//         angle2D(mp(p.RIGHT_SHOULDER), mp(p.RIGHT_ELBOW)) + Math.PI / 4
//       );
//     }

//     /* ===== FOREARMS ===== */
//     if (p.LEFT_ELBOW && p.LEFT_WRIST) {
//       apply(
//         "mixamorigLeftForeArm",
//         Z,
//         -angle2D(mp(p.LEFT_ELBOW), mp(p.LEFT_WRIST))
//       );
//     }

//     if (p.RIGHT_ELBOW && p.RIGHT_WRIST) {
//       apply(
//         "mixamorigRightForeArm",
//         Z,
//         angle2D(mp(p.RIGHT_ELBOW), mp(p.RIGHT_WRIST))
//       );
//     }

//     /* ===== LEGS ===== */
//     if (p.LEFT_HIP && p.LEFT_KNEE) {
//       apply(
//         "mixamorigLeftUpLeg",
//         X,
//         angle2D(mp(p.LEFT_HIP), mp(p.LEFT_KNEE)) * 0.5
//       );
//     }

//     if (p.LEFT_KNEE && p.LEFT_ANKLE) {
//       apply(
//         "mixamorigLeftLeg",
//         X,
//         angle2D(mp(p.LEFT_KNEE), mp(p.LEFT_ANKLE)) * 0.5
//       );
//     }

//     if (p.RIGHT_HIP && p.RIGHT_KNEE) {
//       apply(
//         "mixamorigRightUpLeg",
//         X,
//         angle2D(mp(p.RIGHT_HIP), mp(p.RIGHT_KNEE)) * 0.5
//       );
//     }

//     if (p.RIGHT_KNEE && p.RIGHT_ANKLE) {
//       apply(
//         "mixamorigRightLeg",
//         X,
//         angle2D(mp(p.RIGHT_KNEE), mp(p.RIGHT_ANKLE)) * 0.5
//       );
//     }
//   });

//   return <primitive object={scene} scale={1.3} position={[0, 0, 0]} />;
// }

// /* ===========================
//    MAIN CANVAS
// =========================== */
// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();

//   return (
//     <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
//       <ambientLight intensity={0.6} />
//       <directionalLight position={[5, 10, 5]} intensity={1.2} />
//       <Environment preset="city" />
//       <Suspense fallback={null}>
//         <Model landmarks={landmarks} />
//       </Suspense>
//       <ContactShadows scale={10} blur={2} opacity={0.4} />
//       <OrbitControls target={[0, 1, 0]} />
//     </Canvas>
//   );
// }


//TRY - 6 (It is not working src/utils/smooting/error)


// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
// import * as THREE from "three";
// import { useEffect, useRef } from "react";
// import useLandmarks from "../hooks/useLandmarks";
// import { solveTwoBoneIK } from "../utils/smoothing";

// useGLTF.preload("/models/standing.glb");

// function AvatarModel({ landmarks }) {
//   const { scene, nodes } = useGLTF("/models/standing.glb");

//   const restPose = useRef({});
//   const prevAngles = useRef({});
//   // ---------- WALK STATE ----------
//   const prevLeftAnkleY = useRef(null);
//   const prevRightAnkleY = useRef(null);
//   const walkPhase = useRef(0);
//   // -------- FOOT LOCK --------
//   const leftFootLocked = useRef(false);
//   const rightFootLocked = useRef(false);

//   const leftFootY = useRef(0);
//   const rightFootY = useRef(0);

//   // ---------- VERTICAL MOTION ----------
//   const baseHipY = useRef(null);
//   const verticalOffset = useRef(0);

//   // -------- ROOT MOTION --------
//   const rootPos = useRef(new THREE.Vector3(0, 0, 0));
//   const prevHipZ = useRef(null);
//   const GROUND_Y = -1; // floor height (model ke hisaab se adjust)


//   useEffect(() => {
//     scene.traverse((b) => {
//       if (b.isBone) restPose.current[b.name] = b.quaternion.clone();
//     });
//     console.log("✅ Rest pose stored");
//   }, [scene]);

//   const mp = (lm) => ({
//     x: (lm.x - 0.5) * 2,
//     y: -(lm.y - 0.5) * 2,
//   });

//   const angle2D = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

//   const apply = (name, axis, target) => {
//     const bone = nodes[name];
//     const rest = restPose.current[name];
//     if (!bone || !rest) return;

//     const prev = prevAngles.current[name] ?? target;
//     const smooth = prev + (target - prev) * 0.25;
//     prevAngles.current[name] = smooth;

//     const q = new THREE.Quaternion().setFromAxisAngle(axis, smooth);
//     bone.quaternion.copy(rest).multiply(q);
//   };

//   // ---------- BALANCE HELPERS ----------
//   const clamp = THREE.MathUtils.clamp;
//   const FOOT_LOCK_THRESHOLD = 0.008;
//   const WALK_THRESHOLD = 0.003;
//   const WALK_SPEED = 0.08;
//   const JUMP_THRESHOLD = 0.05;
//   const CROUCH_THRESHOLD = -0.05;
//   const VERTICAL_SPEED = 0.15;

//   // Smooth interpolation
//   const smooth = (current, target, factor = 0.2) =>
//     current + (target - current) * factor;

//   useFrame(() => {
//     if (!landmarks?.pose) return;
//     const p = landmarks.pose;

//     const Z = new THREE.Vector3(0, 0, 1);

//     if (
//   p.LEFT_HIP &&
//   p.LEFT_KNEE &&
//   p.LEFT_ANKLE
// ) {
//   const hip = nodes.mixamorigLeftUpLeg;
//   const knee = nodes.mixamorigLeftLeg;
//   const ankle = nodes.mixamorigLeftFoot;

//   if (hip && knee && ankle) {
//     const target = new THREE.Vector3(
//       (p.LEFT_ANKLE.x - 0.5) * 2,
//       Math.max(GROUND_Y, -(p.LEFT_ANKLE.y - 0.5) * 2),
//       -p.LEFT_ANKLE.z * 2
//     );

//     const pole = new THREE.Vector3(0, 0, 1); // knee forward

//     solveTwoBoneIK({
//       root: hip,
//       mid: knee,
//       end: ankle,
//       target,
//       pole,
//     });
//   }
// }
//       if (
//   p.RIGHT_HIP &&
//   p.RIGHT_KNEE &&
//   p.RIGHT_ANKLE
// ) {
//   const hip = nodes.mixamorigRightUpLeg;
//   const knee = nodes.mixamorigRightLeg;
//   const ankle = nodes.mixamorigRightFoot;

//   if (hip && knee && ankle) {
//     const target = new THREE.Vector3(
//       (p.RIGHT_ANKLE.x - 0.5) * 2,
//       Math.max(GROUND_Y, -(p.RIGHT_ANKLE.y - 0.5) * 2),
//       -p.RIGHT_ANKLE.z * 2
//     );

//     const pole = new THREE.Vector3(0, 0, 1);

//     solveTwoBoneIK({
//       root: hip,
//       mid: knee,
//       end: ankle,
//       target,
//       pole,
//     });
//   }
// }
//       if (nodes.mixamorigLeftFoot && p.LEFT_FOOT_INDEX) {
//   nodes.mixamorigLeftFoot.rotation.x =
//     THREE.MathUtils.clamp(
//       (p.LEFT_FOOT_INDEX.y - p.LEFT_ANKLE.y) * 3,
//       -0.5,
//       0.5
//     );
// }


//     // ===============================
//     // 🚶 ROOT MOTION (FORWARD WALK)
//     // ===============================
//     if (p.LEFT_HIP && p.RIGHT_HIP && nodes.mixamorigHips) {
//       const lHip = mp(p.LEFT_HIP);
//       const rHip = mp(p.RIGHT_HIP);

//       const avgHipZ = (lHip.z + rHip.z) / 2;

//       if (prevHipZ.current === null) {
//         prevHipZ.current = avgHipZ;
//       }

//       const deltaZ = avgHipZ - prevHipZ.current;
//       prevHipZ.current = avgHipZ;

//       // Walking detected
//       if (Math.abs(deltaZ) > WALK_THRESHOLD) {
//         rootPos.current.z -= deltaZ * WALK_SPEED;
//       }

//       // Apply to model root
//       nodes.mixamorigHips.position.z = rootPos.current.z;
//     }
//     // ===============================
//     // 🦘 JUMP / 🧎 CROUCH
//     // ===============================
//     if (p.LEFT_HIP && p.RIGHT_HIP && nodes.mixamorigHips) {
//       const lHip = mp(p.LEFT_HIP);
//       const rHip = mp(p.RIGHT_HIP);

//       const avgHipY = (lHip.y + rHip.y) / 2;

//       // Capture standing height once
//       if (baseHipY.current === null) {
//         baseHipY.current = avgHipY;
//       }

//       const deltaY = avgHipY - baseHipY.current;

//       // JUMP
//       if (deltaY > JUMP_THRESHOLD) {
//         verticalOffset.current += deltaY * VERTICAL_SPEED;
//       }

//       // CROUCH
//       if (deltaY < CROUCH_THRESHOLD) {
//         verticalOffset.current += deltaY * VERTICAL_SPEED;
//       }

//       // Gravity return (smooth reset)
//       verticalOffset.current *= 0.92;

//       nodes.mixamorigHips.position.y = verticalOffset.current;
//     }

//     // ===============================
//     // 🚶 WALK / STEP DETECTION
//     // ===============================
//     if (
//       p.LEFT_ANKLE &&
//       p.RIGHT_ANKLE &&
//       nodes.mixamorigLeftUpLeg &&
//       nodes.mixamorigRightUpLeg &&
//       nodes.mixamorigLeftLeg &&
//       nodes.mixamorigRightLeg
//     ) {
//       const leftY = p.LEFT_ANKLE.y;
//       const rightY = p.RIGHT_ANKLE.y;

//       // Init previous values
//       if (prevLeftAnkleY.current === null) {
//         prevLeftAnkleY.current = leftY;
//         prevRightAnkleY.current = rightY;
//       }

//       // Velocity (movement detection)
//       const leftVel = prevLeftAnkleY.current - leftY;
//       const rightVel = prevRightAnkleY.current - rightY;

//       prevLeftAnkleY.current = leftY;
//       prevRightAnkleY.current = rightY;

//       // If either foot moving → walking
//       const isWalking = Math.abs(leftVel) > 0.005 || Math.abs(rightVel) > 0.005;

//       if (isWalking) {
//         walkPhase.current += 0.08;
//       } else {
//         walkPhase.current *= 0.9; // decay
//       }

//       // Sine wave walk cycle
//       const walkSin = Math.sin(walkPhase.current);
//       const walkCos = Math.cos(walkPhase.current);

//       // ---------------- LEFT LEG ----------------
//       nodes.mixamorigLeftUpLeg.rotation.x = smooth(
//         nodes.mixamorigLeftUpLeg.rotation.x,
//         clamp(walkSin * 0.6, -0.8, 0.8)
//       );

//       nodes.mixamorigLeftLeg.rotation.x = smooth(
//         nodes.mixamorigLeftLeg.rotation.x,
//         clamp(-walkSin * 0.4, -0.6, 0.6)
//       );

//       // ---------------- RIGHT LEG ----------------
//       nodes.mixamorigRightUpLeg.rotation.x = smooth(
//         nodes.mixamorigRightUpLeg.rotation.x,
//         clamp(-walkSin * 0.6, -0.8, 0.8)
//       );

//       nodes.mixamorigRightLeg.rotation.x = smooth(
//         nodes.mixamorigRightLeg.rotation.x,
//         clamp(walkSin * 0.4, -0.6, 0.6)
//       );
//     }

//     // ===== HEAD =====
//     if (p.LEFT_EAR && p.RIGHT_EAR) {
//       const a = angle2D(mp(p.LEFT_EAR), mp(p.RIGHT_EAR));
//       apply("mixamorigHead", Z, a * 0.6);
//     }

//     // ===== LEFT ARM =====
//     if (p.LEFT_SHOULDER && p.LEFT_ELBOW && p.LEFT_WRIST) {
//       const shoulder = nodes.mixamorigLeftArm;
//       const elbow = nodes.mixamorigLeftForeArm;
//       const wrist = nodes.mixamorigLeftHand;

//       if (shoulder && elbow && wrist) {
//         const target = new THREE.Vector3(
//           (p.LEFT_WRIST.x - 0.5) * 2,
//           -(p.LEFT_WRIST.y - 0.5) * 2,
//           -p.LEFT_WRIST.z * 2
//         );

//         const pole = new THREE.Vector3(0, 1, 0);

//         solveTwoBoneIK({
//           root: shoulder,
//           mid: elbow,
//           end: wrist,
//           target,
//           pole,
//         });
//       }
//     }

//     // ===== RIGHT ARM =====
//     if (p.RIGHT_SHOULDER && p.RIGHT_ELBOW) {
//       const a = angle2D(mp(p.RIGHT_SHOULDER), mp(p.RIGHT_ELBOW));
//       apply("mixamorigRightArm", Z, a + Math.PI / 4);
//     }

//     if (p.RIGHT_ELBOW && p.RIGHT_WRIST) {
//       const a = angle2D(mp(p.RIGHT_ELBOW), mp(p.RIGHT_WRIST));
//       apply("mixamorigRightForeArm", Z, a);
//     }

//     // ===============================
//     // 🦶 FOOT LOCKING (NO SLIDING)
//     // ===============================
//     if (
//       p.LEFT_ANKLE &&
//       p.RIGHT_ANKLE &&
//       nodes.mixamorigLeftFoot &&
//       nodes.mixamorigRightFoot
//     ) {
//       const lY = p.LEFT_ANKLE.y;
//       const rY = p.RIGHT_ANKLE.y;

//       // Initialize
//       if (leftFootY.current === 0) leftFootY.current = lY;
//       if (rightFootY.current === 0) rightFootY.current = rY;

//       const lDelta = Math.abs(lY - leftFootY.current);
//       const rDelta = Math.abs(rY - rightFootY.current);

//       // Lock detection
//       leftFootLocked.current = lDelta < FOOT_LOCK_THRESHOLD;
//       rightFootLocked.current = rDelta < FOOT_LOCK_THRESHOLD;

//       leftFootY.current = lY;
//       rightFootY.current = rY;

//       // LOCKED → keep foot flat
//       if (leftFootLocked.current) {
//         nodes.mixamorigLeftFoot.rotation.x = smooth(
//           nodes.mixamorigLeftFoot.rotation.x,
//           0,
//           0.4
//         );
//       }

//       if (rightFootLocked.current) {
//         nodes.mixamorigRightFoot.rotation.x = smooth(
//           nodes.mixamorigRightFoot.rotation.x,
//           0,
//           0.4
//         );
//       }
//     }

//     if (p.LEFT_HIP && p.LEFT_KNEE && p.LEFT_ANKLE) {
//       const hip = mp(p.LEFT_HIP);
//       const knee = mp(p.LEFT_KNEE);
//       const ankle = mp(p.LEFT_ANKLE);

//       const upper = angle2D(hip, knee);
//       const lower = angle2D(knee, ankle);

//       apply("mixamorigLeftUpLeg", X, -upper * 0.6, -1.2, 0.8);
//       apply("mixamorigLeftLeg", X, -lower * 0.6, -0.8, 1.2);
//     }

//     /* ---------- RIGHT LEG ---------- */
//     if (p.RIGHT_HIP && p.RIGHT_KNEE && p.RIGHT_ANKLE) {
//       const hip = mp(p.RIGHT_HIP);
//       const knee = mp(p.RIGHT_KNEE);
//       const ankle = mp(p.RIGHT_ANKLE);

//       const upper = angle2D(hip, knee);
//       const lower = angle2D(knee, ankle);

//       apply("mixamorigRightUpLeg", X, -upper * 0.6, -1.2, 0.8);
//       apply("mixamorigRightLeg", X, -lower * 0.6, -0.8, 1.2);
//     }

//     // ===============================
//     // 🧍 BODY BALANCE & WEIGHT SHIFT
//     // ===============================
//     if (
//       p.LEFT_ANKLE &&
//       p.RIGHT_ANKLE &&
//       nodes.mixamorigHips &&
//       nodes.mixamorigSpine
//     ) {
//       const leftAnkleY = p.LEFT_ANKLE.y;
//       const rightAnkleY = p.RIGHT_ANKLE.y;

//       // Difference tells which leg is lifted
//       const weightDiff = clamp(rightAnkleY - leftAnkleY, -0.25, 0.25);

//       // ---------------- HIP ----------------
//       const hips = nodes.mixamorigHips;

//       // Side lean (Z) → balance
//       const hipTiltZ = weightDiff * 0.8;

//       // Small X shift → center of mass
//       const hipShiftX = weightDiff * 0.15;

//       hips.rotation.z = smooth(hips.rotation.z, hipTiltZ);
//       hips.position.x = smooth(hips.position.x, hipShiftX);

//       // ---------------- SPINE ----------------
//       const spine = nodes.mixamorigSpine;

//       // Counter balance
//       const spineTiltZ = -hipTiltZ * 0.6;

//       spine.rotation.z = smooth(spine.rotation.z, spineTiltZ);
//     }

//     /* ---------- HIP STABILITY ---------- */
//     if (p.LEFT_HIP && p.RIGHT_HIP) {
//       const l = mp(p.LEFT_HIP);
//       const r = mp(p.RIGHT_HIP);
//       const tilt = angle2D(l, r) * 0.25;
//       apply("mixamorigHips", Z, tilt, -0.3, 0.3);
//     }

//     // ===============================
//     // 🟡 PHASE-2: FINGER TRACKING ONLY
//     // ===============================

//     const smooth = 0.3; // smoothing factor

//     function fingerCurl(base, tip) {
//       const d = Math.sqrt(
//         Math.pow(tip.x - base.x, 2) +
//           Math.pow(tip.y - base.y, 2) +
//           Math.pow(tip.z - base.z, 2)
//       );

//       // distance → curl mapping
//       // open ≈ 0.08, closed ≈ 0.02 (approx)
//       return THREE.MathUtils.clamp(
//         THREE.MathUtils.mapLinear(d, 0.02, 0.08, 1.2, 0),
//         0,
//         1.2
//       );
//     }

//     // ===== LEFT HAND =====
//     if (
//       landmarks?.left_hand &&
//       Object.keys(landmarks.left_hand).length === 21
//     ) {
//       const lh = landmarks.left_hand;

//       const fingers = [
//         { bone: "mixamorigLeftHandIndex1", base: 5, tip: 8 },
//         { bone: "mixamorigLeftHandMiddle1", base: 9, tip: 12 },
//         { bone: "mixamorigLeftHandRing1", base: 13, tip: 16 },
//         { bone: "mixamorigLeftHandPinky1", base: 17, tip: 20 },
//         { bone: "mixamorigLeftHandThumb1", base: 2, tip: 4 },
//       ];

//       fingers.forEach(({ bone, base, tip }) => {
//         const b = nodes[bone];
//         if (!b) return;

//         const curl = fingerCurl(lh[base], lh[tip]);

//         b.rotation.x = THREE.MathUtils.lerp(b.rotation.x, curl, smooth);
//       });
//     }

//     // ===== RIGHT HAND =====
//     if (
//       landmarks?.right_hand &&
//       Object.keys(landmarks.right_hand).length === 21
//     ) {
//       const rh = landmarks.right_hand;

//       const fingers = [
//         { bone: "mixamorigRightHandIndex1", base: 5, tip: 8 },
//         { bone: "mixamorigRightHandMiddle1", base: 9, tip: 12 },
//         { bone: "mixamorigRightHandRing1", base: 13, tip: 16 },
//         { bone: "mixamorigRightHandPinky1", base: 17, tip: 20 },
//         { bone: "mixamorigRightHandThumb1", base: 2, tip: 4 },
//       ];

//       fingers.forEach(({ bone, base, tip }) => {
//         const b = nodes[bone];
//         if (!b) return;

//         const curl = fingerCurl(rh[base], rh[tip]);

//         b.rotation.x = THREE.MathUtils.lerp(b.rotation.x, curl, smooth);
//       });
//     }
//   });

//   return <primitive object={scene} scale={1.3} position={[0, 0, 0]} />;
// }

// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();

//   return (
//     <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
//       <ambientLight intensity={0.7} />
//       <directionalLight position={[5, 10, 7]} intensity={1.2} />
//       <Environment preset="city" />
//       <AvatarModel landmarks={landmarks} />
//       <OrbitControls target={[0, 1, 0]} />
//     </Canvas>
//   );
// }







//TRY - 7 (hands are rotating faster beacause we have applied iksolver on it )


// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
// import * as THREE from "three";
// import { useEffect, useRef } from "react";
// import useLandmarks from "../hooks/useLandmarks";
// import { solveTwoBoneIK } from "../utils/ikSolver";
// import { createFilteredLandmarks } from "../utils/smoothing";
// import { classifyHandGesture } from "../../gestures/classifyGesture";
// import { getStableGesture } from "../../gestures/gestureState";
// import { gestureMap } from "../../gestures/gestureMap";
// import { classifyAlphabet } from "../../gestures/classifyAlphabet";
// // import { getStableGesture } from "../../gestures/gestureState";
// import { alphabetMap } from "../../gestures/alphabetMap";



// useGLTF.preload("/models/standing.glb");

// function AvatarModel({ landmarks }) {
//   const { scene, nodes } = useGLTF("/models/standing.glb");

//   const restPose = useRef({});
//   const prevAngles = useRef({});
//   const filteredLandmarks = useRef(createFilteredLandmarks());

//   // Walk state
//   const prevLeftAnkleY = useRef(null);
//   const prevRightAnkleY = useRef(null);
//   const walkPhase = useRef(0);

//   // Foot locking
//   const leftFootLocked = useRef(false);
//   const rightFootLocked = useRef(false);
//   const leftFootY = useRef(0);
//   const rightFootY = useRef(0);

//   // Vertical motion
//   const baseHipY = useRef(null);
//   const verticalOffset = useRef(0);

//   // Root motion
//   const rootPos = useRef(new THREE.Vector3(0, 0, 0));
//   const prevHipZ = useRef(null);

//   const GROUND_Y = -1;
//   const FOOT_LOCK_THRESHOLD = 0.008;
//   const WALK_THRESHOLD = 0.003;
//   const WALK_SPEED = 0.08;
//   const JUMP_THRESHOLD = 0.05;
//   const CROUCH_THRESHOLD = -0.05;
//   const VERTICAL_SPEED = 0.15;

//   // Initialize rest pose
//   useEffect(() => {
//     scene.traverse((b) => {
//       if (b.isBone) {
//         restPose.current[b.name] = b.quaternion.clone();
//       }
//     });
//     console.log("✅ Rest pose stored for", Object.keys(restPose.current).length, "bones");
//   }, [scene]);

//   // MediaPipe coordinate conversion
//   const mp = (lm) => ({
//     x: (lm.x - 0.5) * 2,
//     y: -(lm.y - 0.5) * 2,
//     z: -lm.z * 2,
//   });

//   // 2D angle calculation
//   const angle2D = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

//   // Smooth rotation application with exponential smoothing
//   const apply = (name, axis, target) => {
//     const bone = nodes[name];
//     const rest = restPose.current[name];
//     if (!bone || !rest || !bone.isBone) return false;

//     // Exponential smoothing (20% new value)
//     const prev = prevAngles.current[name] ?? target;
//     const smooth = prev + (target - prev) * 0.2;
//     prevAngles.current[name] = smooth;

//     // Apply rotation
//     const q = new THREE.Quaternion().setFromAxisAngle(axis, smooth);
//     bone.quaternion.copy(rest).multiply(q);

//     return true;
//   };

//   // ===== ARM CONFIGURATION =====
//     const ARM_SMOOTHING = 0.08;  // VERY SLOW for arms (was 0.2)
//     const ARM_IK_STRENGTH = 0.85;  // Don't go 100%

//   // Utility functions
//   const clamp = THREE.MathUtils.clamp;
//   const smooth = (current, target, factor = 0.2) =>
//     current + (target - current) * factor;

//   useFrame(() => {
//     // Apply Kalman smoothing to landmarks
//     const smoothedLandmarks = filteredLandmarks.current.update(landmarks);
//     if (!smoothedLandmarks?.pose) return;

//     const p = smoothedLandmarks.pose;
//     const lh = smoothedLandmarks.left_hand || {};
//     const rh = smoothedLandmarks.right_hand || {};

//     const X = new THREE.Vector3(1, 0, 0);
//     const Y = new THREE.Vector3(0, 1, 0);
//     const Z = new THREE.Vector3(0, 0, 1);

//       if (landmarks?.right_hand) {
//   const rawLetter = classifyAlphabet(landmarks.right_hand);
//   const stableLetter = getStableGesture(rawLetter);

//   if (stableLetter) {
//     console.log("✋ LETTER:", stableLetter);

//     // Example finger pose (A)
//     if (stableLetter === "A") {
//       nodes.mixamorigRightHandIndex1.rotation.x = -1.2;
//       nodes.mixamorigRightHandMiddle1.rotation.x = -1.2;
//       nodes.mixamorigRightHandRing1.rotation.x = -1.2;
//       nodes.mixamorigRightHandPinky1.rotation.x = -1.2;
//     }

//     if (stableLetter === "B") {
//       nodes.mixamorigRightHandIndex1.rotation.x = 0;
//       nodes.mixamorigRightHandMiddle1.rotation.x = 0;
//       nodes.mixamorigRightHandRing1.rotation.x = 0;
//       nodes.mixamorigRightHandPinky1.rotation.x = 0;
//     }
//   }
// }


//     if (landmarks?.right_hand) {
//   const rawGesture = classifyHandGesture(landmarks.right_hand);
//   const stable = getStableGesture(rawGesture);

//   if (stable && gestureMap[stable]) {
//     console.log("✋ Gesture:", gestureMap[stable]);

//     // EXAMPLE ACTION
//     if (gestureMap[stable] === "HELLO") {
//       nodes.mixamorigRightHand.rotation.z = -1;
//     }

//     if (gestureMap[stable] === "FIST") {
//       nodes.mixamorigRightHand.rotation.z = 0;
//     }
//   }
// }

//     // ===== IK LEGS =====
//     if (p.LEFT_HIP && p.LEFT_KNEE && p.LEFT_ANKLE) {
//       const hip = nodes.mixamorigLeftUpLeg;
//       const knee = nodes.mixamorigLeftLeg;
//       const ankle = nodes.mixamorigLeftFoot;

//       if (hip && knee && ankle) {
//         const target = new THREE.Vector3(
//           (p.LEFT_ANKLE.x - 0.5) * 2,
//           Math.max(GROUND_Y, -(p.LEFT_ANKLE.y - 0.5) * 2),
//           -p.LEFT_ANKLE.z * 2
//         );

//         const pole = new THREE.Vector3(0, 0, 1);

//         solveTwoBoneIK({
//           root: hip,
//           mid: knee,
//           end: ankle,
//           target,
//           pole,
//         });
//       }
//     }

//     if (p.RIGHT_HIP && p.RIGHT_KNEE && p.RIGHT_ANKLE) {
//       const hip = nodes.mixamorigRightUpLeg;
//       const knee = nodes.mixamorigRightLeg;
//       const ankle = nodes.mixamorigRightFoot;

//       if (hip && knee && ankle) {
//         const target = new THREE.Vector3(
//           (p.RIGHT_ANKLE.x - 0.5) * 2,
//           Math.max(GROUND_Y, -(p.RIGHT_ANKLE.y - 0.5) * 2),
//           -p.RIGHT_ANKLE.z * 2
//         );

//         const pole = new THREE.Vector3(0, 0, 1);

//         solveTwoBoneIK({
//           root: hip,
//           mid: knee,
//           end: ankle,
//           target,
//           pole,
//         });
//       }
//     }

//     // ===== FOOT ROTATION =====
//     if (nodes.mixamorigLeftFoot && p.LEFT_FOOT_INDEX && p.LEFT_ANKLE) {
//       nodes.mixamorigLeftFoot.rotation.x = clamp(
//         (p.LEFT_FOOT_INDEX.y - p.LEFT_ANKLE.y) * 2,
//         -0.5,
//         0.5
//       );
//     }

//     if (nodes.mixamorigRightFoot && p.RIGHT_FOOT_INDEX && p.RIGHT_ANKLE) {
//       nodes.mixamorigRightFoot.rotation.x = clamp(
//         (p.RIGHT_FOOT_INDEX.y - p.RIGHT_ANKLE.y) * 2,
//         -0.5,
//         0.5
//       );
//     }

//     // ===== ROOT MOTION (WALKING) =====
//     if (p.LEFT_HIP && p.RIGHT_HIP && nodes.mixamorigHips) {
//       const lHip = mp(p.LEFT_HIP);
//       const rHip = mp(p.RIGHT_HIP);
//       const avgHipZ = (lHip.z + rHip.z) / 2;

//       if (prevHipZ.current === null) {
//         prevHipZ.current = avgHipZ;
//       }

//       const deltaZ = avgHipZ - prevHipZ.current;
//       prevHipZ.current = smooth(prevHipZ.current, avgHipZ, 0.15);

//       if (Math.abs(deltaZ) > WALK_THRESHOLD) {
//         rootPos.current.z -= deltaZ * WALK_SPEED;
//       }

//       nodes.mixamorigHips.position.z = smooth(
//         nodes.mixamorigHips.position.z,
//         rootPos.current.z,
//         0.2
//       );
//     }

//     // ===== JUMP / CROUCH =====
//     if (p.LEFT_HIP && p.RIGHT_HIP && nodes.mixamorigHips) {
//       const lHip = mp(p.LEFT_HIP);
//       const rHip = mp(p.RIGHT_HIP);
//       const avgHipY = (lHip.y + rHip.y) / 2;

//       if (baseHipY.current === null) {
//         baseHipY.current = avgHipY;
//       }

//       const deltaY = avgHipY - baseHipY.current;

//       if (deltaY > JUMP_THRESHOLD) {
//         verticalOffset.current += deltaY * VERTICAL_SPEED;
//       } else if (deltaY < CROUCH_THRESHOLD) {
//         verticalOffset.current += deltaY * VERTICAL_SPEED;
//       }

//       // Gravity
//       verticalOffset.current *= 0.92;

//       nodes.mixamorigHips.position.y = smooth(
//         nodes.mixamorigHips.position.y,
//         verticalOffset.current,
//         0.15
//       );
//     }

//     // ===== HEAD =====
//     if (p.LEFT_EAR && p.RIGHT_EAR) {
//       const a = angle2D(mp(p.LEFT_EAR), mp(p.RIGHT_EAR));
//       apply("mixamorigHead", Z, a * 0.5);
//     }

//     // ===== SPINE BALANCE =====
//     if (p.LEFT_HIP && p.RIGHT_HIP) {
//       const l = mp(p.LEFT_HIP);
//       const r = mp(p.RIGHT_HIP);
//       const tilt = angle2D(l, r) * 0.15;
//       apply("mixamorigHips", Z, tilt);

//       if (nodes.mixamorigSpine) {
//         nodes.mixamorigSpine.rotation.z = smooth(
//           nodes.mixamorigSpine.rotation.z,
//           -tilt * 0.6,
//           0.2
//         );
//       }
//     }

//     // ===== WEIGHT SHIFT =====
//     if (p.LEFT_ANKLE && p.RIGHT_ANKLE && nodes.mixamorigHips) {
//       const weightDiff = clamp(
//         (p.RIGHT_ANKLE.y - p.LEFT_ANKLE.y) * 0.8,
//         -0.3,
//         0.3
//       );

//       if (nodes.mixamorigHips) {
//         nodes.mixamorigHips.rotation.z = smooth(
//           nodes.mixamorigHips.rotation.z,
//           weightDiff * 0.4,
//           0.15
//         );
//         nodes.mixamorigHips.position.x = smooth(
//           nodes.mixamorigHips.position.x,
//           weightDiff * 0.1,
//           0.15
//         );
//       }
//     }

//     if (!smoothedLandmarks?.pose) return;
//   // const p = smoothedLandmarks.pose;

//   // ============================================
//   // 🚨 ARMS - ULTRA STABLE
//   // ============================================

//   // ===== LEFT ARM IK =====
//   if (
//     p.LEFT_SHOULDER &&
//     p.LEFT_ELBOW &&
//     p.LEFT_WRIST &&
//     nodes.mixamorigLeftArm &&
//     nodes.mixamorigLeftForeArm &&
//     nodes.mixamorigLeftHand
//   ) {
//     const shoulder = nodes.mixamorigLeftArm;
//     const elbow = nodes.mixamorigLeftForeArm;
//     const wrist = nodes.mixamorigLeftHand;

//     // Smooth target position (pre-filter before IK)
//     if (!window._leftWristTarget) {
//       window._leftWristTarget = new THREE.Vector3();
//     }

//     const newTarget = new THREE.Vector3(
//       (p.LEFT_WRIST.x - 0.5) * 2,
//       -(p.LEFT_WRIST.y - 0.5) * 2,
//       -p.LEFT_WRIST.z * 2
//     );

//     // LERP target position (VERY IMPORTANT)
//     window._leftWristTarget.lerp(newTarget, ARM_SMOOTHING * 0.5);

//     // Store previous rotation to detect oscillation
//     const prevShoulderRot = shoulder.rotation.clone();
//     const prevElbowRot = elbow.rotation.clone();

//     solveTwoBoneIK({
//       root: shoulder,
//       mid: elbow,
//       end: wrist,
//       target: window._leftWristTarget,
//       pole: new THREE.Vector3(0, 1, 0),
//     });

//     // === Detect and dampen oscillation ===
//     const rotDelta = {
//       x: Math.abs(shoulder.rotation.x - prevShoulderRot.x),
//       y: Math.abs(shoulder.rotation.y - prevShoulderRot.y),
//       z: Math.abs(shoulder.rotation.z - prevShoulderRot.z),
//     };

//     // If rotation changed too much → apply damping
//     if (rotDelta.x > 0.1 || rotDelta.y > 0.1 || rotDelta.z > 0.1) {
//       shoulder.rotation.lerp(prevShoulderRot, 0.6);  // Keep 60% old
//       elbow.rotation.lerp(prevElbowRot, 0.6);
//     }
//   }

//   // ===== RIGHT ARM IK =====
//   if (
//     p.RIGHT_SHOULDER &&
//     p.RIGHT_ELBOW &&
//     p.RIGHT_WRIST &&
//     nodes.mixamorigRightArm &&
//     nodes.mixamorigRightForeArm &&
//     nodes.mixamorigRightHand
//   ) {
//     const shoulder = nodes.mixamorigRightArm;
//     const elbow = nodes.mixamorigRightForeArm;
//     const wrist = nodes.mixamorigRightHand;

//     if (!window._rightWristTarget) {
//       window._rightWristTarget = new THREE.Vector3();
//     }

//     const newTarget = new THREE.Vector3(
//       (p.RIGHT_WRIST.x - 0.5) * 2,
//       -(p.RIGHT_WRIST.y - 0.5) * 2,
//       -p.RIGHT_WRIST.z * 2
//     );

//     window._rightWristTarget.lerp(newTarget, ARM_SMOOTHING * 0.5);

//     const prevShoulderRot = shoulder.rotation.clone();
//     const prevElbowRot = elbow.rotation.clone();

//     solveTwoBoneIK({
//       root: shoulder,
//       mid: elbow,
//       end: wrist,
//       target: window._rightWristTarget,
//       pole: new THREE.Vector3(0, 1, 0),
//     });

//     // Oscillation damping
//     const rotDelta = {
//       x: Math.abs(shoulder.rotation.x - prevShoulderRot.x),
//       y: Math.abs(shoulder.rotation.y - prevShoulderRot.y),
//       z: Math.abs(shoulder.rotation.z - prevShoulderRot.z),
//     };

//     if (rotDelta.x > 0.1 || rotDelta.y > 0.1 || rotDelta.z > 0.1) {
//       shoulder.rotation.lerp(prevShoulderRot, 0.6);
//       elbow.rotation.lerp(prevElbowRot, 0.6);
//     }
//   }

//     // ===== FOOT LOCKING =====
//     if (p.LEFT_ANKLE && p.RIGHT_ANKLE) {
//       const lY = p.LEFT_ANKLE.y;
//       const rY = p.RIGHT_ANKLE.y;

//       if (leftFootY.current === 0) leftFootY.current = lY;
//       if (rightFootY.current === 0) rightFootY.current = rY;

//       const lDelta = Math.abs(lY - leftFootY.current);
//       const rDelta = Math.abs(rY - rightFootY.current);

//       leftFootLocked.current = lDelta < FOOT_LOCK_THRESHOLD;
//       rightFootLocked.current = rDelta < FOOT_LOCK_THRESHOLD;

//       leftFootY.current = smooth(leftFootY.current, lY, 0.3);
//       rightFootY.current = smooth(rightFootY.current, rY, 0.3);

//       if (leftFootLocked.current && nodes.mixamorigLeftFoot) {
//         nodes.mixamorigLeftFoot.rotation.x = smooth(
//           nodes.mixamorigLeftFoot.rotation.x,
//           0,
//           0.3
//         );
//       }

//       if (rightFootLocked.current && nodes.mixamorigRightFoot) {
//         nodes.mixamorigRightFoot.rotation.x = smooth(
//           nodes.mixamorigRightFoot.rotation.x,
//           0,
//           0.3
//         );
//       }
//     }

//     // ===== FINGERS (LEFT HAND) =====
//     if (Object.keys(lh).length === 21) {
//       const fingerData = [
//         { bone: "mixamorigLeftHandIndex1", base: 5, tip: 8 },
//         { bone: "mixamorigLeftHandMiddle1", base: 9, tip: 12 },
//         { bone: "mixamorigLeftHandRing1", base: 13, tip: 16 },
//         { bone: "mixamorigLeftHandPinky1", base: 17, tip: 20 },
//         { bone: "mixamorigLeftHandThumb1", base: 2, tip: 4 },
//       ];

//       fingerData.forEach(({ bone, base, tip }) => {
//         const b = nodes[bone];
//         if (b && lh[base] && lh[tip]) {
//           const dist = Math.hypot(
//             lh[tip].x - lh[base].x,
//             lh[tip].y - lh[base].y,
//             lh[tip].z - lh[base].z
//           );
//           const curl = THREE.MathUtils.mapLinear(
//             dist,
//             0.02,
//             0.08,
//             1.2,
//             0
//           );
//           b.rotation.x = smooth(
//             b.rotation.x,
//             THREE.MathUtils.clamp(curl, 0, 1.2),
//             0.25
//           );
//         }
//       });
//     }

//     // ===== FINGERS (RIGHT HAND) =====
//     if (Object.keys(rh).length === 21) {
//       const fingerData = [
//         { bone: "mixamorigRightHandIndex1", base: 5, tip: 8 },
//         { bone: "mixamorigRightHandMiddle1", base: 9, tip: 12 },
//         { bone: "mixamorigRightHandRing1", base: 13, tip: 16 },
//         { bone: "mixamorigRightHandPinky1", base: 17, tip: 20 },
//         { bone: "mixamorigRightHandThumb1", base: 2, tip: 4 },
//       ];

//       fingerData.forEach(({ bone, base, tip }) => {
//         const b = nodes[bone];
//         if (b && rh[base] && rh[tip]) {
//           const dist = Math.hypot(
//             rh[tip].x - rh[base].x,
//             rh[tip].y - rh[base].y,
//             rh[tip].z - rh[base].z
//           );
//           const curl = THREE.MathUtils.mapLinear(
//             dist,
//             0.02,
//             0.08,
//             1.2,
//             0
//           );
//           b.rotation.x = smooth(
//             b.rotation.x,
//             THREE.MathUtils.clamp(curl, 0, 1.2),
//             0.25
//           );
//         }
//       });
//     }
//   });

//   return <primitive object={scene} scale={1.3} position={[0, 0, 0]} />;
// }

// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();

//   return (
//     <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
//       <ambientLight intensity={0.7} />
//       <directionalLight position={[5, 10, 7]} intensity={1.2} />
//       <directionalLight position={[-5, 5, -7]} intensity={0.6} />
//       <Environment preset="city" />
//       <AvatarModel landmarks={landmarks} />
//       <OrbitControls target={[0, 1, 0]} />
//     </Canvas>
//   );
// }





//TRY - 8 (hands are rotating slower beacause we have applied iksolver on it)

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
// import * as THREE from "three";
// import { useEffect, useRef } from "react";
// import useLandmarks from "../hooks/useLandmarks";
// import { solveTwoBoneIK } from "../utils/ikSolver";
// import { createFilteredLandmarks } from "../utils/smoothing";

// useGLTF.preload("/models/standing.glb");

// /**
//  * 🚀 FIXED AVATAR MODEL
//  * - Ultra-smooth arm tracking
//  * - No oscillation or jitter
//  * - Exact 1:1 following of user movements
//  */
// function AvatarModel({ landmarks }) {
//   const { scene, nodes } = useGLTF("/models/standing.glb");

//   // ============================================
//   // STATE
//   // ============================================
//   const restPose = useRef({});
//   const smoothing = useRef({});
//   const filteredLandmarks = useRef(createFilteredLandmarks());

//   // Walk/Motion
//   const prevLeftAnkleY = useRef(null);
//   const prevRightAnkleY = useRef(null);
//   const walkPhase = useRef(0);

//   // Foot state
//   const leftFootLocked = useRef(false);
//   const rightFootLocked = useRef(false);
//   const leftFootY = useRef(0);
//   const rightFootY = useRef(0);

//   // Vertical motion
//   const baseHipY = useRef(null);
//   const verticalOffset = useRef(0);

//   // Root motion
//   const rootPos = useRef(new THREE.Vector3(0, 0, 0));
//   const prevHipZ = useRef(null);

//   // ============================================
//   // CONSTANTS
//   // ============================================
//   const GROUND_Y = -1;
//   const FOOT_LOCK_THRESHOLD = 0.008;
//   const WALK_THRESHOLD = 0.003;
//   const WALK_SPEED = 0.08;
//   const JUMP_THRESHOLD = 0.05;
//   const CROUCH_THRESHOLD = -0.05;
//   const VERTICAL_SPEED = 0.15;

//   // 🚨 ARM TRACKING CONSTANTS (CRITICAL)
//   const ARM_SMOOTHING = 0.12;      // Ultra-slow arm response (was 0.2)
//   const ARM_DAMPING = 0.7;         // Heavy damping to prevent jitter (0.7 = keep 70% old)
//   const ARM_IK_ITERATIONS = 10;    // More IK iterations for accuracy

//   // ============================================
//   // INITIALIZATION
//   // ============================================
//   useEffect(() => {
//     scene.traverse((bone) => {
//       if (bone.isBone) {
//         // Store rest pose
//         restPose.current[bone.name] = bone.quaternion.clone();

//         // Initialize smoothing states
//         smoothing.current[bone.name] = {
//           position: bone.position.clone(),
//           quaternion: bone.quaternion.clone(),
//           euler: new THREE.Euler().setFromQuaternion(bone.quaternion),
//         };
//       }
//     });

//     console.log("✅ Model initialized with", Object.keys(restPose.current).length, "bones");
//   }, [scene, nodes]);

//   // ============================================
//   // HELPERS
//   // ============================================

//   /**
//    * MediaPipe coordinate → Three.js world space
//    */
//   const mpCoord = (landmark) => ({
//     x: (landmark.x - 0.5) * 2,
//     y: -(landmark.y - 0.5) * 2,
//     z: -landmark.z * 2,
//   });

//   /**
//    * 2D angle between two points
//    */
//   const getAngle2D = (from, to) => {
//     return Math.atan2(to.y - from.y, to.x - from.x);
//   };

//   /**
//    * Smooth value with exponential smoothing
//    */
//   const smoothValue = (current, target, smoothingFactor = 0.2) => {
//     return current + (target - current) * smoothingFactor;
//   };

//   /**
//    * Smooth 3D vector
//    */
//   const smoothVector = (current, target, factor = 0.2) => {
//     const result = new THREE.Vector3();
//     result.x = smoothValue(current.x, target.x, factor);
//     result.y = smoothValue(current.y, target.y, factor);
//     result.z = smoothValue(current.z, target.z, factor);
//     return result;
//   };

//   /**
//    * Apply rotation to bone with smoothing
//    */
//   const rotateBone = (boneName, axis, targetAngle, dampingFactor = 0.8) => {
//     const bone = nodes[boneName];
//     if (!bone || !bone.isBone) return false;

//     const restQuat = restPose.current[boneName];
//     if (!restQuat) return false;

//     // Create target rotation
//     const targetQuat = new THREE.Quaternion();
//     targetQuat.setFromAxisAngle(axis, targetAngle);

//     // Get current smoothed state
//     const currentSmoothing = smoothing.current[boneName];
//     if (!currentSmoothing) return false;

//     // Apply damping (keep some of old rotation)
//     const dampedQuat = new THREE.Quaternion();
//     dampedQuat.slerp(restQuat.clone().multiply(targetQuat), 1 - dampingFactor);

//     // Update smoothing state
//     currentSmoothing.quaternion.slerp(
//       restQuat.clone().multiply(dampedQuat),
//       ARM_SMOOTHING
//     );

//     // Apply to bone
//     bone.quaternion.copy(currentSmoothing.quaternion);
//     return true;
//   };

//   /**
//    * 2-Bone IK with damping and oscillation prevention
//    */
//   const solveArmIK = (shoulderName, elbowName, wristName, targetPos, previousTarget) => {
//     const shoulder = nodes[shoulderName];
//     const elbow = nodes[elbowName];
//     const wrist = nodes[wristName];

//     if (!shoulder || !elbow || !wrist) return;

//     // === CRITICAL: Smooth target position first ===
//     const smoothTarget = previousTarget.clone().lerp(targetPos, ARM_SMOOTHING);
//     Object.assign(previousTarget, smoothTarget);

//     // Store previous rotations to detect oscillation
//     const prevShoulderQuat = shoulder.quaternion.clone();
//     const prevElbowQuat = elbow.quaternion.clone();

//     // Solve IK
//     solveTwoBoneIK({
//       root: shoulder,
//       mid: elbow,
//       end: wrist,
//       target: smoothTarget,
//       pole: new THREE.Vector3(0, 1, 0),
//     });

//     // === OSCILLATION DETECTION & DAMPING ===
//     const shoulderDelta = prevShoulderQuat.angleTo(shoulder.quaternion);
//     const elbowDelta = prevElbowQuat.angleTo(elbow.quaternion);

//     // If rotation changed too much → apply heavy damping
//     if (shoulderDelta > 0.15 || elbowDelta > 0.15) {
//       shoulder.quaternion.slerp(prevShoulderQuat, ARM_DAMPING);
//       elbow.quaternion.slerp(prevElbowQuat, ARM_DAMPING);
//     }
//   };

//   // ============================================
//   // MAIN ANIMATION LOOP
//   // ============================================
//   useFrame(() => {
//     // Apply Kalman smoothing
//     const smoothedLandmarks = filteredLandmarks.current.update(landmarks);
//     if (!smoothedLandmarks?.pose) return;

//     const pose = smoothedLandmarks.pose;
//     const leftHand = smoothedLandmarks.left_hand || {};
//     const rightHand = smoothedLandmarks.right_hand || {};

//     const axisX = new THREE.Vector3(1, 0, 0);
//     const axisY = new THREE.Vector3(0, 1, 0);
//     const axisZ = new THREE.Vector3(0, 0, 1);

//     // ============================================
//     // 🎯 ARMS - ULTRA STABLE IK SOLVER
//     // ============================================

//     // Initialize arm target storage
//     if (!window._armTargets) {
//       window._armTargets = {
//         leftWrist: new THREE.Vector3(),
//         rightWrist: new THREE.Vector3(),
//       };
//     }

//     // ===== LEFT ARM =====
//     if (
//       pose.LEFT_SHOULDER &&
//       pose.LEFT_ELBOW &&
//       pose.LEFT_WRIST &&
//       nodes.mixamorigLeftArm &&
//       nodes.mixamorigLeftForeArm &&
//       nodes.mixamorigLeftHand
//     ) {
//       const newLeftTarget = new THREE.Vector3(
//         mpCoord(pose.LEFT_WRIST).x,
//         mpCoord(pose.LEFT_WRIST).y,
//         mpCoord(pose.LEFT_WRIST).z
//       );

//       solveArmIK(
//         "mixamorigLeftArm",
//         "mixamorigLeftForeArm",
//         "mixamorigLeftHand",
//         newLeftTarget,
//         window._armTargets.leftWrist
//       );
//     }

//     // ===== RIGHT ARM =====
//     if (
//       pose.RIGHT_SHOULDER &&
//       pose.RIGHT_ELBOW &&
//       pose.RIGHT_WRIST &&
//       nodes.mixamorigRightArm &&
//       nodes.mixamorigRightForeArm &&
//       nodes.mixamorigRightHand
//     ) {
//       const newRightTarget = new THREE.Vector3(
//         mpCoord(pose.RIGHT_WRIST).x,
//         mpCoord(pose.RIGHT_WRIST).y,
//         mpCoord(pose.RIGHT_WRIST).z
//       );

//       solveArmIK(
//         "mixamorigRightArm",
//         "mixamorigRightForeArm",
//         "mixamorigRightHand",
//         newRightTarget,
//         window._armTargets.rightWrist
//       );
//     }

//     // ============================================
//     // 🦵 LEGS - IK SOLVER
//     // ============================================

//     // ===== LEFT LEG =====
//     if (
//       pose.LEFT_HIP &&
//       pose.LEFT_KNEE &&
//       pose.LEFT_ANKLE &&
//       nodes.mixamorigLeftUpLeg &&
//       nodes.mixamorigLeftLeg &&
//       nodes.mixamorigLeftFoot
//     ) {
//       const hipNode = nodes.mixamorigLeftUpLeg;
//       const kneeNode = nodes.mixamorigLeftLeg;
//       const ankleNode = nodes.mixamorigLeftFoot;

//       const targetPos = new THREE.Vector3(
//         mpCoord(pose.LEFT_ANKLE).x,
//         Math.max(GROUND_Y, mpCoord(pose.LEFT_ANKLE).y),
//         mpCoord(pose.LEFT_ANKLE).z
//       );

//       solveTwoBoneIK({
//         root: hipNode,
//         mid: kneeNode,
//         end: ankleNode,
//         target: targetPos,
//         pole: new THREE.Vector3(0, 0, 1),
//       });
//     }

//     // ===== RIGHT LEG =====
//     if (
//       pose.RIGHT_HIP &&
//       pose.RIGHT_KNEE &&
//       pose.RIGHT_ANKLE &&
//       nodes.mixamorigRightUpLeg &&
//       nodes.mixamorigRightLeg &&
//       nodes.mixamorigRightFoot
//     ) {
//       const hipNode = nodes.mixamorigRightUpLeg;
//       const kneeNode = nodes.mixamorigRightLeg;
//       const ankleNode = nodes.mixamorigRightFoot;

//       const targetPos = new THREE.Vector3(
//         mpCoord(pose.RIGHT_ANKLE).x,
//         Math.max(GROUND_Y, mpCoord(pose.RIGHT_ANKLE).y),
//         mpCoord(pose.RIGHT_ANKLE).z
//       );

//       solveTwoBoneIK({
//         root: hipNode,
//         mid: kneeNode,
//         end: ankleNode,
//         target: targetPos,
//         pole: new THREE.Vector3(0, 0, 1),
//       });
//     }

//     // ============================================
//     // 📍 FOOT ROTATION
//     // ============================================
//     if (pose.LEFT_FOOT_INDEX && pose.LEFT_ANKLE && nodes.mixamorigLeftFoot) {
//       const footRotX = THREE.MathUtils.clamp(
//         (pose.LEFT_FOOT_INDEX.y - pose.LEFT_ANKLE.y) * 2,
//         -0.5,
//         0.5
//       );
//       nodes.mixamorigLeftFoot.rotation.x = smoothValue(
//         nodes.mixamorigLeftFoot.rotation.x,
//         footRotX,
//         0.2
//       );
//     }

//     if (pose.RIGHT_FOOT_INDEX && pose.RIGHT_ANKLE && nodes.mixamorigRightFoot) {
//       const footRotX = THREE.MathUtils.clamp(
//         (pose.RIGHT_FOOT_INDEX.y - pose.RIGHT_ANKLE.y) * 2,
//         -0.5,
//         0.5
//       );
//       nodes.mixamorigRightFoot.rotation.x = smoothValue(
//         nodes.mixamorigRightFoot.rotation.x,
//         footRotX,
//         0.2
//       );
//     }

//     // ============================================
//     // 🧠 HEAD & SPINE
//     // ============================================

//     // ===== HEAD TILT =====
//     if (pose.LEFT_EAR && pose.RIGHT_EAR && nodes.mixamorigHead) {
//       const leftEar = mpCoord(pose.LEFT_EAR);
//       const rightEar = mpCoord(pose.RIGHT_EAR);
//       const headTilt = getAngle2D(leftEar, rightEar);
//       rotateBone("mixamorigHead", axisZ, headTilt * 0.5, 0.8);
//     }

//     // ===== SPINE BALANCE =====
//     if (pose.LEFT_HIP && pose.RIGHT_HIP) {
//       const leftHip = mpCoord(pose.LEFT_HIP);
//       const rightHip = mpCoord(pose.RIGHT_HIP);
//       const hipTilt = getAngle2D(leftHip, rightHip) * 0.15;

//       if (nodes.mixamorigHips) {
//         nodes.mixamorigHips.rotation.z = smoothValue(
//           nodes.mixamorigHips.rotation.z,
//           hipTilt,
//           0.15
//         );
//       }

//       if (nodes.mixamorigSpine) {
//         nodes.mixamorigSpine.rotation.z = smoothValue(
//           nodes.mixamorigSpine.rotation.z,
//           -hipTilt * 0.6,
//           0.15
//         );
//       }
//     }

//     // ============================================
//     // 👤 WEIGHT SHIFT & BALANCE
//     // ============================================
//     if (pose.LEFT_ANKLE && pose.RIGHT_ANKLE && nodes.mixamorigHips) {
//       const weightDiff = THREE.MathUtils.clamp(
//         (pose.RIGHT_ANKLE.y - pose.LEFT_ANKLE.y) * 0.8,
//         -0.3,
//         0.3
//       );

//       nodes.mixamorigHips.rotation.z = smoothValue(
//         nodes.mixamorigHips.rotation.z,
//         weightDiff * 0.4,
//         0.12
//       );

//       nodes.mixamorigHips.position.x = smoothValue(
//         nodes.mixamorigHips.position.x,
//         weightDiff * 0.1,
//         0.12
//       );
//     }

//     // ============================================
//     // 🚶 WALKING (ROOT MOTION)
//     // ============================================
//     if (pose.LEFT_HIP && pose.RIGHT_HIP && nodes.mixamorigHips) {
//       const leftHip = mpCoord(pose.LEFT_HIP);
//       const rightHip = mpCoord(pose.RIGHT_HIP);
//       const avgHipZ = (leftHip.z + rightHip.z) / 2;

//       if (prevHipZ.current === null) {
//         prevHipZ.current = avgHipZ;
//       }

//       const deltaZ = avgHipZ - prevHipZ.current;
//       prevHipZ.current = smoothValue(prevHipZ.current, avgHipZ, 0.15);

//       if (Math.abs(deltaZ) > WALK_THRESHOLD) {
//         rootPos.current.z -= deltaZ * WALK_SPEED;
//       }

//       nodes.mixamorigHips.position.z = smoothValue(
//         nodes.mixamorigHips.position.z,
//         rootPos.current.z,
//         0.15
//       );
//     }

//     // ============================================
//     // 🦘 JUMP / CROUCH
//     // ============================================
//     if (pose.LEFT_HIP && pose.RIGHT_HIP && nodes.mixamorigHips) {
//       const leftHip = mpCoord(pose.LEFT_HIP);
//       const rightHip = mpCoord(pose.RIGHT_HIP);
//       const avgHipY = (leftHip.y + rightHip.y) / 2;

//       if (baseHipY.current === null) {
//         baseHipY.current = avgHipY;
//       }

//       const deltaY = avgHipY - baseHipY.current;

//       if (deltaY > JUMP_THRESHOLD) {
//         verticalOffset.current += deltaY * VERTICAL_SPEED;
//       } else if (deltaY < CROUCH_THRESHOLD) {
//         verticalOffset.current += deltaY * VERTICAL_SPEED;
//       }

//       verticalOffset.current *= 0.92; // Gravity

//       nodes.mixamorigHips.position.y = smoothValue(
//         nodes.mixamorigHips.position.y,
//         verticalOffset.current,
//         0.12
//       );
//     }

//     // ============================================
//     // 🖐️ FINGERS
//     // ============================================

//     // ===== LEFT HAND FINGERS =====
//     if (Object.keys(leftHand).length === 21 && nodes) {
//       const fingerConfigs = [
//         { bone: "mixamorigLeftHandIndex1", base: 5, tip: 8 },
//         { bone: "mixamorigLeftHandMiddle1", base: 9, tip: 12 },
//         { bone: "mixamorigLeftHandRing1", base: 13, tip: 16 },
//         { bone: "mixamorigLeftHandPinky1", base: 17, tip: 20 },
//         { bone: "mixamorigLeftHandThumb1", base: 2, tip: 4 },
//       ];

//       fingerConfigs.forEach(({ bone, base, tip }) => {
//         const fingerBone = nodes[bone];
//         if (fingerBone && leftHand[base] && leftHand[tip]) {
//           const dist = Math.hypot(
//             leftHand[tip].x - leftHand[base].x,
//             leftHand[tip].y - leftHand[base].y,
//             leftHand[tip].z - leftHand[base].z
//           );

//           const curl = THREE.MathUtils.mapLinear(
//             dist,
//             0.02,
//             0.08,
//             1.2,
//             0
//           );

//           fingerBone.rotation.x = smoothValue(
//             fingerBone.rotation.x,
//             THREE.MathUtils.clamp(curl, 0, 1.2),
//             0.2
//           );
//         }
//       });
//     }

//     // ===== RIGHT HAND FINGERS =====
//     if (Object.keys(rightHand).length === 21 && nodes) {
//       const fingerConfigs = [
//         { bone: "mixamorigRightHandIndex1", base: 5, tip: 8 },
//         { bone: "mixamorigRightHandMiddle1", base: 9, tip: 12 },
//         { bone: "mixamorigRightHandRing1", base: 13, tip: 16 },
//         { bone: "mixamorigRightHandPinky1", base: 17, tip: 20 },
//         { bone: "mixamorigRightHandThumb1", base: 2, tip: 4 },
//       ];

//       fingerConfigs.forEach(({ bone, base, tip }) => {
//         const fingerBone = nodes[bone];
//         if (fingerBone && rightHand[base] && rightHand[tip]) {
//           const dist = Math.hypot(
//             rightHand[tip].x - rightHand[base].x,
//             rightHand[tip].y - rightHand[base].y,
//             rightHand[tip].z - rightHand[base].z
//           );

//           const curl = THREE.MathUtils.mapLinear(
//             dist,
//             0.02,
//             0.08,
//             1.2,
//             0
//           );

//           fingerBone.rotation.x = smoothValue(
//             fingerBone.rotation.x,
//             THREE.MathUtils.clamp(curl, 0, 1.2),
//             0.2
//           );
//         }
//       });
//     }
//   });

//   return <primitive object={scene} scale={1.3} position={[0, 0, 0]} />;
// }

// /**
//  * MAIN CANVAS
//  */
// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();

//   return (
//     <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
//       <ambientLight intensity={0.7} />
//       <directionalLight position={[5, 10, 7]} intensity={1.2} />
//       <directionalLight position={[-5, 5, -7]} intensity={0.6} />
//       <Environment preset="city" />

//       <AvatarModel landmarks={landmarks} />

//       <OrbitControls target={[0, 1, 0]} />
//     </Canvas>
//   );
// }



//Try - 9

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
// import * as THREE from "three";
// import { useEffect, useRef } from "react";
// import useLandmarks from "../hooks/useLandmarks";
// import { solveTwoBoneIK } from "../utils/ikSolver";
// import { createFilteredLandmarks } from "../utils/smoothing";

// useGLTF.preload("/models/standing.glb");

// /**
//  * 🚀 FIXED AVATAR MODEL
//  * - Ultra-smooth arm tracking
//  * - No oscillation or jitter
//  * - Exact 1:1 following of user movements
//  * - ✨ HANDS FIXED - proper 3D rotation
//  */
// function AvatarModel({ landmarks }) {
//   const { scene, nodes } = useGLTF("/models/standing.glb");

//   // ============================================
//   // STATE
//   // ============================================
//   const restPose = useRef({});
//   const smoothing = useRef({});
//   const filteredLandmarks = useRef(createFilteredLandmarks());

//   // Walk/Motion
//   const prevLeftAnkleY = useRef(null);
//   const prevRightAnkleY = useRef(null);
//   const walkPhase = useRef(0);

//   // Foot state
//   const leftFootLocked = useRef(false);
//   const rightFootLocked = useRef(false);
//   const leftFootY = useRef(0);
//   const rightFootY = useRef(0);

//   // Vertical motion
//   const baseHipY = useRef(null);
//   const verticalOffset = useRef(0);

//   // Root motion
//   const rootPos = useRef(new THREE.Vector3(0, 0, 0));
//   const prevHipZ = useRef(null);

//   // 🖐️ HAND SMOOTHING STATE
//   const handSmoothing = useRef({
//     leftQuat: new THREE.Quaternion(),
//     rightQuat: new THREE.Quaternion(),
//   });

//   // ============================================
//   // CONSTANTS
//   // ============================================
//   const GROUND_Y = -1;
//   const FOOT_LOCK_THRESHOLD = 0.008;
//   const WALK_THRESHOLD = 0.003;
//   const WALK_SPEED = 0.08;
//   const JUMP_THRESHOLD = 0.05;
//   const CROUCH_THRESHOLD = -0.05;
//   const VERTICAL_SPEED = 0.15;

//   // 🚨 ARM TRACKING CONSTANTS (CRITICAL)
//   const ARM_SMOOTHING = 0.12;      // Ultra-slow arm response
//   const ARM_DAMPING = 0.7;         // Heavy damping to prevent jitter
//   const ARM_IK_ITERATIONS = 10;    // More IK iterations for accuracy

//   // 🖐️ HAND TRACKING CONSTANTS
//   const HAND_SMOOTHING = 0.12;     // Ultra-smooth hand response
//   const HAND_FLIP_THRESHOLD = 0.0; // Detect quaternion flip

//   // ============================================
//   // INITIALIZATION
//   // ============================================
//   useEffect(() => {
//     scene.traverse((bone) => {
//       if (bone.isBone) {
//         // Store rest pose
//         restPose.current[bone.name] = bone.quaternion.clone();

//         // Initialize smoothing states
//         smoothing.current[bone.name] = {
//           position: bone.position.clone(),
//           quaternion: bone.quaternion.clone(),
//           euler: new THREE.Euler().setFromQuaternion(bone.quaternion),
//         };
//       }
//     });

//     console.log("✅ Model initialized with", Object.keys(restPose.current).length, "bones");
//   }, [scene, nodes]);

//   // ============================================
//   // HELPERS
//   // ============================================

//   /**
//    * MediaPipe coordinate → Three.js world space
//    */
//   const mpCoord = (landmark) => ({
//     x: (landmark.x - 0.5) * 2,
//     y: -(landmark.y - 0.5) * 2,
//     z: -landmark.z * 2,
//   });

//   /**
//    * 2D angle between two points
//    */
//   const getAngle2D = (from, to) => {
//     return Math.atan2(to.y - from.y, to.x - from.x);
//   };

//   /**
//    * Smooth value with exponential smoothing
//    */
//   const smoothValue = (current, target, smoothingFactor = 0.2) => {
//     return current + (target - current) * smoothingFactor;
//   };

//   /**
//    * Smooth 3D vector
//    */
//   const smoothVector = (current, target, factor = 0.2) => {
//     const result = new THREE.Vector3();
//     result.x = smoothValue(current.x, target.x, factor);
//     result.y = smoothValue(current.y, target.y, factor);
//     result.z = smoothValue(current.z, target.z, factor);
//     return result;
//   };

//   /**
//    * Apply rotation to bone with smoothing
//    */
//   const rotateBone = (boneName, axis, targetAngle, dampingFactor = 0.8) => {
//     const bone = nodes[boneName];
//     if (!bone || !bone.isBone) return false;

//     const restQuat = restPose.current[boneName];
//     if (!restQuat) return false;

//     // Create target rotation
//     const targetQuat = new THREE.Quaternion();
//     targetQuat.setFromAxisAngle(axis, targetAngle);

//     // Get current smoothed state
//     const currentSmoothing = smoothing.current[boneName];
//     if (!currentSmoothing) return false;

//     // Apply damping (keep some of old rotation)
//     const dampedQuat = new THREE.Quaternion();
//     dampedQuat.slerp(restQuat.clone().multiply(targetQuat), 1 - dampingFactor);

//     // Update smoothing state
//     currentSmoothing.quaternion.slerp(
//       restQuat.clone().multiply(dampedQuat),
//       ARM_SMOOTHING
//     );

//     // Apply to bone
//     bone.quaternion.copy(currentSmoothing.quaternion);
//     return true;
//   };

//   /**
//    * 2-Bone IK with damping and oscillation prevention
//    */
//   const solveArmIK = (shoulderName, elbowName, wristName, targetPos, previousTarget) => {
//     const shoulder = nodes[shoulderName];
//     const elbow = nodes[elbowName];
//     const wrist = nodes[wristName];

//     if (!shoulder || !elbow || !wrist) return;

//     // === CRITICAL: Smooth target position first ===
//     const smoothTarget = previousTarget.clone().lerp(targetPos, ARM_SMOOTHING);
//     Object.assign(previousTarget, smoothTarget);

//     // Store previous rotations to detect oscillation
//     const prevShoulderQuat = shoulder.quaternion.clone();
//     const prevElbowQuat = elbow.quaternion.clone();

//     // Solve IK
//     solveTwoBoneIK({
//       root: shoulder,
//       mid: elbow,
//       end: wrist,
//       target: smoothTarget,
//       pole: new THREE.Vector3(0, 1, 0),
//     });

//     // === OSCILLATION DETECTION & DAMPING ===
//     const shoulderDelta = prevShoulderQuat.angleTo(shoulder.quaternion);
//     const elbowDelta = prevElbowQuat.angleTo(elbow.quaternion);

//     // If rotation changed too much → apply heavy damping
//     if (shoulderDelta > 0.15 || elbowDelta > 0.15) {
//       shoulder.quaternion.slerp(prevShoulderQuat, ARM_DAMPING);
//       elbow.quaternion.slerp(prevElbowQuat, ARM_DAMPING);
//     }
//   };

//   /**
//    * 🖐️ CALCULATE HAND ROTATION FROM LANDMARKS
//    * Uses 3D hand orientation for proper rotation
//    */
//   const getHandRotation = (wrist, indexBase, middleBase, pinkyBase) => {
//     // Forward: wrist → middle finger
//     const forward = new THREE.Vector3(
//       middleBase.x - wrist.x,
//       middleBase.y - wrist.y,
//       middleBase.z - wrist.z
//     ).normalize();

//     // Right: pinky → index
//     const right = new THREE.Vector3(
//       indexBase.x - pinkyBase.x,
//       indexBase.y - pinkyBase.y,
//       indexBase.z - pinkyBase.z
//     ).normalize();

//     // Up: cross product
//     const up = new THREE.Vector3().crossVectors(forward, right).normalize();

//     // Re-orthogonalize right
//     const rightOrtho = new THREE.Vector3().crossVectors(up, forward).normalize();

//     // Create rotation matrix
//     const matrix = new THREE.Matrix4();
//     matrix.makeBasis(rightOrtho, up, forward);

//     return new THREE.Quaternion().setFromRotationMatrix(matrix);
//   };

//   // ============================================
//   // MAIN ANIMATION LOOP
//   // ============================================
//   useFrame(() => {
//     // Apply Kalman smoothing
//     const smoothedLandmarks = filteredLandmarks.current.update(landmarks);
//     if (!smoothedLandmarks?.pose) return;

//     const pose = smoothedLandmarks.pose;
//     const leftHand = smoothedLandmarks.left_hand || {};
//     const rightHand = smoothedLandmarks.right_hand || {};

//     const axisX = new THREE.Vector3(1, 0, 0);
//     const axisY = new THREE.Vector3(0, 1, 0);
//     const axisZ = new THREE.Vector3(0, 0, 1);

//     // ============================================
//     // 🎯 ARMS - ULTRA STABLE IK SOLVER
//     // ============================================

//     // Initialize arm target storage
//     if (!window._armTargets) {
//       window._armTargets = {
//         leftWrist: new THREE.Vector3(),
//         rightWrist: new THREE.Vector3(),
//       };
//     }

//     // ===== LEFT ARM =====
//     if (
//       pose.LEFT_SHOULDER &&
//       pose.LEFT_ELBOW &&
//       pose.LEFT_WRIST &&
//       nodes.mixamorigLeftArm &&
//       nodes.mixamorigLeftForeArm &&
//       nodes.mixamorigLeftHand
//     ) {
//       const newLeftTarget = new THREE.Vector3(
//         mpCoord(pose.LEFT_WRIST).x,
//         mpCoord(pose.LEFT_WRIST).y,
//         mpCoord(pose.LEFT_WRIST).z
//       );

//       solveArmIK(
//         "mixamorigLeftArm",
//         "mixamorigLeftForeArm",
//         "mixamorigLeftHand",
//         newLeftTarget,
//         window._armTargets.leftWrist
//       );
//     }

//     // ===== RIGHT ARM =====
//     if (
//       pose.RIGHT_SHOULDER &&
//       pose.RIGHT_ELBOW &&
//       pose.RIGHT_WRIST &&
//       nodes.mixamorigRightArm &&
//       nodes.mixamorigRightForeArm &&
//       nodes.mixamorigRightHand
//     ) {
//       const newRightTarget = new THREE.Vector3(
//         mpCoord(pose.RIGHT_WRIST).x,
//         mpCoord(pose.RIGHT_WRIST).y,
//         mpCoord(pose.RIGHT_WRIST).z
//       );

//       solveArmIK(
//         "mixamorigRightArm",
//         "mixamorigRightForeArm",
//         "mixamorigRightHand",
//         newRightTarget,
//         window._armTargets.rightWrist
//       );
//     }

//     // ============================================
//     // 🖐️ HANDS - PROPER 3D ORIENTATION
//     // ============================================

//     // ===== RIGHT HAND =====
//     if (rightHand && Object.keys(rightHand).length >= 21) {
//       const wrist = mpCoord(rightHand[0]);
//       const indexBase = mpCoord(rightHand[5]);
//       const middleBase = mpCoord(rightHand[9]);
//       const pinkyBase = mpCoord(rightHand[17]);

//       const handBone = nodes.mixamorigRightHand;

//       if (handBone && wrist && indexBase && middleBase && pinkyBase) {
//         const targetQuat = getHandRotation(wrist, indexBase, middleBase, pinkyBase);

//         // Check for quaternion flip
//         const prevQuat = handSmoothing.current.rightQuat;
//         if (prevQuat.dot(targetQuat) < HAND_FLIP_THRESHOLD) {
//           targetQuat.x = -targetQuat.x;
//           targetQuat.y = -targetQuat.y;
//           targetQuat.z = -targetQuat.z;
//           targetQuat.w = -targetQuat.w;
//         }

//         // Ultra-smooth interpolation
//         handSmoothing.current.rightQuat.slerp(targetQuat, HAND_SMOOTHING);

//         // Apply to bone with rest pose
//         const restQuat = restPose.current["mixamorigRightHand"];
//         if (restQuat) {
//           handBone.quaternion.copy(restQuat).multiply(handSmoothing.current.rightQuat);
//         }
//       }
//     }

//     // ===== LEFT HAND =====
//     if (leftHand && Object.keys(leftHand).length >= 21) {
//       const wrist = mpCoord(leftHand[0]);
//       const indexBase = mpCoord(leftHand[5]);
//       const middleBase = mpCoord(leftHand[9]);
//       const pinkyBase = mpCoord(leftHand[17]);

//       const handBone = nodes.mixamorigLeftHand;

//       if (handBone && wrist && indexBase && middleBase && pinkyBase) {
//         let targetQuat = getHandRotation(wrist, indexBase, middleBase, pinkyBase);

//         // Mirror for left hand
//         const mirrorQuat = new THREE.Quaternion().setFromAxisAngle(
//           new THREE.Vector3(0, 1, 0),
//           Math.PI
//         );
//         targetQuat.multiply(mirrorQuat);

//         // Check for flip
//         const prevQuat = handSmoothing.current.leftQuat;
//         if (prevQuat.dot(targetQuat) < HAND_FLIP_THRESHOLD) {
//           targetQuat.x = -targetQuat.x;
//           targetQuat.y = -targetQuat.y;
//           targetQuat.z = -targetQuat.z;
//           targetQuat.w = -targetQuat.w;
//         }

//         // Ultra-smooth interpolation
//         handSmoothing.current.leftQuat.slerp(targetQuat, HAND_SMOOTHING);

//         // Apply to bone with rest pose
//         const restQuat = restPose.current["mixamorigLeftHand"];
//         if (restQuat) {
//           handBone.quaternion.copy(restQuat).multiply(handSmoothing.current.leftQuat);
//         }
//       }
//     }

//     // ============================================
//     // 🦵 LEGS - IK SOLVER
//     // ============================================

//     // ===== LEFT LEG =====
//     if (
//       pose.LEFT_HIP &&
//       pose.LEFT_KNEE &&
//       pose.LEFT_ANKLE &&
//       nodes.mixamorigLeftUpLeg &&
//       nodes.mixamorigLeftLeg &&
//       nodes.mixamorigLeftFoot
//     ) {
//       const hipNode = nodes.mixamorigLeftUpLeg;
//       const kneeNode = nodes.mixamorigLeftLeg;
//       const ankleNode = nodes.mixamorigLeftFoot;

//       const targetPos = new THREE.Vector3(
//         mpCoord(pose.LEFT_ANKLE).x,
//         Math.max(GROUND_Y, mpCoord(pose.LEFT_ANKLE).y),
//         mpCoord(pose.LEFT_ANKLE).z
//       );

//       solveTwoBoneIK({
//         root: hipNode,
//         mid: kneeNode,
//         end: ankleNode,
//         target: targetPos,
//         pole: new THREE.Vector3(0, 0, 1),
//       });
//     }

//     // ===== RIGHT LEG =====
//     if (
//       pose.RIGHT_HIP &&
//       pose.RIGHT_KNEE &&
//       pose.RIGHT_ANKLE &&
//       nodes.mixamorigRightUpLeg &&
//       nodes.mixamorigRightLeg &&
//       nodes.mixamorigRightFoot
//     ) {
//       const hipNode = nodes.mixamorigRightUpLeg;
//       const kneeNode = nodes.mixamorigRightLeg;
//       const ankleNode = nodes.mixamorigRightFoot;

//       const targetPos = new THREE.Vector3(
//         mpCoord(pose.RIGHT_ANKLE).x,
//         Math.max(GROUND_Y, mpCoord(pose.RIGHT_ANKLE).y),
//         mpCoord(pose.RIGHT_ANKLE).z
//       );

//       solveTwoBoneIK({
//         root: hipNode,
//         mid: kneeNode,
//         end: ankleNode,
//         target: targetPos,
//         pole: new THREE.Vector3(0, 0, 1),
//       });
//     }

//     // ============================================
//     // 📍 FOOT ROTATION
//     // ============================================
//     if (pose.LEFT_FOOT_INDEX && pose.LEFT_ANKLE && nodes.mixamorigLeftFoot) {
//       const footRotX = THREE.MathUtils.clamp(
//         (pose.LEFT_FOOT_INDEX.y - pose.LEFT_ANKLE.y) * 2,
//         -0.5,
//         0.5
//       );
//       nodes.mixamorigLeftFoot.rotation.x = smoothValue(
//         nodes.mixamorigLeftFoot.rotation.x,
//         footRotX,
//         0.2
//       );
//     }

//     if (pose.RIGHT_FOOT_INDEX && pose.RIGHT_ANKLE && nodes.mixamorigRightFoot) {
//       const footRotX = THREE.MathUtils.clamp(
//         (pose.RIGHT_FOOT_INDEX.y - pose.RIGHT_ANKLE.y) * 2,
//         -0.5,
//         0.5
//       );
//       nodes.mixamorigRightFoot.rotation.x = smoothValue(
//         nodes.mixamorigRightFoot.rotation.x,
//         footRotX,
//         0.2
//       );
//     }

//     // ============================================
//     // 🧠 HEAD & SPINE
//     // ============================================

//     // ===== HEAD TILT =====
//     if (pose.LEFT_EAR && pose.RIGHT_EAR && nodes.mixamorigHead) {
//       const leftEar = mpCoord(pose.LEFT_EAR);
//       const rightEar = mpCoord(pose.RIGHT_EAR);
//       const headTilt = getAngle2D(leftEar, rightEar);
//       rotateBone("mixamorigHead", axisZ, headTilt * 0.5, 0.8);
//     }

//     // ===== SPINE BALANCE =====
//     if (pose.LEFT_HIP && pose.RIGHT_HIP) {
//       const leftHip = mpCoord(pose.LEFT_HIP);
//       const rightHip = mpCoord(pose.RIGHT_HIP);
//       const hipTilt = getAngle2D(leftHip, rightHip) * 0.15;

//       if (nodes.mixamorigHips) {
//         nodes.mixamorigHips.rotation.z = smoothValue(
//           nodes.mixamorigHips.rotation.z,
//           hipTilt,
//           0.15
//         );
//       }

//       if (nodes.mixamorigSpine) {
//         nodes.mixamorigSpine.rotation.z = smoothValue(
//           nodes.mixamorigSpine.rotation.z,
//           -hipTilt * 0.6,
//           0.15
//         );
//       }
//     }

//     // ============================================
//     // 👤 WEIGHT SHIFT & BALANCE
//     // ============================================
//     if (pose.LEFT_ANKLE && pose.RIGHT_ANKLE && nodes.mixamorigHips) {
//       const weightDiff = THREE.MathUtils.clamp(
//         (pose.RIGHT_ANKLE.y - pose.LEFT_ANKLE.y) * 0.8,
//         -0.3,
//         0.3
//       );

//       nodes.mixamorigHips.rotation.z = smoothValue(
//         nodes.mixamorigHips.rotation.z,
//         weightDiff * 0.4,
//         0.12
//       );

//       nodes.mixamorigHips.position.x = smoothValue(
//         nodes.mixamorigHips.position.x,
//         weightDiff * 0.1,
//         0.12
//       );
//     }

//     // ============================================
//     // 🚶 WALKING (ROOT MOTION)
//     // ============================================
//     if (pose.LEFT_HIP && pose.RIGHT_HIP && nodes.mixamorigHips) {
//       const leftHip = mpCoord(pose.LEFT_HIP);
//       const rightHip = mpCoord(pose.RIGHT_HIP);
//       const avgHipZ = (leftHip.z + rightHip.z) / 2;

//       if (prevHipZ.current === null) {
//         prevHipZ.current = avgHipZ;
//       }

//       const deltaZ = avgHipZ - prevHipZ.current;
//       prevHipZ.current = smoothValue(prevHipZ.current, avgHipZ, 0.15);

//       if (Math.abs(deltaZ) > WALK_THRESHOLD) {
//         rootPos.current.z -= deltaZ * WALK_SPEED;
//       }

//       nodes.mixamorigHips.position.z = smoothValue(
//         nodes.mixamorigHips.position.z,
//         rootPos.current.z,
//         0.15
//       );
//     }

//     // ============================================
//     // 🦘 JUMP / CROUCH
//     // ============================================
//     if (pose.LEFT_HIP && pose.RIGHT_HIP && nodes.mixamorigHips) {
//       const leftHip = mpCoord(pose.LEFT_HIP);
//       const rightHip = mpCoord(pose.RIGHT_HIP);
//       const avgHipY = (leftHip.y + rightHip.y) / 2;

//       if (baseHipY.current === null) {
//         baseHipY.current = avgHipY;
//       }

//       const deltaY = avgHipY - baseHipY.current;

//       if (deltaY > JUMP_THRESHOLD) {
//         verticalOffset.current += deltaY * VERTICAL_SPEED;
//       } else if (deltaY < CROUCH_THRESHOLD) {
//         verticalOffset.current += deltaY * VERTICAL_SPEED;
//       }

//       verticalOffset.current *= 0.92; // Gravity

//       nodes.mixamorigHips.position.y = smoothValue(
//         nodes.mixamorigHips.position.y,
//         verticalOffset.current,
//         0.12
//       );
//     }

//     // ============================================
//     // 🖐️ FINGERS
//     // ============================================

//     // ===== LEFT HAND FINGERS =====
//     if (Object.keys(leftHand).length === 21 && nodes) {
//       const fingerConfigs = [
//         { bone: "mixamorigLeftHandIndex1", base: 5, tip: 8 },
//         { bone: "mixamorigLeftHandMiddle1", base: 9, tip: 12 },
//         { bone: "mixamorigLeftHandRing1", base: 13, tip: 16 },
//         { bone: "mixamorigLeftHandPinky1", base: 17, tip: 20 },
//         { bone: "mixamorigLeftHandThumb1", base: 2, tip: 4 },
//       ];

//       fingerConfigs.forEach(({ bone, base, tip }) => {
//         const fingerBone = nodes[bone];
//         if (fingerBone && leftHand[base] && leftHand[tip]) {
//           const dist = Math.hypot(
//             leftHand[tip].x - leftHand[base].x,
//             leftHand[tip].y - leftHand[base].y,
//             leftHand[tip].z - leftHand[base].z
//           );

//           const curl = THREE.MathUtils.mapLinear(
//             dist,
//             0.02,
//             0.08,
//             1.2,
//             0
//           );

//           fingerBone.rotation.x = smoothValue(
//             fingerBone.rotation.x,
//             THREE.MathUtils.clamp(curl, 0, 1.2),
//             0.2
//           );
//         }
//       });
//     }

//     // ===== RIGHT HAND FINGERS =====
//     if (Object.keys(rightHand).length === 21 && nodes) {
//       const fingerConfigs = [
//         { bone: "mixamorigRightHandIndex1", base: 5, tip: 8 },
//         { bone: "mixamorigRightHandMiddle1", base: 9, tip: 12 },
//         { bone: "mixamorigRightHandRing1", base: 13, tip: 16 },
//         { bone: "mixamorigRightHandPinky1", base: 17, tip: 20 },
//         { bone: "mixamorigRightHandThumb1", base: 2, tip: 4 },
//       ];

//       fingerConfigs.forEach(({ bone, base, tip }) => {
//         const fingerBone = nodes[bone];
//         if (fingerBone && rightHand[base] && rightHand[tip]) {
//           const dist = Math.hypot(
//             rightHand[tip].x - rightHand[base].x,
//             rightHand[tip].y - rightHand[base].y,
//             rightHand[tip].z - rightHand[base].z
//           );

//           const curl = THREE.MathUtils.mapLinear(
//             dist,
//             0.02,
//             0.08,
//             1.2,
//             0
//           );

//           fingerBone.rotation.x = smoothValue(
//             fingerBone.rotation.x,
//             THREE.MathUtils.clamp(curl, 0, 1.2),
//             0.2
//           );
//         }
//       });
//     }
//   });

//   return <primitive object={scene} scale={1.3} position={[0, 0, 0]} />;
// }

// /**
//  * MAIN CANVAS
//  */
// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();

//   return (
//     <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
//       <ambientLight intensity={0.7} />
//       <directionalLight position={[5, 10, 7]} intensity={1.2} />
//       <directionalLight position={[-5, 5, -7]} intensity={0.6} />
//       <Environment preset="city" />

//       <AvatarModel landmarks={landmarks} />

//       <OrbitControls target={[0, 1, 0]} />
//     </Canvas>
//   );
// }


//TRY - 10 (live tracking)
// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment, useAnimations } from "@react-three/drei";
// import * as THREE from "three";
// import { useEffect, useRef } from "react";
// import useLandmarks from "../hooks/useLandmarks";
// import { solveTwoBoneIK } from "../utils/ikSolver";
// import { createFilteredLandmarks } from "../utils/smoothing";

// useGLTF.preload("/models/standing.glb");

// /**
//  * 🚀 ENHANCED AVATAR MODEL WITH FULL BODY TRACKING
//  * - Complete pose tracking (33 points instead of just 6)
//  * - Accurate hand rotation and finger tracking
//  * - Smooth transitions between poses
//  */
// function AvatarModel({ landmarks }) {
//   const { scene, nodes } = useGLTF("/models/standing.glb");
//   const groupRef = useRef();

//   // ============================================
//   // STATE
//   // ============================================
//   const restPose = useRef({});
//   const smoothing = useRef({});
//   const filteredLandmarks = useRef(createFilteredLandmarks());

//   // Store previous positions for smoothing
//   const prevPositions = useRef({});

//   // ============================================
//   // CONSTANTS
//   // ============================================
//   const GROUND_Y = -1;
//   const SMOOTHING_FACTOR = 0.2;
//   const HAND_SMOOTHING = 0.15;

//   // ============================================
//   // INITIALIZATION
//   // ============================================
//   useEffect(() => {
//     // Store rest pose rotations
//     scene.traverse((bone) => {
//       if (bone.isBone) {
//         restPose.current[bone.name] = {
//           quaternion: bone.quaternion.clone(),
//           position: bone.position.clone()
//         };
//       }
//     });

//     console.log("✅ Model initialized with", Object.keys(restPose.current).length, "bones");
//   }, [scene]);

//   // ============================================
//   // HELPER FUNCTIONS
//   // ============================================

//   /**
//    * Convert MediaPipe coordinates to Three.js world space
//    */
//   const mpCoord = (landmark) => ({
//     x: (landmark.x - 0.5) * 2.5,
//     y: -(landmark.y - 0.5) * 2.5,
//     z: -landmark.z * 1.5,
//   });

//   /**
//    * Smooth value interpolation
//    */
//   const smoothValue = (current, target, factor = SMOOTHING_FACTOR) => {
//     return current + (target - current) * factor;
//   };

//   /**
//    * Smooth vector interpolation
//    */
//   const smoothVector = (current, target, factor = SMOOTHING_FACTOR) => {
//     return current.lerp(target, factor);
//   };

//   /**
//    * Calculate angle between two points
//    */
//   const calculateAngle = (point1, point2) => {
//     return Math.atan2(point2.y - point1.y, point2.x - point1.x);
//   };

//   /**
//    * Calculate 3D rotation between two vectors
//    */
//   const getRotationBetweenVectors = (v1, v2) => {
//     const axis = new THREE.Vector3().crossVectors(v1, v2).normalize();
//     const angle = Math.acos(THREE.MathUtils.clamp(v1.dot(v2), -1, 1));
//     return new THREE.Quaternion().setFromAxisAngle(axis, angle);
//   };

//   // ============================================
//   // BONE MAPPING FUNCTIONS
//   // ============================================

//   /**
//    * Map MediaPipe pose indices to avatar bones
//    */
//   const getBoneMapping = () => ({
//     // Spine
//     'mixamorigHips': { type: 'position', index: [23, 24] }, // Average of both hips
//     'mixamorigSpine': { type: 'rotation', index: [11, 12, 23, 24] }, // Between shoulders and hips

//     // Left Arm
//     'mixamorigLeftShoulder': { type: 'rotation', index: [11, 13] },
//     'mixamorigLeftArm': { type: 'rotation', index: [11, 13] },
//     'mixamorigLeftForeArm': { type: 'rotation', index: [13, 15] },

//     // Right Arm
//     'mixamorigRightShoulder': { type: 'rotation', index: [12, 14] },
//     'mixamorigRightArm': { type: 'rotation', index: [12, 14] },
//     'mixamorigRightForeArm': { type: 'rotation', index: [14, 16] },

//     // Left Leg
//     'mixamorigLeftUpLeg': { type: 'rotation', index: [23, 25] },
//     'mixamorigLeftLeg': { type: 'rotation', index: [25, 27] },

//     // Right Leg
//     'mixamorigRightUpLeg': { type: 'rotation', index: [24, 26] },
//     'mixamorigRightLeg': { type: 'rotation', index: [26, 28] },

//     // Head
//     'mixamorigNeck': { type: 'rotation', index: [11, 12, 0] },
//     'mixamorigHead': { type: 'rotation', index: [7, 8] }, // Between ears
//   });

//   // ============================================
//   // POSE PROCESSING FUNCTIONS
//   // ============================================

//   /**
//    * Process pose landmarks and update avatar
//    */
//   const processPose = (poseLandmarks) => {
//     if (!poseLandmarks || !nodes) return;

//     const boneMapping = getBoneMapping();

//     // Process each bone in mapping
//     Object.entries(boneMapping).forEach(([boneName, config]) => {
//       const bone = nodes[boneName];
//       if (!bone) return;

//       if (config.type === 'rotation') {
//         updateBoneRotation(bone, poseLandmarks, config.index);
//       } else if (config.type === 'position') {
//         updateBonePosition(bone, poseLandmarks, config.index);
//       }
//     });

//     // Special handling for hands
//     processHands(poseLandmarks);
//   };

//   /**
//    * Update bone rotation based on landmarks
//    */
//   const updateBoneRotation = (bone, landmarks, indices) => {
//     if (indices.length < 2) return;

//     // Get landmark points
//     const point1 = mpCoord(landmarks[indices[0]]);
//     const point2 = mpCoord(landmarks[indices[1]]);

//     // Calculate direction vector
//     const direction = new THREE.Vector3(
//       point2.x - point1.x,
//       point2.y - point1.y,
//       point2.z - point1.z
//     ).normalize();

//     // Create target rotation
//     const upVector = new THREE.Vector3(0, 1, 0);
//     const targetQuat = new THREE.Quaternion().setFromUnitVectors(upVector, direction);

//     // Smooth rotation
//     if (!smoothing.current[bone.name]) {
//       smoothing.current[bone.name] = { quaternion: bone.quaternion.clone() };
//     }

//     smoothing.current[bone.name].quaternion.slerp(targetQuat, SMOOTHING_FACTOR);
//     bone.quaternion.copy(smoothing.current[bone.name].quaternion);
//   };

//   /**
//    * Update bone position
//    */
//   const updateBonePosition = (bone, landmarks, indices) => {
//     if (indices.length < 1) return;

//     // Calculate average position
//     const avgPosition = indices.reduce((sum, index) => {
//       const coord = mpCoord(landmarks[index]);
//       return {
//         x: sum.x + coord.x,
//         y: sum.y + coord.y,
//         z: sum.z + coord.z
//       };
//     }, { x: 0, y: 0, z: 0 });

//     avgPosition.x /= indices.length;
//     avgPosition.y /= indices.length;
//     avgPosition.z /= indices.length;

//     // Smooth position
//     const targetPos = new THREE.Vector3(avgPosition.x, avgPosition.y, avgPosition.z);
//     bone.position.lerp(targetPos, SMOOTHING_FACTOR);
//   };

//   /**
//    * Process hand landmarks
//    */
//   const processHands = (poseLandmarks) => {
//     // Process left hand if landmarks available
//     if (poseLandmarks[15] && poseLandmarks[17] && poseLandmarks[19]) {
//       updateHand('mixamorigLeftHand', poseLandmarks[15], poseLandmarks[17], poseLandmarks[19]);
//     }

//     // Process right hand if landmarks available
//     if (poseLandmarks[16] && poseLandmarks[18] && poseLandmarks[20]) {
//       updateHand('mixamorigRightHand', poseLandmarks[16], poseLandmarks[18], poseLandmarks[20]);
//     }
//   };

//   /**
//    * Update hand rotation
//    */
//   const updateHand = (handBoneName, wrist, indexTip, pinkyTip) => {
//     const handBone = nodes[handBoneName];
//     if (!handBone) return;

//     // Calculate hand orientation
//     const wristPos = mpCoord(wrist);
//     const indexPos = mpCoord(indexTip);
//     const pinkyPos = mpCoord(pinkyTip);

//     // Calculate forward vector (from wrist to middle of index and pinky)
//     const midPoint = {
//       x: (indexPos.x + pinkyPos.x) / 2,
//       y: (indexPos.y + pinkyPos.y) / 2,
//       z: (indexPos.z + pinkyPos.z) / 2
//     };

//     const forward = new THREE.Vector3(
//       midPoint.x - wristPos.x,
//       midPoint.y - wristPos.y,
//       midPoint.z - wristPos.z
//     ).normalize();

//     // Calculate right vector (from pinky to index)
//     const right = new THREE.Vector3(
//       indexPos.x - pinkyPos.x,
//       indexPos.y - pinkyPos.y,
//       indexPos.z - pinkyPos.z
//     ).normalize();

//     // Calculate up vector (cross product)
//     const up = new THREE.Vector3().crossVectors(forward, right).normalize();

//     // Create rotation matrix
//     const matrix = new THREE.Matrix4().makeBasis(right, up, forward);
//     const targetQuat = new THREE.Quaternion().setFromRotationMatrix(matrix);

//     // Smooth hand rotation
//     if (!smoothing.current[handBoneName]) {
//       smoothing.current[handBoneName] = { quaternion: handBone.quaternion.clone() };
//     }

//     smoothing.current[handBoneName].quaternion.slerp(targetQuat, HAND_SMOOTHING);
//     handBone.quaternion.copy(smoothing.current[handBoneName].quaternion);
//   };

//   /**
//    * Process finger movements
//    */
//   const processFingers = (handLandmarks, isLeftHand = false) => {
//     if (!handLandmarks || Object.keys(handLandmarks).length < 21) return;

//     const fingerConfigs = [
//       { bone: "Thumb", base: 2, tip: 4 },
//       { bone: "Index", base: 5, tip: 8 },
//       { bone: "Middle", base: 9, tip: 12 },
//       { bone: "Ring", base: 13, tip: 16 },
//       { bone: "Pinky", base: 17, tip: 20 },
//     ];

//     fingerConfigs.forEach(({ bone, base, tip }) => {
//       const boneName = `mixamorig${isLeftHand ? 'Left' : 'Right'}Hand${bone}1`;
//       const fingerBone = nodes[boneName];

//       if (fingerBone && handLandmarks[base] && handLandmarks[tip]) {
//         // Calculate finger curl based on distance
//         const baseCoord = mpCoord(handLandmarks[base]);
//         const tipCoord = mpCoord(handLandmarks[tip]);

//         const distance = Math.sqrt(
//           Math.pow(tipCoord.x - baseCoord.x, 2) +
//           Math.pow(tipCoord.y - baseCoord.y, 2) +
//           Math.pow(tipCoord.z - baseCoord.z, 2)
//         );

//         // Map distance to rotation (0 = straight, 1 = fully curled)
//         const curl = THREE.MathUtils.mapLinear(distance, 0.05, 0.2, 0, 1.5);

//         // Apply rotation with smoothing
//         fingerBone.rotation.x = smoothValue(
//           fingerBone.rotation.x,
//           THREE.MathUtils.clamp(curl, 0, 1.5),
//           0.3
//         );
//       }
//     });
//   };

//   // ============================================
//   // MAIN ANIMATION LOOP
//   // ============================================
//   useFrame(() => {
//     // Apply Kalman filtering to landmarks
//     const smoothedLandmarks = filteredLandmarks.current.update(landmarks);

//     if (!smoothedLandmarks?.pose) {
//       // No pose data, return to rest pose
//       scene.traverse((bone) => {
//         if (bone.isBone && restPose.current[bone.name]) {
//           bone.quaternion.slerp(restPose.current[bone.name].quaternion, 0.1);
//           bone.position.lerp(restPose.current[bone.name].position, 0.1);
//         }
//       });
//       return;
//     }

//     // Extract pose and hand data
//     const pose = smoothedLandmarks.pose;
//     const leftHand = smoothedLandmarks.left_hand || {};
//     const rightHand = smoothedLandmarks.right_hand || {};

//     // Convert pose landmarks to array if needed
//     const poseArray = Array.isArray(pose) ? pose : Object.values(pose);

//     // Process pose landmarks
//     processPose(poseArray);

//     // Process finger movements
//     processFingers(leftHand, true);
//     processFingers(rightHand, false);

//     // Update hips position based on body center
//     if (poseArray.length >= 25 && nodes.mixamorigHips) {
//       const leftHip = mpCoord(poseArray[23]);
//       const rightHip = mpCoord(poseArray[24]);

//       // Calculate center point
//       const centerX = (leftHip.x + rightHip.x) / 2;
//       const centerY = (leftHip.y + rightHip.y) / 2 - 1; // Adjust height
//       const centerZ = (leftHip.z + rightHip.z) / 2;

//       // Smoothly move hips to center
//       nodes.mixamorigHips.position.lerp(
//         new THREE.Vector3(centerX, Math.max(GROUND_Y, centerY), centerZ),
//         SMOOTHING_FACTOR
//       );
//     }
//   });

//   return <primitive object={scene} ref={groupRef} scale={1.5} position={[0, 0, 0]} />;
// }

// /**
//  * MAIN CANVAS COMPONENT
//  */
// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();

//   return (
//     <Canvas 
//       camera={{ 
//         position: [0, 1.8, 5], 
//         fov: 50,
//         near: 0.1,
//         far: 1000 
//       }}
//       shadows
//     >
//       {/* Lighting */}
//       <ambientLight intensity={0.6} />
//       <directionalLight 
//         position={[5, 10, 7]} 
//         intensity={1.2}
//         castShadow
//         shadow-mapSize-width={2048}
//         shadow-mapSize-height={2048}
//       />
//       <directionalLight 
//         position={[-5, 5, -7]} 
//         intensity={0.6}
//         color="#ffccaa"
//       />
//       <hemisphereLight 
//         skyColor="#ffffff"
//         groundColor="#888888"
//         intensity={0.5}
//       />

//       {/* Environment */}
//       <Environment preset="studio" />

//       {/* Floor */}
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
//         <planeGeometry args={[20, 20]} />
//         <shadowMaterial opacity={0.3} />
//         <meshStandardMaterial color="#333333" roughness={0.8} />
//       </mesh>

//       {/* Avatar */}
//       <AvatarModel landmarks={landmarks} />

//       {/* Camera Controls */}
//       <OrbitControls 
//         enablePan={true}
//         enableZoom={true}
//         enableRotate={true}
//         target={[0, 1.5, 0]}
//         minDistance={2}
//         maxDistance={10}
//         maxPolarAngle={Math.PI / 2}
//       />

//       {/* Grid Helper */}
//       <gridHelper args={[20, 20, 0x444444, 0x888888]} />

//       {/* Axis Helper */}
//       <axesHelper args={[2]} />
//     </Canvas>
//   );
// }


//TRY - 11
// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment, useAnimations } from "@react-three/drei";
// import * as THREE from "three";
// import { useEffect, useRef, useState } from "react";
// import useLandmarks from "../hooks/useLandmarks";
// import { solveTwoBoneIK } from "../utils/ikSolver";
// import { createFilteredLandmarks } from "../utils/smoothing";

// // Preload models
// useGLTF.preload("/models/standing.glb");

// /**
//  * 🎭 IDLE ANIMATION MODEL
//  * Plays idle animations when no live data is available
//  */
// function IdleAvatar() {
//   const { scene, nodes, animations } = useGLTF("/models/standing.glb");
//   const groupRef = useRef();
//   const mixerRef = useRef();
//   const animationActions = useRef({});
//   const currentAnimationRef = useRef("Idle");
//   const idleTimeRef = useRef(0);

//   // Idle animations list (you can add more animations)
//   const idleAnimations = ["Idle", "Neutral Idle", "Waving", "Walking"];

//   useEffect(() => {
//     if (scene && animations.length > 0) {
//       // Create animation mixer
//       mixerRef.current = new THREE.AnimationMixer(scene);

//       // Setup all animations
//       animations.forEach((clip) => {
//         animationActions.current[clip.name] = mixerRef.current.clipAction(clip);
//         animationActions.current[clip.name].clampWhenFinished = true;
//         animationActions.current[clip.name].loop = THREE.LoopRepeat;
//       });

//       // Start with Idle animation
//       if (animationActions.current["Idle"]) {
//         animationActions.current["Idle"].play();
//       } else if (animationActions.current[animations[0].name]) {
//         animationActions.current[animations[0].name].play();
//         currentAnimationRef.current = animations[0].name;
//       }

//       console.log(`🎭 Loaded ${animations.length} idle animations:`, animations.map(a => a.name));
//     }

//     return () => {
//       if (mixerRef.current) {
//         mixerRef.current.stopAllAction();
//       }
//     };
//   }, [scene, animations]);

//   // Animation frame update
//   useFrame((state, delta) => {
//     // Update animation mixer
//     if (mixerRef.current) {
//       mixerRef.current.update(delta);
//     }

//     // Randomly switch animations every 10-20 seconds
//     idleTimeRef.current += delta;
//     if (idleTimeRef.current > 10 + Math.random() * 10) {
//       idleTimeRef.current = 0;
//       changeIdleAnimation();
//     }

//     // Add subtle breathing motion
//     if (groupRef.current) {
//       const breath = Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
//       groupRef.current.position.y = breath;
//     }
//   });

//   const changeIdleAnimation = () => {
//     if (!mixerRef.current || Object.keys(animationActions.current).length === 0) return;

//     const currentAction = animationActions.current[currentAnimationRef.current];
//     if (currentAction) {
//       currentAction.fadeOut(0.5);
//     }

//     // Select random animation
//     const availableAnimations = idleAnimations.filter(name => 
//       animationActions.current[name] && name !== currentAnimationRef.current
//     );

//     if (availableAnimations.length > 0) {
//       const nextAnimation = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
//       const nextAction = animationActions.current[nextAnimation];

//       if (nextAction) {
//         nextAction.reset().fadeIn(0.5).play();
//         currentAnimationRef.current = nextAnimation;
//         console.log(`🔄 Switching idle animation to: ${nextAnimation}`);
//       }
//     }
//   };

//   return <primitive object={scene} ref={groupRef} scale={1.3} position={[0, 0, 0]} />;
// }

// /**
//  * 🚀 LIVE TRACKING MODEL
//  * Follows real-time pose data when available
//  */
// function LiveAvatar({ landmarks }) {
//   const { scene, nodes } = useGLTF("/models/standing.glb");

//   // ============================================
//   // STATE
//   // ============================================
//   const restPose = useRef({});
//   const smoothing = useRef({});
//   const filteredLandmarks = useRef(createFilteredLandmarks());
//   const transitionProgress = useRef(0);
//   const isTransitioning = useRef(false);

//   // ============================================
//   // INITIALIZATION
//   // ============================================
//   useEffect(() => {
//     scene.traverse((bone) => {
//       if (bone.isBone) {
//         restPose.current[bone.name] = bone.quaternion.clone();
//         smoothing.current[bone.name] = {
//           quaternion: bone.quaternion.clone(),
//           position: bone.position.clone()
//         };
//       }
//     });

//     // Start transition from idle to live
//     isTransitioning.current = true;
//     transitionProgress.current = 0;

//     console.log("🚀 Live tracking initialized");
//   }, [scene]);

//   // ============================================
//   // HELPER FUNCTIONS
//   // ============================================
//   const mpCoord = (landmark) => ({
//     x: (landmark.x - 0.5) * 2,
//     y: -(landmark.y - 0.5) * 2,
//     z: -landmark.z * 2,
//   });

//   const smoothValue = (current, target, factor = 0.2) => {
//     return current + (target - current) * factor;
//   };

//   // ============================================
//   // POSE PROCESSING
//   // ============================================
//   const processPose = (pose) => {
//     if (!pose || !nodes) return;

//     // Head rotation
//     if (pose.LEFT_EAR && pose.RIGHT_EAR && nodes.mixamorigHead) {
//       const leftEar = mpCoord(pose.LEFT_EAR);
//       const rightEar = mpCoord(pose.RIGHT_EAR);
//       const headTilt = Math.atan2(rightEar.y - leftEar.y, rightEar.x - leftEar.x);

//       const targetQuat = new THREE.Quaternion().setFromEuler(
//         new THREE.Euler(0, 0, headTilt * 0.3)
//       );

//       nodes.mixamorigHead.quaternion.slerp(targetQuat, 0.1);
//     }

//     // Arms
//     processArm("Left", pose);
//     processArm("Right", pose);

//     // Spine
//     if (pose.LEFT_SHOULDER && pose.RIGHT_SHOULDER && nodes.mixamorigSpine) {
//       const leftShoulder = mpCoord(pose.LEFT_SHOULDER);
//       const rightShoulder = mpCoord(pose.RIGHT_SHOULDER);
//       const spineRotation = Math.atan2(
//         rightShoulder.y - leftShoulder.y,
//         rightShoulder.x - leftShoulder.x
//       );

//       nodes.mixamorigSpine.rotation.z = smoothValue(
//         nodes.mixamorigSpine.rotation.z,
//         spineRotation * 0.2,
//         0.15
//       );
//     }
//   };

//   const processArm = (side, pose) => {
//     const shoulderKey = `${side.toUpperCase()}_SHOULDER`;
//     const elbowKey = `${side.toUpperCase()}_ELBOW`;
//     const wristKey = `${side.toUpperCase()}_WRIST`;

//     if (pose[shoulderKey] && pose[elbowKey] && pose[wristKey]) {
//       const shoulder = mpCoord(pose[shoulderKey]);
//       const elbow = mpCoord(pose[elbowKey]);
//       const wrist = mpCoord(pose[wristKey]);

//       // Calculate arm angles
//       const upperArmBone = nodes[`mixamorig${side}Arm`];
//       const forearmBone = nodes[`mixamorig${side}ForeArm`];
//       const handBone = nodes[`mixamorig${side}Hand`];

//       if (upperArmBone && forearmBone && handBone) {
//         // Solve IK for arm
//         solveTwoBoneIK({
//           root: upperArmBone,
//           mid: forearmBone,
//           end: handBone,
//           target: new THREE.Vector3(wrist.x, wrist.y, wrist.z),
//           pole: new THREE.Vector3(0, 1, 0),
//         });
//       }
//     }
//   };

//   // ============================================
//   // ANIMATION FRAME
//   // ============================================
//   useFrame(() => {
//     // Smooth transition from idle to live
//     if (isTransitioning.current && transitionProgress.current < 1) {
//       transitionProgress.current += 0.05;
//       if (transitionProgress.current >= 1) {
//         isTransitioning.current = false;
//       }
//     }

//     // Process landmarks
//     const smoothedLandmarks = filteredLandmarks.current.update(landmarks);
//     if (smoothedLandmarks?.pose) {
//       processPose(smoothedLandmarks.pose);

//       // Process hands
//       processHand(smoothedLandmarks.left_hand, "Left");
//       processHand(smoothedLandmarks.right_hand, "Right");
//     }
//   });

//   const processHand = (handLandmarks, side) => {
//     if (!handLandmarks || Object.keys(handLandmarks).length < 21) return;

//     const handBone = nodes[`mixamorig${side}Hand`];
//     if (!handBone) return;

//     // Simple finger curl based on landmark distances
//     const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips

//     fingerTips.forEach((tipIndex, fingerIndex) => {
//       const baseIndex = tipIndex - 2; // Approximate base joint
//       if (handLandmarks[baseIndex] && handLandmarks[tipIndex]) {
//         const base = handLandmarks[baseIndex];
//         const tip = handLandmarks[tipIndex];

//         // Calculate distance for curl
//         const dist = Math.sqrt(
//           Math.pow(tip.x - base.x, 2) +
//           Math.pow(tip.y - base.y, 2) +
//           Math.pow(tip.z - base.z, 2)
//         );

//         // Map distance to finger curl
//         const curl = THREE.MathUtils.mapLinear(dist, 0.05, 0.2, 1.5, 0);

//         // Apply to finger bones
//         const fingerBone = nodes[`mixamorig${side}Hand${["Thumb", "Index", "Middle", "Ring", "Pinky"][fingerIndex]}1`];
//         if (fingerBone) {
//           fingerBone.rotation.x = smoothValue(
//             fingerBone.rotation.x,
//             THREE.MathUtils.clamp(curl, 0, 1.5),
//             0.3
//           );
//         }
//       }
//     });
//   };

//   return <primitive object={scene} scale={1.3} position={[0, 0, 0]} />;
// }

// /**
//  * MAIN AVATAR CANVAS WITH MODE SWITCHING
//  */
// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();
//   const [connectionStatus, setConnectionStatus] = useState("connecting");
//   const [showControls, setShowControls] = useState(true);
//   const cameraRef = useRef();

//   // Monitor connection status
//   useEffect(() => {
//     if (landmarks) {
//       setConnectionStatus("connected");
//     } else {
//       setConnectionStatus("disconnected");
//     }
//   }, [landmarks]);

//   return (
//     <>
//       {/* Connection Status Overlay */}
//       <div style={{
//         position: 'absolute',
//         top: 20,
//         left: 20,
//         zIndex: 100,
//         background: connectionStatus === 'connected' 
//           ? 'rgba(0, 255, 100, 0.2)' 
//           : 'rgba(255, 165, 0, 0.2)',
//         padding: '10px 20px',
//         borderRadius: '10px',
//         border: `2px solid ${connectionStatus === 'connected' ? '#00ff64' : '#ffa500'}`,
//         color: 'white',
//         fontFamily: 'monospace',
//         backdropFilter: 'blur(10px)'
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//           <div style={{
//             width: '10px',
//             height: '10px',
//             borderRadius: '50%',
//             background: connectionStatus === 'connected' ? '#00ff64' : '#ffa500',
//             animation: connectionStatus === 'connected' ? 'pulse 2s infinite' : 'none'
//           }} />
//           <span>
//             {connectionStatus === 'connected' 
//               ? '✅ LIVE TRACKING ACTIVE' 
//               : '🔄 WAITING FOR SERVER...'}
//           </span>
//         </div>
//         {connectionStatus === 'disconnected' && (
//           <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>
//             Start the capture script to begin live tracking
//           </div>
//         )}
//       </div>

//       {/* Toggle Controls Button */}
//       <button
//         onClick={() => setShowControls(!showControls)}
//         style={{
//           position: 'absolute',
//           top: 20,
//           right: 20,
//           zIndex: 100,
//           padding: '8px 16px',
//           background: 'rgba(0, 0, 0, 0.5)',
//           color: 'white',
//           border: '1px solid #00ffcc',
//           borderRadius: '5px',
//           cursor: 'pointer',
//           fontFamily: 'monospace'
//         }}
//       >
//         {showControls ? 'Hide Controls' : 'Show Controls'}
//       </button>

//       {/* Main Canvas */}
//       <Canvas 
//         camera={{ 
//           position: [0, 1.5, 4], 
//           fov: 50,
//           ref: cameraRef
//         }}
//         shadows
//       >
//         {/* Lighting */}
//         <ambientLight intensity={0.6} />
//         <directionalLight 
//           position={[5, 10, 7]} 
//           intensity={1.2}
//           castShadow
//           shadow-mapSize-width={1024}
//           shadow-mapSize-height={1024}
//         />
//         <directionalLight 
//           position={[-5, 5, -7]} 
//           intensity={0.6}
//           color="#ffccaa"
//         />
//         <hemisphereLight 
//           skyColor="#ffffff"
//           groundColor="#888888"
//           intensity={0.5}
//         />

//         {/* Environment */}
//         <Environment preset="city" />

//         {/* Floor */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
//           <planeGeometry args={[20, 20]} />
//           <shadowMaterial opacity={0.3} />
//           <meshStandardMaterial color="#333333" roughness={0.8} />
//         </mesh>

//         {/* Grid Helper */}
//         <gridHelper args={[20, 20, 0x444444, 0x888888]} />

//         {/* Avatar - Switches between idle and live */}
//         {landmarks ? (
//           <LiveAvatar landmarks={landmarks} />
//         ) : (
//           <IdleAvatar />
//         )}

//         {/* Camera Controls */}
//         {showControls && (
//           <OrbitControls 
//             enablePan={true}
//             enableZoom={true}
//             enableRotate={true}
//             target={[0, 1, 0]}
//             minDistance={2}
//             maxDistance={10}
//             maxPolarAngle={Math.PI / 2}
//           />
//         )}

//         {/* Axis Helper */}
//         <axesHelper args={[2]} />
//       </Canvas>

//       {/* Instructions Overlay */}
//       <div style={{
//         position: 'absolute',
//         bottom: 20,
//         left: '50%',
//         transform: 'translateX(-50%)',
//         background: 'rgba(0, 0, 0, 0.7)',
//         padding: '15px 30px',
//         borderRadius: '10px',
//         color: 'white',
//         fontFamily: 'sans-serif',
//         textAlign: 'center',
//         backdropFilter: 'blur(10px)',
//         border: '1px solid rgba(0, 255, 204, 0.3)',
//         maxWidth: '80%'
//       }}>
//         <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
//           {connectionStatus === 'connected' ? '🎯 Live Tracking Active' : '💤 Idle Mode'}
//         </div>
//         <div style={{ fontSize: '14px', opacity: 0.8 }}>
//           {connectionStatus === 'connected' 
//             ? 'Your movements are being tracked in real-time' 
//             : 'Waiting for server connection. Run: python capture_and_send.py'}
//         </div>
//       </div>
//     </>
//   );
// }


//TRY - 12

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment, Html } from "@react-three/drei";
// import * as THREE from "three";
// import { useEffect, useRef, useState, Suspense, useCallback } from "react";
// import useLandmarks from "../hooks/useLandmarks";
// import { solveTwoBoneIK } from "../utils/ikSolver";
// import { createFilteredLandmarks } from "../utils/smoothing";

// // Preload models
// useGLTF.preload("/models/standing.glb");

// /**
//  * 🕺 MALE DANCE POSE IDLE AVATAR - FIXED WITH ANIMATION HANDLING
//  */
// function MaleDancePoseAvatar() {
//   const [model, setModel] = useState(null);
//   const [mixer, setMixer] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const groupRef = useRef();
//   const animationRef = useRef({ time: 0 });
//   const clockRef = useRef(new THREE.Clock(false));

//   // Helper function to create breathing animation
//   const createBreathingAnimation = useCallback((targetModel, animationMixer) => {
//     // Create a simple breathing animation
//     const tracks = [];

//     // Add some subtle movement to root
//     const positionTrack = new THREE.VectorKeyframeTrack(
//       '.position[y]',
//       [0, 1, 2],
//       [0, 0.02, 0]
//     );
//     tracks.push(positionTrack);

//     const rotationTrack = new THREE.VectorKeyframeTrack(
//       '.rotation[y]',
//       [0, 1, 2],
//       [0, 0.01, 0]
//     );
//     tracks.push(rotationTrack);

//     const clip = new THREE.AnimationClip('breathing', 2, tracks);
//     const action = animationMixer.clipAction(clip);
//     action.loop = THREE.LoopRepeat;
//     action.play();

//     return animationMixer;
//   }, []);

//   // Helper function to extend short animations
//   const extendAnimationClip = useCallback((clip) => {
//     // Create a new longer animation by repeating the short one
//     const newDuration = 3.0; // 3 seconds

//     // If it's a very short animation (like 1 frame), make it a hold pose
//     if (clip.duration < 0.1) {
//       console.log("📏 Very short animation detected, creating hold animation");

//       // Create a simple looping animation from scratch
//       const newClip = new THREE.AnimationClip('extended_dance', newDuration, []);

//       // Add some basic movement tracks
//       const positionTrack = new THREE.VectorKeyframeTrack(
//         '.position[y]',
//         [0, 1.5, 3.0],
//         [0, 0.03, 0]
//       );

//       const rotationTrack = new THREE.VectorKeyframeTrack(
//         '.rotation[y]',
//         [0, 1.5, 3.0],
//         [0, 0.05, 0]
//       );

//       newClip.tracks.push(positionTrack, rotationTrack);
//       return newClip;
//     }

//     // Otherwise, try to extend the existing tracks
//     try {
//       const extendedTracks = [];

//       clip.tracks.forEach((track, trackIndex) => {
//         // Create extended version of the track
//         const times = [];
//         const values = [];

//         // Repeat the animation pattern multiple times
//         const repeats = Math.ceil(newDuration / clip.duration);

//         for (let i = 0; i < repeats; i++) {
//           const timeOffset = i * clip.duration;

//           if (track.times && track.values) {
//             // Add original keyframes with time offset
//             track.times.forEach((time, idx) => {
//               times.push(time + timeOffset);

//               // Cycle through values for repeating pattern
//               const valueIdx = idx % track.values.length;
//               values.push(track.values[valueIdx]);
//             });
//           }
//         }

//         if (times.length > 0 && values.length > 0) {
//           const extendedTrack = new track.constructor(
//             track.name,
//             times,
//             values
//           );
//           extendedTracks.push(extendedTrack);
//         }
//       });

//       return new THREE.AnimationClip(
//         `${clip.name}_extended`,
//         newDuration,
//         extendedTracks
//       );
//     } catch (err) {
//       console.warn("⚠️ Could not extend animation, using original:", err);
//       return clip;
//     }
//   }, []);

//   useEffect(() => {
//     let fbxLoader;
//     let cleanup = () => {};

//     const loadModel = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         console.log("🕺 Loading Male Dance Pose FBX...");

//         // Dynamically import FBXLoader to avoid SSR issues
//         const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
//         fbxLoader = new FBXLoader();

//         // Load the model
//         const loadedModel = await new Promise((resolve, reject) => {
//           fbxLoader.load(
//             "/models/Male Dance Pose.fbx",
//             (fbx) => {
//               console.log("✅ FBX model loaded successfully");
//               console.log("📊 Model info:", {
//                 type: fbx.type,
//                 children: fbx.children.length,
//                 animations: fbx.animations?.length || 0,
//                 animationNames: fbx.animations?.map(a => a.name) || []
//               });
//               resolve(fbx);
//             },
//             (progress) => {
//               const percent = progress.total > 0 
//                 ? (progress.loaded / progress.total * 100).toFixed(1)
//                 : '0.0';
//               console.log(`📥 Loading: ${percent}%`);
//             },
//             (err) => {
//               console.error("❌ Failed to load FBX:", err);
//               reject(err);
//             }
//           );
//         });

//         if (loadedModel) {
//           // Scale and position
//           loadedModel.scale.setScalar(0.02);
//           loadedModel.position.set(0, -1.5, 0);
//           loadedModel.rotation.y = Math.PI;

//           // Enable shadows and enhance materials
//           loadedModel.traverse((child) => {
//             if (child.isMesh) {
//               child.castShadow = true;
//               child.receiveShadow = true;

//               // Enhance materials
//               if (child.material) {
//                 child.material.metalness = 0.3;
//                 child.material.roughness = 0.7;
//                 child.material.needsUpdate = true;
//               }
//             }
//           });

//           // Extract animations
//           const animations = loadedModel.animations || [];
//           console.log(`🎬 Found ${animations.length} animations`);

//           if (animations.length > 0) {
//             // Create animation mixer
//             const animationMixer = new THREE.AnimationMixer(loadedModel);

//             // Process each animation clip
//             animations.forEach((clip, index) => {
//               console.log(`🎬 Animation ${index + 1}: "${clip.name}"`);
//               console.log("   Duration:", clip.duration, "seconds");
//               console.log("   Tracks:", clip.tracks.length);

//               let animationClip = clip;

//               // Check if animation is very short (likely a pose)
//               if (clip.duration < 0.5) {
//                 console.log("🔄 Extending short animation...");
//                 animationClip = extendAnimationClip(clip);
//               }

//               // Create and configure the action
//               const action = animationMixer.clipAction(animationClip);

//               // Set animation properties
//               action.timeScale = 0.8; // Slightly slower
//               action.setEffectiveWeight(1.0);
//               action.clampWhenFinished = false;
//               action.loop = THREE.LoopRepeat;
//               action.repetitions = Infinity;

//               // Random starting point for variety
//               action.time = Math.random() * animationClip.duration;

//               action.play();

//               console.log(`▶️ Playing extended animation: ${animationClip.duration.toFixed(2)}s`);
//             });

//             setMixer(animationMixer);
//           } else {
//             console.log("⚠️ No animations found in FBX file");
//             // Mark for procedural animation
//             loadedModel.userData.needsProceduralAnimation = true;
//           }

//           setModel(loadedModel);
//           clockRef.current.start();
//         }

//       } catch (err) {
//         console.error("❌ Error loading model:", err);
//         setError(err.message);

//         // Create a simple fallback dancing character
//         createFallbackModel();

//       } finally {
//         setLoading(false);
//       }
//     };

//     const createFallbackModel = () => {
//       console.log("🔄 Creating fallback dance model...");

//       // Create a group for the fallback model
//       const fallbackGroup = new THREE.Group();
//       fallbackGroup.userData.isFallback = true;

//       // Create body parts
//       const bodyGeometry = new THREE.BoxGeometry(1, 2, 0.5);
//       const bodyMaterial = new THREE.MeshStandardMaterial({ 
//         color: 0xff00ff,
//         emissive: 0xff00ff,
//         emissiveIntensity: 0.2
//       });
//       const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
//       body.castShadow = true;
//       body.name = "body";
//       fallbackGroup.add(body);

//       // Head
//       const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
//       const headMaterial = new THREE.MeshStandardMaterial({ 
//         color: 0x00ffff,
//         emissive: 0x00ffff,
//         emissiveIntensity: 0.1
//       });
//       const head = new THREE.Mesh(headGeometry, headMaterial);
//       head.position.y = 1.5;
//       head.castShadow = true;
//       head.name = "head";
//       fallbackGroup.add(head);

//       // Arms
//       const armGeometry = new THREE.BoxGeometry(0.3, 1.2, 0.3);
//       const armMaterial = new THREE.MeshStandardMaterial({ color: 0xff8800 });

//       const leftArm = new THREE.Mesh(armGeometry, armMaterial);
//       leftArm.position.set(-0.8, 0.5, 0);
//       leftArm.castShadow = true;
//       leftArm.name = "leftArm";
//       fallbackGroup.add(leftArm);

//       const rightArm = new THREE.Mesh(armGeometry, armMaterial);
//       rightArm.position.set(0.8, 0.5, 0);
//       rightArm.castShadow = true;
//       rightArm.name = "rightArm";
//       fallbackGroup.add(rightArm);

//       // Legs
//       const legGeometry = new THREE.BoxGeometry(0.3, 1.2, 0.3);
//       const legMaterial = new THREE.MeshStandardMaterial({ color: 0x0088ff });

//       const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
//       leftLeg.position.set(-0.3, -1.5, 0);
//       leftLeg.castShadow = true;
//       leftLeg.name = "leftLeg";
//       fallbackGroup.add(leftLeg);

//       const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
//       rightLeg.position.set(0.3, -1.5, 0);
//       rightLeg.castShadow = true;
//       rightLeg.name = "rightLeg";
//       fallbackGroup.add(rightLeg);

//       // Add animation data
//       fallbackGroup.userData.animationTime = 0;
//       fallbackGroup.userData.parts = {
//         leftArm, rightArm, leftLeg, rightLeg, head, body
//       };

//       setModel(fallbackGroup);
//     };

//     loadModel();

//     // Cleanup function
//     cleanup = () => {
//       if (mixer) {
//         mixer.stopAllAction();
//       }
//     };

//     return cleanup;
//   }, [extendAnimationClip]);

//   // Update procedural animation for models without proper animations
//   const updateProceduralAnimation = useCallback((delta) => {
//     if (!model || !groupRef.current) return;

//     const time = clockRef.current.getElapsedTime();

//     // Global movements
//     const breath = Math.sin(time * 2) * 0.02;
//     const sway = Math.sin(time * 0.8) * 0.03;
//     const bounce = Math.sin(time * 1.5) * 0.01;

//     groupRef.current.position.y = breath + bounce;
//     groupRef.current.rotation.z = sway;
//     groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.01;

//     // For fallback model with named parts
//     if (model.userData.isFallback && model.userData.parts) {
//       const parts = model.userData.parts;

//       // Head movement
//       parts.head.rotation.y = Math.sin(time * 1.2) * 0.1;
//       parts.head.rotation.x = Math.sin(time * 0.8) * 0.05;

//       // Arm movements with offset
//       parts.leftArm.rotation.x = Math.sin(time * 3) * 0.8;
//       parts.leftArm.rotation.z = Math.sin(time * 1.5) * 0.2;
//       parts.rightArm.rotation.x = Math.sin(time * 3 + Math.PI) * 0.8;
//       parts.rightArm.rotation.z = Math.sin(time * 1.5 + Math.PI) * 0.2;

//       // Leg movements with offset
//       parts.leftLeg.rotation.x = Math.sin(time * 2) * 0.6;
//       parts.rightLeg.rotation.x = Math.sin(time * 2 + Math.PI) * 0.6;

//       // Body rotation
//       parts.body.rotation.y = Math.sin(time * 0.5) * 0.05;
//     }

//     // For FBX models without animations
//     if (model.userData.needsProceduralAnimation) {
//       // Apply subtle movement to the entire model
//       model.rotation.y += 0.001;
//       model.position.y = Math.sin(time * 2) * 0.01;

//       // Try to find and animate specific bones/meshes
//       model.traverse((child) => {
//         if (child.isMesh) {
//           // Add subtle random movements to different parts
//           const seed = child.uuid || '';
//           const hash = seed.split('').reduce((a, b) => {
//             a = ((a << 5) - a) + b.charCodeAt(0);
//             return a & a;
//           }, 0);

//           const frequency = 1 + (Math.abs(hash) % 10) / 10;
//           const amplitude = 0.1 + (Math.abs(hash) % 10) / 100;

//           if (child.name.includes('Arm') || child.name.includes('arm')) {
//             child.rotation.x = Math.sin(time * frequency) * amplitude;
//           }
//           if (child.name.includes('Leg') || child.name.includes('leg')) {
//             child.rotation.x = Math.sin(time * (frequency * 0.7)) * amplitude * 0.5;
//           }
//           if (child.name.includes('Head') || child.name.includes('head')) {
//             child.rotation.y = Math.sin(time * 0.5) * 0.1;
//           }
//         }
//       });
//     }
//   }, [model]);

//   // Animation frame update
//   useFrame((state, delta) => {
//     // Update animation mixer if exists
//     if (mixer) {
//       mixer.update(delta);
//     }

//     // Update procedural animations
//     updateProceduralAnimation(delta);

//     // Add continuous rotation for visual interest
//     if (groupRef.current) {
//       groupRef.current.rotation.y += 0.0005;
//     }
//   });

//   // Loading state
//   if (loading) {
//     return (
//       <Html center>
//         <div style={{
//           background: 'rgba(0, 0, 0, 0.8)',
//           color: 'white',
//           padding: '20px',
//           borderRadius: '10px',
//           fontFamily: 'monospace',
//           border: '2px solid #ff00ff',
//           textAlign: 'center',
//           minWidth: '200px',
//           backdropFilter: 'blur(10px)'
//         }}>
//           <div style={{ fontSize: '24px', marginBottom: '10px', animation: 'spin 1s linear infinite' }}>🕺</div>
//           <div style={{ fontSize: '16px' }}>Loading Dance Model...</div>
//           <div style={{ 
//             fontSize: '12px', 
//             marginTop: '10px', 
//             opacity: 0.7,
//             color: '#ff00ff'
//           }}>
//             Male Dance Pose.fbx
//           </div>
//           <style>{`
//             @keyframes spin {
//               from { transform: rotate(0deg); }
//               to { transform: rotate(360deg); }
//             }
//           `}</style>
//         </div>
//       </Html>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <Html center>
//         <div style={{
//           background: 'rgba(255, 0, 0, 0.2)',
//           color: 'white',
//           padding: '20px',
//           borderRadius: '10px',
//           fontFamily: 'monospace',
//           border: '2px solid #ff5555',
//           textAlign: 'center',
//           minWidth: '200px',
//           backdropFilter: 'blur(10px)'
//         }}>
//           <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
//           <div style={{ fontSize: '16px' }}>Model Load Error</div>
//           <div style={{ 
//             fontSize: '12px', 
//             marginTop: '10px', 
//             opacity: 0.7
//           }}>
//             {error}
//           </div>
//           <div style={{ 
//             fontSize: '10px', 
//             marginTop: '15px',
//             color: '#aaa'
//           }}>
//             Using fallback dancing character
//           </div>
//         </div>
//       </Html>
//     );
//   }

//   // Render the model
//   return model ? (
//     <group ref={groupRef}>
//       <primitive object={model} />
//     </group>
//   ) : null;
// }

// /**
//  * 🚀 LIVE TRACKING AVATAR
//  */
// function LiveAvatar({ landmarks }) {
//   const { scene } = useGLTF("/models/standing.glb");
//   const groupRef = useRef();
//   const filteredLandmarks = useRef(createFilteredLandmarks());

//   useFrame(() => {
//     if (!landmarks?.pose || !scene) return;

//     // Apply Kalman filtering to landmarks
//     const smoothedLandmarks = filteredLandmarks.current.update(landmarks);
//     if (!smoothedLandmarks?.pose) return;

//     const pose = smoothedLandmarks.pose;

//     // Simple arm tracking
//     if (scene.traverse) {
//       scene.traverse((child) => {
//         if (child.isBone) {
//           // Right arm tracking
//           if (child.name.includes("RightArm") || child.name.includes("RightForeArm")) {
//             if (pose.RIGHT_WRIST && pose.RIGHT_ELBOW) {
//               const armRotation = (pose.RIGHT_WRIST.y - pose.RIGHT_ELBOW.y) * Math.PI;
//               child.rotation.x = armRotation * 0.5;
//             }
//           }
//           // Left arm tracking
//           if (child.name.includes("LeftArm") || child.name.includes("LeftForeArm")) {
//             if (pose.LEFT_WRIST && pose.LEFT_ELBOW) {
//               const armRotation = (pose.LEFT_WRIST.y - pose.LEFT_ELBOW.y) * Math.PI;
//               child.rotation.x = armRotation * 0.5;
//             }
//           }
//         }
//       });
//     }
//   });

//   if (!scene) {
//     return (
//       <Html center>
//         <div style={{
//           background: 'rgba(0, 0, 0, 0.8)',
//           color: 'white',
//           padding: '20px',
//           borderRadius: '10px',
//           fontFamily: 'monospace',
//           border: '2px solid #00ff88',
//           textAlign: 'center',
//           backdropFilter: 'blur(10px)'
//         }}>
//           <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
//           <div style={{ fontSize: '16px' }}>Loading Live Model...</div>
//         </div>
//       </Html>
//     );
//   }

//   return (
//     <group ref={groupRef}>
//       <primitive object={scene} scale={1.3} position={[0, 0, 0]} />
//     </group>
//   );
// }

// /**
//  * MAIN AVATAR CANVAS
//  */
// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();
//   const [connectionStatus, setConnectionStatus] = useState("disconnected");
//   const [showControls, setShowControls] = useState(true);

//   // Monitor connection status
//   useEffect(() => {
//     if (landmarks) {
//       setConnectionStatus("connected");
//     } else {
//       setConnectionStatus("disconnected");
//     }
//   }, [landmarks]);

//   return (
//     <>
//       {/* Connection Status */}
//       <div style={{
//         position: 'absolute',
//         top: 20,
//         left: 20,
//         zIndex: 100,
//         background: connectionStatus === 'connected' 
//           ? 'rgba(0, 255, 100, 0.2)' 
//           : 'rgba(255, 165, 0, 0.2)',
//         padding: '10px 20px',
//         borderRadius: '10px',
//         border: `2px solid ${connectionStatus === 'connected' ? '#00ff64' : '#ffa500'}`,
//         color: 'white',
//         fontFamily: 'monospace',
//         backdropFilter: 'blur(10px)',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '10px'
//       }}>
//         <div style={{
//           width: '10px',
//           height: '10px',
//           borderRadius: '50%',
//           background: connectionStatus === 'connected' ? '#00ff64' : '#ffa500',
//           animation: connectionStatus === 'connected' ? 'pulse 2s infinite' : 'blink 1s infinite'
//         }} />
//         <div>
//           <span>
//             {connectionStatus === 'connected' 
//               ? '✅ LIVE TRACKING' 
//               : '🕺 DANCE MODE'}
//           </span>
//           {connectionStatus === 'disconnected' && (
//             <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.8 }}>
//               Run: python capture_and_send.py
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Controls Toggle */}
//       <button
//         onClick={() => setShowControls(!showControls)}
//         style={{
//           position: 'absolute',
//           top: 20,
//           right: 20,
//           zIndex: 100,
//           padding: '8px 16px',
//           background: 'rgba(0, 0, 0, 0.5)',
//           color: 'white',
//           border: '1px solid #00ffcc',
//           borderRadius: '5px',
//           cursor: 'pointer',
//           fontFamily: 'monospace',
//           backdropFilter: 'blur(10px)',
//           transition: 'all 0.3s'
//         }}
//         onMouseEnter={(e) => e.target.style.background = 'rgba(0, 255, 204, 0.3)'}
//         onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
//       >
//         {showControls ? 'Hide Controls' : 'Show Controls'}
//       </button>

//       {/* Main Canvas */}
//       <Canvas 
//         camera={{ 
//           position: [0, 1.5, 5], 
//           fov: 50,
//           near: 0.1,
//           far: 1000
//         }}
//         shadows
//         style={{ background: '#0a0a0f' }}
//       >
//         {/* Lighting */}
//         <ambientLight intensity={0.6} />
//         <directionalLight 
//           position={[5, 10, 7]} 
//           intensity={1.2}
//           castShadow
//           shadow-mapSize-width={1024}
//           shadow-mapSize-height={1024}
//           shadow-camera-far={50}
//           shadow-camera-left={-10}
//           shadow-camera-right={10}
//           shadow-camera-top={10}
//           shadow-camera-bottom={-10}
//         />
//         <directionalLight 
//           position={[-5, 5, -7]} 
//           intensity={0.6}
//           color="#ffccaa"
//         />
//         <hemisphereLight 
//           skyColor="#ffffff"
//           groundColor="#888888"
//           intensity={0.5}
//         />

//         {/* Point light for drama */}
//         <pointLight 
//           position={[0, 3, 2]} 
//           color="#ff00ff" 
//           intensity={0.5}
//           distance={10}
//           decay={2}
//         />

//         {/* Environment */}
//         <Environment preset="studio" />

//         {/* Floor */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
//           <planeGeometry args={[20, 20]} />
//           <shadowMaterial opacity={0.3} />
//           <meshStandardMaterial 
//             color="#1a1a1a" 
//             roughness={0.8}
//             metalness={0.2}
//           />
//         </mesh>

//         {/* Dance floor effect */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
//           <planeGeometry args={[5, 5]} />
//           <meshStandardMaterial 
//             color="#000000"
//             emissive="#ff00ff"
//             emissiveIntensity={0.1}
//             transparent
//             opacity={0.3}
//           />
//         </mesh>

//         {/* Avatar */}
//         <Suspense fallback={
//           <Html center>
//             <div style={{
//               background: 'rgba(0, 0, 0, 0.8)',
//               color: 'white',
//               padding: '20px',
//               borderRadius: '10px',
//               fontFamily: 'monospace',
//               border: '2px solid #00ff88',
//               textAlign: 'center'
//             }}>
//               <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
//               <div style={{ fontSize: '16px' }}>Loading Avatar...</div>
//             </div>
//           </Html>
//         }>
//           {landmarks ? (
//             <LiveAvatar landmarks={landmarks} />
//           ) : (
//             <MaleDancePoseAvatar />
//           )}
//         </Suspense>

//         {/* Camera Controls */}
//         {showControls && (
//           <OrbitControls 
//             enablePan={true}
//             enableZoom={true}
//             enableRotate={true}
//             target={[0, 1, 0]}
//             minDistance={2}
//             maxDistance={15}
//             maxPolarAngle={Math.PI / 2}
//             dampingFactor={0.05}
//           />
//         )}

//         {/* Grid Helper (only in dev) */}
//         {process.env.NODE_ENV === 'development' && (
//           <gridHelper args={[20, 20, 0x444444, 0x888888]} />
//         )}
//       </Canvas>

//       {/* Instructions */}
//       <div style={{
//         position: 'absolute',
//         bottom: 20,
//         left: '50%',
//         transform: 'translateX(-50%)',
//         background: 'rgba(0, 0, 0, 0.7)',
//         padding: '15px 30px',
//         borderRadius: '10px',
//         color: 'white',
//         fontFamily: 'sans-serif',
//         textAlign: 'center',
//         backdropFilter: 'blur(10px)',
//         border: '1px solid rgba(0, 255, 204, 0.3)',
//         maxWidth: '80%',
//         boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
//       }}>
//         <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>
//           {connectionStatus === 'connected' ? '🎯 Live Body Tracking' : '🕺 Male Dance Pose'}
//         </div>
//         <div style={{ fontSize: '14px', opacity: 0.8 }}>
//           {connectionStatus === 'connected' 
//             ? 'Your movements are being tracked in real-time' 
//             : 'Idle animation playing'}
//         </div>
//         <div style={{ 
//           fontSize: '12px', 
//           opacity: 0.6, 
//           marginTop: '5px',
//           fontFamily: 'monospace'
//         }}>
//           {connectionStatus === 'disconnected' && '> python capture_and_send.py'}
//         </div>
//       </div>

//       {/* CSS Animations */}
//       <style>{`
//         @keyframes pulse {
//           0% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.5; transform: scale(1.1); }
//           100% { opacity: 1; transform: scale(1); }
//         }

//         @keyframes blink {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.3; }
//         }

//         @keyframes danceFloor {
//           0% { box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, inset 0 0 10px #ff00ff; }
//           50% { box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, inset 0 0 20px #00ffff; }
//           100% { box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, inset 0 0 10px #ff00ff; }
//         }
//       `}</style>
//     </>
//   );
// }

//TRY -13
// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment, Html } from "@react-three/drei";
// import * as THREE from "three";
// import { useEffect, useRef, useState, Suspense, useCallback } from "react";
// import useLandmarks from "../hooks/useLandmarks";
// import { solveTwoBoneIK } from "../utils/ikSolver";
// import { createFilteredLandmarks } from "../utils/smoothing";

// // Preload models
// useGLTF.preload("/models/standing.glb");

// /**
//  * 🕺 MALE DANCE POSE IDLE AVATAR - SIMPLE WORKING VERSION
//  */
// function MaleDancePoseAvatar() {
//   const [model, setModel] = useState(null);
//   const [mixer, setMixer] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const groupRef = useRef();
//   const clockRef = useRef(new THREE.Clock(false));

//   useEffect(() => {
//     let fbxLoader;
//     let animationMixer = null;

//     const loadModel = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         console.log("🕺 Loading Male Dance Pose FBX...");

//         // Dynamically import FBXLoader
//         const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
//         fbxLoader = new FBXLoader();

//         // Load the model
//         const loadedModel = await new Promise((resolve, reject) => {
//           fbxLoader.load(
//             "/models/Male Dance Pose.fbx",
//             (fbx) => {
//               console.log("✅ FBX model loaded successfully");
//               resolve(fbx);
//             },
//             (progress) => {
//               const percent = progress.total > 0 
//                 ? (progress.loaded / progress.total * 100).toFixed(1)
//                 : '0.0';
//               console.log(`📥 Loading: ${percent}%`);
//             },
//             (err) => {
//               console.error("❌ Failed to load FBX:", err);
//               reject(err);
//             }
//           );
//         });

//         if (loadedModel) {
//           // FIRST, let's see what we have in the model
//           console.log("🔍 Model structure:", {
//             type: loadedModel.type,
//             name: loadedModel.name,
//             childrenCount: loadedModel.children.length,
//             hasAnimations: loadedModel.animations?.length > 0
//           });

//           // Traverse and log all children
//           loadedModel.traverse((child) => {
//             console.log(`  - ${child.type}: ${child.name || 'unnamed'}`, {
//               isMesh: child.isMesh,
//               isBone: child.isBone,
//               isGroup: child.isGroup,
//               position: child.position ? {x: child.position.x, y: child.position.y, z: child.position.z} : null
//             });
//           });

//           // IMPORTANT: Try different scales - the model might be too small or too big
//           // Try a larger scale first
//           loadedModel.scale.set(0.1, 0.1, 0.1); // Increased from 0.02

//           // Reset position
//           loadedModel.position.set(0, 0, 0); // Start at origin
//           loadedModel.rotation.set(0, 0, 0); // No rotation initially

//           // Apply basic material to ALL meshes to ensure visibility
//           loadedModel.traverse((child) => {
//             if (child.isMesh) {
//               console.log(`🎨 Applying material to mesh: ${child.name || 'unnamed'}`);

//               // Replace material with a simple, visible material
//               child.material = new THREE.MeshStandardMaterial({
//                 color: 0x00aaff, // Bright blue color
//                 metalness: 0.1,
//                 roughness: 0.7,
//                 emissive: 0x000000,
//                 emissiveIntensity: 0
//               });

//               child.castShadow = true;
//               child.receiveShadow = true;

//               // Enable frustum culling
//               child.frustumCulled = false;

//               // Log mesh info
//               console.log(`  ✅ Mesh ${child.name || 'unnamed'} updated`, {
//                 vertices: child.geometry?.attributes?.position?.count || 0,
//                 material: child.material.type
//               });
//             }
//           });

//           // Check for animations
//           const animations = loadedModel.animations || [];
//           console.log(`🎬 Found ${animations.length} animations`);

//           if (animations.length > 0) {
//             // Create animation mixer
//             animationMixer = new THREE.AnimationMixer(loadedModel);

//             animations.forEach((clip, index) => {
//               console.log(`  Animation ${index + 1}: "${clip.name}"`, {
//                 duration: clip.duration,
//                 tracks: clip.tracks.length
//               });

//               // Create action
//               const action = animationMixer.clipAction(clip);

//               // If it's a very short animation (pose), create a looping version
//               if (clip.duration < 0.5) {
//                 console.log("🔄 Creating looping animation from pose");

//                 // Set up the action to loop
//                 action.loop = THREE.LoopRepeat;
//                 action.clampWhenFinished = false;

//                 // We'll manually animate in useFrame
//               } else {
//                 // For longer animations, play normally
//                 action.loop = THREE.LoopRepeat;
//                 action.play();
//               }
//             });

//             setMixer(animationMixer);
//           }

//           setModel(loadedModel);
//           clockRef.current.start();

//           console.log("🎉 Model ready for rendering");
//         }

//       } catch (err) {
//         console.error("❌ Error loading model:", err);
//         setError(err.message);

//         // Create a simple visible fallback model
//         createFallbackModel();

//       } finally {
//         setLoading(false);
//       }
//     };

//     const createFallbackModel = () => {
//       console.log("🔄 Creating fallback model...");

//       const group = new THREE.Group();

//       // Create a simple cube that's definitely visible
//       const geometry = new THREE.BoxGeometry(1, 2, 1);
//       const material = new THREE.MeshStandardMaterial({ 
//         color: 0xff0000, // Bright red so we can see it
//         emissive: 0xff0000,
//         emissiveIntensity: 0.3
//       });

//       const cube = new THREE.Mesh(geometry, material);
//       cube.castShadow = true;
//       cube.receiveShadow = true;
//       cube.position.set(0, 1, 0); // Position at eye level

//       group.add(cube);

//       // Add a sphere head
//       const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
//       const headMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
//       const head = new THREE.Mesh(headGeometry, headMaterial);
//       head.position.set(0, 1.8, 0);
//       group.add(head);

//       // Make the model larger
//       group.scale.set(0.5, 0.5, 0.5);

//       setModel(group);
//     };

//     loadModel();

//     return () => {
//       if (animationMixer) {
//         animationMixer.stopAllAction();
//       }
//     };
//   }, []);

//   // Animation frame update
//   useFrame((state, delta) => {
//     // Update animation mixer if exists
//     if (mixer) {
//       mixer.update(delta);
//     }

//     // Add subtle animation to the model
//     if (model && groupRef.current) {
//       const time = clockRef.current.getElapsedTime();

//       // Breathing effect
//       const breath = Math.sin(time * 2) * 0.02;
//       groupRef.current.position.y = breath;

//       // Gentle sway
//       const sway = Math.sin(time * 0.5) * 0.03;
//       groupRef.current.rotation.z = sway;

//       // Slow rotation
//       groupRef.current.rotation.y += 0.001;

//       // If it's the fallback model, add more animation
//       if (model.children.some(child => child.type === 'Mesh' && child.geometry.type === 'BoxGeometry')) {
//         // Animate arms and legs
//         const wave = Math.sin(time * 3) * 0.5;
//         model.children.forEach((child, index) => {
//           if (child.geometry?.type === 'BoxGeometry') {
//             child.rotation.x = wave;
//             child.rotation.z = Math.sin(time * 2 + index) * 0.2;
//           }
//           if (child.geometry?.type === 'SphereGeometry') {
//             child.rotation.y = Math.sin(time * 1) * 0.3;
//           }
//         });
//       }
//     }
//   });

//   // Loading state
//   if (loading) {
//     return (
//       <Html center>
//         <div style={{
//           background: 'rgba(0, 0, 0, 0.8)',
//           color: 'white',
//           padding: '20px',
//           borderRadius: '10px',
//           fontFamily: 'monospace',
//           border: '2px solid #ff00ff',
//           textAlign: 'center',
//           minWidth: '200px',
//           backdropFilter: 'blur(10px)'
//         }}>
//           <div style={{ fontSize: '24px', marginBottom: '10px', animation: 'spin 1s linear infinite' }}>🕺</div>
//           <div style={{ fontSize: '16px' }}>Loading Dance Model...</div>
//           <div style={{ 
//             fontSize: '12px', 
//             marginTop: '10px', 
//             opacity: 0.7,
//             color: '#ff00ff'
//           }}>
//             Male Dance Pose.fbx
//           </div>
//           <style>{`
//             @keyframes spin {
//               from { transform: rotate(0deg); }
//               to { transform: rotate(360deg); }
//             }
//           `}</style>
//         </div>
//       </Html>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <Html center>
//         <div style={{
//           background: 'rgba(255, 0, 0, 0.2)',
//           color: 'white',
//           padding: '20px',
//           borderRadius: '10px',
//           fontFamily: 'monospace',
//           border: '2px solid #ff5555',
//           textAlign: 'center',
//           minWidth: '200px',
//           backdropFilter: 'blur(10px)'
//         }}>
//           <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
//           <div style={{ fontSize: '16px' }}>Model Load Error</div>
//           <div style={{ 
//             fontSize: '12px', 
//             marginTop: '10px', 
//             opacity: 0.7
//           }}>
//             {error}
//           </div>
//           <div style={{ 
//             fontSize: '10px', 
//             marginTop: '15px',
//             color: '#aaa'
//           }}>
//             Using fallback character
//           </div>
//         </div>
//       </Html>
//     );
//   }

//   // Render the model
//   return model ? (
//     <group ref={groupRef} position={[0, -1.5, 0]}>
//       <primitive object={model} />
//     </group>
//   ) : null;
// }

// /**
//  * 🚀 LIVE TRACKING AVATAR
//  */
// function LiveAvatar({ landmarks }) {
//   const { scene } = useGLTF("/models/standing.glb");
//   const groupRef = useRef();
//   const filteredLandmarks = useRef(createFilteredLandmarks());

//   useFrame(() => {
//     if (!landmarks?.pose || !scene) return;

//     // Apply Kalman filtering to landmarks
//     const smoothedLandmarks = filteredLandmarks.current.update(landmarks);
//     if (!smoothedLandmarks?.pose) return;

//     const pose = smoothedLandmarks.pose;

//     // Simple arm tracking
//     if (scene.traverse) {
//       scene.traverse((child) => {
//         if (child.isBone) {
//           // Right arm tracking
//           if (child.name.includes("RightArm") || child.name.includes("RightForeArm")) {
//             if (pose.RIGHT_WRIST && pose.RIGHT_ELBOW) {
//               const armRotation = (pose.RIGHT_WRIST.y - pose.RIGHT_ELBOW.y) * Math.PI;
//               child.rotation.x = armRotation * 0.5;
//             }
//           }
//           // Left arm tracking
//           if (child.name.includes("LeftArm") || child.name.includes("LeftForeArm")) {
//             if (pose.LEFT_WRIST && pose.LEFT_ELBOW) {
//               const armRotation = (pose.LEFT_WRIST.y - pose.LEFT_ELBOW.y) * Math.PI;
//               child.rotation.x = armRotation * 0.5;
//             }
//           }
//         }
//       });
//     }
//   });

//   if (!scene) {
//     return (
//       <Html center>
//         <div style={{
//           background: 'rgba(0, 0, 0, 0.8)',
//           color: 'white',
//           padding: '20px',
//           borderRadius: '10px',
//           fontFamily: 'monospace',
//           border: '2px solid #00ff88',
//           textAlign: 'center',
//           backdropFilter: 'blur(10px)'
//         }}>
//           <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
//           <div style={{ fontSize: '16px' }}>Loading Live Model...</div>
//         </div>
//       </Html>
//     );
//   }

//   return (
//     <group ref={groupRef} position={[0, -1.5, 0]}>
//       <primitive object={scene} scale={1.3} />
//     </group>
//   );
// }

// /**
//  * MAIN AVATAR CANVAS
//  */
// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();
//   const [connectionStatus, setConnectionStatus] = useState("disconnected");
//   const [showControls, setShowControls] = useState(true);

//   // Monitor connection status
//   useEffect(() => {
//     if (landmarks) {
//       setConnectionStatus("connected");
//     } else {
//       setConnectionStatus("disconnected");
//     }
//   }, [landmarks]);

//   return (
//     <>
//       {/* Connection Status */}
//       <div style={{
//         position: 'absolute',
//         top: 20,
//         left: 20,
//         zIndex: 100,
//         background: connectionStatus === 'connected' 
//           ? 'rgba(0, 255, 100, 0.2)' 
//           : 'rgba(255, 165, 0, 0.2)',
//         padding: '10px 20px',
//         borderRadius: '10px',
//         border: `2px solid ${connectionStatus === 'connected' ? '#00ff64' : '#ffa500'}`,
//         color: 'white',
//         fontFamily: 'monospace',
//         backdropFilter: 'blur(10px)',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '10px'
//       }}>
//         <div style={{
//           width: '10px',
//           height: '10px',
//           borderRadius: '50%',
//           background: connectionStatus === 'connected' ? '#00ff64' : '#ffa500',
//           animation: connectionStatus === 'connected' ? 'pulse 2s infinite' : 'blink 1s infinite'
//         }} />
//         <div>
//           <span>
//             {connectionStatus === 'connected' 
//               ? '✅ LIVE TRACKING' 
//               : '🕺 DANCE MODE'}
//           </span>
//           {connectionStatus === 'disconnected' && (
//             <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.8 }}>
//               Run: python capture_and_send.py
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Controls Toggle */}
//       <button
//         onClick={() => setShowControls(!showControls)}
//         style={{
//           position: 'absolute',
//           top: 20,
//           right: 20,
//           zIndex: 100,
//           padding: '8px 16px',
//           background: 'rgba(0, 0, 0, 0.5)',
//           color: 'white',
//           border: '1px solid #00ffcc',
//           borderRadius: '5px',
//           cursor: 'pointer',
//           fontFamily: 'monospace',
//           backdropFilter: 'blur(10px)',
//           transition: 'all 0.3s'
//         }}
//         onMouseEnter={(e) => e.target.style.background = 'rgba(0, 255, 204, 0.3)'}
//         onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
//       >
//         {showControls ? 'Hide Controls' : 'Show Controls'}
//       </button>

//       {/* Debug Info */}
//       <div style={{
//         position: 'absolute',
//         top: 70,
//         left: 20,
//         zIndex: 100,
//         background: 'rgba(0, 0, 0, 0.7)',
//         padding: '10px 15px',
//         borderRadius: '10px',
//         color: 'white',
//         fontFamily: 'monospace',
//         fontSize: '12px',
//         backdropFilter: 'blur(10px)',
//         border: '1px solid #00aaff'
//       }}>
//         <div>Mode: {connectionStatus === 'connected' ? 'Live Tracking' : 'Dance Animation'}</div>
//         <div>Status: {connectionStatus === 'connected' ? 'Connected' : 'Waiting for Python script'}</div>
//       </div>

//       {/* Main Canvas */}
//       <Canvas 
//         camera={{ 
//           position: [0, 1.5, 5], 
//           fov: 50,
//           near: 0.1,
//           far: 1000
//         }}
//         shadows
//         style={{ background: '#0a0a0f' }}
//       >
//         {/* Lighting */}
//         <ambientLight intensity={0.8} />
//         <directionalLight 
//           position={[5, 10, 7]} 
//           intensity={1.5}
//           castShadow
//           shadow-mapSize-width={1024}
//           shadow-mapSize-height={1024}
//           shadow-camera-far={50}
//           shadow-camera-left={-10}
//           shadow-camera-right={10}
//           shadow-camera-top={10}
//           shadow-camera-bottom={-10}
//         />
//         <directionalLight 
//           position={[-5, 5, -7]} 
//           intensity={0.8}
//           color="#ffccaa"
//         />
//         <hemisphereLight 
//           skyColor="#ffffff"
//           groundColor="#888888"
//           intensity={0.5}
//         />

//         {/* Point light for drama */}
//         <pointLight 
//           position={[0, 3, 2]} 
//           color="#00aaff" 
//           intensity={0.8}
//           distance={10}
//           decay={2}
//         />

//         {/* Environment */}
//         <Environment preset="studio" />

//         {/* Floor */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
//           <planeGeometry args={[20, 20]} />
//           <shadowMaterial opacity={0.3} />
//           <meshStandardMaterial 
//             color="#1a1a1a" 
//             roughness={0.8}
//             metalness={0.2}
//           />
//         </mesh>

//         {/* Dance floor effect */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
//           <planeGeometry args={[5, 5]} />
//           <meshStandardMaterial 
//             color="#000000"
//             emissive="#00aaff"
//             emissiveIntensity={0.2}
//             transparent
//             opacity={0.3}
//           />
//         </mesh>

//         {/* Avatar */}
//         <Suspense fallback={
//           <Html center>
//             <div style={{
//               background: 'rgba(0, 0, 0, 0.8)',
//               color: 'white',
//               padding: '20px',
//               borderRadius: '10px',
//               fontFamily: 'monospace',
//               border: '2px solid #00ff88',
//               textAlign: 'center'
//             }}>
//               <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
//               <div style={{ fontSize: '16px' }}>Loading Avatar...</div>
//             </div>
//           </Html>
//         }>
//           {landmarks ? (
//             <LiveAvatar landmarks={landmarks} />
//           ) : (
//             <MaleDancePoseAvatar />
//           )}
//         </Suspense>

//         {/* Camera Controls */}
//         {showControls && (
//           <OrbitControls 
//             enablePan={true}
//             enableZoom={true}
//             enableRotate={true}
//             minDistance={1}
//             maxDistance={20}
//             maxPolarAngle={Math.PI / 2}
//             dampingFactor={0.05}
//           />
//         )}

//         {/* Grid Helper (only in dev) */}
//         {process.env.NODE_ENV === 'development' && (
//           <gridHelper args={[20, 20, 0x444444, 0x888888]} />
//         )}

//         {/* Axis Helper */}
//         {process.env.NODE_ENV === 'development' && (
//           <axesHelper args={[5]} />
//         )}
//       </Canvas>

//       {/* Instructions */}
//       <div style={{
//         position: 'absolute',
//         bottom: 20,
//         left: '50%',
//         transform: 'translateX(-50%)',
//         background: 'rgba(0, 0, 0, 0.7)',
//         padding: '15px 30px',
//         borderRadius: '10px',
//         color: 'white',
//         fontFamily: 'sans-serif',
//         textAlign: 'center',
//         backdropFilter: 'blur(10px)',
//         border: '1px solid rgba(0, 255, 204, 0.3)',
//         maxWidth: '80%',
//         boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
//       }}>
//         <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>
//           {connectionStatus === 'connected' ? '🎯 Live Body Tracking' : '🕺 Male Dance Pose'}
//         </div>
//         <div style={{ fontSize: '14px', opacity: 0.8 }}>
//           {connectionStatus === 'connected' 
//             ? 'Your movements are being tracked in real-time' 
//             : 'Dance animation playing'}
//         </div>
//         <div style={{ 
//           fontSize: '12px', 
//           opacity: 0.6, 
//           marginTop: '5px',
//           fontFamily: 'monospace'
//         }}>
//           {connectionStatus === 'disconnected' && '> python capture_and_send.py'}
//         </div>
//       </div>

//       {/* CSS Animations */}
//       <style>{`
//         @keyframes pulse {
//           0% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.5; transform: scale(1.1); }
//           100% { opacity: 1; transform: scale(1); }
//         }

//         @keyframes blink {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.3; }
//         }

//         @keyframes danceFloor {
//           0% { box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, inset 0 0 10px #ff00ff; }
//           50% { box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, inset 0 0 20px #00ffff; }
//           100% { box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, inset 0 0 10px #ff00ff; }
//         }
//       `}</style>
//     </>
//   );
// }



//TRY - 14

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF, OrbitControls, Environment, Html } from "@react-three/drei";
// import * as THREE from "three";
// import { useEffect, useRef, useState, Suspense, useCallback } from "react";
// import useLandmarks from "../hooks/useLandmarks";
// import { solveTwoBoneIK } from "../utils/ikSolver";
// import { createFilteredLandmarks } from "../utils/smoothing";

// // Preload models
// useGLTF.preload("/models/standing.glb");

// /**
//  * 🕺 MALE DANCE POSE IDLE AVATAR - SIMPLE & EFFECTIVE
//  */
// function MaleDancePoseAvatar() {
//   const [model, setModel] = useState(null);
//   const [mixer, setMixer] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const groupRef = useRef();
//   const clockRef = useRef(new THREE.Clock(false));

//   useEffect(() => {
//     let fbxLoader;
//     let animationMixer = null;

//     const loadModel = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         console.log("🕺 Loading Male Dance Pose FBX...");

//         // Dynamically import FBXLoader
//         const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
//         fbxLoader = new FBXLoader();

//         // Load the model
//         const loadedModel = await new Promise((resolve, reject) => {
//           fbxLoader.load(
//             "/models/Male Dance Pose.fbx",
//             (fbx) => {
//               console.log("✅ FBX model loaded successfully");
//               resolve(fbx);
//             },
//             (progress) => {
//               const percent = progress.total > 0 
//                 ? (progress.loaded / progress.total * 100).toFixed(1)
//                 : '0.0';
//               console.log(`📥 Loading: ${percent}%`);
//             },
//             (err) => {
//               console.error("❌ Failed to load FBX:", err);
//               reject(err);
//             }
//           );
//         });

//         if (loadedModel) {
//           // Scale and position
//           loadedModel.scale.setScalar(0.02);
//           loadedModel.position.set(0, -1.5, 0);
//           loadedModel.rotation.y = Math.PI;

//           // Enable shadows and enhance materials
//           loadedModel.traverse((child) => {
//             if (child.isMesh) {
//               child.castShadow = true;
//               child.receiveShadow = true;

//               // Enhance materials
//               if (child.material) {
//                 child.material.metalness = 0.3;
//                 child.material.roughness = 0.7;
//                 child.material.needsUpdate = true;
//               }
//             }
//           });

//           // Create animation mixer
//           animationMixer = new THREE.AnimationMixer(loadedModel);

//           // Get animations from model
//           const animations = loadedModel.animations || [];
//           console.log(`🎬 Found ${animations.length} animations`);

//           if (animations.length > 0) {
//             // Check animation duration
//             animations.forEach((clip, index) => {
//               console.log(`📊 Animation "${clip.name}": ${clip.duration.toFixed(3)}s, ${clip.tracks.length} tracks`);

//               // If animation is very short (single frame pose), we'll create our own animation
//               if (clip.duration < 0.1) {
//                 console.log("📏 Single frame pose detected - creating custom dance animation");

//                 // Create custom animation clips
//                 createCustomAnimations(animationMixer, loadedModel);
//               } else {
//                 // If it has actual animation, play it
//                 const action = animationMixer.clipAction(clip);
//                 action.loop = THREE.LoopRepeat;
//                 action.timeScale = 1.0;
//                 action.play();
//                 console.log(`▶️ Playing animation: ${clip.name}`);
//               }
//             });
//           } else {
//             // No animations found, create custom ones
//             console.log("⚠️ No animations found - creating custom dance animation");
//             createCustomAnimations(animationMixer, loadedModel);
//           }

//           setModel(loadedModel);
//           setMixer(animationMixer);
//           clockRef.current.start();
//         }

//       } catch (err) {
//         console.error("❌ Error loading model:", err);
//         setError(err.message);

//         // Create fallback model with animations
//         createFallbackModel();

//       } finally {
//         setLoading(false);
//       }
//     };

//     // Create custom dance animations programmatically
//     const createCustomAnimations = (mixer, model) => {
//       console.log("💃 Creating custom dance animations...");

//       // Find bones in the model
//       const bones = {};
//       model.traverse((child) => {
//         if (child.isBone) {
//           bones[child.name] = child;
//           console.log(`🦴 Found bone: ${child.name}`);
//         }
//       });

//       // Create custom animation clips
//       const clips = [];

//       // 1. Breathing animation (subtle up/down movement)
//       const breathingTracks = [];

//       // Try to find the root bone or use the model itself
//       const rootBone = bones['mixamorigHips'] || bones['Hips'] || bones['root'] || model;

//       // Breathing: subtle vertical movement
//       const breathingClip = new THREE.AnimationClip('breathing', 2, [
//         new THREE.VectorKeyframeTrack(
//           rootBone.isBone ? '.position[y]' : '.position[y]',
//           [0, 1, 2],
//           [0, 0.02, 0]
//         )
//       ]);
//       clips.push(breathingClip);

//       // 2. Sway animation (left/right rotation)
//       const swayClip = new THREE.AnimationClip('sway', 3, [
//         new THREE.VectorKeyframeTrack(
//           rootBone.isBone ? '.rotation[z]' : '.rotation[z]',
//           [0, 0.5, 1, 1.5, 2, 2.5, 3],
//           [0, 0.02, 0, -0.02, 0, 0.02, 0]
//         )
//       ]);
//       clips.push(swayClip);

//       // 3. Head movement animation
//       const headBone = bones['mixamorigHead'] || bones['Head'];
//       if (headBone) {
//         const headClip = new THREE.AnimationClip('head_move', 2, [
//           new THREE.VectorKeyframeTrack(
//             '.rotation[y]',
//             [0, 0.5, 1, 1.5, 2],
//             [0, 0.1, 0, -0.1, 0]
//           )
//         ]);
//         clips.push(headClip);
//       }

//       // 4. Arm dance animation (if arm bones exist)
//       const leftArmBone = bones['mixamorigLeftArm'] || bones['LeftArm'];
//       const rightArmBone = bones['mixamorigRightArm'] || bones['RightArm'];

//       if (leftArmBone && rightArmBone) {
//         const armClip = new THREE.AnimationClip('arm_dance', 1.5, [
//           new THREE.VectorKeyframeTrack(
//             leftArmBone.isBone ? '.rotation[x]' : '.rotation[x]',
//             [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5],
//             [0, 0.5, 0, -0.5, 0, 0.5, 0]
//           ),
//           new THREE.VectorKeyframeTrack(
//             rightArmBone.isBone ? '.rotation[x]' : '.rotation[x]',
//             [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5],
//             [0, -0.5, 0, 0.5, 0, -0.5, 0]
//           )
//         ]);
//         clips.push(armClip);
//       }

//       // Play all clips
//       clips.forEach((clip, index) => {
//         const action = mixer.clipAction(clip);
//         action.loop = THREE.LoopRepeat;
//         action.timeScale = 0.8 + (index * 0.1); // Different speeds
//         action.play();
//         console.log(`▶️ Playing custom animation: ${clip.name} (${clip.duration}s)`);
//       });
//     };

//     // Create fallback model with bone-based animation
//     const createFallbackModel = () => {
//       console.log("🔄 Creating animated fallback model...");

//       const group = new THREE.Group();
//       group.userData.isFallback = true;

//       // Create skeleton
//       const bones = {};

//       // Root bone
//       bones.root = new THREE.Bone();
//       bones.root.position.y = 0;

//       // Spine
//       bones.spine = new THREE.Bone();
//       bones.spine.position.y = 1;
//       bones.root.add(bones.spine);

//       // Head
//       bones.head = new THREE.Bone();
//       bones.head.position.y = 0.5;
//       bones.spine.add(bones.head);

//       // Left Arm
//       bones.leftArm = new THREE.Bone();
//       bones.leftArm.position.set(-0.5, 0, 0);
//       bones.spine.add(bones.leftArm);

//       // Right Arm
//       bones.rightArm = new THREE.Bone();
//       bones.rightArm.position.set(0.5, 0, 0);
//       bones.spine.add(bones.rightArm);

//       // Left Leg
//       bones.leftLeg = new THREE.Bone();
//       bones.leftLeg.position.set(-0.2, -1, 0);
//       bones.root.add(bones.leftLeg);

//       // Right Leg
//       bones.rightLeg = new THREE.Bone();
//       bones.rightLeg.position.set(0.2, -1, 0);
//       bones.root.add(bones.rightLeg);

//       group.add(bones.root);

//       // Create mesh for visualization
//       const bodyGeometry = new THREE.BoxGeometry(0.5, 2, 0.3);
//       const bodyMaterial = new THREE.MeshStandardMaterial({ 
//         color: 0xff00ff,
//         emissive: 0xff00ff,
//         emissiveIntensity: 0.2
//       });
//       const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
//       body.castShadow = true;
//       body.position.y = 1;
//       group.add(body);

//       // Head
//       const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
//       const headMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
//       const head = new THREE.Mesh(headGeometry, headMaterial);
//       head.position.y = 1.5;
//       head.castShadow = true;
//       group.add(head);

//       // Arms
//       const armGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
//       const armMaterial = new THREE.MeshStandardMaterial({ color: 0xff8800 });

//       const leftArm = new THREE.Mesh(armGeometry, armMaterial);
//       leftArm.position.set(-0.5, 0.5, 0);
//       leftArm.castShadow = true;
//       group.add(leftArm);

//       const rightArm = new THREE.Mesh(armGeometry, armMaterial);
//       rightArm.position.set(0.5, 0.5, 0);
//       rightArm.castShadow = true;
//       group.add(rightArm);

//       // Legs
//       const legGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
//       const legMaterial = new THREE.MeshStandardMaterial({ color: 0x0088ff });

//       const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
//       leftLeg.position.set(-0.2, -0.5, 0);
//       leftLeg.castShadow = true;
//       group.add(leftLeg);

//       const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
//       rightLeg.position.set(0.2, -0.5, 0);
//       rightLeg.castShadow = true;
//       group.add(rightLeg);

//       // Store references
//       group.userData.bones = bones;
//       group.userData.meshes = { body, head, leftArm, rightArm, leftLeg, rightLeg };
//       group.userData.animationTime = 0;

//       setModel(group);
//     };

//     loadModel();

//     // Cleanup
//     return () => {
//       if (animationMixer) {
//         animationMixer.stopAllAction();
//       }
//     };
//   }, []);

//   // Animation frame update
//   useFrame((state, delta) => {
//     // Update animation mixer if exists
//     if (mixer) {
//       mixer.update(delta);
//     }

//     // Update fallback model animation
//     if (model?.userData?.isFallback) {
//       const time = clockRef.current.getElapsedTime();

//       const bones = model.userData.bones;
//       const meshes = model.userData.meshes;

//       if (bones && meshes) {
//         // Breathing
//         bones.root.position.y = Math.sin(time * 2) * 0.02;

//         // Sway
//         bones.root.rotation.z = Math.sin(time * 0.5) * 0.05;

//         // Head movement
//         bones.head.rotation.y = Math.sin(time * 1.2) * 0.2;
//         bones.head.rotation.x = Math.sin(time * 0.8) * 0.05;

//         // Arm dance
//         bones.leftArm.rotation.x = Math.sin(time * 3) * 0.8;
//         bones.rightArm.rotation.x = Math.sin(time * 3 + Math.PI) * 0.8;
//         bones.leftArm.rotation.z = Math.sin(time * 2) * 0.3;
//         bones.rightArm.rotation.z = Math.sin(time * 2) * 0.3;

//         // Leg movement
//         bones.leftLeg.rotation.x = Math.sin(time * 2) * 0.5;
//         bones.rightLeg.rotation.x = Math.sin(time * 2 + Math.PI) * 0.5;

//         // Update mesh positions to follow bones
//         meshes.body.position.copy(bones.spine.position);
//         meshes.head.position.copy(bones.head.position);
//         meshes.leftArm.position.copy(bones.leftArm.position);
//         meshes.rightArm.position.copy(bones.rightArm.position);
//         meshes.leftLeg.position.copy(bones.leftLeg.position);
//         meshes.rightLeg.position.copy(bones.rightLeg.position);

//         // Update mesh rotations
//         meshes.head.rotation.copy(bones.head.rotation);
//         meshes.leftArm.rotation.copy(bones.leftArm.rotation);
//         meshes.rightArm.rotation.copy(bones.rightArm.rotation);
//         meshes.leftLeg.rotation.copy(bones.leftLeg.rotation);
//         meshes.rightLeg.rotation.copy(bones.rightLeg.rotation);
//       }
//     }

//     // Add continuous slow rotation for visual interest
//     if (groupRef.current) {
//       groupRef.current.rotation.y += 0.0005;
//     }
//   });

//   // Loading state
//   if (loading) {
//     return (
//       <Html center>
//         <div style={{
//           background: 'rgba(0, 0, 0, 0.8)',
//           color: 'white',
//           padding: '20px',
//           borderRadius: '10px',
//           fontFamily: 'monospace',
//           border: '2px solid #ff00ff',
//           textAlign: 'center',
//           minWidth: '200px',
//           backdropFilter: 'blur(10px)'
//         }}>
//           <div style={{ fontSize: '24px', marginBottom: '10px', animation: 'spin 1s linear infinite' }}>🕺</div>
//           <div style={{ fontSize: '16px' }}>Loading Dance Model...</div>
//           <div style={{ 
//             fontSize: '12px', 
//             marginTop: '10px', 
//             opacity: 0.7,
//             color: '#ff00ff'
//           }}>
//             Male Dance Pose.fbx
//           </div>
//           <style>{`
//             @keyframes spin {
//               from { transform: rotate(0deg); }
//               to { transform: rotate(360deg); }
//             }
//           `}</style>
//         </div>
//       </Html>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <Html center>
//         <div style={{
//           background: 'rgba(255, 0, 0, 0.2)',
//           color: 'white',
//           padding: '20px',
//           borderRadius: '10px',
//           fontFamily: 'monospace',
//           border: '2px solid #ff5555',
//           textAlign: 'center',
//           minWidth: '200px',
//           backdropFilter: 'blur(10px)'
//         }}>
//           <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
//           <div style={{ fontSize: '16px' }}>Model Load Error</div>
//           <div style={{ 
//             fontSize: '12px', 
//             marginTop: '10px', 
//             opacity: 0.7
//           }}>
//             {error}
//           </div>
//           <div style={{ 
//             fontSize: '10px', 
//             marginTop: '15px',
//             color: '#aaa'
//           }}>
//             Using animated fallback character
//           </div>
//         </div>
//       </Html>
//     );
//   }

//   // Render the model
//   return model ? (
//     <group ref={groupRef}>
//       <primitive object={model} />
//     </group>
//   ) : null;
// }

// /**
//  * 🚀 LIVE TRACKING AVATAR
//  */
// function LiveAvatar({ landmarks }) {
//   const { scene } = useGLTF("/models/standing.glb");
//   const groupRef = useRef();
//   const filteredLandmarks = useRef(createFilteredLandmarks());

//   useFrame(() => {
//     if (!landmarks?.pose || !scene) return;

//     // Apply Kalman filtering to landmarks
//     const smoothedLandmarks = filteredLandmarks.current.update(landmarks);
//     if (!smoothedLandmarks?.pose) return;

//     const pose = smoothedLandmarks.pose;

//     // Simple arm tracking
//     if (scene.traverse) {
//       scene.traverse((child) => {
//         if (child.isBone) {
//           // Right arm tracking
//           if (child.name.includes("RightArm") || child.name.includes("RightForeArm")) {
//             if (pose.RIGHT_WRIST && pose.RIGHT_ELBOW) {
//               const armRotation = (pose.RIGHT_WRIST.y - pose.RIGHT_ELBOW.y) * Math.PI;
//               child.rotation.x = armRotation * 0.5;
//             }
//           }
//           // Left arm tracking
//           if (child.name.includes("LeftArm") || child.name.includes("LeftForeArm")) {
//             if (pose.LEFT_WRIST && pose.LEFT_ELBOW) {
//               const armRotation = (pose.LEFT_WRIST.y - pose.LEFT_ELBOW.y) * Math.PI;
//               child.rotation.x = armRotation * 0.5;
//             }
//           }
//         }
//       });
//     }
//   });

//   if (!scene) {
//     return (
//       <Html center>
//         <div style={{
//           background: 'rgba(0, 0, 0, 0.8)',
//           color: 'white',
//           padding: '20px',
//           borderRadius: '10px',
//           fontFamily: 'monospace',
//           border: '2px solid #00ff88',
//           textAlign: 'center',
//           backdropFilter: 'blur(10px)'
//         }}>
//           <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
//           <div style={{ fontSize: '16px' }}>Loading Live Model...</div>
//         </div>
//       </Html>
//     );
//   }

//   return (
//     <group ref={groupRef}>
//       <primitive object={scene} scale={1.3} position={[0, 0, 0]} />
//     </group>
//   );
// }

// /**
//  * MAIN AVATAR CANVAS
//  */
// export default function AvatarCanvas() {
//   const landmarks = useLandmarks();
//   const [connectionStatus, setConnectionStatus] = useState("disconnected");
//   const [showControls, setShowControls] = useState(true);
//   //frontend/public/models/Male Dance Pose.fbx
//   // Monitor connection status
//   useEffect(() => {
//     if (landmarks) {
//       setConnectionStatus("connected");
//     } else {
//       setConnectionStatus("disconnected");
//     }
//   }, [landmarks]);

//   return (
//     <>
//       {/* Connection Status */}
//       <div style={{
//         position: 'absolute',
//         top: 20,
//         left: 20,
//         zIndex: 100,
//         background: connectionStatus === 'connected' 
//           ? 'rgba(0, 255, 100, 0.2)' 
//           : 'rgba(255, 165, 0, 0.2)',
//         padding: '10px 20px',
//         borderRadius: '10px',
//         border: `2px solid ${connectionStatus === 'connected' ? '#00ff64' : '#ffa500'}`,
//         color: 'white',
//         fontFamily: 'monospace',
//         backdropFilter: 'blur(10px)',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '10px'
//       }}>
//         <div style={{
//           width: '10px',
//           height: '10px',
//           borderRadius: '50%',
//           background: connectionStatus === 'connected' ? '#00ff64' : '#ffa500',
//           animation: connectionStatus === 'connected' ? 'pulse 2s infinite' : 'blink 1s infinite'
//         }} />
//         <div>
//           <span>
//             {connectionStatus === 'connected' 
//               ? '✅ LIVE TRACKING' 
//               : '🕺 DANCE MODE'}
//           </span>
//           {connectionStatus === 'disconnected' && (
//             <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.8 }}>
//               Run: Server
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Controls Toggle */}
//       <button
//         onClick={() => setShowControls(!showControls)}
//         style={{
//           position: 'absolute',
//           top: 20,
//           right: 20,
//           zIndex: 100,
//           padding: '8px 16px',
//           background: 'rgba(0, 0, 0, 0.5)',
//           color: 'white',
//           border: '1px solid #00ffcc',
//           borderRadius: '5px',
//           cursor: 'pointer',
//           fontFamily: 'monospace',
//           backdropFilter: 'blur(10px)',
//           transition: 'all 0.3s'
//         }}
//         onMouseEnter={(e) => e.target.style.background = 'rgba(0, 255, 204, 0.3)'}
//         onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
//       >
//         {showControls ? 'Hide Controls' : 'Show Controls'}
//       </button>

//       {/* Main Canvas */}
//       <Canvas 
//         camera={{ 
//           position: [0, 1.5, 5], 
//           fov: 50,
//           near: 0.1,
//           far: 1000
//         }}
//         shadows
//         style={{ background: '#0a0a0f' }}
//       >
//         {/* Lighting */}
//         <ambientLight intensity={0.6} />
//         <directionalLight 
//           position={[5, 10, 7]} 
//           intensity={1.2}
//           castShadow
//           shadow-mapSize-width={1024}
//           shadow-mapSize-height={1024}
//           shadow-camera-far={50}
//           shadow-camera-left={-10}
//           shadow-camera-right={10}
//           shadow-camera-top={10}
//           shadow-camera-bottom={-10}
//         />
//         <directionalLight 
//           position={[-5, 5, -7]} 
//           intensity={0.6}
//           color="#ffccaa"
//         />
//         <hemisphereLight 
//           skyColor="#ffffff"
//           groundColor="#888888"
//           intensity={0.5}
//         />

//         {/* Point light for drama */}
//         <pointLight 
//           position={[0, 3, 2]} 
//           color="#ff00ff" 
//           intensity={0.5}
//           distance={10}
//           decay={2}
//         />

//         {/* Environment */}
//         <Environment preset="studio" />

//         {/* Floor */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
//           <planeGeometry args={[20, 20]} />
//           <shadowMaterial opacity={0.3} />
//           <meshStandardMaterial 
//             color="#1a1a1a" 
//             roughness={0.8}
//             metalness={0.2}
//           />
//         </mesh>

//         {/* Dance floor effect */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
//           <planeGeometry args={[5, 5]} />
//           <meshStandardMaterial 
//             color="#000000"
//             emissive="#ff00ff"
//             emissiveIntensity={0.1}
//             transparent
//             opacity={0.3}
//           />
//         </mesh>

//         {/* Avatar */}
//         <Suspense fallback={
//           <Html center>
//             <div style={{
//               background: 'rgba(0, 0, 0, 0.8)',
//               color: 'white',
//               padding: '20px',
//               borderRadius: '10px',
//               fontFamily: 'monospace',
//               border: '2px solid #00ff88',
//               textAlign: 'center'
//             }}>
//               <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
//               <div style={{ fontSize: '16px' }}>Loading Avatar...</div>
//             </div>
//           </Html>
//         }>
//           {landmarks ? (
//             <LiveAvatar landmarks={landmarks} />
//           ) : (
//             <MaleDancePoseAvatar />
//           )}
//         </Suspense>

//         {/* Camera Controls */}
//         {showControls && (
//           <OrbitControls 
//             enablePan={true}
//             enableZoom={true}
//             enableRotate={true}
//             target={[0, 1, 0]}
//             minDistance={2}
//             maxDistance={15}
//             maxPolarAngle={Math.PI / 2}
//             dampingFactor={0.05}
//           />
//         )}

//         {/* Grid Helper (only in dev) */}
//         {process.env.NODE_ENV === 'development' && (
//           <gridHelper args={[20, 20, 0x444444, 0x888888]} />
//         )}
//       </Canvas>

//       {/* Instructions */}
//       <div style={{
//         position: 'absolute',
//         bottom: 20,
//         left: '50%',
//         transform: 'translateX(-50%)',
//         background: 'rgba(0, 0, 0, 0.7)',
//         padding: '15px 30px',
//         borderRadius: '10px',
//         color: 'white',
//         fontFamily: 'sans-serif',
//         textAlign: 'center',
//         backdropFilter: 'blur(10px)',
//         border: '1px solid rgba(0, 255, 204, 0.3)',
//         maxWidth: '80%',
//         boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
//       }}>
//         <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>
//           {connectionStatus === 'connected' ? '🎯 Live Body Tracking' : '🕺 Animated Dance Pose'}
//         </div>
//         <div style={{ fontSize: '14px', opacity: 0.8 }}>
//           {connectionStatus === 'connected' 
//             ? 'Your movements are being tracked in real-time' 
//             : 'Custom dance animations playing'}
//         </div>
//         <div style={{ 
//           fontSize: '12px', 
//           opacity: 0.6, 
//           marginTop: '5px',
//           fontFamily: 'monospace'
//         }}>
//           {connectionStatus === 'disconnected' && '> python capture_and_send.py'}
//         </div>
//       </div>

//       {/* CSS Animations */}
//       <style>{`
//         @keyframes pulse {
//           0% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.5; transform: scale(1.1); }
//           100% { opacity: 1; transform: scale(1); }
//         }

//         @keyframes blink {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.3; }
//         }

//         @keyframes danceFloor {
//           0% { box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, inset 0 0 10px #ff00ff; }
//           50% { box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, inset 0 0 20px #00ffff; }
//           100% { box-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, inset 0 0 10px #ff00ff; }
//         }
//       `}</style>
//     </>
//   );
// }


//TRY - 15
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import useLandmarks from "../hooks/useLandmarks";
import { createFilteredLandmarks } from "../utils/smoothing";
import "../../src/App.css";
import Caption from "./Caption";

useGLTF.preload("/models/standing.glb");


function IdleAvatar() {
  const { scene } = useGLTF("/models/standing.glb");
  const groupRef = useRef();
  const clockRef = useRef(new THREE.Clock(false));

  useFrame((state, delta) => {
    // Add subtle breathing motion
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      const breath = Math.sin(time * 2) * 0.01;
      const sway = Math.sin(time * 0.5) * 0.02;

      groupRef.current.position.y = breath;
      groupRef.current.rotation.z = sway;

      // Add slow continuous rotation
      groupRef.current.rotation.y += 0.001;
    }
  });

  return <primitive ref={groupRef} object={scene} scale={1.3} position={[0, 0, 0]} />;
}


function LiveAvatar({ landmarks }) {
  const { scene, nodes } = useGLTF("/models/standing.glb");
  const groupRef = useRef();
  const filteredLandmarks = useRef(createFilteredLandmarks());
  const lastLandmarksRef = useRef(null);
  const boneRotationsRef = useRef({});

  // Initialize bone rotations
  useEffect(() => {
    if (scene) {
      // Store initial rotations for all bones
      scene.traverse((child) => {
        if (child.isBone) {
          boneRotationsRef.current[child.name] = {
            rotation: child.rotation.clone(),
            quaternion: child.quaternion.clone()
          };
        }
      });
      console.log("🎯 Live tracking initialized with bone system");
    }
  }, [scene]);

  // Convert MediaPipe coordinates to Three.js world coordinates
  const mapLandmarkToWorld = useCallback((landmark) => {
    if (!landmark) return { x: 0, y: 0, z: 0 };

    // MediaPipe coordinates: x,y in [0,1], z is depth
    // Convert to Three.js coordinates
    return {
      x: (landmark.x - 0.5) * 4,  // Scale and center
      y: -(landmark.y - 0.5) * 4, // Invert Y and scale
      z: (landmark.z || 0) * 2    // Scale depth
    };
  }, []);

  // Calculate rotation between two vectors
  const calculateRotation = useCallback((fromVec, toVec, up = new THREE.Vector3(0, 1, 0)) => {
    const quaternion = new THREE.Quaternion();
    const matrix = new THREE.Matrix4();

    // Create lookAt matrix
    matrix.lookAt(new THREE.Vector3(0, 0, 0), toVec.clone().normalize(), up);
    quaternion.setFromRotationMatrix(matrix);

    return quaternion;
  }, []);

  // Calculate angle between two vectors
  const calculateAngle = useCallback((vec1, vec2) => {
    const v1 = new THREE.Vector3(vec1.x, vec1.y, vec1.z).normalize();
    const v2 = new THREE.Vector3(vec2.x, vec2.y, vec2.z).normalize();
    return Math.acos(v1.dot(v2));
  }, []);

  // Process full body tracking
  const processBodyTracking = useCallback((pose) => {
    if (!pose || !nodes) return;

    // Map all key landmarks to world coordinates
    const landmarks3D = {};
    Object.keys(pose).forEach(key => {
      landmarks3D[key] = mapLandmarkToWorld(pose[key]);
    });

    // 1. SPINE & HIP TRACKING
    if (landmarks3D.LEFT_HIP && landmarks3D.RIGHT_HIP && landmarks3D.LEFT_SHOULDER && landmarks3D.RIGHT_SHOULDER) {
      // Calculate hip center
      const hipCenter = {
        x: (landmarks3D.LEFT_HIP.x + landmarks3D.RIGHT_HIP.x) / 2,
        y: (landmarks3D.LEFT_HIP.y + landmarks3D.RIGHT_HIP.y) / 2,
        z: (landmarks3D.LEFT_HIP.z + landmarks3D.RIGHT_HIP.z) / 2
      };

      // Calculate shoulder center
      const shoulderCenter = {
        x: (landmarks3D.LEFT_SHOULDER.x + landmarks3D.RIGHT_SHOULDER.x) / 2,
        y: (landmarks3D.LEFT_SHOULDER.y + landmarks3D.RIGHT_SHOULDER.y) / 2,
        z: (landmarks3D.LEFT_SHOULDER.z + landmarks3D.RIGHT_SHOULDER.z) / 2
      };

      // Spine vector (from hips to shoulders)
      const spineVec = {
        x: shoulderCenter.x - hipCenter.x,
        y: shoulderCenter.y - hipCenter.y,
        z: shoulderCenter.z - hipCenter.z
      };

      // Apply to spine bone if exists
      const spineBone = nodes.mixamorigSpine || nodes.Spine || nodes.spine;
      if (spineBone) {
        const spineRotation = Math.atan2(spineVec.x, spineVec.y) * 0.5;
        spineBone.rotation.z = spineRotation;

        // Forward/backward tilt
        const spineLength = Math.sqrt(spineVec.x * spineVec.x + spineVec.y * spineVec.y + spineVec.z * spineVec.z);
        const spineTilt = Math.asin(spineVec.z / spineLength) * 0.5;
        spineBone.rotation.x = spineTilt;
      }

      // Hip rotation (based on hip positions)
      const hipBone = nodes.mixamorigHips || nodes.Hips || nodes.hips;
      if (hipBone) {
        const hipRotation = Math.atan2(
          landmarks3D.RIGHT_HIP.x - landmarks3D.LEFT_HIP.x,
          landmarks3D.RIGHT_HIP.y - landmarks3D.LEFT_HIP.y
        ) * 0.3;
        hipBone.rotation.y = hipRotation;
      }
    }

    // 2. ARM TRACKING - IMPROVED
    const processArm = (side) => {
      const upperKey = `${side}_SHOULDER`;
      const midKey = `${side}_ELBOW`;
      const endKey = `${side}_WRIST`;

      if (landmarks3D[upperKey] && landmarks3D[midKey] && landmarks3D[endKey]) {
        // Get arm bones
        const upperArmBone = nodes[`mixamorig${side}Arm`] || nodes[`${side}Arm`];
        const forearmBone = nodes[`mixamorig${side}ForeArm`] || nodes[`${side}ForeArm`];

        if (upperArmBone && forearmBone) {
          // Calculate vectors for each arm segment
          const upperArmVec = {
            x: landmarks3D[midKey].x - landmarks3D[upperKey].x,
            y: landmarks3D[midKey].y - landmarks3D[upperKey].y,
            z: landmarks3D[midKey].z - landmarks3D[upperKey].z
          };

          const forearmVec = {
            x: landmarks3D[endKey].x - landmarks3D[midKey].x,
            y: landmarks3D[endKey].y - landmarks3D[midKey].y,
            z: landmarks3D[endKey].z - landmarks3D[midKey].z
          };

          // Calculate angles
          const upperArmAngleX = Math.atan2(upperArmVec.y, upperArmVec.z) * 1.5;
          const upperArmAngleY = Math.atan2(upperArmVec.x, upperArmVec.z) * 1.5;
          const upperArmAngleZ = Math.atan2(upperArmVec.x, upperArmVec.y) * 0.5;

          // Apply to upper arm
          upperArmBone.rotation.x = THREE.MathUtils.lerp(
            upperArmBone.rotation.x,
            upperArmAngleX,
            0.3
          );
          upperArmBone.rotation.y = THREE.MathUtils.lerp(
            upperArmBone.rotation.y,
            upperArmAngleY,
            0.3
          );
          upperArmBone.rotation.z = THREE.MathUtils.lerp(
            upperArmBone.rotation.z,
            upperArmAngleZ,
            0.3
          );

          // Calculate forearm angles relative to upper arm
          const forearmAngleX = Math.atan2(forearmVec.y, forearmVec.z) * 1.5;
          const forearmAngleZ = Math.atan2(forearmVec.x, forearmVec.y) * 0.5;

          // Apply to forearm
          forearmBone.rotation.x = THREE.MathUtils.lerp(
            forearmBone.rotation.x,
            forearmAngleX,
            0.3
          );
          forearmBone.rotation.z = THREE.MathUtils.lerp(
            forearmBone.rotation.z,
            forearmAngleZ,
            0.3
          );
        }
      }
    };

    processArm("LEFT");
    processArm("RIGHT");

    // 3. HEAD TRACKING
    if (landmarks3D.LEFT_EAR && landmarks3D.RIGHT_EAR && landmarks3D.NOSE) {
      const headBone = nodes.mixamorigHead || nodes.Head || nodes.head;
      if (headBone) {
        // Head tilt based on ear positions
        const headTilt = Math.atan2(
          landmarks3D.RIGHT_EAR.y - landmarks3D.LEFT_EAR.y,
          landmarks3D.RIGHT_EAR.x - landmarks3D.LEFT_EAR.x
        ) * 0.5;

        // Head rotation based on nose position relative to shoulders
        if (landmarks3D.LEFT_SHOULDER && landmarks3D.RIGHT_SHOULDER) {
          const shoulderCenterX = (landmarks3D.LEFT_SHOULDER.x + landmarks3D.RIGHT_SHOULDER.x) / 2;
          const headRotation = (landmarks3D.NOSE.x - shoulderCenterX) * 2;

          headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, headRotation, 0.3);
        }

        headBone.rotation.z = THREE.MathUtils.lerp(headBone.rotation.z, headTilt, 0.3);
      }
    }

    // 4. LEG TRACKING (if available)
    const processLeg = (side) => {
      const hipKey = `${side}_HIP`;
      const kneeKey = `${side}_KNEE`;
      const ankleKey = `${side}_ANKLE`;

      if (landmarks3D[hipKey] && landmarks3D[kneeKey] && landmarks3D[ankleKey]) {
        const upperLegBone = nodes[`mixamorig${side}UpLeg`] || nodes[`${side}UpLeg`];
        const lowerLegBone = nodes[`mixamorig${side}Leg`] || nodes[`${side}Leg`];

        if (upperLegBone && lowerLegBone) {
          // Upper leg vector
          const upperLegVec = {
            x: landmarks3D[kneeKey].x - landmarks3D[hipKey].x,
            y: landmarks3D[kneeKey].y - landmarks3D[hipKey].y,
            z: landmarks3D[kneeKey].z - landmarks3D[hipKey].z
          };

          // Lower leg vector
          const lowerLegVec = {
            x: landmarks3D[ankleKey].x - landmarks3D[kneeKey].x,
            y: landmarks3D[ankleKey].y - landmarks3D[kneeKey].y,
            z: landmarks3D[ankleKey].z - landmarks3D[kneeKey].z
          };

          // Apply rotations
          const upperLegAngle = Math.atan2(upperLegVec.x, upperLegVec.y) * 1.5;
          const lowerLegAngle = Math.atan2(lowerLegVec.x, lowerLegVec.y) * 1.5;

          upperLegBone.rotation.x = THREE.MathUtils.lerp(
            upperLegBone.rotation.x,
            upperLegAngle,
            0.3
          );

          lowerLegBone.rotation.x = THREE.MathUtils.lerp(
            lowerLegBone.rotation.x,
            lowerLegAngle,
            0.3
          );
        }
      }
    };

    processLeg("LEFT");
    processLeg("RIGHT");

  }, [nodes, mapLandmarkToWorld, calculateRotation, calculateAngle]);

  // Process hand tracking for fingers
  const processHandTracking = useCallback((handLandmarks, side) => {
    if (!handLandmarks || Object.keys(handLandmarks).length < 21 || !nodes) return;

    // Map finger landmarks to bone rotations
    const fingerBones = {
      thumb: [`${side}HandThumb1`, `${side}HandThumb2`, `${side}HandThumb3`],
      index: [`${side}HandIndex1`, `${side}HandIndex2`, `${side}HandIndex3`],
      middle: [`${side}HandMiddle1`, `${side}HandMiddle2`, `${side}HandMiddle3`],
      ring: [`${side}HandRing1`, `${side}HandRing2`, `${side}HandRing3`],
      pinky: [`${side}HandPinky1`, `${side}HandPinky2`, `${side}HandPinky3`]
    };

    // Process each finger
    Object.keys(fingerBones).forEach((finger, fingerIndex) => {
      const boneNames = fingerBones[finger];
      const tipIndex = [4, 8, 12, 16, 20][fingerIndex]; // MediaPipe finger tip indices
      const baseIndex = tipIndex - 2;

      if (handLandmarks[baseIndex] && handLandmarks[tipIndex]) {
        const base = handLandmarks[baseIndex];
        const tip = handLandmarks[tipIndex];

        // Calculate curl based on distance
        const dist = Math.sqrt(
          Math.pow(tip.x - base.x, 2) +
          Math.pow(tip.y - base.y, 2) +
          Math.pow(tip.z || 0 - (base.z || 0), 2)
        );

        // Map distance to rotation (adjust these values based on your needs)
        const curl = THREE.MathUtils.mapLinear(dist, 0.05, 0.15, 1.5, 0);

        // Apply to all bones in the finger
        boneNames.forEach((boneName, boneIndex) => {
          const bone = nodes[boneName];
          if (bone) {
            // Different bones get different amounts of curl
            const boneCurl = curl * (1 - boneIndex * 0.3);
            bone.rotation.x = THREE.MathUtils.lerp(
              bone.rotation.x,
              THREE.MathUtils.clamp(boneCurl, 0, 1.2),
              0.4
            );
          }
        });
      }
    });
  }, [nodes]);

  // Main animation frame
  useFrame(() => {
    if (!landmarks?.pose) return;

    // Apply smoothing to landmarks
    const smoothedLandmarks = filteredLandmarks.current.update(landmarks);
    if (!smoothedLandmarks?.pose) return;

    // Process body tracking
    processBodyTracking(smoothedLandmarks.pose);

    // Process hands if available
    if (smoothedLandmarks.left_hand) {
      processHandTracking(smoothedLandmarks.left_hand, "Left");
    }

    if (smoothedLandmarks.right_hand) {
      processHandTracking(smoothedLandmarks.right_hand, "Right");
    }

    lastLandmarksRef.current = smoothedLandmarks;
  });

  return <primitive ref={groupRef} object={scene} scale={1.3} position={[0, 0, 0]} />;
}


function LandmarkDebugViewer({ landmarks }) {
  const groupRef = useRef();
  const filteredLandmarks = useRef(createFilteredLandmarks());

  useFrame(() => {
    if (!landmarks?.pose || !groupRef.current) return;

    // Clear previous markers
    groupRef.current.children.forEach(child => {
      if (child.userData.isMarker) {
        groupRef.current.remove(child);
      }
    });

    // Add new markers for each landmark
    const smoothedLandmarks = filteredLandmarks.current.update(landmarks);
    if (!smoothedLandmarks?.pose) return;

    const pose = smoothedLandmarks.pose;

    Object.keys(pose).forEach((key, index) => {
      const landmark = pose[key];
      if (landmark) {
        // Convert to 3D coordinates
        const x = (landmark.x - 0.5) * 4;
        const y = -(landmark.y - 0.5) * 4;
        const z = (landmark.z || 0) * 2;

        // Create sphere for landmark
        const geometry = new THREE.SphereGeometry(0.02, 8, 8);
        const material = new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? 0xff0000 : 0x00ff00
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        sphere.userData.isMarker = true;

        groupRef.current.add(sphere);
      }
    });
  });

  return <group ref={groupRef} />;
}


export default function CanvasAvatar() {
  const landmarks = useLandmarks();
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [showControls, setShowControls] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [trackingQuality, setTrackingQuality] = useState("Good");

  // Monitor connection and tracking quality
  useEffect(() => {
    if (landmarks) {
      setConnectionStatus("connected");

      // Estimate tracking quality based on visible landmarks
      if (landmarks.pose) {
        const visiblePoints = Object.values(landmarks.pose).filter(p => p).length;
        if (visiblePoints < 10) setTrackingQuality("Poor");
        else if (visiblePoints < 20) setTrackingQuality("Fair");
        else setTrackingQuality("Good");
      }
    } else {
      setConnectionStatus("disconnected");
      setTrackingQuality("Good");
    }
  }, [landmarks]);

  return (
    <>
      {/* Connection Status */}
      <div style={{
        position: 'absolute',
        top: 'min(2vw, 20px)',
        left: 'min(2vw, 20px)',
        zIndex: 100,
        background: connectionStatus === 'connected'
          ? 'rgba(0, 255, 100, 0.15)'
          : 'rgba(255, 165, 0, 0.15)',
        padding: 'clamp(8px, 1.5vw, 15px) clamp(12px, 2vw, 25px)',
        borderRadius: 'min(1.5vw, 12px)',
        border: `1.5px solid ${connectionStatus === 'connected' ? '#00ff64' : '#ffa500'}`,
        color: 'white',
        fontFamily: 'monospace',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        gap: 'min(1.5vw, 12px)',
        maxWidth: 'min(80vw, 300px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: 'min(1.2vw, 10px)',
          height: 'min(1.2vw, 10px)',
          borderRadius: '50%',
          background: connectionStatus === 'connected' ? '#00ff64' : '#ffa500',
          animation: connectionStatus === 'connected' ? 'pulse 2s infinite' : 'blink 1s infinite',
          flexShrink: 0
        }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 'bold', fontSize: 'clamp(12px, 1.2vw, 15px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {connectionStatus === 'connected'
              ? '✅ LIVE TRACKING ACTIVE'
              : '🕺 IDLE MODE'}
          </div>
          {connectionStatus === 'connected' && (
            <div style={{ fontSize: 'clamp(10px, 1vw, 13px)', marginTop: '2px', opacity: 0.8 }}>
              Quality: <span style={{
                color: trackingQuality === 'Good' ? '#00ff64' :
                  trackingQuality === 'Fair' ? '#ffaa00' : '#ff4444'
              }}>{trackingQuality}</span>
            </div>
          )}
          {connectionStatus === 'disconnected' && (
            <div style={{ fontSize: 'clamp(10px, 1vw, 13px)', marginTop: '2px', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Run
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 'min(2vw, 20px)',
        right: 'min(2vw, 20px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 'min(1vw, 10px)'
      }}>
        <button
          onClick={() => setShowControls(!showControls)}
          style={{
            padding: 'clamp(6px, 1vw, 10px) clamp(10px, 1.5vw, 20px)',
            background: 'rgba(0, 0, 0, 0.4)',
            color: 'white',
            border: '1px solid #00ffcc',
            borderRadius: 'min(1vw, 8px)',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: 'clamp(10px, 1vw, 14px)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(0, 255, 204, 0.25)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.4)'}
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>

        {connectionStatus === 'connected' && (
          <button
            onClick={() => setShowDebug(!showDebug)}
            style={{
              padding: 'clamp(6px, 1vw, 10px) clamp(10px, 1.5vw, 20px)',
              background: showDebug ? 'rgba(255, 0, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
              color: 'white',
              border: `1px solid ${showDebug ? '#ff00ff' : '#00ffcc'}`,
              borderRadius: 'min(1vw, 8px)',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 'clamp(10px, 1vw, 14px)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => !showDebug && (e.target.style.background = 'rgba(0, 255, 204, 0.25)')}
            onMouseLeave={(e) => !showDebug && (e.target.style.background = 'rgba(0, 0, 0, 0.4)')}
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
        )}
      </div>

      {/* Tracking Tips */}
      {connectionStatus === 'connected' && (
        <div style={{
          position: 'absolute',
          top: 'clamp(80px, 10vh, 120px)',
          left: 'min(2vw, 20px)',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.6)',
          padding: 'clamp(10px, 1.5vw, 20px)',
          borderRadius: 'min(1.5vw, 12px)',
          color: 'white',
          fontFamily: 'sans-serif',
          fontSize: 'clamp(10px, 1.1vw, 14px)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 255, 204, 0.2)',
          maxWidth: 'min(80vw, 260px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#00ffcc', fontSize: 'clamp(12px, 1.2vw, 16px)' }}>
            📍 Tracking Tips:
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2vw', opacity: 0.9, lineHeight: '1.5' }}>
            <li>Stand facing the camera</li>
            <li>Keep arms visible</li>
            <li>Good lighting helps</li>
            <li>Move slowly</li>
          </ul>
        </div>
      )}

      {/* Main Canvas */}
      <Canvas
        camera={{
          position: [0, 1.5, 4],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        shadows
        style={{ background: '#0a0a0f' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 10, 7]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight
          position={[-5, 5, -7]}
          intensity={0.6}
          color="#ffccaa"
        />
        <hemisphereLight
          skyColor="#ffffff"
          groundColor="#888888"
          intensity={0.5}
        />

        {/* Point light for drama */}
        <pointLight
          position={[0, 3, 2]}
          color="#00ffcc"
          intensity={0.5}
          distance={10}
          decay={2}
        />

        {/* Environment */}
        <Environment preset="studio" />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.3} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Avatar */}
        <Suspense fallback={
          <Html center>
            <div style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '20px',
              borderRadius: '10px',
              fontFamily: 'monospace',
              border: '2px solid #00ff88',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
              <div style={{ fontSize: '16px' }}>Loading Avatar...</div>
            </div>
          </Html>
        }>
          {landmarks ? (
            <>
              <LiveAvatar landmarks={landmarks} />
              {showDebug && <LandmarkDebugViewer landmarks={landmarks} />}
            </>
          ) : (
            <IdleAvatar />
          )}
        </Suspense>

        {/* Camera Controls */}
        {showControls && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 1, 0]}
            minDistance={2}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2}
            dampingFactor={0.05}
          />
        )}

        {/* Grid Helper */}
        {process.env.NODE_ENV === 'development' && (
          <gridHelper args={[20, 20, 0x444444, 0x888888]} />
        )}
      </Canvas>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px 30px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 255, 204, 0.3)',
        maxWidth: '80%',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>
          {connectionStatus === 'connected' ? '🎯 Full Body Tracking' : '🕺 Idle Animation'}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          {connectionStatus === 'connected'
            ? 'Your entire body is being tracked in real-time'
            : 'Waiting for camera feed to start tracking'}
        </div>
        {showDebug && connectionStatus === 'connected' && (
          <div style={{
            fontSize: '12px',
            marginTop: '10px',
            color: '#ff00ff',
            fontFamily: 'monospace'
          }}>
            Debug Mode: Showing MediaPipe landmarks
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      
    </>
  );
}
