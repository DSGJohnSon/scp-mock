export type StageType = "INITIATION" | "PROGRESSION" | "AUTONOMIE" | "DOUBLE";
export type StageBookingType = "INITIATION" | "PROGRESSION" | "AUTONOMIE";

export interface AppStage {
  id: string;
  type: StageType;
  startDate: string;
  duration: number;
}

export interface AppStageBooking {
  id: string;
  shortCode: string | null;
  type: StageBookingType;
  stage: AppStage;
  createdAt: string;
}

export interface AppStagiaire {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string | null;
  weight: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  stageBookings: AppStageBooking[];
}
