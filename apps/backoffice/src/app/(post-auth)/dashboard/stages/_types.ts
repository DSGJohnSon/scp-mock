import { StageType } from "@prisma/client";

export type { StageType };

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

export interface EditedStageState {
  places: number;
  price: number;
  acomptePrice: number;
  moniteurIds: string[];
}

export interface TypeConfig {
  hex: string;
  label: string;
  badgeCls: string;
}

export interface StageWithDetails {
  id: string;
  startDate: Date | string;
  duration: number;
  places: number;
  price: number;
  acomptePrice: number;
  type: StageType;
  promotionOriginalPrice: number | null;
  promotionEndDate: string | null;
  promotionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  moniteurs: Array<{
    moniteur: {
      id: string;
      name: string;
      avatarUrl?: string | null;
      role: string;
      email: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
  bookings: BookingWithStagiaire[];
  confirmedBookings?: number;
}

export type StageItem = StageWithDetails & { placesRestantes: number };
