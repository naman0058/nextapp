"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { takeBatchCheckerHandoff } from "@/features/batch/utils/handoff/batchToCheckerHandoff";
import type { CheckerAction } from "@/features/accessibility/components/checker/checkerReducer";

type Props = {
  dispatch: React.Dispatch<CheckerAction>;
};

export function AccessibilityCheckerHandoff({ dispatch }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handoffId = searchParams.get("handoff");
    if (!handoffId) return;
    const payload = takeBatchCheckerHandoff(handoffId);
    if (!payload) return;
    const previewUrl = URL.createObjectURL(payload.file);
    dispatch({
      type: "SET_IMAGE",
      file: payload.file,
      fileName: payload.file.name,
      previewUrl,
    });
    dispatch({ type: "SET_PLATFORM", platform: payload.platform });
    router.replace(window.location.pathname);
  }, [searchParams, router, dispatch]);

  return null;
}
