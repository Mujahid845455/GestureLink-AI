// distance between 2 landmarks
const dist = (a, b) =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

// finger open / closed
const isFingerOpen = (tip, pip, wrist) =>
  dist(tip, wrist) > dist(pip, wrist);

export function classifyHandGesture(hand) {
  if (!hand || Object.keys(hand).length < 21) return "NONE";

  const wrist = hand[0];

  const thumbOpen  = isFingerOpen(hand[4], hand[2], wrist);
  const indexOpen  = isFingerOpen(hand[8], hand[6], wrist);
  const middleOpen = isFingerOpen(hand[12], hand[10], wrist);
  const ringOpen   = isFingerOpen(hand[16], hand[14], wrist);
  const pinkyOpen  = isFingerOpen(hand[20], hand[18], wrist);

  // ✋ OPEN PALM
  if (indexOpen && middleOpen && ringOpen && pinkyOpen)
    return "OPEN_PALM";

  // ✊ FIST
  if (!indexOpen && !middleOpen && !ringOpen && !pinkyOpen)
    return "FIST";

  // 👍 THUMBS UP
  if (thumbOpen && !indexOpen && !middleOpen)
    return "THUMBS_UP";

  // ☝️ POINT
  if (indexOpen && !middleOpen && !ringOpen)
    return "POINT";

  return "UNKNOWN";
}
