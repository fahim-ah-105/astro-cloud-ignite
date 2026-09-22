import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/useSession";
import { normalizeLocale, t } from "@/lib/i18n";

export const Route = createFileRoute("/$locale/auth")({
  component: AuthPage,
  head: ({ params }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.auth.title} — ${copy.brand}`;
    return {
      meta: [
        { title },
        { name: "description", content: copy.auth.subtitle },
        { property: "og:title", content: title },
        { property: "og:description", content: copy.auth.subtitle },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);
  const navigate = useNavigate();
  const { user } = useSession();
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/$locale/account", params: { locale }, replace: true });
  }, [user, navigate, locale]);

  const schema = z.object({
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(72),
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const displayName = String(form.get("displayName") ?? "").trim();

    setBusy(true);
    try {
      if (mode === "forgot") {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/${locale}/reset-password`,
        });
        setNotice(copy.auth.resetSent);
        return;
      }

      const parsed = schema.safeParse({ email, password: form.get("password") });
      if (!parsed.success) {
        toast.error(copy.errors.loadBody);
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/${locale}`,
            data: { display_name: displayName || null },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        setNotice(copy.auth.checkEmail);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      navigate({ to: "/$locale/account", params: { locale } });
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result.error) {
      toast.error(copy.errors.loadBody);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/$locale/account", params: { locale } });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{copy.auth.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{copy.auth.subtitle}</p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="focus-on-brand mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-60"
      >
        {copy.auth.google}
      </button>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{copy.auth.email}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <div>
            <label htmlFor="displayName" className="text-sm font-medium text-foreground">
              {copy.auth.displayName}
            </label>
            <input
              id="displayName"
              name="displayName"
              maxLength={80}
              className="focus-on-brand mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            {copy.auth.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="focus-on-brand mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          />
        </div>

        {mode !== "forgot" ? (
          <div>
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              {copy.auth.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              className="focus-on-brand mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="focus-on-brand inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {mode === "signup" ? copy.auth.signUp : mode === "forgot" ? copy.auth.reset : copy.auth.signIn}
        </button>
      </form>

      {notice ? (
        <p className="mt-4 rounded-xl bg-primary-soft px-4 py-3 text-sm font-medium text-primary">{notice}</p>
      ) : null}

      <div className="mt-6 space-y-2 text-sm">
        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="focus-on-brand block min-h-11 text-primary hover:underline"
        >
          {mode === "signup" ? copy.auth.toSignIn : copy.auth.toSignUp}
        </button>
        {mode !== "forgot" ? (
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className="focus-on-brand block min-h-11 text-muted-foreground hover:text-primary"
          >
            {copy.auth.forgot}
          </button>
        ) : null}
      </div>
    </div>
  );
}
