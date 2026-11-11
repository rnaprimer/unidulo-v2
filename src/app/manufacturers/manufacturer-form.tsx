"use client";

import { useRef, useState, useTransition } from "react";
import { submitManufacturerApplication } from "@/app/actions";
import {
  CheckboxGroup,
  Field,
  Honeypot,
  Received,
  SubmitError,
  Turnstile,
  inputClass,
  primaryButton,
} from "@/components/form-kit";
import { INDIAN_STATES, PACKAGING_TYPES, fieldErrors, manufacturerSchema } from "@/lib/schemas";

type ProductKey = keyof typeof PACKAGING_TYPES;

const empty = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  products: [] as ProductKey[],
  minimumOrder: "",
  capabilities: "",
};
type Values = typeof empty;

export function ManufacturerForm() {
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [token, setToken] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileRound, setTurnstileRound] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [reference, setReference] = useState("");
  const [pending, startTransition] = useTransition();
  const submissionId = useRef<string | null>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };
  const text = (key: Exclude<keyof Values, "products">) => ({
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      set(key, e.target.value),
  });

  const submit = () => {
    const check = manufacturerSchema.safeParse(values);
    if (!check.success) {
      setErrors(fieldErrors(check.error));
      setSubmitError("Some details need fixing before we can send this.");
      return;
    }
    submissionId.current ??= crypto.randomUUID();
    const id = submissionId.current;
    setSubmitError("");
    startTransition(async () => {
      try {
        const result = await submitManufacturerApplication(values, {
          submissionId: id,
          turnstileToken: token,
          website,
        });
        if (result.ok) {
          setReference(result.reference);
          return;
        }
        setSubmitError(result.message);
        if (result.fieldErrors) setErrors(result.fieldErrors);
      } catch {
        setSubmitError("We couldn't reach the server. Check your connection and try again.");
      }
      setToken("");
      setTurnstileRound((n) => n + 1);
    });
  };

  if (reference) {
    return (
      <Received title="We have your application" reference={reference}>
        <p>
          A person at Unidulo will read it and contact you at {values.email} or {values.phone}.
        </p>
        <p>
          Applying doesn&rsquo;t make your unit an approved partner yet. We speak to every
          manufacturer, and usually ask for samples, before sending any enquiries.
        </p>
      </Received>
    );
  }

  const needsToken = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="relative space-y-6"
    >
      <Field label="Company name" error={errors.companyName}>
        {(p) => <input {...p} {...text("companyName")} type="text" autoComplete="organization" className={inputClass} />}
      </Field>
      <Field label="Your name" error={errors.contactName}>
        {(p) => <input {...p} {...text("contactName")} type="text" autoComplete="name" className={inputClass} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" error={errors.email}>
          {(p) => <input {...p} {...text("email")} type="email" autoComplete="email" className={inputClass} />}
        </Field>
        <Field label="Phone" error={errors.phone}>
          {(p) => <input {...p} {...text("phone")} type="tel" autoComplete="tel" className={inputClass} />}
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Factory city" error={errors.city}>
          {(p) => <input {...p} {...text("city")} type="text" className={inputClass} />}
        </Field>
        <Field label="State" error={errors.state}>
          {(p) => (
            <select {...p} {...text("state")} className={inputClass}>
              <option value="">Choose one</option>
              {INDIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <CheckboxGroup
        legend="What do you make?"
        error={errors.products}
        options={PACKAGING_TYPES}
        selected={values.products}
        onChange={(v) => set("products", v)}
      />
      <Field
        label="Smallest order you take"
        optional
        hint="For example: 500 pieces for printed mailer boxes."
        error={errors.minimumOrder}
      >
        {(p) => <input {...p} {...text("minimumOrder")} type="text" maxLength={200} className={inputClass} />}
      </Field>
      <Field
        label="Machines and capabilities"
        optional
        hint="Printing method, board grades, finishing, monthly capacity."
        error={errors.capabilities}
      >
        {(p) => <textarea {...p} {...text("capabilities")} rows={4} maxLength={2000} className={inputClass} />}
      </Field>

      <Honeypot value={website} onChange={setWebsite} />
      <Turnstile key={turnstileRound} onToken={setToken} />
      {submitError && <SubmitError message={submitError} />}

      <button type="submit" disabled={pending || (needsToken && !token)} className={primaryButton}>
        {pending ? "Sending…" : "Send application"}
      </button>
    </form>
  );
}
