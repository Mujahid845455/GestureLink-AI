import { useEffect, useState } from "react";
import socket from "../socket";

export default function useSign() {
  const [sign, setSign] = useState(null);

  useEffect(() => {
    socket.on("sign", (data) => {
      if (data?.sign_language?.letter) {
      setSign({
        letter: data.sign_language.letter,
        confidence: data.sign_language.confidence || 0
      });
      }
    });

    return () => {
      socket.off("sign");
    };
  }, []);

  return sign;
}
