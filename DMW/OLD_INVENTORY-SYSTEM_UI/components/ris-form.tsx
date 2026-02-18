"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PlusCircle, Trash2 } from "lucide-react";
import type { RequisitionIssueSlip, Office, Employee, Designation, SettingsCounters, IARItem } from "@/types";
import { cn, toDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormMessage,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const risItemSchema = z.object({
  itemId: z.string().min(1, { message: "Item is required." }),
  description: z.string(),
  uom: z.string(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

const formSchema = z.object({
  risNo: z.string(),
  risDate: z.date({ required_error: "RIS Date is required." }),
  division: z.string().min(1, "Division/Office is required."),
  purpose: z.string().optional(),
  items: z.array(risItemSchema).min(1, "At least one item must be requested."),
  requestedById: z.string().min(1),
  requestedByDesignation: z.string().min(1),
  approvedById: z.string().min(1),
  approvedByDesignation: z.string().min(1),
  issuedById: z.string().min(1),
  issuedByDesignation: z.string().min(1),
  receivedById: z.string().min(1),
  receivedByDesignation: z.string().min(1),
});

export type RISFormValues = z.infer<typeof formSchema>;

interface RISFormProps {
  ris: RequisitionIssueSlip | null;
  offices: Office[];
  employees: Employee[];
  designations: Designation[];
  expendableBatches: (IARItem & { iarId: string; iarNo: string; iarDate: Date | null })[];
  availableStock: Map<string, number>;
  settings: SettingsCounters | null;
  onSubmit: (data: RISFormValues, id?: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const generateRisNo = (settings: SettingsCounters | null, date: Date): string => {
  if (!settings) return "YYYY-0000";
  const year = date.getFullYear().toString();
  const risCounters = settings.risCounters || {};
  const nextCount = (risCounters[year] || 0) + 1;
  return `${year}-${String(nextCount).padStart(4, "0")}`;
};

export function RISForm({
  ris,
  offices,
  employees,
  designations,
  expendableBatches,
  availableStock,
  settings,
  onSubmit,
  onCancel,
  isSubmitting,
}: RISFormProps) {
  const form = useForm<RISFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      risNo: ris?.risNo ?? (settings ? generateRisNo(settings, new Date()) : ""),
      risDate: ris?.risDate ? toDate(ris.risDate) : new Date(),
      division: ris?.division ?? "",
      purpose: ris?.purpose ?? "",
      items: ris?.items?.length
        ? ris.items.map(i => ({ ...i }))
        : [],
      requestedById: ris?.requestedById ?? "",
      requestedByDesignation: ris?.requestedByDesignation ?? "",
      approvedById: ris?.approvedById ?? "",
      approvedByDesignation: ris?.approvedByDesignation ?? "",
      issuedById: ris?.issuedById ?? "",
      issuedByDesignation: ris?.issuedByDesignation ?? "",
      receivedById: ris?.receivedById ?? "",
      receivedByDesignation: ris?.receivedByDesignation ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  const acceptedItems = useMemo(() => {
    const itemsMap = new Map<string, { itemId: string; description: string; uom: string }>();
    expendableBatches.forEach(batch => {
      if (!itemsMap.has(batch.itemId)) {
        itemsMap.set(batch.itemId, {
          itemId: batch.itemId,
          description: batch.description,
          uom: batch.uom,
        });
      }
    });
    return Array.from(itemsMap.values()).sort((a,b) => a.description.localeCompare(b.description));
  }, [expendableBatches]);

  const handleSubmit = (data: RISFormValues) => {
    onSubmit(data, ris?.id);
  };

  return (
    <div className="h-full">
      <Form {...(form as unknown as UseFormReturn<any>)}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 h-full flex flex-col">
          <div className="overflow-y-auto pr-4 space-y-6">
            <Card>
              <CardHeader><CardTitle>Requisition Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="risNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RIS No.</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="risDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>RIS Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent 
                                className="w-auto p-0" 
                                align="start"
                                forceMount={true}
                                side="bottom"
                            >
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                if (date) field.onChange(date); // RHF updates
                                }}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                  <FormField
                    control={form.control}
                    name="division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Division/Office</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an office" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {offices.map((o) => (
                              <SelectItem key={o.id} value={o.name}>
                                {o.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Textarea placeholder="State the purpose of the requisition" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Items Requested</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-2/5">Item</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const selectedItemId = watchedItems[index]?.itemId;
                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.itemId`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      const selectedItem = acceptedItems.find((i) => i.itemId === value);
                                      form.setValue(`items.${index}.description`, selectedItem?.description || "");
                                      form.setValue(`items.${index}.uom`, selectedItem?.uom || "");
                                    }}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select an item" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {acceptedItems.map((i) => (
                                        <SelectItem key={i.itemId} value={i.itemId}>
                                          {i.description}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            {availableStock.get(selectedItemId) ?? 0}
                          </TableCell>
                          <TableCell>
                            <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </TableCell>
                          <TableCell>
                            <FormField control={form.control} name={`items.${index}.uom`} render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} readOnly />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1 && !ris}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                 <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ itemId: "", description: "", uom: "", quantity: 1 })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Signatories</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { by: "requestedById", designation: "requestedByDesignation", label: "Requested By" },
                  { by: "approvedById", designation: "approvedByDesignation", label: "Approved By" },
                  { by: "issuedById", designation: "issuedByDesignation", label: "Issued By" },
                  { by: "receivedById", designation: "receivedByDesignation", label: "Received By" },
                ].map((group) => (
                  <div key={group.by} className="space-y-4">
                    <FormField
                      control={form.control}
                      name={group.by as keyof RISFormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{group.label}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employee" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={group.designation as keyof RISFormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select designation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {designations.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
              {isSubmitting ? "Submitting..." : ris ? "Save Changes" : "Create & Post RIS"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
