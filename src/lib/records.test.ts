import { describe, expect, it } from "vitest";
import {
  KINDS,
  PAGE_SIZE,
  alertEmail,
  alertText,
  isKind,
  isOverdue,
  isOwner,
  isStatus,
  isUuid,
  nextActionSchema,
  noteSchema,
  pageCount,
  pageRange,
  parsePage,
  type ManufacturerRow,
  type RfqRow,
} from "./records";

// Made-up records, shaped like rows read from the database.
const common = {
  id: "11111111-2222-4333-8444-555555555555",
  status: "new",
  contact_name: "Asha Example",
  email: "asha@example.com",
  phone: "9000000001",
  next_action: "",
  next_action_due: null,
  notified_at: null,
  created_at: "2026-11-01T10:00:00Z",
  updated_at: "2026-11-01T10:00:00Z",
};
const rfq: RfqRow = {
  ...common,
  reference: "RFQ-26-9001",
  packaging_type: "mailer_box",
  intended_use: "Made-up candles",
  length: 200,
  width: 150,
  height: 80,
  unit: "mm",
  dimension_basis: "internal",
  material: "corrugated_3ply",
  print_colours: "one",
  finishing: ["matte_lamination", "foil"],
  quantity: 500,
  delivery_city: "Testville",
  delivery_state: "Odisha",
  required_by: null,
  notes: "",
  company: "",
};
const manufacturer: ManufacturerRow = {
  ...common,
  status: "applied",
  reference: "MFR-26-9001",
  company_name: "Made-up Boxes Pvt",
  city: "Testpur",
  state: "Odisha",
  products: ["mailer_box", "rigid_box"],
  minimum_order: "",
  capabilities: "Flexo, 3 ply",
};

describe("isOwner", () => {
  const owner = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
  it("lets the configured owner in", () => {
    expect(isOwner(owner, owner)).toBe(true);
    expect(isOwner(owner, ` ${owner}\n`)).toBe(true);
  });
  it("refuses any other signed-in user", () => {
    expect(isOwner("99999999-bbbb-4ccc-8ddd-eeeeeeeeeeee", owner)).toBe(false);
  });
  it("refuses everyone when no owner is configured, rather than letting everyone in", () => {
    expect(isOwner(owner, undefined)).toBe(false);
    expect(isOwner(owner, "")).toBe(false);
    expect(isOwner(undefined, undefined)).toBe(false);
    expect(isOwner("", "")).toBe(false);
  });
  it("refuses a missing user", () => {
    expect(isOwner(undefined, owner)).toBe(false);
  });
});

describe("statuses", () => {
  it("match the values the database allows", () => {
    expect(KINDS.rfq.statuses).toEqual(["new", "reviewing", "quoted", "closed"]);
    expect(KINDS.manufacturer.statuses).toEqual(["applied", "reviewing", "approved", "rejected"]);
  });
  it("accepts only a status that belongs to that kind of record", () => {
    expect(isStatus("rfq", "quoted")).toBe(true);
    expect(isStatus("manufacturer", "approved")).toBe(true);
    expect(isStatus("rfq", "approved")).toBe(false);
    expect(isStatus("manufacturer", "quoted")).toBe(false);
    expect(isStatus("rfq", "won")).toBe(false);
    expect(isStatus("rfq", "")).toBe(false);
    expect(isStatus("rfq", undefined)).toBe(false);
    expect(isStatus("rfq", ["new"])).toBe(false);
  });
});

describe("isKind and isUuid", () => {
  it("accept only the two record kinds", () => {
    expect(isKind("rfq")).toBe(true);
    expect(isKind("manufacturer")).toBe(true);
    expect(isKind("rfqs")).toBe(false);
    expect(isKind("notes")).toBe(false);
    expect(isKind(undefined)).toBe(false);
  });
  it("accept only a well-formed id", () => {
    expect(isUuid(common.id)).toBe(true);
    expect(isUuid("1")).toBe(false);
    expect(isUuid(`${common.id}' or '1'='1`)).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });
});

