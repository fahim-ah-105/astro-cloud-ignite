import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bookmark, BookmarkCheck, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  getMyProductState,
  setVote,
  setReservation,
  cancelReservation,
  setSaved,
} from "@/lib/engagement.functions";
import { useSession } from "@/hooks/useSession";
import { t, type Locale } from "@/lib/i18n";
import { formatBdt } from "@/lib/format";
import { canReserve, canVote, type PublicState } from "@/lib/lifecycle";
import type { FlagMap } from "@/lib/catalog.functions";

interface Variant {
  id: string;
  name_bn: string;
  name_en: string;
  detail_bn: string | null;
  detail_en: string | null;
  price_bdt: number | null;
  local_stock: number;
}

export function ProductActions({
  productId,
  campaignId,
  campaignState,
  state,
  variants,
  flags,
  locale,
}: {
  productId: string;
  campaignId: string | null;
  campaignState: string | null;
  state: PublicState;
  variants: Variant[];
  flags: FlagMap;
  locale: Locale;
}) {
  const copy = t(locale);
  const { user, emailVerified, loading } = useSession();
  const queryClient = useQueryClient();

  const fetchState = useServerFn(getMyProductState);
  const voteFn = useServerFn(setVote);
  const reserveFn = useServerFn(setReservation);
  const cancelFn = useServerFn(cancelReservation);
  const savedFn = useServerFn(setSaved);

  const mine = useQuery({
    queryKey: ["my-product-state", productId, user?.id],
    queryFn: () => fetchState({ data: { productId } }),
    enabled: Boolean(user),
  });

  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [subscribe, setSubscribe] = useState(true);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["my-product-state", productId] });
  };

  const failureMessage = (reason: string) =>
    reason === "email_unverified"
      ? copy.auth.verifyRequired
      : reason === "closed"
        ? copy.product.voteClosed
        : copy.errors.loadBody;

  const voteMutation = useMutation({
    mutationFn: (voted: boolean) => voteFn({ data: { campaignId: campaignId!, voted } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(failureMessage(result.reason));
        return;
      }
      toast.success(result.voted ? copy.product.voted : copy.common.saved);
      invalidate();
    },
    onError: () => toast.error(copy.errors.loadBody),
  });

  const reserveMutation = useMutation({
    mutationFn: () =>
      reserveFn({
        data: {
          campaignId: campaignId!,
          variantId,
          quantity,
          subscribe,
          acknowledged: true as const,
        },
      }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(failureMessage(result.reason));
        return;
      }
      toast.success(copy.product.reserveDone);
      invalidate();
    },
    onError: () => toast.error(copy.errors.loadBody),
  });

  const cancelMutation = useMutation({
    mutationFn: (reservationId: string) => cancelFn({ data: { reservationId } }),
    onSuccess: () => {
      toast.success(copy.common.saved);
      invalidate();
    },
  });

  const saveMutation = useMutation({
    mutationFn: (next: boolean) => savedFn({ data: { productId, saved: next } }),
    onSuccess: invalidate,
  });

  const votingAllowed = canVote(state, campaignState as never, flags.interestEnabled) && campaignId;
  const reservingAllowed =
    canReserve(state, campaignState as never, flags.reservationsEnabled) && campaignId && variants.length > 0;

  const signInPrompt = (
    <Link
      to="/$locale/auth"
      params={{ locale }}
      className="focus-on-brand inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
    >
      {copy.product.voteSignIn}
    </Link>
  );

  const hasVoted = mine.data?.hasVoted ?? false;
  const myReservations = mine.data?.reservations ?? [];
  const isSaved = mine.data?.saved ?? false;

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface p-5">
      <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm font-medium text-primary">
        {copy.product.noPaymentNote}
      </p>

      {/* Vote */}
      {votingAllowed ? (
        <div className="space-y-2">
          {!user && !loading ? (
            signInPrompt
          ) : (
            <>
              <button
                type="button"
                disabled={voteMutation.isPending || mine.isLoading}
                onClick={() => voteMutation.mutate(!hasVoted)}
                aria-pressed={hasVoted}
                className={`focus-on-brand inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  hasVoted
                    ? "border border-primary bg-primary-soft text-primary"
                    : "bg-primary text-primary-foreground hover:bg-primary-hover"
                }`}
              >
                {voteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : hasVoted ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : null}
                {hasVoted ? copy.product.voteWithdraw : copy.product.voteCta}
              </button>
              {hasVoted ? <p className="text-xs text-muted-foreground">{copy.product.voted}</p> : null}
              {user && !emailVerified ? (
                <p className="text-xs font-medium text-warm">{copy.product.voteVerify}</p>
              ) : null}
            </>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{copy.stateNotes[state]}</p>
      )}

      {/* Free reservation */}
      {reservingAllowed ? (
        <section className="space-y-3 border-t border-border pt-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">{copy.product.reserveTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.product.reserveHelp}</p>
          </div>

          {user ? (
            <>
              <div>
                <label htmlFor="variant" className="text-xs font-medium text-muted-foreground">
                  {copy.product.variantTitle}
                </label>
                <select
                  id="variant"
                  value={variantId}
                  onChange={(event) => setVariantId(event.target.value)}
                  className="focus-on-brand mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                >
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {(locale === "bn" ? variant.name_bn : variant.name_en) +
                        (variant.price_bdt ? ` — ${formatBdt(Number(variant.price_bdt), locale)}` : "")}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">{copy.product.variantHelp}</p>
              </div>

              <div>
                <label htmlFor="quantity" className="text-xs font-medium text-muted-foreground">
                  {copy.product.reserveQuantity}
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={3}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.min(3, Math.max(1, Number(event.target.value) || 1)))}
                  className="focus-on-brand mt-1 h-11 w-24 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">{copy.product.reserveMax}</p>
              </div>

              <label className="flex items-start gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="focus-on-brand mt-1 h-4 w-4 rounded border-input"
                />
                <span>{copy.product.reserveAck}</span>
              </label>

              <label className="flex items-start gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={subscribe}
                  onChange={(event) => setSubscribe(event.target.checked)}
                  className="focus-on-brand mt-1 h-4 w-4 rounded border-input"
                />
                <span>{copy.product.reserveSubscribe}</span>
              </label>

              <button
                type="button"
                disabled={!acknowledged || reserveMutation.isPending}
                onClick={() => reserveMutation.mutate()}
                className="focus-on-brand inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary bg-background px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft disabled:opacity-50"
              >
                {reserveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                {copy.product.reserveCta}
              </button>

              {myReservations.length ? (
                <ul className="space-y-2">
                  {myReservations.map((reservation) => {
                    const variant = variants.find((v) => v.id === reservation.variant_id);
                    return (
                      <li
                        key={reservation.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2 text-sm"
                      >
                        <span className="text-foreground">
                          {variant ? (locale === "bn" ? variant.name_bn : variant.name_en) : ""} ×{" "}
                          {reservation.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => cancelMutation.mutate(reservation.id)}
                          className="focus-on-brand min-h-11 rounded-lg px-2 text-sm font-medium text-destructive hover:underline"
                        >
                          {copy.product.reserveCancel}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </>
          ) : (
            signInPrompt
          )}
        </section>
      ) : null}

      {/* Save */}
      {user ? (
        <button
          type="button"
          onClick={() => saveMutation.mutate(!isSaved)}
          aria-pressed={isSaved}
          className="focus-on-brand inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          {isSaved ? (
            <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden="true" />
          )}
          {isSaved ? copy.product.savedCta : copy.product.saveCta}
        </button>
      ) : null}

      {!flags.ordersEnabled ? (
        <p className="border-t border-border pt-4 text-xs text-muted-foreground">
          {copy.commerce.disabledBody}
        </p>
      ) : null}
    </div>
  );
}
