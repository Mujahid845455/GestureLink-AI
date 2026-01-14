// src/utils/signAnimations.js
import * as THREE from 'three';

/**
 * ASL Alphabet Bone Rotations
 * Each pose contains rotation data for specific hand bones.
 */
export const ALPHABET_POSES = {
    A: {
        LeftHandThumb1: [0.2, 0.2, 0],
        LeftHandIndex1: [1.2, 0, 0],
        LeftHandMiddle1: [1.2, 0, 0],
        LeftHandRing1: [1.2, 0, 0],
        LeftHandPinky1: [1.2, 0, 0],
        RightHandThumb1: [0.2, -0.2, 0],
        RightHandIndex1: [1.2, 0, 0],
        RightHandMiddle1: [1.2, 0, 0],
        RightHandRing1: [1.2, 0, 0],
        RightHandPinky1: [1.2, 0, 0],
    },
    B: {
        LeftHandThumb1: [1.2, 0.4, 0],
        LeftHandIndex1: [0, 0, 0],
        LeftHandMiddle1: [0, 0, 0],
        LeftHandRing1: [0, 0, 0],
        LeftHandPinky1: [0, 0, 0],
        RightHandThumb1: [1.2, -0.4, 0],
        RightHandIndex1: [0, 0, 0],
        RightHandMiddle1: [0, 0, 0],
        RightHandRing1: [0, 0, 0],
        RightHandPinky1: [0, 0, 0],
    },
    C: {
        LeftHandThumb1: [0.5, 0.5, 0],
        LeftHandIndex1: [0.5, 0, 0],
        LeftHandMiddle1: [0.5, 0, 0],
        LeftHandRing1: [0.5, 0, 0],
        LeftHandPinky1: [0.5, 0, 0],
        RightHandThumb1: [0.5, -0.5, 0],
        RightHandIndex1: [0.5, 0, 0],
        RightHandMiddle1: [0.5, 0, 0],
        RightHandRing1: [0.5, 0, 0],
        RightHandPinky1: [0.5, 0, 0],
    },
    D: {
        LeftHandThumb1: [1.0, 0.4, 0],
        LeftHandIndex1: [0, 0, 0],
        LeftHandMiddle1: [1.2, 0, 0],
        LeftHandRing1: [1.2, 0, 0],
        LeftHandPinky1: [1.2, 0, 0],
        RightHandThumb1: [1.0, -0.4, 0],
        RightHandIndex1: [0, 0, 0],
        RightHandMiddle1: [1.2, 0, 0],
        RightHandRing1: [1.2, 0, 0],
        RightHandPinky1: [1.2, 0, 0],
    },
    E: {
        LeftHandThumb1: [1.2, 0.2, 0],
        LeftHandIndex1: [1.4, 0, 0],
        LeftHandMiddle1: [1.4, 0, 0],
        LeftHandRing1: [1.4, 0, 0],
        LeftHandPinky1: [1.4, 0, 0],
        RightHandThumb1: [1.2, -0.2, 0],
        RightHandIndex1: [1.4, 0, 0],
        RightHandMiddle1: [1.4, 0, 0],
        RightHandRing1: [1.4, 0, 0],
        RightHandPinky1: [1.4, 0, 0],
    },
    F: {
        LeftHandThumb1: [0.8, 0.8, 0],
        LeftHandIndex1: [1.0, 0.5, 0],
        LeftHandMiddle1: [0, 0.1, 0],
        LeftHandRing1: [0, 0, 0],
        LeftHandPinky1: [0, -0.1, 0],
        RightHandThumb1: [0.8, -0.8, 0],
        RightHandIndex1: [1.0, -0.5, 0],
        RightHandMiddle1: [0, -0.1, 0],
        RightHandRing1: [0, 0, 0],
        RightHandPinky1: [0, 0.1, 0],
    },
    G: {
        LeftHandThumb1: [0, 1.2, 0],
        LeftHandIndex1: [0, 1.5, 0],
        LeftHandMiddle1: [1.2, 0, 0],
        LeftHandRing1: [1.2, 0, 0],
        LeftHandPinky1: [1.2, 0, 0],
        RightHandThumb1: [0, -1.2, 0],
        RightHandIndex1: [0, -1.5, 0],
        RightHandMiddle1: [1.2, 0, 0],
        RightHandRing1: [1.2, 0, 0],
        RightHandPinky1: [1.2, 0, 0],
    },
    H: {
        LeftHandThumb1: [1.2, 0.5, 0],
        LeftHandIndex1: [0, 1.5, 0],
        LeftHandMiddle1: [0, 1.5, 0],
        LeftHandRing1: [1.2, 0, 0],
        LeftHandPinky1: [1.2, 0, 0],
        RightHandThumb1: [1.2, -0.5, 0],
        RightHandIndex1: [0, -1.5, 0],
        RightHandMiddle1: [0, -1.5, 0],
        RightHandRing1: [1.2, 0, 0],
        RightHandPinky1: [1.2, 0, 0],
    },
    I: {
        LeftHandThumb1: [1.2, 0.5, 0],
        LeftHandIndex1: [1.2, 0, 0],
        LeftHandMiddle1: [1.2, 0, 0],
        LeftHandRing1: [1.2, 0, 0],
        LeftHandPinky1: [0, 0, 0],
        RightHandThumb1: [1.2, -0.5, 0],
        RightHandIndex1: [1.2, 0, 0],
        RightHandMiddle1: [1.2, 0, 0],
        RightHandRing1: [1.2, 0, 0],
        RightHandPinky1: [0, 0, 0],
    },
    K: {
        LeftHandThumb1: [0, 0.4, 0],
        LeftHandIndex1: [0, 0, 0],
        LeftHandMiddle1: [0, 0, 0.2],
        LeftHandRing1: [1.2, 0, 0],
        LeftHandPinky1: [1.2, 0, 0],
        RightHandThumb1: [0, -0.4, 0],
        RightHandIndex1: [0, 0, 0],
        RightHandMiddle1: [0, 0, -0.2],
        RightHandRing1: [1.2, 0, 0],
        RightHandPinky1: [1.2, 0, 0],
    },
    L: {
        LeftHandThumb1: [0, 1.5, 0],
        LeftHandIndex1: [0, 0, 0],
        LeftHandMiddle1: [1.2, 0, 0],
        LeftHandRing1: [1.2, 0, 0],
        LeftHandPinky1: [1.2, 0, 0],
        RightHandThumb1: [0, -1.5, 0],
        RightHandIndex1: [0, 0, 0],
        RightHandMiddle1: [1.2, 0, 0],
        RightHandRing1: [1.2, 0, 0],
        RightHandPinky1: [1.2, 0, 0],
    }
};

/**
 * Smoothly interpolates bone rotations towards a target pose
 */
export const applySignPose = (nodes, letter, side, alpha = 0.1) => {
    const pose = ALPHABET_POSES[letter.toUpperCase()];
    if (!pose) return;

    Object.entries(pose).forEach(([boneName, rotation]) => {
        if (side && !boneName.startsWith(side)) return;

        const bone = nodes[`mixamorig${boneName}`] || nodes[boneName];
        if (bone) {
            bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, rotation[0], alpha);
            bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, rotation[1], alpha);
            bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, rotation[2], alpha);
        }
    });
};
