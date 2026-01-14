import { useEffect, useState } from "react";
import socketService from "../services/socketService";

export default function useSign() {
  const [sign, setSign] = useState(null);

  useEffect(() => {
    const unsub = socketService.onSign((data) => {
      if (data?.sign_language?.letter) {
        setSign({
          letter: data.sign_language.letter,
          confidence: data.sign_language.confidence || 0
        });
      }
    });

    return () => {
      unsub();
    };
  }, []);

  return sign;
}
