
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Employee } from "@/types";
import { useEffect } from "react";
import { LoadingOverlay } from "@/components/loading-overlay";

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
  name: z.string().min(1, { message: "Employee name is required." }),
});

export type EmployeeFormValues = z.infer<typeof formSchema>;

interface EmployeeFormProps {
  employee: Employee | null;
  onSubmit: (data: EmployeeFormValues, id?: string) => Promise<void>;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: employee ? { name: employee.name } : { name: "" },
  });

  useEffect(() => {
    form.reset(employee ? { name: employee.name } : { name: "" });
  }, [employee, form]);

  const handleSubmit = async (values: EmployeeFormValues) => {
    await onSubmit(values, employee?.id);
  };

  return (
    <Form {...(form as any)}>
      {form.formState.isSubmitting && <LoadingOverlay />}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : (employee ? "Save Changes" : "Add Employee")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
