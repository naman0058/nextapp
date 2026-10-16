"use client";

import { useCallback, useState } from "react";

export function useDeveloperTicketClipboard() {
  const [message, setMessage] = useState<string | null>(null);

  const copyText = useCallback(async (text: string, successLabel: string) => {
    setMessage(null);
    try {
      await navigator.clipboard.writeText(text);
      setMessage(successLabel);
      return true;
    } catch {
      setMessage("Could not copy. Select the text manually or download the file.");
      return false;
    }
  }, []);

  const clearMessage = useCallback(() => setMessage(null), []);

  return { message, copyText, clearMessage };
}
