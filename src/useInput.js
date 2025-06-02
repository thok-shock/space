import { useEffect, useRef } from 'react';

export function useInput({ onMoveLeft, onMoveRight, onShoot }) {
  const keysPressed = useRef(new Set());

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current.add(e.code);

      if (e.code === 'Space') {
        onShoot?.();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onShoot]);

  // Continuous movement loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (keysPressed.current.has('ArrowLeft')) {
        onMoveLeft?.();
      }
      if (keysPressed.current.has('ArrowRight')) {
        onMoveRight?.();
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [onMoveLeft, onMoveRight]);
}