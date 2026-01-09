const dist = (a, b) =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

const isOpen = (tip, pip, wrist) =>
  dist(tip, wrist) > dist(pip, wrist);

export function classifyAlphabet(hand) {
  if (!hand || Object.keys(hand).length < 21) return null;

  const w = hand[0];

  const thumb  = isOpen(hand[4], hand[2], w);
  const index  = isOpen(hand[8], hand[6], w);
  const middle = isOpen(hand[12], hand[10], w);
  const ring   = isOpen(hand[16], hand[14], w);
  const pinky  = isOpen(hand[20], hand[18], w);

  // ✊ A
  if (!index && !middle && !ring && !pinky && thumb)
    return "A";

  // ✋ B
  if (index && middle && ring && pinky && !thumb)
    return "B";

  // 🤏 C (approx)
  if (index && middle && ring && pinky && thumb)
    return "C";

  // ☝️ D
  if (index && !middle && !ring && !pinky)
    return "D";

  // ✊ E
  if (!index && !middle && !ring && !pinky && !thumb)
    return "E";

  return null;
}
