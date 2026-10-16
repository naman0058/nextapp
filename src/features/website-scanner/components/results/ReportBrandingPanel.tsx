"use client";

import { MAX_REPORT_LOGO_SIZE_BYTES } from "@/features/website-scanner/constants/scanLimits";
import { useWebsiteScanSession } from "@/features/website-scanner/context/WebsiteScanProvider";

export function ReportBrandingPanel() {
  const { state, dispatch } = useWebsiteScanSession();
  const b = state.reportBranding;

  function onLogo(file: File | null) {
    if (!file) return;
    if (file.size > MAX_REPORT_LOGO_SIZE_BYTES) {
      alert("Logo must be 1 MB or smaller.");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      alert("Use PNG, JPEG, or WebP.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({
        type: "SET_REPORT_BRANDING",
        branding: { logoDataUrl: String(reader.result) },
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <fieldset className="rounded-lg border border-border p-4 text-sm">
      <legend className="px-1 font-semibold">Client branding (local only)</legend>
      <p className="text-xs text-muted">
        Branding applies to exports on this device only and is not sent to our servers or AI.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          Prepared for
          <input
            className="mt-1 w-full rounded border border-border px-2 py-1"
            value={b.preparedFor}
            onChange={(e) =>
              dispatch({
                type: "SET_REPORT_BRANDING",
                branding: { preparedFor: e.target.value },
              })
            }
          />
        </label>
        <label className="block">
          Organization / client
          <input
            className="mt-1 w-full rounded border border-border px-2 py-1"
            value={b.clientOrganization}
            onChange={(e) =>
              dispatch({
                type: "SET_REPORT_BRANDING",
                branding: { clientOrganization: e.target.value },
              })
            }
          />
        </label>
        <label className="block">
          Project name
          <input
            className="mt-1 w-full rounded border border-border px-2 py-1"
            value={b.projectName}
            onChange={(e) =>
              dispatch({
                type: "SET_REPORT_BRANDING",
                branding: { projectName: e.target.value },
              })
            }
          />
        </label>
        <label className="block">
          Accent color
          <input
            type="color"
            className="mt-1 h-9 w-full"
            value={b.accentColor}
            onChange={(e) =>
              dispatch({
                type: "SET_REPORT_BRANDING",
                branding: { accentColor: e.target.value },
              })
            }
          />
        </label>
      </div>
      <label className="mt-3 block">
        Logo (PNG/JPEG/WebP, max 1 MB)
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="mt-1 block text-sm"
          onChange={(e) => onLogo(e.target.files?.[0] ?? null)}
        />
      </label>
      <label className="mt-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={state.exportPreferences.includeQueryStringsInExports}
          onChange={(e) =>
            dispatch({
              type: "SET_EXPORT_PREFERENCES",
              prefs: { includeQueryStringsInExports: e.target.checked },
            })
          }
        />
        Include URL query strings in exports (may expose tokens)
      </label>
    </fieldset>
  );
}
