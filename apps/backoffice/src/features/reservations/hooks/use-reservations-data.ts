"use client";

import { useState, useEffect, useCallback } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { fr } from "date-fns/locale";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate?: string;
}

interface Stage {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  price: number;
  type: string;
  moniteurs: Array<{ moniteur: { id: string; name: string; email: string } }>;
}

export interface StageBooking {
  id: string;
  type: string;
  customer: Customer;
  stage: Stage;
  orderItem: {
    id: string;
    depositAmount: number | null;
    remainingAmount: number | null;
    isFullyPaid: boolean;
    totalPrice: number;
    order: { orderNumber: string; status: string; totalAmount: number };
  };
}

export interface ReservationsData {
  stageBookings: StageBooking[];
  period: { month: number; year: number; startDate: string; endDate: string };
}

export interface TodayData {
  stageBookings: StageBooking[];
  date: string;
}

interface UseReservationsDataReturn {
  reservationsData: ReservationsData | null;
  todayData: TodayData | null;
  loading: boolean;
  currentDate: Date;
  headerLabel: string;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
  refreshAll: () => void;
}

export function useReservationsData(): UseReservationsDataReturn {
  const [reservationsData, setReservationsData] = useState<ReservationsData | null>(null);
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchReservations = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const response = await fetch(`/api/reservations?month=${month}&year=${year}`);
      const result = await response.json();
      if (result.success) {
        setReservationsData(result.data as ReservationsData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTodayReservations = useCallback(async () => {
    try {
      const response = await fetch("/api/reservations/today");
      const result = await response.json();
      if (result.success) {
        setTodayData(result.data as TodayData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réservations du jour:", error);
    }
  }, []);

  useEffect(() => {
    fetchTodayReservations();
    fetchReservations(currentDate);
  }, [currentDate, fetchReservations, fetchTodayReservations]);

  const refreshAll = useCallback(() => {
    fetchTodayReservations();
    fetchReservations(currentDate);
  }, [currentDate, fetchReservations, fetchTodayReservations]);

  const handlePreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  const headerLabel = format(currentDate, "MMMM yyyy", { locale: fr });

  return {
    reservationsData,
    todayData,
    loading,
    currentDate,
    headerLabel,
    handlePreviousMonth,
    handleNextMonth,
    refreshAll,
  };
}
