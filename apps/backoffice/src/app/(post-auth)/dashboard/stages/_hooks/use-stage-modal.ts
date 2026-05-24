"use client";

import { useState } from "react";
import { StageItem } from "../_types";

type ModalMode = "create" | "detail";

interface ModalState {
  isOpen: boolean;
  mode: ModalMode;
  selectedStage: StageItem | null;
  selectedDate: Date | null;
}

const CLOSED: ModalState = {
  isOpen: false,
  mode: "create",
  selectedStage: null,
  selectedDate: null,
};

export function useStageModal() {
  const [state, setState] = useState<ModalState>(CLOSED);

  const openCreate = (date?: Date) =>
    setState({ isOpen: true, mode: "create", selectedStage: null, selectedDate: date ?? null });

  const openDetail = (stage: StageItem) =>
    setState({ isOpen: true, mode: "detail", selectedStage: stage, selectedDate: null });

  const close = () => setState(CLOSED);

  return { ...state, openCreate, openDetail, close };
}
