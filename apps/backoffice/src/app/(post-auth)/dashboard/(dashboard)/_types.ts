export type Period = 1 | 3 | 6 | 12;

export interface ChartDataPoint {
  month: string;
  monthLabel: string;
  total: number;
  online: number;
  manual: number;
  pendingBalance: number;
}

export interface PeriodStats {
  year: number;
  month?: number;
  totalCA: number;
  totalCollected: number;
  totalPending: number;
  onlineCollected: number;
  manualCollected: number;
  depositsPaid: number;
  balancesPaid: number;
  totalReservations: number;
  uniqueStagiaires: number;
}
