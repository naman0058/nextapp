import Link from "next/link";
import { getRelatedResourcesForPath } from "@/lib/seo/route-registry";

type Props = { path: string };

export function ToolRelatedResources({ path }: Props) {
  const links = getRelatedResourcesForPath(path);
  if (links.length === 0) return null;
  return (
    <nav aria-labelledby="tool-related-resources" className="rounded-xl border border-border bg-card p-5">
      <h2 id="tool-related-resources" className="text-sm font-semibold">
        Related resources
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href} className="list-none">
            <Link href={link.href} className="font-medium text-primary hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
