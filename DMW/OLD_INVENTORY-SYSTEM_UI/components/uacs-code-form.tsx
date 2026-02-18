
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { UacsCode, ItemCategory } from "@/types";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  code: z.string().min(1, { message: "UACS code is required." }),
  title: z.string().min(1, { message: "Title is required." }),
  category: z.enum(["Expendable", "Semi-Expendable", "Capital Outlay"], {
    required_error: "Category is required.",
  }),
});

type UacsCodeFormValues = z.infer<typeof formSchema>;

interface UacsCodeFormProps {
  code: UacsCode | null;
  onSubmit: (data: UacsCodeFormValues, id?: string) => void;
  onCancel: () => void;
}

const categories: ItemCategory[] = ["Expendable", "Semi-Expendable", "Capital Outlay"];

export function UacsCodeForm({ code, onSubmit, onCancel }: UacsCodeFormProps) {
  const form = useForm<UacsCodeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: code
      ? {
          code: code.code,
          title: code.title,
          category: code.category,
        }
      : {
          code: "",
          title: "",
          category: "Expendable",
        },
  });

  const handleSubmit = (data: UacsCodeFormValues) => {
    onSubmit(data, code?.id);
  };

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UACS Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 5020301000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Office Supplies Expense" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                        {category}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            {code ? "Save Changes" : "Add Code"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
