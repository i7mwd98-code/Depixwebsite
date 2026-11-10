"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { placeOrder, type CheckoutResult } from "@/lib/actions/checkout";
import { getProductById, getVariant } from "@/lib/catalog";
import { slots as allSlots, zones } from "@/lib/data/delivery";
import { availableDays, dubaiDate } from "@/lib/delivery";
import { formatMoney } from "@/lib/money";
import { computeTotals, discountFor } from "@/lib/pricing";
import { useCart } from "./CartProvider";

type Confirmed = Extract<CheckoutResult, { ok: true }>["order"];

const PHONE = /^(?:\+971|00971|971|0)?5\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const tc = useTranslations("confirmation");
  const locale = useLocale() as Locale;
  const { lines, ready, clear } = useCart();
  const [pending, startTransition] = useTransition();

  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
  const [zoneId, setZoneId] = useState("");
  const [date, setDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [form, setForm] = useState({
    recipientName: "", recipientPhone: "", address: "", notes: "",
    cardMessage: "", senderName: "", senderEmail: "", senderPhone: "",
  });
  const [anonymous, setAnonymous] = useState(false);
  const [acceptSubstitution, setAcceptSubstitution] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  // The clock is read after mount so server and browser render the same HTML.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  const activeZones = zones.filter((z) => z.active);
  const effectiveZone = method === "pickup" ? null : zoneId || undefined;
  const prepHours = Math.max(0, ...lines.map((l) => getProductById(l.productId)?.prepHours ?? 0));

  const days = useMemo(
    () => (now && effectiveZone !== undefined ? availableDays(effectiveZone, prepHours, now) : []),
    [now, effectiveZone, prepHours],
  );
  const day = days.find((d) => d.date === date) ?? days[0];
  const slot = day?.slots.find((s) => s.id === slotId) ?? day?.slots[0];

  const totals = computeTotals(lines, effectiveZone ?? null, discountCode || undefined);
  const hasFlowers = lines.some((l) => getProductById(l.productId)?.category === "flowers");
  const today = now ? dubaiDate(now) : "";

  const clearError = (...keys: string[]) =>
    setErrors((current) =>
      keys.some((k) => k in current)
        ? Object.fromEntries(Object.entries(current).filter(([k]) => !keys.includes(k)))
        : current,
    );

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    clearError(key);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const need = (key: keyof typeof form) => {
      if (!form[key].trim()) next[key] = t("errors.required");
    };
    need("recipientName");
    need("senderName");
    const clean = (v: string) => v.replace(/[\s()-]/g, "");
    if (!PHONE.test(clean(form.recipientPhone))) next.recipientPhone = t("errors.phone");
    if (!PHONE.test(clean(form.senderPhone))) next.senderPhone = t("errors.phone");
    if (!EMAIL.test(form.senderEmail.trim())) next.senderEmail = t("errors.email");
    if (method === "delivery") {
      if (!zoneId) next.zoneId = t("errors.required");
      need("address");
    }
    if (!day || !slot) next.slot = t("errors.slot");
    return next;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const found = validate();
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    startTransition(async () => {
      const result = await placeOrder({
        lines,
        method,
        zoneId: method === "delivery" ? zoneId : null,
        ...form,
        date: day!.date,
        slotId: slot!.id,
        anonymous,
        acceptSubstitution,
        discountCode,
      });
      if (result.ok) {
        setConfirmed(result.order);
        clear();
        window.scrollTo({ top: 0 });
      } else if (result.error === "slot") {
        setNow(new Date());
        setErrors({ slot: t("errors.slot") });
      } else {
        setFormError(t(result.error === "empty" ? "errors.empty" : "errors.generic"));
      }
    });
  };

  if (confirmed) {
    const slotInfo = allSlots.find((s) => s.id === confirmed.slotId);
    return (
      <div className="card mx-auto max-w-xl p-8 text-center" role="status">
        <h2 className="text-2xl font-semibold text-forest sm:text-3xl">{tc("title")}</h2>
        <p className="mt-2 text-muted">{tc("text")}</p>
        <dl className="mt-6 space-y-3 rounded-xl bg-sand p-5 text-start text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{tc("number")}</dt>
            <dd className="font-semibold" dir="ltr">{confirmed.number}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{tc("when")}</dt>
            <dd className="font-semibold">
              {formatDate(confirmed.date, locale)}{slotInfo ? `${locale === "ar" ? "،" : ","} ${slotInfo.label[locale]}` : ""}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{tc("total")}</dt>
            <dd className="font-semibold">{formatMoney(confirmed.totals.total, locale)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">{t("paymentNote")}</p>
        <Link href="/shop" className="btn btn-primary mt-6">{tc("back")}</Link>
      </div>
    );
  }

  if (!ready) return <div className="h-40" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-muted">{t("errors.empty")}</p>
        <Link href="/shop" className="btn btn-primary mt-5">{tc("back")}</Link>
      </div>
    );
  }

  const input = (key: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="label">{label}</span>
      <input
        id={`f-${key}`}
        className="field"
        value={form[key]}
        onChange={update(key)}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `e-${key}` : undefined}
        {...props}
      />
      {errors[key] && <span id={`e-${key}`} className="mt-1 block text-sm text-danger">{errors[key]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 md:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="text-xl font-semibold">{t("method")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(["delivery", "pickup"] as const).map((m) => (
              <label key={m} className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-forest ${method === m ? "border-forest bg-forest text-white" : "border-line bg-white hover:border-forest"}`}>
                <input type="radio" name="method" className="sr-only" checked={method === m} onChange={() => { setMethod(m); clearError("slot", "zoneId", "address"); }} />
                {t(m)}
              </label>
            ))}
          </div>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="text-xl font-semibold">{t("recipient")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {input("recipientName", t("recipientName"), { autoComplete: "off" })}
            {input("recipientPhone", t("recipientPhone"), { type: "tel", inputMode: "tel", dir: "ltr", placeholder: "05X XXX XXXX", autoComplete: "off" })}
          </div>
          {method === "delivery" && (
            <>
              <label className="block">
                <span className="label">{t("area")}</span>
                <select
                  id="f-zoneId"
                  className="field"
                  value={zoneId}
                  onChange={(e) => { setZoneId(e.target.value); clearError("zoneId", "slot"); }}
                  aria-invalid={errors.zoneId ? true : undefined}
                >
                  <option value="">{t("chooseArea")}</option>
                  {activeZones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name[locale]} · {formatMoney(z.fee, locale)}</option>
                  ))}
                </select>
                {errors.zoneId && <span className="mt-1 block text-sm text-danger">{errors.zoneId}</span>}
              </label>
              {input("address", t("address"), { placeholder: t("addressHint"), autoComplete: "off" })}
              {input("notes", t("notes"), { autoComplete: "off" })}
            </>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-xl font-semibold">{t("when")}</h2>
          {days.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t("noDates")}</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">{t("date")}</span>
                <select className="field" value={day?.date ?? ""} onChange={(e) => { setDate(e.target.value); clearError("slot"); }}>
                  {days.map((d) => (
                    <option key={d.date} value={d.date}>
                      {d.date === today ? `${t("today")}${locale === "ar" ? "،" : ","} ` : ""}{formatDate(d.date, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">{t("slot")}</span>
                <select id="f-slot" className="field" value={slot?.id ?? ""} onChange={(e) => { setSlotId(e.target.value); clearError("slot"); }}>
                  {day?.slots.map((s) => (
                    <option key={s.id} value={s.id}>{s.label[locale]} ({s.start} – {s.end})</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {errors.slot && <p className="mt-2 text-sm text-danger" role="alert">{errors.slot}</p>}
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="text-xl font-semibold">{t("card")}</h2>
          <label className="block">
            <span className="label">{t("cardMessage")}</span>
            <textarea className="field min-h-24" maxLength={300} value={form.cardMessage} onChange={update("cardMessage")} />
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-[var(--color-forest)]" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            {t("anonymous")}
          </label>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="text-xl font-semibold">{t("sender")}</h2>
          {input("senderName", t("senderName"), { autoComplete: "name" })}
          <div className="grid gap-4 sm:grid-cols-2">
            {input("senderEmail", t("senderEmail"), { type: "email", inputMode: "email", dir: "ltr", autoComplete: "email" })}
            {input("senderPhone", t("senderPhone"), { type: "tel", inputMode: "tel", dir: "ltr", placeholder: "05X XXX XXXX", autoComplete: "tel" })}
          </div>
          {hasFlowers && (
            <label className="flex min-h-11 items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--color-forest)]" checked={acceptSubstitution} onChange={(e) => setAcceptSubstitution(e.target.checked)} />
              {t("substitution")}
            </label>
          )}
        </section>
      </div>

      <aside className="card h-fit p-5 md:sticky md:top-32">
        <h2 className="text-xl font-semibold">{t("summary")}</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((line) => {
            const product = getProductById(line.productId);
            const variant = product && getVariant(product, line.variantId);
            if (!product || !variant) return null;
            return (
              <li key={`${line.productId}-${line.variantId}-${line.inscription ?? ""}`} className="flex justify-between gap-3">
                <span className="min-w-0">
                  {line.quantity} × {product.name[locale]}
                  {product.variants.length > 1 && <span className="text-muted"> ({variant.name[locale]})</span>}
                </span>
                <span className="shrink-0">{formatMoney(variant.price * line.quantity, locale)}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex gap-2">
          <input className="field" placeholder={t("discount")} aria-label={t("discount")} value={codeInput} onChange={(e) => setCodeInput(e.target.value)} dir="ltr" />
          <button type="button" className="btn btn-outline shrink-0 px-4" onClick={() => setDiscountCode(discountFor(codeInput, totals.subtotal) > 0 ? codeInput.trim() : "")}>
            {t("apply")}
          </button>
        </div>

        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt>{t("subtotal")}</dt><dd>{formatMoney(totals.subtotal, locale)}</dd></div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-forest"><dt>{t("discountLine")}</dt><dd>−{formatMoney(totals.discount, locale)}</dd></div>
          )}
          <div className="flex justify-between">
            <dt>{t("deliveryFee")}</dt>
            <dd>{effectiveZone === undefined ? "—" : totals.deliveryFee === 0 ? t("free") : formatMoney(totals.deliveryFee, locale)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
            <dt>{t("total")}</dt><dd>{formatMoney(totals.total, locale)}</dd>
          </div>
        </dl>
        <p className="mt-1 text-xs text-muted">{t("vat", { amount: formatMoney(totals.vatIncluded, locale) })}</p>

        {formError && <p className="mt-3 text-sm text-danger" role="alert">{formError}</p>}
        <button type="submit" className="btn btn-primary mt-5 w-full" disabled={pending}>
          {pending ? t("placing") : t("place")}
        </button>
        <p className="mt-3 text-xs text-muted">{t("paymentNote")}</p>
      </aside>
    </form>
  );
}
