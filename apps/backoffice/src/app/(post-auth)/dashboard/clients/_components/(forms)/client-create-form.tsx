"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { AddClientSchema } from "@/features/clients/schemas";
import { useCreateClient } from "@/features/clients/api/use-create-client";

interface ClientCreateFormProps {
  onSuccess: () => void;
}

export function ClientCreateForm({ onSuccess }: ClientCreateFormProps) {
  const createClient = useCreateClient();

  const form = useForm<z.infer<typeof AddClientSchema>>({
    resolver: zodResolver(AddClientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      country: "",
    },
  });

  const handleAutoFill = () => {
    const v = form.getValues();
    if (!v.firstName) form.setValue("firstName", "n/a");
    if (!v.lastName) form.setValue("lastName", "n/a");
    if (!v.phone) form.setValue("phone", "+330000000000");
    if (!v.address) form.setValue("address", "n/a");
    if (!v.postalCode) form.setValue("postalCode", "n/a");
    if (!v.city) form.setValue("city", "n/a");
    if (!v.country) form.setValue("country", "n/a");
  };

  function onSubmit(values: z.infer<typeof AddClientSchema>) {
    createClient.mutate(values, {
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
                  <Input type="email" placeholder="jean.dupont@email.com" {...field} />
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="123 Rue de la Paix" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code Postal</FormLabel>
                <FormControl>
                  <Input placeholder="75000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input placeholder="Paris" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pays</FormLabel>
              <FormControl>
                <Input placeholder="France" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAutoFill}
            disabled={createClient.isPending}
          >
            Remplir les champs vides
          </Button>
          <Button type="submit" disabled={createClient.isPending}>
            {createClient.isPending ? "Création…" : "Créer le client"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
