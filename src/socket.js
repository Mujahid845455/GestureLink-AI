// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000", {
//   transports: ["websocket"],
// });

// socket.on("connect", () => {
//   console.log("🟢 FRONTEND SOCKET CONNECTED:", socket.id);
// });

// export default socket;

import { io } from "socket.io-client";

const socket = io("http://localhost:7000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on("connect", () => {
  console.log("🟢 FRONTEND SOCKET CONNECTED:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 FRONTEND SOCKET DISCONNECTED");
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

export default socket;
