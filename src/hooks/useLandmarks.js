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
import socket from '../socket';

export default function useLandmarks() {
  const [landmarks, setLandmarks] = useState(null);
  useEffect(() => {
    const handleLandmarks = (data) => {
      setLandmarks(data);
    };

    const handleSign = (data) => {
      console.log('Sign detected:', data);
    };

    socket.on('landmarks', handleLandmarks);
    socket.on('sign', handleSign);

    return () => {
      socket.off('landmarks', handleLandmarks);
      socket.off('sign', handleSign);
    };
  }, []);

  return landmarks;
}
