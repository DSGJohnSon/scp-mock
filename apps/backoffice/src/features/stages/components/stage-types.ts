import { Stage, User } from "@prisma/client";

export type TypeConfig = {
  hex: string;
  label: string;
  badgeCls: string;
};

export interface BookingWithStagiaire {
  id: string;
  type: string;
  stagiaire?: {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    weight?: number | null;
    height?: number | null;
  } | null;
}

export interface StageWithDetails extends Stage {
  moniteurs: Array<{ moniteur: User }>;
  bookings: BookingWithStagiaire[];
  acomptePrice: number;
  confirmedBookings?: number;
}

export interface EditedStageState {
  places: number;
  price: number;
  acomptePrice: number;
  moniteurIds: string[];
}
