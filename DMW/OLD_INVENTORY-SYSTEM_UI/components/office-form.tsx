
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Office } from "@/types";

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
  name: z.string().min(1, { message: "Office name is required." }),
});

type OfficeFormValues = z.infer<typeof formSchema>;

interface OfficeFormProps {
  office: Office | null;
  onSubmit: (data: OfficeFormValues, id?: string) => void;
  onCancel: () => void;
}

export function OfficeForm({ office, onSubmit, onCancel }: OfficeFormProps) {
  const form = useForm<OfficeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: office
      ? {
          name: office.name,
        }
      : {
          name: "",
        },
  });

  const handleSubmit = (data: OfficeFormValues) => {
    onSubmit(data, office?.id);
  };

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Office Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., FAD" {...field} />
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
            {office ? "Save Changes" : "Add Office"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
