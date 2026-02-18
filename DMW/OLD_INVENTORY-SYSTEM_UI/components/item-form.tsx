
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { Item, Uom, UacsCode, ItemCategory } from "@/types";
import { useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  uacsCode: z.string().min(1, { message: "UACS Code is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  unit: z.string().min(1, { message: "Unit of Measurement is required." }),
  reorderPoint: z.coerce.number().min(0, { message: "Re-order point must be 0 or greater." }),
});

export type ItemFormValues = z.infer<typeof formSchema>;

interface ItemFormProps {
  item: Item | null;
  uoms: Uom[];
  uacsCodes: UacsCode[];
  onSubmit: (data: ItemFormValues, id?: string) => void;
  onCancel: () => void;
}

const categoryOrder: ItemCategory[] = ["Expendable", "Semi-Expendable", "Capital Outlay"];

export function ItemForm({ item, uoms, uacsCodes, onSubmit, onCancel }: ItemFormProps) {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: item
      ? {
          uacsCode: item.uacsCode,
          description: item.description,
          unit: item.unit,
          reorderPoint: item.reorderPoint,
        }
      : {
          uacsCode: "",
          description: "",
          unit: "",
          reorderPoint: 0,
        },
  });

  const selectedUacsCode = useWatch({
    control: form.control,
    name: 'uacsCode',
  });

  const category = uacsCodes.find(c => c.code === selectedUacsCode)?.category || "";

  useEffect(() => {
    if (item) {
        form.reset({
            uacsCode: item.uacsCode,
            description: item.description,
            unit: item.unit,
            reorderPoint: item.reorderPoint,
        });
    }
  }, [item, form]);
  
  const groupedUacsCodes = useMemo(() => {
    return uacsCodes.reduce((acc, code) => {
      const category = code.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(code);
      return acc;
    }, {} as Record<ItemCategory, UacsCode[]>);
  }, [uacsCodes]);


  const handleSubmit = (data: ItemFormValues) => {
    onSubmit(data, item?.id);
  };

  return (
    <Form {...(form as any)}>
      {form.formState.isSubmitting && <LoadingOverlay />}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="uacsCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UACS Code</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a UACS code" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {categoryOrder.map((category) => (
                        groupedUacsCodes[category] && (
                            <SelectGroup key={category}>
                                <SelectLabel>{category}</SelectLabel>
                                {groupedUacsCodes[category].map((code) => (
                                    <SelectItem key={code.id} value={code.code}>
                                        {code.code} - {code.title}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        )
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A more detailed description of the item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measurement (UOM)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a UOM" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {uoms.map((uom) => (
                    <SelectItem key={uom.id} value={uom.abbreviation}>
                      {uom.name} ({uom.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
                <Input value={category} disabled placeholder="Category will be set by UACS code" />
            </FormControl>
        </FormItem>
        <FormField
          control={form.control}
          name="reorderPoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Re-order Point</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
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
            {form.formState.isSubmitting ? "Saving..." : (item ? "Save Changes" : "Add Item")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
