import Papa from "papaparse";
import { BATCH_CSV_HEADERS } from "@/features/batch/constants/batchCsvHeaders";

const EXAMPLE_ROWS = [
  {
    id: "post-001",
    platform: "instagram",
    caption: "Fall enrollment is now open! #FallEnrollment",
    alt_text: "",
    image_filename: "fall.jpg",
    content_name: "Fall Enrollment",
    client: "Demo Organization",
    campaign: "Fall Campaign",
    notes: "",
  },
  {
    id: "post-002",
    platform: "linkedin",
    caption: "Join our accessibility workshop. #Accessibility",
    alt_text: "",
    image_filename: "workshop.png",
    content_name: "Accessibility Workshop",
    client: "Demo Organization",
    campaign: "October Events",
    notes: "",
  },
];

export function downloadBatchCsvTemplate(): void {
  const csv = Papa.unparse({
    fields: [...BATCH_CSV_HEADERS],
    data: EXAMPLE_ROWS.map((r) =>
      BATCH_CSV_HEADERS.map((h) => String(r[h as keyof typeof r] ?? "")),
    ),
  });
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "batch-accessibility-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
