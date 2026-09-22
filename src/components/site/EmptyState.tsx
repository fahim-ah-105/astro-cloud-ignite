import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {body ? <p className="mx-auto mt-2 max-w-prose text-sm text-muted-foreground">{body}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
        {description ? <p className="mt-1 max-w-prose text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
