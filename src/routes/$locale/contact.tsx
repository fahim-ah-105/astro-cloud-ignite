import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { normalizeLocale, t } from "@/lib/i18n";

export const Route = createFileRoute("/$locale/contact")({
  component: ContactPage,
  head: ({ params }) => {
    const copy = t(normalizeLocale(params.locale));
    const title = `${copy.contact.title} — ${copy.brand}`;
    return {
      meta: [
        { title },
        { name: "description", content: copy.contact.description },
        { property: "og:title", content: title },
        { property: "og:description", content: copy.contact.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function ContactPage() {
  const locale = normalizeLocale(Route.useParams().locale);
  const copy = t(locale);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    message: z.string().trim().min(1).max(1000),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{copy.contact.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{copy.contact.description}</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const parsed = schema.safeParse({
            name: form.get("name"),
            email: form.get("email"),
            message: form.get("message"),
          });
          if (!parsed.success) {
            const next: Record<string, string> = {};
            for (const issue of parsed.error.issues) next[String(issue.path[0])] = copy.common.required;
            setErrors(next);
            return;
          }
          setErrors({});
          setSent(true);
          toast.success(copy.contact.sent);
        }}
      >
        <div>
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            {copy.contact.name}
          </label>
          <input
            id="name"
            name="name"
            maxLength={100}
            required
            className="focus-on-brand mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          />
          {errors["name"] ? <p className="mt-1 text-xs text-destructive">{errors["name"]}</p> : null}
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            {copy.contact.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={255}
            required
            className="focus-on-brand mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          />
          {errors["email"] ? <p className="mt-1 text-xs text-destructive">{errors["email"]}</p> : null}
        </div>

        <div>
          <label htmlFor="message" className="text-sm font-medium text-foreground">
            {copy.contact.message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            maxLength={1000}
            required
            className="focus-on-brand mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {errors["message"] ? <p className="mt-1 text-xs text-destructive">{errors["message"]}</p> : null}
        </div>

        <button
          type="submit"
          className="focus-on-brand inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {copy.contact.send}
        </button>

        {sent ? (
          <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm font-medium text-primary">
            {copy.contact.sent}
          </p>
        ) : null}
      </form>
    </div>
  );
}
