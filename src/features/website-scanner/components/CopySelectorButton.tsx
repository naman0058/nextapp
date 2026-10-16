"use client";

import { useState } from "react";

type Props = {
  selector: string;
};

export function CopySelectorButton({ selector }: Props) {
  const [status, setStatus] = useState<string | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(selector);
      setStatus("Copied selector");
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus("Copy failed");
    }
  }

  return (
    <div className="mt-2">
      <pre className="max-w-full overflow-x-auto rounded bg-background p-2 text-xs">
        <code>{selector}</code>
      </pre>
      <button
        type="button"
        onClick={() => void copy()}
        className="mt-1 rounded border border-border px-2 py-1 text-xs font-medium"
      >
        Copy selector
      </button>
      {status && (
        <span className="ml-2 text-xs text-muted" role="status">
          {status}
        </span>
      )}
    </div>
  );
}
