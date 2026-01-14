// src/components/signing/SignAvatar.jsx
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Preload the avatar model
useGLTF.preload('/models/avatar_1766080971830.glb');

function AvatarModel({ currentSign }) {
    const { scene, nodes } = useGLTF('/models/avatar_1766080971830.glb');
    const modelRef = useRef();

    useFrame(() => {
        if (!nodes || !currentSign) return;

        // Reset all rotations first
        scene.traverse((obj) => {
            if (obj.isBone) {
                obj.rotation.set(0, 0, 0);
            }
        });

        // Apply sign-specific animations
        applySignAnimation(nodes, currentSign);
    });

    return (
        <primitive
            ref={modelRef}
            object={scene}
            scale={2}
            position={[0, -1.5, 0]}
        />
    );
}

// Sign animation mappings
function applySignAnimation(nodes, signData) {
    if (!signData || !signData.animation) return;

    const { handShape, motion, facialExpression } = signData.animation;

    // Find common bone names (try multiple naming conventions)
    const leftArm = nodes['LeftArm'] || nodes['mixamorigLeftArm'] || nodes['Left_Arm'];
    const rightArm = nodes['RightArm'] || nodes['mixamorigRightArm'] || nodes['Right_Arm'];
    const leftForeArm = nodes['LeftForeArm'] || nodes['mixamorigLeftForeArm'] || nodes['Left_ForeArm'];
    const rightForeArm = nodes['RightForeArm'] || nodes['mixamorigRightForeArm'] || nodes['Right_ForeArm'];
    const leftHand = nodes['LeftHand'] || nodes['mixamorigLeftHand'] || nodes['Left_Hand'];
    const rightHand = nodes['RightHand'] || nodes['mixamorigRightHand'] || nodes['Right_Hand'];

    // Apply animations based on hand shape and motion
    switch (handShape) {
        case 'wave':
            // HELLO - Wave hand
            if (rightArm) {
                rightArm.rotation.z = THREE.MathUtils.degToRad(-90);
                rightArm.rotation.x = THREE.MathUtils.degToRad(45);
            }
            if (rightForeArm) {
                rightForeArm.rotation.z = THREE.MathUtils.degToRad(-30);
            }
            break;

        case 'point':
            // YOU - Point forward
            if (rightArm) {
                rightArm.rotation.z = THREE.MathUtils.degToRad(-45);
                rightArm.rotation.x = THREE.MathUtils.degToRad(0);
            }
            if (rightForeArm) {
                rightForeArm.rotation.z = THREE.MathUtils.degToRad(-45);
            }
            break;

        case 'index':
            // WHO/WHAT/WHERE/WHEN - Index finger gestures
            if (rightArm) {
                rightArm.rotation.z = THREE.MathUtils.degToRad(-60);
                rightArm.rotation.y = THREE.MathUtils.degToRad(30);
            }
            if (rightForeArm) {
                rightForeArm.rotation.z = THREE.MathUtils.degToRad(-60);
            }
            break;

        case 'flat':
            // MY/THANK-YOU/PLEASE - Flat hand gestures
            if (motion === 'chest-tap' || motion === 'chest-circle') {
                // MY/PLEASE - Hand on chest
                if (rightArm) {
                    rightArm.rotation.z = THREE.MathUtils.degToRad(-30);
                    rightArm.rotation.x = THREE.MathUtils.degToRad(-45);
                }
            } else if (motion === 'chin-forward') {
                // THANK-YOU - Hand from chin forward
                if (rightArm) {
                    rightArm.rotation.z = THREE.MathUtils.degToRad(-45);
                    rightArm.rotation.x = THREE.MathUtils.degToRad(-30);
                }
            }
            break;

        case 'thumbs-up':
            // GOOD - Thumbs up
            if (rightArm) {
                rightArm.rotation.z = THREE.MathUtils.degToRad(-90);
                rightArm.rotation.x = THREE.MathUtils.degToRad(0);
            }
            if (rightForeArm) {
                rightForeArm.rotation.z = THREE.MathUtils.degToRad(-20);
            }
            break;

        case 'fist':
            // YES/SORRY - Fist gestures
            if (motion === 'nod') {
                // YES - Fist nod
                if (rightArm) {
                    rightArm.rotation.z = THREE.MathUtils.degToRad(-60);
                }
            } else if (motion === 'chest-circle') {
                // SORRY - Fist on chest
                if (rightArm) {
                    rightArm.rotation.z = THREE.MathUtils.degToRad(-30);
                    rightArm.rotation.x = THREE.MathUtils.degToRad(-60);
                }
            }
            break;

        case 'open':
            // WHAT - Open hands
            if (leftArm && rightArm) {
                leftArm.rotation.z = THREE.MathUtils.degToRad(60);
                rightArm.rotation.z = THREE.MathUtils.degToRad(-60);
                leftArm.rotation.x = THREE.MathUtils.degToRad(30);
                rightArm.rotation.x = THREE.MathUtils.degToRad(30);
            }
            break;

        case 'H-shape':
            // NAME - H-shaped hands
            if (leftHand && rightHand) {
                leftArm.rotation.z = THREE.MathUtils.degToRad(45);
                rightArm.rotation.z = THREE.MathUtils.degToRad(-45);
            }
            break;

        default:
            // Neutral pose
            break;
    }
}

function SignAvatar({ currentSign }) {
    return (
        <div className="w-full h-full bg-gradient-to-b from-blue-100 to-purple-100 dark:from-gray-900 dark:to-purple-900/20 rounded-xl overflow-hidden">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                style={{ width: '100%', height: '100%' }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} />

                <AvatarModel currentSign={currentSign} />

                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={3}
                    maxDistance={8}
                    target={[0, 0, 0]}
                />

                <Environment preset="sunset" />
            </Canvas>
        </div>
    );
}

export default SignAvatar;
