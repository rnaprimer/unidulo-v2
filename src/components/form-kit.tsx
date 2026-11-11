"use client";

// Small building blocks shared by the quote form and the manufacturer form.
import { useEffect, useId, useRef } from "react";

export const inputClass =
  "mt-1.5 block w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-base text-ink placeholder:text-muted/70 aria-[invalid=true]:border-error";

export function Field({
  label,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
}) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={id} className="font-medium">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy || undefined })}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckboxGroup<K extends string>({
  legend,
  hint,
  error,
  options,
  selected,
  onChange,
}: {
  legend: string;
  hint?: string;
  error?: string;
  options: Record<K, string>;
  selected: K[];
  onChange: (next: K[]) => void;
}) {
  return (
    <fieldset>
      <legend className="font-medium">{legend}</legend>
      {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      <div className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {(Object.entries(options) as [K, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2.5">
            <input
              type="checkbox"
              className="size-4 accent-fold"
              checked={selected.includes(key)}
              onChange={(e) =>
                onChange(e.target.checked ? [...selected, key] : selected.filter((k) => k !== key))
              }
            />
            {label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm font-medium text-error">{error}</p>}
    </fieldset>
  );
}

/** Hidden field that people never see or fill in. Bots usually do. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

/** Cloudflare's "are you a person" check. Renders nothing if no site key is set. */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    const api = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;
    let widgetId: string | undefined;
    let cancelled = false;

    const render = () => {
      const turnstile = api();
      if (cancelled || !ref.current || !turnstile) return;
      widgetId = turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };

    if (api()) {
      render();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      if (widgetId) api()?.remove(widgetId);
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} className="min-h-[65px]" />;
}

export function SubmitError({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-sm border border-error bg-surface px-4 py-3 font-medium text-error">
      {message}
    </p>
  );
}

export function Received({
  title,
  reference,
  children,
}: {
  title: string;
  reference: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" className="rounded-sm border border-line bg-surface p-6 sm:p-8">
      <h2 className="display text-2xl">{title}</h2>
      <p className="mt-4 text-muted">Your reference number</p>
      <p className="display mt-1 text-3xl text-fold">{reference}</p>
      <div className="mt-5 max-w-[60ch] space-y-3 text-muted">{children}</div>
    </div>
  );
}

export const primaryButton =
  "rounded-sm bg-fold px-5 py-3 font-medium text-white hover:bg-fold-dark disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButton =
  "rounded-sm border border-ink px-5 py-3 font-medium hover:bg-surface disabled:opacity-60";
