
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import type { SettingsCounters } from "@/types";
import { format, parse } from "date-fns";
import { LoadingOverlay } from "@/components/loading-overlay";
import { useEffect } from 'react';

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
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  tripTicketCounters: z.array(z.object({
    yearMonth: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"),
    count: z.coerce.number().int().min(0, "Count must be a non-negative integer."),
  })).optional(),
  generatedItemIdCounter: z.coerce.number().int().min(0, "Count must be a non-negative integer.").optional(),
  ppeCounter: z.coerce.number().int().min(0, "Count must be a non-negative integer.").optional(),
  inventoryCounter: z.coerce.number().int().min(0, "Count must be a non-negative integer.").optional(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
  settings: SettingsCounters | null;
  onSubmit: (data: Partial<Omit<SettingsCounters, 'id'>>) => Promise<void>;
}

export function SettingsForm({ settings, onSubmit }: SettingsFormProps) {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tripTicketCounters",
  });
  
  useEffect(() => {
    if (settings) {
        form.reset({
            tripTicketCounters: settings.counters
            ? Object.entries(settings.counters)
                .map(([yearMonth, count]) => ({ yearMonth, count }))
                .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
            : [],
            generatedItemIdCounter: settings.generatedItemIdCounter ?? 0,
            ppeCounter: settings.ppeCounters ? Object.values(settings.ppeCounters).reduce((a, b) => a + b, 0) : 0, // Simplified for now
            inventoryCounter: settings.inventoryCounters ? Object.values(settings.inventoryCounters).reduce((a, b) => a + b, 0) : 0, // Simplified for now
        });
    }
  }, [settings, form]);


  const handleSubmit = async (data: SettingsFormValues) => {
     const countersRecord = data.tripTicketCounters?.reduce((acc, current) => {
      acc[current.yearMonth] = current.count;
      return acc;
    }, {} as Record<string, number>);

    // Note: This form doesn't support editing the complex map counters for ppe/inventory yet.
    // It will only save the simple counters.
    const dataToSubmit: Partial<SettingsCounters> = {
        counters: countersRecord,
        generatedItemIdCounter: data.generatedItemIdCounter,
    };

    await onSubmit(dataToSubmit);
  };

  return (
    <Form {...(form as any)}>
      {form.formState.isSubmitting && <LoadingOverlay />}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <h3 className="text-lg font-medium">Global Item Counters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <FormField
                control={form.control}
                name="generatedItemIdCounter"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Generated Item ID</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="ppeCounter"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>PPE No.</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="inventoryCounter"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Inventory No.</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <Separator />

        <h3 className="text-lg font-medium">Trip Ticket Counters</h3>
        <div className="space-y-4">
            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-3 gap-4 items-end">
                     <FormField
                        control={form.control}
                        name={`tripTicketCounters.${index}.yearMonth`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Month</FormLabel>
                                <FormControl>
                                    <Input type="month" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`tripTicketCounters.${index}.count`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Used No.</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            ))}
        </div>
        
        <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
