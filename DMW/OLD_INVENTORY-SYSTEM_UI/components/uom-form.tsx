
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Uom } from "@/types";

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

const formSchema = z.object({
  name: z.string().min(1, { message: "UOM name is required." }),
  abbreviation: z.string().min(1, { message: "Abbreviation is required." }),
});

type UomFormValues = z.infer<typeof formSchema>;

interface UomFormProps {
  uom: Uom | null;
  onSubmit: (data: UomFormValues, id?: string) => void;
  onCancel: () => void;
}

export function UomForm({ uom, onSubmit, onCancel }: UomFormProps) {
  const form = useForm<UomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: uom
      ? {
          name: uom.name,
          abbreviation: uom.abbreviation,
        }
      : {
          name: "",
          abbreviation: "",
        },
  });

  const handleSubmit = (data: UomFormValues) => {
    onSubmit(data, uom?.id);
  };

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Piece" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="abbreviation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Abbreviation</FormLabel>
              <FormControl>
                <Input placeholder="e.g., pc" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            {uom ? "Save Changes" : "Add UOM"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
