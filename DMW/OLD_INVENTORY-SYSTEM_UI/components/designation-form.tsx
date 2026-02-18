
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Designation } from "@/types";

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
  name: z.string().min(1, { message: "Designation name is required." }),
});

type DesignationFormValues = z.infer<typeof formSchema>;

interface DesignationFormProps {
  designation: Designation | null;
  onSubmit: (data: DesignationFormValues, id?: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function DesignationForm({ designation, onSubmit, onCancel, isSubmitting }: DesignationFormProps) {
  const form = useForm<DesignationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: designation
      ? {
          name: designation.name,
        }
      : {
          name: "",
        },
  });

  const handleSubmit = (data: DesignationFormValues) => {
    onSubmit(data, designation?.id);
  };

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Regional Director" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (designation ? "Save Changes" : "Add Designation")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
