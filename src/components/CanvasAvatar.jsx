import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import useLandmarks from "../hooks/useLandmarks";
import { createFilteredLandmarks } from "../utils/smoothing";
import { ALPHABET_POSES, applySignPose } from "../utils/signAnimations";
import socketService from "../services/socketService";
import { io } from "socket.io-client";
import "../../src/App.css";
import Caption from "./Caption";

// Landmark mapping for MediaPipe indices
const POSE_MAP = {
  "0": "NOSE",
  "11": "LEFT_SHOULDER", "12": "RIGHT_SHOULDER",
  "13": "LEFT_ELBOW", "14": "RIGHT_ELBOW",
  "15": "LEFT_WRIST", "16": "RIGHT_WRIST",
  "23": "LEFT_HIP", "24": "RIGHT_HIP",
  "25": "LEFT_KNEE", "26": "RIGHT_KNEE",
  "27": "LEFT_ANKLE", "28": "RIGHT_ANKLE",
  "7": "LEFT_EAR", "8": "RIGHT_EAR"
};

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


function LiveAvatar({ landmarks, playbackChar }) {
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
    Object.entries(pose).forEach(([key, landmark]) => {
      const name = POSE_MAP[key] || key;
      landmarks3D[name] = mapLandmarkToWorld(landmark);
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
    // ===== PLAYBACK MODE (Text-to-Sign) =====
    if (playbackChar && nodes) {
      applySignPose(nodes, playbackChar, null, 0.15);
      return;
    }

    // ===== LIVE TRACKING MODE =====
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
  const { landmarks: remoteLandmarks, sign: remoteSign, sentence: remoteSentence } = useLandmarks();
  const [localLandmarks, setLocalLandmarks] = useState(null);
  const [localSign, setLocalSign] = useState(null);
  const [localSentence, setLocalSentence] = useState("");

  // Smoothing state for landmarks
  const landmarkHistory = useRef({ left: [], right: [], pose: [] });
  const SMOOTHING_WINDOW = 3;

  const videoRef = useRef(null);
  const holisticRef = useRef(null);
  const pythonSocketRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPythonConnected, setIsPythonConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [showControls, setShowControls] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [trackingQuality, setTrackingQuality] = useState("Good");

  // Text-to-Sign Playback State
  const [playbackQueue, setPlaybackQueue] = useState([]);
  const [currentPlaybackChar, setCurrentPlaybackChar] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  // Python Prediction Server Connection
  useEffect(() => {
    const SIGN_URL = import.meta.env.VITE_SIGN_PREDICT_URL || 'http://localhost:7001';
    console.log("🔌 Connecting to Python Prediction Server at:", SIGN_URL);

    const socket = io(SIGN_URL);

    socket.on('connect', () => {
      console.log('✅ Connected to Python Prediction Server');
      setIsPythonConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Disconnected from Python Prediction Server');
      setIsPythonConnected(false);
    });

    socket.on('landmarks_processed', (data) => {
      // console.log("🧠 Processed landmarks received from Python");
      setLocalLandmarks(data);
      if (data.sign_language) {
        setLocalSign(data.sign_language);
        setLocalSentence(data.sign_language.sentence);
      }

      // Sync with other components (like Caption.js)
      socketService.emitEvent('landmarks', data);
      if (data.sign_language) {
        socketService.emitEvent('sign', data.sign_language);
      }
    });

    pythonSocketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  // MediaPipe Holistic Setup
  useEffect(() => {
    if (!window.Holistic) {
      console.error("❌ MediaPipe Holistic not found in window");
      return;
    }

    const holistic = new window.Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
    });

    holistic.setOptions({
      modelComplexity: 1, // 1 for balance, 2 for higher precision
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      refineFaceLandmarks: false
    });

    const smooth = (landmarks, historyKey) => {
      if (!landmarks) return null;
      const history = landmarkHistory.current[historyKey];
      history.push(landmarks);
      if (history.length > SMOOTHING_WINDOW) history.shift();

      const averaged = landmarks.map((lm, i) => {
        let x = 0, y = 0, z = 0;
        history.forEach(h => {
          x += h[i].x;
          y += h[i].y;
          z += h[i].z;
        });
        return { x: x / history.length, y: y / history.length, z: z / history.length };
      });
      return averaged;
    };

    holistic.onResults((results) => {
      if (!isCapturing) return;

      const data = {
        pose: {},
        left_hand: {},
        right_hand: {},
        timestamp: Date.now()
      };

      if (results.poseLandmarks) {
        results.poseLandmarks.forEach((lm, i) => {
          data.pose[i] = { x: lm.x, y: lm.y, z: lm.z };
        });
      }

      const smoothedLeft = smooth(results.leftHandLandmarks, 'left');
      if (smoothedLeft) {
        smoothedLeft.forEach((lm, i) => {
          data.left_hand[i] = { x: lm.x, y: lm.y, z: lm.z };
        });
      }

      const smoothedRight = smooth(results.rightHandLandmarks, 'right');
      if (smoothedRight) {
        smoothedRight.forEach((lm, i) => {
          data.right_hand[i] = { x: lm.x, y: lm.y, z: lm.z };
        });
      }

      // Send to Python for prediction
      if (pythonSocketRef.current?.connected && (smoothedLeft || smoothedRight)) {
        pythonSocketRef.current.emit('process_landmarks', data);
      } else {
        setLocalLandmarks(data);
      }
    });

    holisticRef.current = holistic;
  }, [isCapturing]);

  // Camera Management
  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      videoRef.current.srcObject = stream;
      setIsCapturing(true);

      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (holisticRef.current) {
            await holisticRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      camera.start();
    } catch (err) {
      console.error("❌ Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  // Switch between remote (Python capture) and local (Browser capture)
  const activeLandmarks = isCapturing ? localLandmarks : remoteLandmarks;
  const activeSign = isCapturing ? localSign : remoteSign;
  const activeSentence = isCapturing ? localSentence : remoteSentence;

  useEffect(() => {
    const checkSocket = () => {
      const isConnected = socketService.isConnected();
      if (activeLandmarks && isTrackingActive) {
        setConnectionStatus("connected");
      } else if (isConnected) {
        setConnectionStatus(isTrackingActive ? "waiting_for_data" : "paused");
      } else {
        setConnectionStatus("disconnected");
      }
    };

    checkSocket();
    const timer = setInterval(checkSocket, 2000); // Poll connection status

    if (activeLandmarks && activeLandmarks.pose && isTrackingActive) {
      // Estimate tracking quality based on visible landmarks
      const visiblePoints = Object.values(activeLandmarks.pose).filter(p => p).length;
      if (visiblePoints < 10) setTrackingQuality("Poor");
      else if (visiblePoints < 20) setTrackingQuality("Fair");
      else setTrackingQuality("Good");

      // Stop playback if live tracking starts
      setPlaybackQueue([]);
      setCurrentPlaybackChar(null);
    }

    return () => clearInterval(timer);
  }, [activeLandmarks, isTrackingActive]);

  // Listen for new messages for Text-to-Sign
  useEffect(() => {
    const handleNewMessage = (data) => {
      if (data.type === 'text' && data.content) {
        console.log("🎬 Queuing text for sign playback:", data.content);
        const chars = data.content.toUpperCase().split('').filter(c => ALPHABET_POSES[c]);
        if (chars.length > 0) {
          setPlaybackQueue(prev => [...prev, ...chars]);
        }
      }
    };

    const unsub = socketService.onNewMessage(handleNewMessage);
    return () => unsub();
  }, []);

  // Process playback queue
  useEffect(() => {
    if (playbackQueue.length > 0 && !currentPlaybackChar) {
      const nextChar = playbackQueue[0];
      setCurrentPlaybackChar(nextChar);

      // Show each sign for 1 second
      const timer = setTimeout(() => {
        setPlaybackQueue(prev => prev.slice(1));
        setCurrentPlaybackChar(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [playbackQueue, currentPlaybackChar]);

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

          {connectionStatus === 'connected' && activeLandmarks && (
            <div style={{ fontSize: 'clamp(10px, 1vw, 13px)', marginTop: '2px', opacity: 0.8 }}>
              Points: {Object.keys(activeLandmarks.pose || {}).length} | Quality: <span style={{
                color: trackingQuality === 'Good' ? '#00ff64' :
                  trackingQuality === 'Fair' ? '#ffaa00' : '#ff4444'
              }}>{trackingQuality}</span>
            </div>
          )}
          {connectionStatus === 'waiting_for_data' && (
            <div style={{ fontSize: 'clamp(10px, 1vw, 13px)', marginTop: '2px', opacity: 0.8 }}>
              {isCapturing ? "Processing local capture..." : "Socket OK. Use Local Cam or External Script."}
            </div>
          )}


          {currentPlaybackChar && (
            <div style={{ fontSize: 'clamp(12px, 1.2vw, 18px)', marginTop: '5px', color: '#00ffcc', fontWeight: 'bold' }}>
              Letter: {currentPlaybackChar}
            </div>
          )}
        </div>
      </div>

      {/* Hidden Video for MediaPipe */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        width="640"
        height="480"
        autoPlay
        playsInline
      />

      {/* Predicted Sentence Overlay */}
      {activeSentence && connectionStatus === 'connected' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '20px 40px',
          borderRadius: '15px',
          border: '2px solid #00ff88',
          textAlign: 'center',
          minWidth: '300px',
          maxWidth: '80%',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.4)',
          animation: 'fadeIn 0.3s'
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', letterSpacing: '1px' }}>PREDICTED SENTENCE</div>
          <div style={{ fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: 'bold', color: '#00ff88', lineHeight: 1.4, wordBreak: 'break-word' }}>
            {activeSentence || "..."}
          </div>
        </div>
      )}

      {/* Predicted Sign Overlay (Case 1) */}
      {activeSign && connectionStatus === 'connected' && activeSign.letter && activeSign.letter !== 'nothing' && (
        <div style={{
          position: 'absolute',
          bottom: '120px',
          right: '20px',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '15px',
          border: '2px solid #00ffcc',
          textAlign: 'center',
          minWidth: '120px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 30px rgba(0, 255, 204, 0.3)',
          animation: 'fadeIn 0.3s'
        }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>DETECTED SIGN</div>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#00ffcc', lineHeight: 1 }}>
            {activeSign.letter}
          </div>
          <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>
            {(activeSign.confidence * 100).toFixed(0)}% confidence
          </div>
        </div>
      )}

      {/* Dashboard Button - Below Tracking Tips */}
      <div style={{
        position: 'absolute',
        top: 'min(2vw, 20px)',
        left: 'min(2vw, 20px)',
        zIndex: 100
      }}>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            padding: 'clamp(10px, 1.5vw, 15px) clamp(15px, 2vw, 25px)',
            background: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            border: '1px solid rgba(0, 255, 204, 0.3)',
            borderRadius: 'min(1.5vw, 12px)',
            cursor: 'pointer',
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            fontSize: 'clamp(11px, 1.1vw, 14px)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 255, 204, 0.15)';
            e.target.style.borderColor = 'rgba(0, 255, 204, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0, 0, 0, 0.6)';
            e.target.style.borderColor = 'rgba(0, 255, 204, 0.3)';
          }}
          title="Back to Dashboard"
        >
          <span style={{ fontSize: 'clamp(14px, 1.5vw, 18px)' }}></span>
          <span>Back to Dashboard</span>
        </button>
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
          onClick={() => {
            const nextState = !isTrackingActive;
            setIsTrackingActive(nextState);
            if (nextState) {
              startCamera();
              socketService.startTracking();
            } else {
              stopCamera();
              socketService.stopTracking();
            }
          }}
          style={{
            padding: 'clamp(8px, 1.2vw, 12px) clamp(15px, 2vw, 30px)',
            background: isTrackingActive ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 255, 100, 0.6)',
            color: 'white',
            border: 'none',
            borderRadius: 'min(1vw, 8px)',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: 'clamp(12px, 1.2vw, 16px)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isTrackingActive ? (
            <>
              <span style={{ width: 10, height: 10, background: 'white', borderRadius: 2 }} />
              STOP TRACKING
            </>
          ) : (
            <>
              <span style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid white' }} />
              START TRACKING
            </>
          )}
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
          {(activeLandmarks && isTrackingActive) || currentPlaybackChar ? (
            <>
              <LiveAvatar
                landmarks={isTrackingActive ? activeLandmarks : null}
                playbackChar={currentPlaybackChar}
              />
              {showDebug && activeLandmarks && isTrackingActive && <LandmarkDebugViewer landmarks={activeLandmarks} />}
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
