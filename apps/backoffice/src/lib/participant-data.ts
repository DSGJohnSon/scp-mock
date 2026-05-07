// Shape of the JSON stored in CartItem.participantData and OrderItem.participantData.
// Mirrors CartParticipantData from @serreche/types — kept in sync manually.
export interface ParticipantData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  weight?: number;
  height?: number;
  birthDate?: string;
  selectedCategory?: string;
  hasVideo?: boolean;
  selectedStageType?: string;
  voucherProductType?: string;
  buyerName?: string;
  buyerEmail?: string;
  notifyRecipient?: boolean;
  usedGiftVoucherCode?: string;
  voucherStageCategory?: string;
  voucherBaptemeCategory?: string;
  recipientName?: string;
  recipientEmail?: string;
}
