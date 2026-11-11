// One set of rules shared by the browser and the server.
// The browser uses them to give quick feedback; the server uses the same
// rules again and is the only check that counts.
import { z } from "zod";

export const PACKAGING_TYPES = {
  corrugated_shipping_box: "Corrugated shipping box",
  mailer_box: "Mailer box",
  folding_carton: "Folding carton",
  rigid_box: "Rigid gift box",
  paper_bag: "Paper bag",
  sleeve: "Packaging sleeve",
  insert: "Insert or divider",
  other: "Something else",
} as const;

export const MATERIALS = {
  not_sure: "Not sure, please advise",
  corrugated_3ply: "Corrugated board, 3 ply",
  corrugated_5ply: "Corrugated board, 5 ply",
  kraft_paper: "Kraft paper",
  duplex_board: "Duplex board",
  sbs_fbb: "SBS / FBB paperboard",
  rigid_greyboard: "Rigid greyboard",
  other: "Other (describe in notes)",
} as const;

export const PRINT_COLOURS = {
  none: "No printing",
  one: "1 colour",
  two: "2 colours",
  full_colour: "Full colour (CMYK)",
  not_sure: "Not sure yet",
} as const;

export const FINISHES = {
  matte_lamination: "Matte lamination",
  gloss_lamination: "Gloss lamination",
  spot_uv: "Spot UV",
  foil: "Foil stamping",
  emboss: "Embossing or debossing",
} as const;

export const UNITS = { mm: "mm", cm: "cm", in: "inches" } as const;

export const DIMENSION_BASIS = {
  internal: "Inside (the space for the product)",
  external: "Outside (the overall box)",
} as const;

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
] as const;

const keys = <T extends Record<string, string>>(o: T) =>
  Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);
const requiredText = (max: number, message: string) => text(max).min(1, message);

// Form fields arrive as text. An empty box should read as "missing", not as 0.
const numberFromText = <T extends z.ZodType<number>>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema);

const dimension = numberFromText(
  z.coerce
    .number({ error: "Enter a number" })
    .positive("Must be more than 0")
    .max(5000, "That looks too large. Check the unit"),
);

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9 \-]{6,17}$/, "Enter a phone number with 7 to 15 digits");

const state = z.enum(INDIAN_STATES, { error: "Choose a state" });

/** Today's date in India as YYYY-MM-DD, so "required by" can't be in the past. */
export function todayInIndia(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

// The RFQ form is split into steps. Each step has its own small schema so the
// form can check one step at a time; the full schema is all of them combined.
export const rfqSteps = {
  product: z.object({
    packagingType: z.enum(keys(PACKAGING_TYPES), { error: "Choose a packaging type" }),
    intendedUse: requiredText(300, "Tell us what goes inside"),
    length: dimension,
    width: dimension,
    height: dimension,
    unit: z.enum(keys(UNITS)),
    dimensionBasis: z.enum(keys(DIMENSION_BASIS)),
  }),
  material: z.object({
    material: z.enum(keys(MATERIALS), { error: "Choose a material" }),
    printColours: z.enum(keys(PRINT_COLOURS), { error: "Choose a printing option" }),
    finishing: z.array(z.enum(keys(FINISHES))).max(5).default([]),
  }),
  order: z.object({
    quantity: numberFromText(
      z.coerce
        .number({ error: "Enter a number" })
        .int("Enter a whole number")
        .min(1, "Enter at least 1")
        .max(10_000_000, "That quantity looks too large"),
    ),
    deliveryCity: requiredText(80, "Enter the delivery city"),
    deliveryState: state,
    requiredBy: z
      .string()
      .trim()
      .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date")
      .refine((v) => v === "" || v >= todayInIndia(), "Choose a date that hasn't passed")
      .default(""),
    notes: text(2000).default(""),
  }),
  contact: z.object({
    contactName: requiredText(100, "Enter your name"),
    company: text(120).default(""),
    email: z.email("Enter a valid email address").trim().max(200),
    phone,
  }),
};

export const rfqSchema = z.object({
  ...rfqSteps.product.shape,
  ...rfqSteps.material.shape,
  ...rfqSteps.order.shape,
  ...rfqSteps.contact.shape,
});
export type Rfq = z.infer<typeof rfqSchema>;

export const manufacturerSchema = z.object({
  companyName: requiredText(120, "Enter your company name"),
  contactName: requiredText(100, "Enter your name"),
  email: z.email("Enter a valid email address").trim().max(200),
  phone,
  city: requiredText(80, "Enter your city"),
  state,
  products: z
    .array(z.enum(keys(PACKAGING_TYPES)))
    .min(1, "Choose at least one product you make")
    .max(8),
  minimumOrder: text(200).default(""),
  capabilities: text(2000).default(""),
});
export type ManufacturerApplication = z.infer<typeof manufacturerSchema>;

/** Turns a failed validation into { fieldName: "first message" }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    if (!out[field]) out[field] = issue.message;
  }
  return out;
}

export type SubmitResult =
  | { ok: true; reference: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };
