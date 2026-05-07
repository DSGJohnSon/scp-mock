"use client";

import { useState, useEffect } from "react";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import type { CartItem } from "@/lib/types/cart";

export function useCartItems() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCartItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCartItems = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsUpdating(true);
      }
      const sessionId = SessionManager.getOrCreateSessionId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`,
        {
          headers: {
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setCartItems(data.data.items);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger votre panier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur chargement panier:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement du panier",
        variant: "destructive",
      });
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setIsUpdating(false);
      }
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const sessionId = SessionManager.getOrCreateSessionId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Article supprimé",
          description: "L'article a été retiré de votre panier",
        });
        loadCartItems(true);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur suppression item:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (item: CartItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToDelete) return;
    await removeItem(itemToDelete.id);
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const toggleExpanded = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return {
    cartItems,
    loading,
    isUpdating,
    loadCartItems,
    removeItem,
    handleDeleteClick,
    confirmRemoveItem,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    itemToDelete,
    expandedDetails,
    toggleExpanded,
  };
}
