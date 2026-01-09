import * as THREE from "three";

/**
 * STABLE 2-bone IK solver - NO FLUCTUATION
 */
export function solveTwoBoneIK({
  root,
  mid,
  end,
  target,
  pole = null,
}) {
  if (!root || !mid || !end) return false;

  try {
    // Get world positions
    const rootPos = root.getWorldPosition(new THREE.Vector3());
    const midPos = mid.getWorldPosition(new THREE.Vector3());
    const endPos = end.getWorldPosition(new THREE.Vector3());
    const targetPos = target.clone();

    // Bone lengths
    const a = rootPos.distanceTo(midPos);
    const b = midPos.distanceTo(endPos);
    const c = rootPos.distanceTo(targetPos);

    // === CRITICAL: Clamp distance to valid range ===
    const minDist = Math.abs(a - b) + 0.0001;
    const maxDist = a + b - 0.0001;

    if (c < minDist || c > maxDist) {
      // Target unreachable - lerp towards it instead
      const reachableTarget = rootPos.clone()
        .add(targetPos.clone().sub(rootPos).normalize().multiplyScalar(maxDist * 0.95));
      return solveTwoBoneIK({
        root,
        mid,
        end,
        target: reachableTarget,
        pole,
      });
    }

    const clampedC = THREE.MathUtils.clamp(c, minDist, maxDist);

    // Law of Cosines
    const cosA = (a * a + clampedC * clampedC - b * b) / (2 * a * clampedC);
    const cosB = (a * a + b * b - clampedC * clampedC) / (2 * a * b);

    const angleA = Math.acos(THREE.MathUtils.clamp(cosA, -1, 1));
    const angleB = Math.acos(THREE.MathUtils.clamp(cosB, -1, 1));

    // === Root bone rotation ===
    const toTarget = targetPos.clone().sub(rootPos);
    const toMid = midPos.clone().sub(rootPos);

    if (toTarget.length() > 0.001 && toMid.length() > 0.001) {
      toTarget.normalize();
      toMid.normalize();

      const rotAxis = toMid.clone().cross(toTarget);

      if (rotAxis.length() > 0.001) {
        const rotAngle = Math.acos(THREE.MathUtils.clamp(toMid.dot(toTarget), -1, 1));

        // IMPORTANT: Apply in parent local space
        const parentQuat = root.parent.getWorldQuaternion(new THREE.Quaternion());
        const localQuat = new THREE.Quaternion().setFromAxisAngle(
          rotAxis.normalize(),
          rotAngle * 0.9  // 90% to prevent overshoot
        );

        root.quaternion.copy(parentQuat.invert().multiply(localQuat));
      } else {
        // Already aligned - maintain current rotation
        root.quaternion.slerp(new THREE.Quaternion(), 0.1);
      }
    }

    // === Mid bone rotation (CRITICAL) ===
    // Clamp elbow angle to realistic range
    const clampedAngleB = THREE.MathUtils.clamp(angleB, 0.1, Math.PI - 0.1);
    mid.rotation.x = Math.PI - clampedAngleB;

    // === Pole vector correction (smooth) ===
    if (pole && pole.length() > 0.001) {
      const poleDir = pole.clone().sub(rootPos).normalize();
      const upDir = toTarget.clone().cross(poleDir).normalize();

      if (upDir.length() > 0.001) {
        const newZ = toTarget.clone().cross(upDir).normalize();
        const midToEnd = endPos.clone().sub(midPos).normalize();

        // Smooth pole blending
        const poleBend = midToEnd.clone().cross(newZ);
        if (poleBend.length() > 0.001) {
          const poleAngle = Math.atan2(poleBend.length(), midToEnd.dot(newZ));
          mid.rotateOnWorldAxis(toTarget, poleAngle * 0.15);  // Very conservative
        }
      }
    }

    return true;
  } catch (e) {
    console.warn("IK Error:", e);
    return false;
  }
}
