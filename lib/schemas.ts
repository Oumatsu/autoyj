import { z } from "zod";

/**
 * Single source of truth for runtime validation schemas across client and server.
 */

export const RoleEnum = z.enum(["admin", "sales", "partner", "customer"]);
export type Role = z.infer<typeof RoleEnum>;

export const TradeTermEnum = z.enum(["EXW", "FOB", "CIF"]);
export type TradeTerm = z.infer<typeof TradeTermEnum>;

export const InquiryStatusEnum = z.enum(["open", "closed"]);
export type InquiryStatus = z.infer<typeof InquiryStatusEnum>;

export const DevSessionLoginSchema = z.object({
  role: RoleEnum.optional(),
  email: z.string().email().optional(),
  accessCode: z.string().optional(),
});
export type DevSessionLoginInput = z.infer<typeof DevSessionLoginSchema>;

export const InquiryCreateSchema = z.object({
  vehicleModel: z.string().min(1, "Vehicle model is required").default("General Inquiry"),
  trim: z.string().optional().default("Standard"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1").default(1),
  tradeTerm: TradeTermEnum.default("FOB"),
  destinationPort: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  targetPrice: z.coerce.number().nonnegative().optional(),
  title: z.string().optional(),
});
export type InquiryCreateInput = z.infer<typeof InquiryCreateSchema>;

export const InquiryNoteCreateSchema = z.object({
  body: z.string().trim().min(1, "Note body cannot be empty"),
  parentNoteId: z.string().optional().nullable(),
  isPublic: z.boolean().optional().default(true),
});
export type InquiryNoteCreateInput = z.infer<typeof InquiryNoteCreateSchema>;

export const InquiryStatusUpdateSchema = z.object({
  status: InquiryStatusEnum,
  note: z.string().optional(),
});
export type InquiryStatusUpdateInput = z.infer<typeof InquiryStatusUpdateSchema>;

export const QuotationCreateSchema = z.object({
  inquiryNo: z.string().min(1, "Inquiry number is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  trim: z.string().optional().default("Standard"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.coerce.number().positive("Unit price must be greater than 0"),
  tradeTerm: TradeTermEnum.default("FOB"),
  destinationPort: z.string().optional().default(""),
  validityDays: z.coerce.number().int().positive().default(30),
  notes: z.string().optional().default(""),
});
export type QuotationCreateInput = z.infer<typeof QuotationCreateSchema>;

export const QuotationCounterSchema = z.object({
  counterPrice: z.coerce.number().positive().optional(),
  message: z.string().optional(),
}).refine((data) => data.counterPrice !== undefined || (data.message && data.message.trim().length > 0), {
  message: "Either counterPrice or message must be provided",
});
export type QuotationCounterInput = z.infer<typeof QuotationCounterSchema>;

export const AdminUserCreateSchema = z.object({
  name: z.string().min(1, "User name is required"),
  email: z.string().email("Valid email is required"),
  role: RoleEnum,
  phone: z.string().optional(),
  company: z.string().optional(),
  telegramChatId: z.string().optional(),
});
export type AdminUserCreateInput = z.infer<typeof AdminUserCreateSchema>;
