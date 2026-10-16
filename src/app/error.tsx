"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-3xl font-bold text-foreground">Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        We could not complete your request. You can try again, or return to the
        homepage.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button type="button" variant="primary" onClick={() => reset()}>
          Try again
        </Button>
        <Button href="/" variant="secondary">
          Return home
        </Button>
      </div>
    </Container>
  );
}
