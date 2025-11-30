import { useCallback, useState } from "react";
import { useTimeout } from "./use-timeout";

export const useTransientToast = (defaultDuration = 2000) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const { set: setTimer, clear } = useTimeout();

  const show = useCallback(
    (nextMessage, duration = defaultDuration) => {
      setMessage(nextMessage);
      setIsVisible(true);
      setTimer(() => setIsVisible(false), duration);
    },
    [defaultDuration, setTimer]
  );

  const hide = useCallback(() => {
    clear();
    setIsVisible(false);
  }, [clear]);

  return { isVisible, message, show, hide };
};
