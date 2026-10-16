"use client";

import { useState } from "react";

type Props = { code: string; label?: string };

export function CopyCodeBlock({ code, label = "Copy" }: Props) {
  const [status, setStatus] = useState<string | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied");
    } catch {
      setStatus("Could not copy");
    }
    setTimeout(() => setStatus(null), 2000);
  }

  return (
    <div className="mt-2">
      <pre className="max-w-full overflow-x-auto rounded border border-border bg-background p-3 text-xs">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={() => void copy()}
        className="mt-2 rounded border border-border px-2 py-1 text-xs font-medium"
      >
        {label}
      </button>
      {status && (
        <span className="ml-2 text-xs text-muted" role="status">
          {status}
        </span>
      )}
    </div>
  );
}
