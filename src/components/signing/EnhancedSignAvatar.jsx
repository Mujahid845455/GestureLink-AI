// src/components/signing/EnhancedSignAvatar.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Preload the avatar model
useGLTF.preload('/models/avatar_1766080971830.glb');

// Bone name mappings for different model formats
const BONE_MAPPINGS = {
    // Arm bones
    'LeftArm': ['LeftArm', 'mixamorigLeftArm', 'leftArm', 'Arm_L', 'arm_left'],
    'RightArm': ['RightArm', 'mixamorigRightArm', 'rightArm', 'Arm_R', 'arm_right'],
    'LeftForeArm': ['LeftForeArm', 'mixamorigLeftForeArm', 'leftForeArm', 'Forearm_L', 'forearm_left'],
    'RightForeArm': ['RightForeArm', 'mixamorigRightForeArm', 'rightForeArm', 'Forearm_R', 'forearm_right'],
    'LeftHand': ['LeftHand', 'mixamorigLeftHand', 'leftHand', 'Hand_L', 'hand_left'],
    'RightHand': ['RightHand', 'mixamorigRightHand', 'rightHand', 'Hand_R', 'hand_right'],

    // Finger bones
    'LeftThumb': ['LeftThumb', 'mixamorigLeftHandThumb1', 'thumb_left'],
    'RightThumb': ['RightThumb', 'mixamorigRightHandThumb1', 'thumb_right'],
    'LeftIndex': ['LeftIndex', 'mixamorigLeftHandIndex1', 'index_left'],
    'RightIndex': ['RightIndex', 'mixamorigRightHandIndex1', 'index_right'],

    // Body bones
    'Head': ['Head', 'mixamorigHead', 'head'],
    'Neck': ['Neck', 'mixamorigNeck', 'neck'],
    'Spine': ['Spine', 'mixamorigSpine', 'spine', 'Spine1', 'Spine2'],
    'Hips': ['Hips', 'mixamorigHips', 'hips'],

    // Shoulder bones
    'LeftShoulder': ['LeftShoulder', 'mixamorigLeftShoulder', 'shoulder_left'],
    'RightShoulder': ['RightShoulder', 'mixamorigRightShoulder', 'shoulder_right']
};

// Find bone by trying multiple names
const findBone = (nodes, boneName) => {
    const possibleNames = BONE_MAPPINGS[boneName];
    if (!possibleNames) return null;

    for (const name of possibleNames) {
        if (nodes[name]) return nodes[name];
    }
    return null;
};

