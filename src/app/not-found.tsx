import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="Page not found"
        description="The page you are looking for does not exist or may have moved."
        actions={[
          { label: "Return home", href: "/", variant: "primary" },
          {
            label: "Open checker",
            href: "/social-media-accessibility-checker",
            variant: "secondary",
          },
        ]}
      />
      <Container className="py-12 text-center text-sm text-muted">
        <p>
          Browse all tools from the{" "}
          <Link href="/#tools" className="font-semibold text-primary hover:underline">
            homepage tools section
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
