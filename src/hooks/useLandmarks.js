
// hooks/useLandmarks.js
import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

export default function useLandmarks() {
  const [landmarks, setLandmarks] = useState(null);
  const [sign, setSign] = useState(null);
  const [sentence, setSentence] = useState("");

  useEffect(() => {
    // Ensure socket is connected
    if (!socketService.isConnected()) {
      const token = localStorage.getItem("access_token");
      if (token) {
        console.log("🔌 useLandmarks: Requesting socket connection...");
        socketService.connect(token);
      }
    }

    const handleLandmarks = (data) => {
      // console.log("📍 Landmark arrived in hook:", data?.timestamp);
      setLandmarks(data);

      // Update sign and sentence from the unified landmarks event
      if (data?.sign_language) {
        const sl = data.sign_language;

        // Update sign state (including 'nothing')
        if (sl.letter !== undefined) {
          // console.log("🖖 Hook Sign:", sl.letter, sl.confidence);
          setSign(sl);
        }

        // Update sentence if available
        if (sl.sentence !== undefined) {
          // console.log("💬 Hook Sentence:", sl.sentence);
          setSentence(sl.sentence);
        }
      }
    };

    const handleSign = (data) => {
      console.log('📡 Sign detected (dedicated event):', data);
      setSign(data);
    };

    const unsubLandmarks = socketService.onLandmarks(handleLandmarks);
    const unsubSign = socketService.onSign(handleSign);

    return () => {
      unsubLandmarks();
      unsubSign();
    };
  }, []);

  return { landmarks, sign, sentence };
}
