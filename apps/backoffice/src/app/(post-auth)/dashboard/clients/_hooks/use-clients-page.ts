"use client";

import { useState } from "react";
import { AppClient } from "../_types";

export const useClientsPage = () => {
  const [selectedClient, setSelectedClient] = useState<AppClient | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const openDetail = (client: AppClient) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open) setSelectedClient(null);
  };

  return {
    selectedClient,
    isDetailOpen,
    isCreateOpen,
    setIsCreateOpen,
    openDetail,
    handleDetailOpenChange,
  };
};
