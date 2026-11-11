"use client";

import { useRef, useState, useTransition } from "react";
import { submitRfq } from "@/app/actions";
import {
  CheckboxGroup,
  Field,
  Honeypot,
  Received,
  SubmitError,
  Turnstile,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/form-kit";
import {
  DIMENSION_BASIS,
  FINISHES,
  INDIAN_STATES,
  MATERIALS,
  PACKAGING_TYPES,
  PRINT_COLOURS,
  UNITS,
  fieldErrors,
  rfqSteps,
  todayInIndia,
} from "@/lib/schemas";

type FinishKey = keyof typeof FINISHES;

const empty = {
  packagingType: "",
  intendedUse: "",
  length: "",
  width: "",
  height: "",
  unit: "mm",
  dimensionBasis: "internal",
  material: "",
  printColours: "",
  finishing: [] as FinishKey[],
  quantity: "",
  deliveryCity: "",
  deliveryState: "",
  requiredBy: "",
  notes: "",
  contactName: "",
  company: "",
  email: "",
  phone: "",
};
type Values = typeof empty;

const steps = [
  { key: "product", title: "The packaging" },
  { key: "material", title: "Material and printing" },
  { key: "order", title: "Quantity and delivery" },
  { key: "contact", title: "Your details" },
] as const;
const REVIEW = steps.length;

const options = (o: Record<string, string>) =>
  Object.entries(o).map(([value, label]) => (
    <option key={value} value={value}>
      {label}
    </option>
  ));

export function RfqForm() {
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [token, setToken] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileRound, setTurnstileRound] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [reference, setReference] = useState("");
  const [pending, startTransition] = useTransition();
  // One id per filled-in form. A retry sends the same id, so the server
  // can tell it's the same request and not save it twice.
  const submissionId = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };
  const text = (key: Exclude<keyof Values, "finishing">) => ({
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      set(key, e.target.value),
  });

  const goTo = (next: number) => {
    setStep(next);
    setSubmitError("");
    requestAnimationFrame(() => heading.current?.focus());
  };

  const next = () => {
    const result = rfqSteps[steps[step].key].safeParse(values);
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return;
    }
    setErrors({});
    goTo(step + 1);
  };

  const submit = () => {
    submissionId.current ??= crypto.randomUUID();
    const id = submissionId.current;
    setSubmitError("");
    startTransition(async () => {
      try {
        const result = await submitRfq(values, { submissionId: id, turnstileToken: token, website });
        if (result.ok) {
          setReference(result.reference);
          return;
        }
        setSubmitError(result.message);
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
          const bad = steps.findIndex((s) =>
            Object.keys(rfqSteps[s.key].shape).some((f) => result.fieldErrors?.[f]),
          );
          if (bad >= 0) setStep(bad);
        }
      } catch {
        setSubmitError("We couldn't reach the server. Check your connection and try again.");
      }
      // A Turnstile token works once, so ask for a fresh one before a retry.
      setToken("");
      setTurnstileRound((n) => n + 1);
    });
  };

  if (reference) {
    return (
      <Received title="We have your request" reference={reference}>
        <p>
          Keep this number for your records. A person at Unidulo will read your request and
          contact you at {values.email} or {values.phone}.
        </p>
        <p>
          Nothing has been ordered and no factory has started work. The next thing you&rsquo;ll
          receive from us is either a question about your specification or a quotation.
        </p>
      </Received>
    );
  }

  const needsToken = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const summary: [string, string][] = [
    ["Packaging", PACKAGING_TYPES[values.packagingType as keyof typeof PACKAGING_TYPES] ?? ""],
    ["What goes inside", values.intendedUse],
    ["Size", `${values.length} × ${values.width} × ${values.height} ${values.unit}, ${values.dimensionBasis === "internal" ? "inside" : "outside"}`],
    ["Material", MATERIALS[values.material as keyof typeof MATERIALS] ?? ""],
    ["Printing", PRINT_COLOURS[values.printColours as keyof typeof PRINT_COLOURS] ?? ""],
    ["Finishing", values.finishing.map((f) => FINISHES[f]).join(", ") || "None"],
    ["Quantity", values.quantity],
    ["Deliver to", `${values.deliveryCity}, ${values.deliveryState}`],
    ["Needed by", values.requiredBy || "No fixed date"],
    ["Notes", values.notes || "None"],
    ["Name", values.contactName],
    ["Company", values.company || "Not given"],
    ["Email", values.email],
    ["Phone", values.phone],
  ];

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step < REVIEW) next();
        else submit();
      }}
      className="relative"
    >
      <p className="text-sm text-muted">
        Step {step + 1} of {REVIEW + 1}
      </p>
      <h2 ref={heading} tabIndex={-1} className="display mt-1 text-2xl outline-none">
        {step < REVIEW ? steps[step].title : "Check and send"}
      </h2>

      <div className="mt-6 space-y-6">
        {step === 0 && (
          <>
            <Field label="Type of packaging" error={errors.packagingType}>
              {(p) => (
                <select {...p} {...text("packagingType")} className={inputClass}>
                  <option value="">Choose one</option>
                  {options(PACKAGING_TYPES)}
                </select>
              )}
            </Field>
            <Field
              label="What goes inside?"
              hint="For example: a 250 g glass candle jar, or 12 bars of soap."
              error={errors.intendedUse}
            >
              {(p) => <input {...p} {...text("intendedUse")} type="text" maxLength={300} className={inputClass} />}
            </Field>
            <fieldset>
              <legend className="font-medium">Size</legend>
              <p className="mt-0.5 text-sm text-muted">Rough sizes are fine. We&rsquo;ll confirm them with you.</p>
              <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(["length", "width", "height"] as const).map((dim) => (
                  <Field key={dim} label={dim[0].toUpperCase() + dim.slice(1)} error={errors[dim]}>
                    {(p) => <input {...p} {...text(dim)} type="text" inputMode="decimal" className={inputClass} />}
                  </Field>
                ))}
                <Field label="Unit" error={errors.unit}>
                  {(p) => (
                    <select {...p} {...text("unit")} className={inputClass}>
                      {options(UNITS)}
                    </select>
                  )}
                </Field>
              </div>
            </fieldset>
            <Field label="These sizes are for the" error={errors.dimensionBasis}>
              {(p) => (
                <select {...p} {...text("dimensionBasis")} className={inputClass}>
                  {options(DIMENSION_BASIS)}
                </select>
              )}
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field
              label="Material"
              hint="If you're unsure, choose the first option and we'll recommend one."
              error={errors.material}
            >
              {(p) => (
                <select {...p} {...text("material")} className={inputClass}>
                  <option value="">Choose one</option>
                  {options(MATERIALS)}
                </select>
              )}
            </Field>
            <Field label="Printing" error={errors.printColours}>
              {(p) => (
                <select {...p} {...text("printColours")} className={inputClass}>
                  <option value="">Choose one</option>
                  {options(PRINT_COLOURS)}
                </select>
              )}
            </Field>
            <CheckboxGroup
              legend="Finishing"
              hint="Tick any you want. Leave all empty for none."
              error={errors.finishing}
              options={FINISHES}
              selected={values.finishing}
              onChange={(v) => set("finishing", v)}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Quantity" hint="Number of pieces for this order." error={errors.quantity}>
              {(p) => <input {...p} {...text("quantity")} type="text" inputMode="numeric" className={inputClass} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Delivery city" error={errors.deliveryCity}>
                {(p) => <input {...p} {...text("deliveryCity")} type="text" autoComplete="address-level2" className={inputClass} />}
              </Field>
              <Field label="State" error={errors.deliveryState}>
                {(p) => (
                  <select {...p} {...text("deliveryState")} autoComplete="address-level1" className={inputClass}>
                    <option value="">Choose one</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
            <Field label="Needed by" optional error={errors.requiredBy}>
              {(p) => <input {...p} {...text("requiredBy")} type="date" min={todayInIndia()} className={inputClass} />}
            </Field>
            <Field
              label="Anything else we should know?"
              optional
              hint="Budget, how the product is shipped, a box you've seen and liked."
              error={errors.notes}
            >
              {(p) => <textarea {...p} {...text("notes")} rows={4} maxLength={2000} className={inputClass} />}
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="Your name" error={errors.contactName}>
              {(p) => <input {...p} {...text("contactName")} type="text" autoComplete="name" className={inputClass} />}
            </Field>
            <Field label="Company" optional error={errors.company}>
              {(p) => <input {...p} {...text("company")} type="text" autoComplete="organization" className={inputClass} />}
            </Field>
            <Field label="Email" error={errors.email}>
              {(p) => <input {...p} {...text("email")} type="email" autoComplete="email" className={inputClass} />}
            </Field>
            <Field label="Phone" hint="We may call or message to clarify your specification." error={errors.phone}>
              {(p) => <input {...p} {...text("phone")} type="tel" autoComplete="tel" className={inputClass} />}
            </Field>
          </>
        )}

        {step === REVIEW && (
          <>
            <dl className="border-t border-line">
              {summary.map(([label, value]) => (
                <div key={label} className="grid gap-x-6 border-b border-line py-2.5 sm:grid-cols-[11rem_1fr]">
                  <dt className="text-muted">{label}</dt>
                  <dd className="break-words">{value}</dd>
                </div>
              ))}
            </dl>
            <Honeypot value={website} onChange={setWebsite} />
            <Turnstile key={turnstileRound} onToken={setToken} />
          </>
        )}

        {submitError && <SubmitError message={submitError} />}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {step > 0 && (
          <button type="button" onClick={() => goTo(step - 1)} disabled={pending} className={secondaryButton}>
            Back
          </button>
        )}
        {step < REVIEW ? (
          <button type="submit" className={primaryButton}>
            Continue
          </button>
        ) : (
          <button type="submit" disabled={pending || (needsToken && !token)} className={primaryButton}>
            {pending ? "Sending…" : "Send request"}
          </button>
        )}
      </div>
    </form>
  );
}
