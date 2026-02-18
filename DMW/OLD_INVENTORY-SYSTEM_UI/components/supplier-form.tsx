
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Supplier } from "@/types";

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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Supplier name is required." }),
    address: z.string().min(1, { message: "Address is required." }),
    orgType: z.enum(["Non-Government", "Government"], {
      required_error: "Organization type is required.",
    }),
    tin: z.string().optional(),
    taxType: z.enum(["VAT", "Non-VAT"], {
      required_error: "Tax type is required.",
    }),
  })
  .refine(
    (data) => {
      if (data.orgType === "Non-Government") {
        return !!data.tin && data.tin.length > 0;
      }
      return true;
    },
    {
      message: "TIN is required for Non-Government organizations.",
      path: ["tin"],
    }
  );

type SupplierFormValues = z.infer<typeof formSchema>;

interface SupplierFormProps {
  supplier: Supplier | null;
  onSubmit: (data: SupplierFormValues, id?: string) => void;
  onCancel: () => void;
}

export function SupplierForm({ supplier, onSubmit, onCancel }: SupplierFormProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: supplier
      ? {
          ...supplier,
        }
      : {
          name: "",
          address: "",
          orgType: "Non-Government",
          tin: "",
          taxType: "VAT",
        },
  });

  const orgType = form.watch("orgType");

  const handleSubmit = (data: SupplierFormValues) => {
    onSubmit(data, supplier?.id);
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
                <Input placeholder="e.g. ProTool Co." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter supplier address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="orgType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Organization Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Non-Government" />
                    </FormControl>
                    <FormLabel className="font-normal">Non-Government</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="Government" />
                    </FormControl>
                    <FormLabel className="font-normal">Government</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {orgType === "Non-Government" && (
          <FormField
            control={form.control}
            name="tin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TIN No.</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 000-000-000-000"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="taxType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={orgType === "Government"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="VAT">VAT</SelectItem>
                  <SelectItem value="Non-VAT">Non-VAT</SelectItem>
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
            {supplier ? "Save Changes" : "Add Supplier"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
