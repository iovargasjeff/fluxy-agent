import { useState, useEffect } from "react";
import { healthCheck } from "@/lib/api/client";

export function useBackendStatus() {
  const [isReady, setIsReady] = useState(false);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    const check = async () => {
      try {
        await healthCheck();
        setIsReady(true);
      } catch {
        if (retries < 10) {
          setTimeout(() => setRetries(r => r + 1), 1000);
        }
      }
    };
    check();
  }, [retries]);

  return { isReady, retries };
}
