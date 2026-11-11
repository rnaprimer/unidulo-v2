import { describe, expect, it } from "vitest";
import { fieldErrors, manufacturerSchema, rfqSchema, rfqSteps, todayInIndia } from "./schemas";

const validRfq = {
  packagingType: "mailer_box",
  intendedUse: "Candle jar",
  length: "250",
  width: "200",
  height: "100",
  unit: "mm",
  dimensionBasis: "internal",
  material: "corrugated_3ply",
  printColours: "one",
  finishing: [],
  quantity: "500",
  deliveryCity: "Bhubaneswar",
  deliveryState: "Odisha",
  requiredBy: "",
  notes: "",
  contactName: "Asha",
  company: "",
  email: "asha@example.com",
  phone: "+91 98765 43210",
};

describe("rfqSchema", () => {
  it("accepts a complete request and turns number text into numbers", () => {
    const result = rfqSchema.parse(validRfq);
    expect(result.length).toBe(250);
    expect(result.quantity).toBe(500);
  });

  it.each([
    ["packagingType", "crate"],
    ["length", "0"],
    ["length", "abc"],
    ["length", "6000"],
    ["quantity", "0"],
    ["quantity", "12.5"],
    ["deliveryState", "Atlantis"],
    ["email", "not-an-email"],
    ["phone", "123"],
    ["intendedUse", "   "],
    ["requiredBy", "2020-01-01"],
    ["requiredBy", "tomorrow"],
    ["finishing", ["glitter"]],
  ])("rejects %s = %j", (field, value) => {
    const result = rfqSchema.safeParse({ ...validRfq, [field]: value });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error)[field]).toBeTruthy();
  });

  it("accepts a required-by date of today or later", () => {
    expect(rfqSchema.safeParse({ ...validRfq, requiredBy: todayInIndia() }).success).toBe(true);
    expect(rfqSchema.safeParse({ ...validRfq, requiredBy: "2999-12-31" }).success).toBe(true);
  });

  it("drops fields that are not part of the form", () => {
    const result = rfqSchema.parse({ ...validRfq, status: "quoted", reference: "X" });
    expect(result).not.toHaveProperty("status");
    expect(result).not.toHaveProperty("reference");
  });

  it("validates one step at a time", () => {
    expect(rfqSteps.product.safeParse(validRfq).success).toBe(true);
    expect(rfqSteps.contact.safeParse({ ...validRfq, email: "" }).success).toBe(false);
  });
});

describe("manufacturerSchema", () => {
  const valid = {
    companyName: "Kalinga Cartons",
    contactName: "Ravi",
    email: "ravi@example.com",
    phone: "9876543210",
    city: "Cuttack",
    state: "Odisha",
    products: ["mailer_box"],
    minimumOrder: "",
    capabilities: "",
  };

  it("accepts a complete application", () => {
    expect(manufacturerSchema.safeParse(valid).success).toBe(true);
  });

  it("needs at least one product", () => {
    const result = manufacturerSchema.safeParse({ ...valid, products: [] });
    expect(result.success).toBe(false);
  });
});

describe("todayInIndia", () => {
  it("uses the Indian date, not UTC", () => {
    // 20:00 UTC on 1 Jan is already 2 Jan in India.
    expect(todayInIndia(new Date("2026-01-01T20:00:00Z"))).toBe("2026-01-02");
  });
});
