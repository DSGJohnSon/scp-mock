export interface CartItem {
  id: string;
  type: string;
  quantity: number;
  participantData: any;
  stage?: any;
  expiresAt?: string;
  createdAt?: string;
}
