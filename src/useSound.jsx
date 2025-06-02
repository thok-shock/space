import { useEffect, useRef } from "react";


export default function useSound(src, volume = 1.0) {
    const audioRef = useRef(null);
  
    useEffect(() => {
      audioRef.current = new Audio(src);
      audioRef.current.volume = volume;
    }, [src, volume]);
  
    const play = () => {
      if (audioRef.current) {
        // Rewind before playing again
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((e) => console.error("Sound play error:", e));
      }
    };
  
    return play;
  }