function AvatarModel({ currentSign, isPlaying, onLoad }) {
    const { scene, nodes, materials } = useGLTF('/models/avatar_1766080971830.glb');
    const modelRef = useRef();
    const mixerRef = useRef();
    const timelineRef = useRef(null);
    const [bonesReady, setBonesReady] = useState(false);

    useEffect(() => {
        if (scene && nodes) {
            console.log('Available bones:', Object.keys(nodes).filter(k => nodes[k].isBone));

            // Set up animation mixer
            mixerRef.current = new THREE.AnimationMixer(scene);

            // Check for available bones
            const rightArm = findBone(nodes, 'RightArm');
            const leftArm = findBone(nodes, 'LeftArm');
            const head = findBone(nodes, 'Head');

            if (rightArm || leftArm || head) {
                setBonesReady(true);
                onLoad?.();
            }
        }
    }, [scene, nodes, onLoad]);

    useEffect(() => {
        if (!bonesReady || !currentSign || !nodes) return;

        playSignAnimation(currentSign.animation);
    }, [currentSign, bonesReady, nodes]);

    const playSignAnimation = (animation) => {
        if (!animation || !nodes || !mixerRef.current) return;

        // Stop any ongoing animation
        if (timelineRef.current) {
            timelineRef.current.kill();
        }

        mixerRef.current.stopAllAction();

        const timeline = gsap.timeline({
            defaults: {
                ease: "power2.inOut",
                duration: 0.8
            }
        });
        timelineRef.current = timeline;

        // Get bones
        const rightArm = findBone(nodes, 'RightArm');
        const leftArm = findBone(nodes, 'LeftArm');
        const rightForeArm = findBone(nodes, 'RightForeArm');
        const leftForeArm = findBone(nodes, 'LeftForeArm');
        const rightHand = findBone(nodes, 'RightHand');
        const leftHand = findBone(nodes, 'LeftHand');
        const head = findBone(nodes, 'Head');
        const rightShoulder = findBone(nodes, 'RightShoulder');
        const leftShoulder = findBone(nodes, 'LeftShoulder');
        const rightIndex = findBone(nodes, 'RightIndex');
        const leftIndex = findBone(nodes, 'LeftIndex');
        const rightThumb = findBone(nodes, 'RightThumb');
        const leftThumb = findBone(nodes, 'LeftThumb');

        const duration = (animation.duration || 1500) / 1000;

        // Reset bones to neutral position
        [rightArm, leftArm, rightForeArm, leftForeArm, rightHand, leftHand, head,
            rightShoulder, leftShoulder, rightIndex, leftIndex, rightThumb, leftThumb]
            .filter(bone => bone)
            .forEach(bone => {
                bone.rotation.set(0, 0, 0);
            });

        // Apply animation based on hand shape and motion
        const { handShape, motion, facialExpression } = animation;

        // Common animation sequences
        switch (handShape) {
            case 'wave':
                // HELLO - Wave hand
                if (rightArm && rightForeArm) {
                    timeline
                        .to(rightArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(-60),
                            x: THREE.MathUtils.degToRad(30),
                        }, 0)
                        .to(rightForeArm.rotation, {
                            duration: duration * 0.5,
                            z: THREE.MathUtils.degToRad(-20),
                        }, 0)
                        .to(rightArm.rotation, {
                            duration: 0.2,
                            z: THREE.MathUtils.degToRad(-70),
                            repeat: 3,
                            yoyo: true,
                        }, duration * 0.3);
                }
                break;

            case 'point':
                // YOU - Point forward
                if (rightArm && rightForeArm && rightIndex) {
                    timeline
                        .to(rightArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(-45),
                            y: THREE.MathUtils.degToRad(15),
                        }, 0)
                        .to(rightForeArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(-30),
                        }, 0)
                        .to(rightIndex.rotation, {
                            duration: duration * 0.2,
                            x: THREE.MathUtils.degToRad(-30),
                        }, duration * 0.3);
                }
                break;

            case 'index':
                // WHO/WHAT/WHERE/WHEN - Index finger gestures
                if (rightArm && rightForeArm) {
                    timeline
                        .to(rightArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(-60),
                            y: THREE.MathUtils.degToRad(30),
                        }, 0)
                        .to(rightForeArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(-60),
                        }, 0);

                    // Add circular motion for WHO
                    if (motion === 'circular_shake') {
                        timeline.to(rightArm.rotation, {
                            duration: 0.3,
                            y: `+=${THREE.MathUtils.degToRad(40)}`,
                            repeat: 2,
                            yoyo: true,
                        }, duration * 0.4);
                    }
                }
                break;

            case 'flat':
                // MY/THANK-YOU/PLEASE - Flat hand gestures
                if (rightArm && rightHand) {
                    timeline.to(rightArm.rotation, {
                        duration: duration * 0.3,
                        z: THREE.MathUtils.degToRad(-30),
                        x: THREE.MathUtils.degToRad(-45),
                    }, 0);

                    if (motion === 'chest_circle') {
                        timeline.to(rightArm.rotation, {
                            duration: 0.4,
                            x: `+=${THREE.MathUtils.degToRad(30)}`,
                            y: `+=${THREE.MathUtils.degToRad(20)}`,
                            repeat: 1,
                            yoyo: true,
                        }, duration * 0.4);
                    }
                }
                break;

            case 'thumbs-up':
                // GOOD - Thumbs up
                if (rightArm && rightForeArm && rightThumb) {
                    timeline
                        .to(rightArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(-90),
                        }, 0)
                        .to(rightForeArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(-20),
                        }, 0)
                        .to(rightThumb.rotation, {
                            duration: duration * 0.2,
                            x: THREE.MathUtils.degToRad(45),
                        }, duration * 0.3);
                }
                break;

            case 'fist':
                // YES/SORRY - Fist gestures
                if (rightArm && rightHand) {
                    timeline.to(rightArm.rotation, {
                        duration: duration * 0.3,
                        z: THREE.MathUtils.degToRad(-60),
                        x: THREE.MathUtils.degToRad(-30),
                    }, 0);

                    if (motion === 'nod') {
                        timeline.to(rightArm.rotation, {
                            duration: 0.2,
                            x: `+=${THREE.MathUtils.degToRad(20)}`,
                            repeat: 3,
                            yoyo: true,
                        }, duration * 0.4);
                    }
                }
                break;

            case 'open':
                // WHAT - Open hands
                if (leftArm && rightArm) {
                    timeline
                        .to(leftArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(60),
                            x: THREE.MathUtils.degToRad(30),
                        }, 0)
                        .to(rightArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(-60),
                            x: THREE.MathUtils.degToRad(30),
                        }, 0);
                }
                break;

            case 'H-shape':
                // NAME - H-shaped hands
                if (leftArm && rightArm && leftIndex && rightIndex) {
                    timeline
                        .to(leftArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(45),
                            x: THREE.MathUtils.degToRad(20),
                        }, 0)
                        .to(rightArm.rotation, {
                            duration: duration * 0.3,
                            z: THREE.MathUtils.degToRad(-45),
                            x: THREE.MathUtils.degToRad(20),
                        }, 0)
                        .to(leftIndex.rotation, {
                            duration: duration * 0.2,
                            x: THREE.MathUtils.degToRad(-15),
                        }, duration * 0.4)
                        .to(rightIndex.rotation, {
                            duration: duration * 0.2,
                            x: THREE.MathUtils.degToRad(-15),
                        }, duration * 0.4);
                }
                break;

            default:
                // Neutral pose with slight breathing motion
                if (rightArm && leftArm) {
                    timeline.to([rightArm.rotation, leftArm.rotation], {
                        duration: duration,
                        z: 0,
                        x: 0,
                        y: 0,
                    }, 0);
                }
                break;
        }

        // Apply facial expression through head tilt
        if (head) {
            let headTilt = 0;
            switch (facialExpression) {
                case 'question':
                    headTilt = THREE.MathUtils.degToRad(15);
                    break;
                case 'excited':
                    headTilt = THREE.MathUtils.degToRad(-10);
                    break;
                case 'sad':
                    headTilt = THREE.MathUtils.degToRad(-5);
                    break;
                default:
                    headTilt = 0;
            }

            timeline.to(head.rotation, {
                duration: duration * 0.5,
                z: headTilt,
            }, 0);
        }

        // Add idle breathing animation at the end
        timeline.to(modelRef.current.position, {
            duration: 2,
            y: "+=0.02",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        }, "+=0.5");
    };

    useFrame((state, delta) => {
        if (mixerRef.current) {
            mixerRef.current.update(delta);
        }

        // Add subtle idle animation when not playing specific sign
        if (modelRef.current && !isPlaying) {
            const time = state.clock.getElapsedTime();
            modelRef.current.position.y = Math.sin(time * 0.5) * 0.01 - 1.5;
        }
    });

    return (
        <primitive
            ref={modelRef}
            object={scene}
            scale={2}
            position={[0, -1.5, 0]}
            rotation={[0, THREE.MathUtils.degToRad(180), 0]} // Face forward
        />
    );
}

