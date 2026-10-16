import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <div className="blog-segment min-h-[50vh]">{children}</div>;
}
