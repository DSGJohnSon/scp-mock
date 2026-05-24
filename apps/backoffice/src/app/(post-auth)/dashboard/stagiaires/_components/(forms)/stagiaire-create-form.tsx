"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AddStagiaireSchema } from "@/features/stagiaires/schemas";
import { useCreateStagiaire } from "@/features/stagiaires/api/use-create-stagiaire";

interface StagiaireCreateFormProps {
  onSuccess: () => void;
}

export function StagiaireCreateForm({ onSuccess }: StagiaireCreateFormProps) {
  const createStagiaire = useCreateStagiaire();

  const form = useForm<z.infer<typeof AddStagiaireSchema>>({
    resolver: zodResolver(AddStagiaireSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      height: 0,
      weight: 0,
    },
  });

  const handleAutoFill = () => {
    const v = form.getValues();
    if (!v.firstName) form.setValue("firstName", "n/a");
    if (!v.lastName) form.setValue("lastName", "n/a");
    if (!v.phone) form.setValue("phone", "+330000000000");
    if (!v.birthDate) form.setValue("birthDate", new Date("2000-01-01"));
    if (!v.height || v.height === 0) form.setValue("height", 1);
    if (!v.weight || v.weight === 0) form.setValue("weight", 1);
  };

  function onSubmit(values: z.infer<typeof AddStagiaireSchema>) {
    createStagiaire.mutate(values, {
      onSuccess: (response) => {
        if (response?.success) {
          form.reset();
          onSuccess();
        }
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Jean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jean.dupont@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="06 12 34 56 78" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de naissance</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const date = e.target.valueAsDate;
                    if (date) field.onChange(date);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taille (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="175"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poids (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="70"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAutoFill}
            disabled={createStagiaire.isPending}
          >
            Remplir les champs vides
          </Button>
          <Button type="submit" disabled={createStagiaire.isPending}>
            {createStagiaire.isPending ? "Création…" : "Créer le stagiaire"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
