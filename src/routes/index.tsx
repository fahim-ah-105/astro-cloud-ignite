import { createFileRoute, redirect } from "@tanstack/react-router";

// Bangla is the default locale; the root path always resolves to /bn.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/$locale", params: { locale: "bn" } });
  },
});