function EnhancedSignAvatar({ currentSign, isPlaying, onLoad }) {
    const [cameraPosition] = useState([0, 0.5, 3.5]);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden relative">
            <Canvas
                shadows
                style={{ width: '100%', height: '100%' }}
                camera={{ position: cameraPosition, fov: 45 }}
            >
                {/* Enhanced Lighting */}
                <ambientLight intensity={0.6} color="#ffffff" />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <directionalLight
                    position={[-5, 3, -3]}
                    intensity={0.5}
                    color="#4f46e5"
                />
                <directionalLight
                    position={[0, 5, -5]}
                    intensity={0.4}
                    color="#3b82f6"
                />

                {/* Soft fill light */}
                <hemisphereLight
                    skyColor="#ffffff"
                    groundColor="#888888"
                    intensity={0.3}
                />

                <AvatarModel
                    currentSign={currentSign}
                    isPlaying={isPlaying}
                    onLoad={onLoad}
                />

                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    minDistance={2}
                    maxDistance={6}
                    target={[0, 0.5, 0]}
                    enableDamping={true}
                    dampingFactor={0.05}
                    maxPolarAngle={Math.PI / 2}
                />

                <Environment preset="studio" />

                {/* Grid helper for positioning */}
                {process.env.NODE_ENV === 'development' && (
                    <gridHelper args={[10, 10]} />
                )}
            </Canvas>

            {/* Loading overlay */}
            {!currentSign && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-50/80 to-purple-50/80 dark:from-gray-900/80 dark:to-purple-900/20">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🤟</div>
                        <div className="text-gray-700 dark:text-gray-300 font-medium">
                            Ready to sign...
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Enter text or select a sentence
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EnhancedSignAvatar;