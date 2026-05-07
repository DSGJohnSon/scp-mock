export function getBadgeVariant(status: string) {
  switch (status) {
    case "PAID":
    case "FULLY_PAID":
      return "default" as const;
    case "PARTIALLY_PAID":
    case "CONFIRMED":
      return "secondary" as const;
    case "PENDING":
    default:
      return "outline" as const;
  }
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PAID: "Payé",
    PARTIALLY_PAID: "Acompte payé",
    FULLY_PAID: "Entièrement payé",
    CONFIRMED: "Confirmé",
    PENDING: "En attente",
    SUCCEEDED: "Réussi",
    FAILED: "Échoué",
    CANCELLED: "Annulé",
    REFUNDED: "Remboursé",
  };
  return labels[status] ?? status;
}

export function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    AVENTURE: "Aventure",
    DUREE: "Durée",
    LONGUE_DUREE: "Longue Durée",
    ENFANT: "Enfant",
    HIVER: "Hiver",
    INITIATION: "Initiation",
    PROGRESSION: "Progression",
    AUTONOMIE: "Autonomie",
  };
  return labels[category] ?? category;
}

export function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "SUCCEEDED":
      return "default" as const;
    case "PENDING":
      return "secondary" as const;
    case "FAILED":
    case "CANCELLED":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    CARD: "Carte Bancaire",
    BANK_TRANSFER: "Virement",
    CASH: "Espèces",
    CHECK: "Chèque",
  };
  return labels[method] ?? method;
}
