// Rules for the two kinds of record the owner's console works with: quote
// requests and manufacturer applications. Nothing here touches the network or
// the database, so every rule in this file can be tested on its own.
import { z } from "zod";
import {
  FINISHES,
  MATERIALS,
  PACKAGING_TYPES,
  PRINT_COLOURS,
  todayInIndia,
} from "./schemas";

export const KINDS = {
  rfq: {
    table: "rfqs",
    noteColumn: "rfq_id",
    label: "Quote requests",
    singular: "Quote request",
    // Must match the CHECK constraint on rfqs.status in the database.
    statuses: ["new", "reviewing", "quoted", "closed"],
    // A record in one of these states is finished, so it can't be overdue.
    finished: ["closed"],
  },
  manufacturer: {
    table: "manufacturer_applications",
    noteColumn: "manufacturer_application_id",
    label: "Manufacturer applications",
    singular: "Manufacturer application",
    statuses: ["applied", "reviewing", "approved", "rejected"],
    finished: ["rejected"],
  },
} as const;

export type Kind = keyof typeof KINDS;

export const isKind = (value: unknown): value is Kind =>
  value === "rfq" || value === "manufacturer";

export const isStatus = (kind: Kind, value: unknown): value is string =>
  typeof value === "string" && (KINDS[kind].statuses as readonly string[]).includes(value);

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/** The signed-in user is the owner only if an owner is configured and the ids match. */
export const isOwner = (userId: string | undefined, ownerId: string | undefined): boolean =>
  Boolean(userId) && Boolean(ownerId) && userId === ownerId?.trim();

// --- Paging ---------------------------------------------------------------

export const PAGE_SIZE = 25;

/** Reads ?page= from the address. Anything that isn't a whole number from 1 up becomes 1. */
export function parsePage(value: unknown): number {
  const n = typeof value === "string" && /^\d{1,6}$/.test(value) ? Number(value) : 1;
  return n >= 1 ? n : 1;
}

/** First and last row numbers (counting from 0) for a page, as the database wants them. */
export function pageRange(page: number): { from: number; to: number } {
  const from = (page - 1) * PAGE_SIZE;
  return { from, to: from + PAGE_SIZE - 1 };
}

export const pageCount = (total: number): number => Math.max(1, Math.ceil(total / PAGE_SIZE));

// --- Next action ------------------------------------------------------------

/** Overdue means: has a due date, that date is before today in India, and the record isn't finished. */
export function isOverdue(
  kind: Kind,
  status: string,
  due: string | null,
  today: string = todayInIndia(),
): boolean {
  if (!due) return false;
  if ((KINDS[kind].finished as readonly string[]).includes(status)) return false;
  return due < today;
}

export const nextActionSchema = z.object({
  nextAction: z.string().trim().max(200, "Keep the next action under 200 characters"),
  due: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date"),
});

export const noteSchema = z
  .string()
  .trim()
  .min(1, "Write something before saving the note")
  .max(4000, "Keep a note under 4000 characters");

// --- Rows as the database stores them -----------------------------------------

type Common = {
  id: string;
  reference: string;
  status: string;
  contact_name: string;
  email: string;
  phone: string;
  next_action: string;
  next_action_due: string | null;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RfqRow = Common & {
  packaging_type: string;
  intended_use: string;
  length: number;
  width: number;
  height: number;
  unit: string;
  dimension_basis: string;
  material: string;
  print_colours: string;
  finishing: string[];
  quantity: number;
  delivery_city: string;
  delivery_state: string;
  required_by: string | null;
  notes: string;
  company: string;
};

export type ManufacturerRow = Common & {
  company_name: string;
  city: string;
  state: string;
  products: string[];
  minimum_order: string;
  capabilities: string;
};

export type RecordRow<K extends Kind = Kind> = K extends "rfq" ? RfqRow : ManufacturerRow;

/** Turns a stored code such as "mailer_box" into the wording the customer saw. */
export const labelFor = (labels: Record<string, string>, key: string): string => labels[key] ?? key;

// --- The owner's alert email ----------------------------------------------------

export type Alert = { subject: string; lines: [string, unknown][] };

/**
 * The alert email for a saved record, built only from what is in the database.
 * The first send and a later resend both use this, so they always match.
 * Console notes are deliberately not part of it.
 */
export function alertEmail(kind: Kind, row: RfqRow | ManufacturerRow): Alert {
  if (kind === "rfq") {
    const r = row as RfqRow;
    const packaging = labelFor(PACKAGING_TYPES, r.packaging_type);
    return {
      subject: `New RFQ ${r.reference}: ${r.quantity} x ${packaging}`,
      lines: [
        ["Reference", r.reference],
        ["Packaging", packaging],
        ["For", r.intended_use],
        ["Size", `${r.length} x ${r.width} x ${r.height} ${r.unit} (${r.dimension_basis})`],
        ["Material", labelFor(MATERIALS, r.material)],
        ["Printing", labelFor(PRINT_COLOURS, r.print_colours)],
        ["Finishing", r.finishing.map((f) => labelFor(FINISHES, f))],
        ["Quantity", r.quantity],
        ["Deliver to", `${r.delivery_city}, ${r.delivery_state}`],
        ["Required by", r.required_by],
        ["Notes", r.notes],
        ["Name", r.contact_name],
        ["Company", r.company],
        ["Email", r.email],
        ["Phone", r.phone],
      ],
    };
  }
  const m = row as ManufacturerRow;
  return {
    subject: `New manufacturer application ${m.reference}: ${m.company_name}`,
    lines: [
      ["Reference", m.reference],
      ["Company", m.company_name],
      ["Contact", m.contact_name],
      ["Email", m.email],
      ["Phone", m.phone],
      ["Location", `${m.city}, ${m.state}`],
      ["Makes", m.products.map((p) => labelFor(PACKAGING_TYPES, p))],
      ["Minimum order", m.minimum_order],
      ["Capabilities", m.capabilities],
    ],
  };
}

/** The plain-text body of an alert: one "Label: value" line per filled-in field. */
export function alertText(lines: [string, unknown][]): string {
  return lines
    .filter(([, value]) => value !== "" && value != null && !(Array.isArray(value) && value.length === 0))
    .map(([label, value]) => `${label}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join("\n");
}
