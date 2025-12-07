import { useEffect, useRef } from "react";

export const useTimeout = () => {
  const timerRef = useRef(null);

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const set = (callback, delay) => {
    clear();
    timerRef.current = setTimeout(callback, delay);
  };

  // 컴포넌트 언마운트 시 자동 정리
  useEffect(() => {
    return () => clear();
  }, []);

  return { set, clear };
};
