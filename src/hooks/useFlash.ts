import { useEffect, useRef, useState } from 'react';

export function useFlash(value: number) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (prevRef.current !== value) {
      const direction = value > prevRef.current ? 'up' : 'down';
      setFlash(direction);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFlash(null), 350);
      prevRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return flash;
}
