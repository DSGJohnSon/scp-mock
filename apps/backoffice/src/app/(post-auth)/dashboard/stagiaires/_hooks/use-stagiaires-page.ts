"use client";

import { useState } from "react";
import { AppStagiaire } from "../_types";

export const useStagiairesPage = () => {
  const [selectedStagiaire, setSelectedStagiaire] =
    useState<AppStagiaire | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const openDetail = (stagiaire: AppStagiaire) => {
    setSelectedStagiaire(stagiaire);
    setIsDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open) setSelectedStagiaire(null);
  };

  return {
    selectedStagiaire,
    isDetailOpen,
    isCreateOpen,
    setIsCreateOpen,
    openDetail,
    handleDetailOpenChange,
  };
};
