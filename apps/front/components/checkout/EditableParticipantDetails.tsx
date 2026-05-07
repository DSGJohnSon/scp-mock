import { User, Mail, Phone, Weight, Ruler, Calendar, Edit2, Save, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParticipantEdit } from "@/hooks/useParticipantEdit";
import type { ParticipantData } from "@/hooks/useParticipantEdit";

interface EditableParticipantDetailsProps {
  participantData: ParticipantData;
  type: string;
  itemId: string;
  onUpdate: () => void;
}

export function EditableParticipantDetails({
  participantData,
  type: _type,
  itemId,
  onUpdate,
}: EditableParticipantDetailsProps) {
  const {
    isEditing,
    setIsEditing,
    isSaving,
    register,
    handleSubmit,
    errors,
    onSubmit,
    handleCancel,
    formatBirthDate,
  } = useParticipantEdit({ participantData, itemId, onUpdate });

  if (isEditing) {
    return (
      <Card className="bg-white border-blue-200">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Modifier les informations
              </h4>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-xs">Prénom *</Label>
                <Input
                  id="firstName"
                  {...register("firstName", { required: "Prénom requis" })}
                  className="h-9 text-sm"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName" className="text-xs">Nom *</Label>
                <Input
                  id="lastName"
                  {...register("lastName", { required: "Nom requis" })}
                  className="h-9 text-sm"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-xs">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email requis" })}
                  className="h-9 text-sm"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs">Téléphone *</Label>
                <Input
                  id="phone"
                  {...register("phone", { required: "Téléphone requis" })}
                  className="h-9 text-sm"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="weight" className="text-xs">Poids (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  {...register("weight", {
                    required: "Poids requis",
                    min: { value: 20, message: "Poids minimum 20kg" },
                    max: { value: 120, message: "Poids maximum 120kg" },
                  })}
                  className="h-9 text-sm"
                />
                {errors.weight && (
                  <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="height" className="text-xs">Taille (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  {...register("height", {
                    required: "Taille requise",
                    min: { value: 120, message: "Taille minimum 120cm" },
                    max: { value: 220, message: "Taille maximum 220cm" },
                  })}
                  className="h-9 text-sm"
                />
                {errors.height && (
                  <p className="text-red-500 text-xs mt-1">{errors.height.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="birthDate" className="text-xs">Date de naissance</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register("birthDate")}
                  className="h-9 text-sm"
                />
                {errors.birthDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
            Informations du participant
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Modifier
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Nom complet</p>
              <p className="font-medium text-slate-800">
                {participantData.firstName} {participantData.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium text-slate-800 break-all">
                {participantData.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Téléphone</p>
              <p className="font-medium text-slate-800">
                {participantData.phone}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Weight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Poids</p>
              <p className="font-medium text-slate-800">
                {participantData.weight} kg
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Ruler className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Taille</p>
              <p className="font-medium text-slate-800">
                {participantData.height} cm
              </p>
            </div>
          </div>

          {participantData.birthDate && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Date de naissance</p>
                <p className="font-medium text-slate-800">
                  {formatBirthDate(participantData.birthDate)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
