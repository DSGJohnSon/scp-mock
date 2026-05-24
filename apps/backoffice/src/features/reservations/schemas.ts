import { z } from "zod";

export const CreateReservationSchema = z.object({
  stagiaireId: z.string().min(1, "Stagiaire requis"),
  stageId: z.string().min(1, "Stage requis"),
  type: z.enum(["INITIATION", "PROGRESSION", "AUTONOMIE"]),
});

export const RecordManualPaymentSchema = z.object({
  orderItemId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "CASH", "CHECK"]),
  note: z.string().optional(),
});

export const GetReservationsSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  search: z.string().optional(),
  bookingStatus: z.enum(["ALL", "CONFIRMED", "CANCELLED"]).optional().default("ALL"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
