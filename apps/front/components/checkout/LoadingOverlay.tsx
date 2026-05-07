"use client";

import { Loader2 } from "lucide-react";

export function LoadingOverlay({
  message = "Mise à jour en cours...",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4 max-w-sm mx-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-lg font-semibold text-gray-800">{message}</p>
        <p className="text-sm text-gray-600 text-center">
          Veuillez patienter...
        </p>
      </div>
    </div>
  );
}
