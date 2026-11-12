"use server";

// Server Actions: functions the browser can call, but which run on the server.
// Anyone can call them directly, so nothing from the browser is trusted here.
import { fieldErrors, manufacturerSchema, rfqSchema, type SubmitResult } from "@/lib/schemas";
import { saveSubmission, type SubmitMeta } from "@/lib/server/submit";

const invalid = (errors: Record<string, string>): SubmitResult => ({
  ok: false,
  message: "Some details need fixing before we can send this.",
  fieldErrors: errors,
});

export async function submitRfq(input: unknown, meta: SubmitMeta): Promise<SubmitResult> {
  const parsed = rfqSchema.safeParse(input);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const d = parsed.data;

  return saveSubmission(
    "rfq",
    meta,
    {
      packaging_type: d.packagingType,
      intended_use: d.intendedUse,
      length: d.length,
      width: d.width,
      height: d.height,
      unit: d.unit,
      dimension_basis: d.dimensionBasis,
      material: d.material,
      print_colours: d.printColours,
      finishing: d.finishing,
      quantity: d.quantity,
      delivery_city: d.deliveryCity,
      delivery_state: d.deliveryState,
      required_by: d.requiredBy || null,
      notes: d.notes,
      contact_name: d.contactName,
      company: d.company,
      email: d.email,
      phone: d.phone,
    },
  );
}

export async function submitManufacturerApplication(
  input: unknown,
  meta: SubmitMeta,
): Promise<SubmitResult> {
  const parsed = manufacturerSchema.safeParse(input);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const d = parsed.data;

  return saveSubmission(
    "manufacturer",
    meta,
    {
      company_name: d.companyName,
      contact_name: d.contactName,
      email: d.email,
      phone: d.phone,
      city: d.city,
      state: d.state,
      products: d.products,
      minimum_order: d.minimumOrder,
      capabilities: d.capabilities,
    },
  );
}