describe("paging", () => {
  it("reads the page number and falls back to 1 for anything odd", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-2")).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("2.5")).toBe(1);
    expect(parsePage("99999999999")).toBe(1);
  });
  it("works out which rows a page holds", () => {
    expect(pageRange(1)).toEqual({ from: 0, to: PAGE_SIZE - 1 });
    expect(pageRange(3)).toEqual({ from: 2 * PAGE_SIZE, to: 3 * PAGE_SIZE - 1 });
  });
  it("counts pages, with at least one even when there are no rows", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(PAGE_SIZE)).toBe(1);
    expect(pageCount(PAGE_SIZE + 1)).toBe(2);
  });
});

describe("isOverdue", () => {
  const today = "2026-11-12";
  it("is overdue when the due date is before today", () => {
    expect(isOverdue("rfq", "new", "2026-11-11", today)).toBe(true);
  });
  it("is not overdue on the due date itself or later", () => {
    expect(isOverdue("rfq", "new", "2026-11-12", today)).toBe(false);
    expect(isOverdue("rfq", "new", "2026-11-13", today)).toBe(false);
  });
  it("is never overdue without a due date", () => {
    expect(isOverdue("rfq", "new", null, today)).toBe(false);
  });
  it("is never overdue once the record is finished", () => {
    expect(isOverdue("rfq", "closed", "2026-01-01", today)).toBe(false);
    expect(isOverdue("manufacturer", "rejected", "2026-01-01", today)).toBe(false);
  });
  it("can still be overdue for an approved manufacturer", () => {
    expect(isOverdue("manufacturer", "approved", "2026-01-01", today)).toBe(true);
  });
});

describe("next action and note rules", () => {
  it("accepts a short action with a date, or both empty to clear it", () => {
    expect(nextActionSchema.safeParse({ nextAction: " Call back ", due: "2026-12-01" }).data).toEqual({
      nextAction: "Call back",
      due: "2026-12-01",
    });
    expect(nextActionSchema.safeParse({ nextAction: "", due: "" }).success).toBe(true);
  });
  it("rejects an action over 200 characters or a malformed date", () => {
    expect(nextActionSchema.safeParse({ nextAction: "x".repeat(201), due: "" }).success).toBe(false);
    expect(nextActionSchema.safeParse({ nextAction: "ok", due: "tomorrow" }).success).toBe(false);
  });
  it("rejects an empty or oversized note and trims a good one", () => {
    expect(noteSchema.safeParse("   ").success).toBe(false);
    expect(noteSchema.safeParse("x".repeat(4001)).success).toBe(false);
    expect(noteSchema.safeParse("  Spoke to buyer  ").data).toBe("Spoke to buyer");
  });
});

describe("alertEmail", () => {
  it("builds the RFQ alert from the saved row", () => {
    const { subject, lines } = alertEmail("rfq", rfq);
    expect(subject).toBe("New RFQ RFQ-26-9001: 500 x Mailer box");
    const text = alertText(lines);
    expect(text).toContain("Reference: RFQ-26-9001");
    expect(text).toContain("Size: 200 x 150 x 80 mm (internal)");
    expect(text).toContain("Material: Corrugated board, 3 ply");
    expect(text).toContain("Finishing: Matte lamination, Foil stamping");
    expect(text).toContain("Deliver to: Testville, Odisha");
    expect(text).toContain("Email: asha@example.com");
  });
  it("leaves out fields the customer left empty", () => {
    const text = alertText(alertEmail("rfq", { ...rfq, finishing: [] }).lines);
    expect(text).not.toContain("Required by");
    expect(text).not.toContain("Notes");
    expect(text).not.toContain("Company");
    expect(text).not.toContain("Finishing");
  });
  it("builds the manufacturer alert from the saved row", () => {
    const { subject, lines } = alertEmail("manufacturer", manufacturer);
    expect(subject).toBe("New manufacturer application MFR-26-9001: Made-up Boxes Pvt");
    const text = alertText(lines);
    expect(text).toContain("Makes: Mailer box, Rigid gift box");
    expect(text).toContain("Location: Testpur, Odisha");
    expect(text).not.toContain("Minimum order");
  });
  it("never includes console-only fields such as the next action", () => {
    const text = alertText(
      alertEmail("rfq", { ...rfq, next_action: "SECRET-NEXT-ACTION", next_action_due: "2026-12-01" }).lines,
    );
    expect(text).not.toContain("SECRET-NEXT-ACTION");
    expect(text).not.toContain("2026-12-01");
  });
});
