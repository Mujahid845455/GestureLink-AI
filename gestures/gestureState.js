let lastGesture = "NONE";
let stableCount = 0;
const STABLE_FRAMES = 6;

export function getStableGesture(current) {
  if (current === lastGesture) {
    stableCount++;
  } else {
    stableCount = 0;
    lastGesture = current;
  }

  if (stableCount >= STABLE_FRAMES) {
    return current;
  }
  return null;
}
