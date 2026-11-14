"use client";

// Small building blocks shared by the quote form and the manufacturer form.
import { useEffect, useId, useRef, useState } from "react";

export const inputClass =
  "mt-2 block w-full rounded-[3px] border border-edge bg-white px-3.5 py-3 text-base text-charcoal placeholder:text-soft aria-[invalid=true]:border-error";

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
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="font-normal text-soft"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-sm text-soft">
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
      <legend className="text-sm font-medium">{legend}</legend>
      {hint && <p className="mt-0.5 text-sm text-soft">{hint}</p>}
      <div className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {(Object.entries(options) as [K, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2.5">
            <input
              type="checkbox"
              className="size-4 accent-charcoal"
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

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
// How long to wait for Cloudflare's script before saying it couldn't load.
const TURNSTILE_LOAD_TIMEOUT_MS = 10_000;

// What the person is told in each state of the check. The Send button is
// disabled in every state except "done", so each of the others explains why.
const turnstileMessages = {
  loading: "Loading the security check…",
  interactive: "Tick the box above to confirm you're a person. Then you can send.",
  done: "",
  expired: "The security check timed out. Run it again to send.",
  failed: "The security check didn't work.",
  unavailable: "The security check couldn't load. An ad blocker or a weak connection can cause this.",
};
type TurnstileStatus = keyof typeof turnstileMessages;

/**
 * Cloudflare's "are you a person" check. Renders nothing if no site key is set.
 * This only decides what the browser shows; the server still verifies the token.
 */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const [status, setStatus] = useState<TurnstileStatus>("loading");
  // Counts retries. Changing it re-runs the effect below, which starts the check afresh.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!siteKey) return;
    const api = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;
    let widgetId: string | undefined;
    let cancelled = false;

    // Every state except "done" means there is no usable token.
    const update = (next: TurnstileStatus, token = "") => {
      if (cancelled) return;
      setStatus(next);
      onToken(token);
    };

    const render = () => {
      const turnstile = api();
      if (cancelled || !ref.current || !turnstile) return;
      widgetId = turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token: string) => update("done", token),
        "before-interactive-callback": () => update("interactive"),
        "expired-callback": () => update("expired"),
        "timeout-callback": () => update("expired"),
        "error-callback": () => {
          update("failed");
          return true; // tells Turnstile we've shown our own message
        },
      });
    };

    let script: HTMLScriptElement | null = null;
    let timer: number | undefined;
    const scriptFailed = () => {
      script?.remove(); // so a retry downloads it again
      update("unavailable");
    };

    if (api()) {
      render();
    } else {
      script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = TURNSTILE_SCRIPT;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      script.addEventListener("error", scriptFailed);
      timer = window.setTimeout(() => {
        if (!api()) update("unavailable");
      }, TURNSTILE_LOAD_TIMEOUT_MS);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      script?.removeEventListener("load", render);
      script?.removeEventListener("error", scriptFailed);
      if (widgetId) api()?.remove(widgetId);
    };
  }, [siteKey, onToken, attempt]);

  if (!siteKey) return null;

  const retry = () => {
    setStatus("loading");
    onToken("");
    setAttempt((n) => n + 1);
  };
  const problem = status === "expired" || status === "failed" || status === "unavailable";
  const message = turnstileMessages[status];

  return (
    <div>
      <div ref={ref} className="min-h-[65px]" />
      <div role="status" className="mt-2 space-y-1 text-sm text-soft">
        {message && <p className={problem ? "font-medium text-error" : undefined}>{message}</p>}
        {contactEmail && (status === "failed" || status === "unavailable") && (
          <p>
            If it keeps happening, email us at{" "}
            <a href={`mailto:${contactEmail}`} className="text-charcoal underline underline-offset-4">
              {contactEmail}
            </a>
            .
          </p>
        )}
      </div>
      {problem && (
        <button
          type="button"
          onClick={retry}
          className="mt-2 text-sm font-medium text-charcoal underline underline-offset-4"
        >
          Try the check again
        </button>
      )}
    </div>
  );
}

export function SubmitError({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-[3px] border border-error bg-white px-4 py-3 font-medium text-error">
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
    <div role="status" className="rounded-[3px] bg-sage p-6 sm:p-8">
      <h2 className="display text-3xl">{title}</h2>
      <p className="label mt-6">Your reference number</p>
      <p className="mt-2 text-3xl font-medium tracking-tight text-charcoal">{reference}</p>
      <div className="mt-5 max-w-[60ch] space-y-3 text-soft">{children}</div>
    </div>
  );
}

export const primaryButton =
  "rounded-[3px] bg-charcoal px-6 py-3 text-sm font-medium text-white hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButton =
  "rounded-[3px] border border-charcoal px-6 py-3 text-sm font-medium hover:bg-band disabled:opacity-60";
