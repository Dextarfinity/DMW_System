
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ProcurementMode } from "@/types";

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
  name: z.string().min(1, { message: "Mode of procurement name is required." }),
});

type ProcurementModeFormValues = z.infer<typeof formSchema>;

interface ProcurementModeFormProps {
  mode: ProcurementMode | null;
  onSubmit: (data: ProcurementModeFormValues, id?: string) => void;
  onCancel: () => void;
}

export function ProcurementModeForm({ mode, onSubmit, onCancel }: ProcurementModeFormProps) {
  const form = useForm<ProcurementModeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: mode
      ? { name: mode.name }
      : { name: "" },
  });

  const handleSubmit = (data: ProcurementModeFormValues) => {
    onSubmit(data, mode?.id);
  };

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mode Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Public Bidding" {...field} />
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
            {mode ? "Save Changes" : "Add Mode"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
