// import { useEffect, useState } from "react";
// import socket from "../socket";

// export default function useLandmarks() {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     const handler = (incoming) => {
//       setData({
//         ...incoming,
//         pose: { ...incoming.pose },
//         left_hand: { ...incoming.left_hand },
//         right_hand: { ...incoming.right_hand },
//       });
//     };

//     socket.on("landmarks", handler);
//     return () => socket.off("landmarks", handler);
//   }, []);

//   return data;
// }




// import { useEffect, useState } from "react";
// import socket from "../socket";

// export default function useLandmarks() {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     const handler = (incoming) => {
//       setData({
//         ...incoming,
//         pose: { ...incoming.pose },
//         left_hand: { ...incoming.left_hand },
//         right_hand: { ...incoming.right_hand },
//       });
//     };

//     socket.on("landmarks", handler);
//     return () => socket.off("landmarks", handler);
//   }, []);

//   return data;
// }







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
      // console.log("📍 Landmark arrived in hook");
      setLandmarks(data);
      if (data?.sign_language?.letter && data.sign_language.letter !== 'nothing') {
        console.log("📡 Sign received:", data.sign_language.letter, "Conf:", data.sign_language.confidence);
        setSign(data.sign_language);
      }
      // Update sentence if available
      if (data?.sign_language?.sentence !== undefined) {
        console.log("💬 Sentence received:", data.sign_language.sentence);
        setSentence(data.sign_language.sentence);
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
