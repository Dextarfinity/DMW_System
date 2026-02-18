
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { InspectionAcceptanceReport, PurchaseOrder, Supplier, IARItem } from "@/types";
import { cn } from "@/lib/utils";
import { toDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Separator } from "./ui/separator";
import { LoadingOverlay } from "./loading-overlay";

const iarItemSchema = z.object({
    itemId: z.string().min(1),
    generatedItemId: z.string().optional(),
    description: z.string(),
    quantity: z.number(),
    uom: z.string(),
    unitCost: z.number(),
    totalCost: z.number(),
    inventoryNo: z.string().optional(),
    serialNo: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    remarks: z.string().optional(),
    ppeNo: z.string().optional(),
    category: z.enum(["Expendable", "Semi-Expendable", "Capital Outlay"]),
});

const formSchema = z.object({
  supplierName: z.string().min(1, { message: "Supplier is required." }),
  poNumber: z.string().min(1, { message: "PO Number is required." }),
  supplierId: z.string().optional(),
  poId: z.string().optional(),
  iarNumber: z.string().min(1, { message: "IAR Number is required." }),
  iarDate: z.date({ required_error: "IAR Date is required." }),
  invoiceNumber: z.string().min(1, { message: "Invoice Number is required." }),
  invoiceDate: z.date({ required_error: "Invoice Date is required." }),
  purpose: z.string().min(1, "Purpose is required."),
  items: z.array(iarItemSchema).min(1, { message: "At least one item is required." }),
});

export type IARFormValues = z.infer<typeof formSchema>;

interface IARFormProps {
  iar: InspectionAcceptanceReport | null;
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  onSubmit: (data: IARFormValues, id?: string) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  isSubmitting?: boolean;
}

const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return '₱0.00';
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
};

export function IARForm({ iar, purchaseOrders, suppliers, onSubmit, onCancel, isEditMode = false, isSubmitting = false }: IARFormProps) {
  const form = useForm<IARFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: iar
        ? {
            ...iar,
            iarDate: toDate(iar.iarDate) ?? undefined,
            invoiceDate: toDate(iar.invoiceDate) ?? undefined,
            items: iar.items.map(item => ({
              ...item,
              generatedItemId: item.generatedItemId || "",
              ppeNo: item.ppeNo || "",
              inventoryNo: item.inventoryNo || "",
              brand: item.brand || "",
              model: item.model || "",
              serialNo: item.serialNo || "",
              remarks: item.remarks || ""
            })),
          }
        : {
            supplierId: "",
            poId: "",
            supplierName: "",
            poNumber: "",
            iarNumber: "",
            iarDate: new Date(),
            invoiceNumber: "",
            invoiceDate: new Date(),
            purpose: "",
            items: [],
          },
  });
  
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'items'
  });
  
  useEffect(() => {
    form.register("supplierName", { required: true });
    form.register("poNumber", { required: true });
  }, [form]);

  useEffect(() => {
    if (isEditMode && iar) {
        form.reset({
            ...iar,
            supplierName: iar.supplierName || "",
            poNumber: iar.poNumber || "",
            iarDate: toDate(iar.iarDate) ?? undefined,
            invoiceDate: toDate(iar.invoiceDate) ?? undefined,
            items: iar.items.map(item => ({
              ...item,
              generatedItemId: item.generatedItemId || "",
              ppeNo: item.ppeNo || "",
              inventoryNo: item.inventoryNo || "",
              brand: item.brand || "",
              model: item.model || "",
              serialNo: item.serialNo || "",
              remarks: item.remarks || ""
            })),
        });
        // Programmatically trigger validation after resetting the form
        form.trigger();
    }
  }, [iar, form, isEditMode]);


  const watchedItems = useWatch({ control: form.control, name: 'items' });
  const grandTotal = useMemo(() => {
    return (watchedItems || []).reduce((total, item) => total + (item.totalCost || 0), 0);
  }, [watchedItems]);

  const selectedSupplierId = useWatch({ control: form.control, name: 'supplierId'});
  const selectedPoId = useWatch({ control: form.control, name: 'poId'});

  const availablePOs = useMemo(() => {
      if (!selectedSupplierId) return [];
      if (isEditMode) {
        return purchaseOrders.filter(po => po.supplierId === selectedSupplierId);
      }
      const usedPoIds = new Set();
      return purchaseOrders.filter(po => po.supplierId === selectedSupplierId && (po.status === 'Delivered' || po.status === 'Processing') && !usedPoIds.has(po.id));
  }, [selectedSupplierId, purchaseOrders, isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
        const po = purchaseOrders.find(p => p.id === selectedPoId);
        if (po) {
            form.setValue('purpose', po.purpose);
            const supplier = suppliers.find(s => s.id === po.supplierId);
            if (supplier) {
                form.setValue('supplierName', supplier.name);
            }
            form.setValue('poNumber', po.poNumber);
            replace(po.items.map(item => ({...item, generatedItemId: ''})));
        } else {
            form.setValue('purpose', '');
            form.setValue('supplierName', '');
            form.setValue('poNumber', '');
            replace([]);
        }
    }
  }, [selectedPoId, purchaseOrders, suppliers, form, replace, isEditMode]);


  const handleSubmit = (data: IARFormValues) => {
    onSubmit(data, iar?.id);
  };
  
  const isAcceptButtonDisabled = !form.formState.isValid || isSubmitting || iar?.status !== 'Pending';

  return (
    <Form {...(form as unknown as UseFormReturn<any>)}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditMode ? (
              <>
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <Input {...form.register("supplierName")} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormItem>
                  <FormLabel>PO Number</FormLabel>
                  <FormControl>
                    <Input {...form.register("poNumber")} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </>
            ) : (
              <>
                <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('poId', ''); // Reset PO selection
                        }} value={field.value} disabled={!suppliers.length}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {suppliers.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                {s.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="poId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>PO Number</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!availablePOs.length}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a PO Number" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {availablePOs.map((po) => (
                                <SelectItem key={po.id} value={po.id}>
                                {po.poNumber}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </>
            )}
             <FormField
              control={form.control}
              name="iarNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IAR Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter IAR Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="iarDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>IAR Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                            >
                            {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Invoice Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Invoice Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                            >
                            {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Purpose from PO" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <Separator />

        <Card>
            <CardHeader>
                <CardTitle>Items Received</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>IAR Item ID</TableHead>
                                <TableHead className="min-w-[200px]">Description</TableHead>
                                <TableHead className="text-center w-[80px]">Qty</TableHead>
                                <TableHead className="text-center w-[80px]">Unit</TableHead>
                                <TableHead className="text-right w-[120px]">Cost</TableHead>
                                <TableHead className="text-right w-[120px]">Total</TableHead>
                                <TableHead className="w-[150px]">PPE No.</TableHead>
                                <TableHead className="w-[150px]">Inventory No.</TableHead>
                                <TableHead className="w-[150px]">Brand</TableHead>
                                <TableHead className="w-[150px]">Model</TableHead>
                                <TableHead className="w-[150px]">Serial No.</TableHead>
                                <TableHead className="min-w-[200px]">Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <input type="hidden" {...form.register(`items.${index}.itemId`)} />
                                    <input type="hidden" {...form.register(`items.${index}.category`)} />
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.generatedItemId`}
                                            render={({ field }) => (
                                                <Input {...field} value={field.value || ''} disabled placeholder="-" />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>{field.description}</TableCell>
                                    <TableCell className="text-center">{field.quantity}</TableCell>
                                    <TableCell className="text-center">{field.uom}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(field.unitCost)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(field.totalCost)}</TableCell>
                                    <TableCell>
                                        <FormField control={form.control} name={`items.${index}.ppeNo`} render={({ field: formField }) => (<Input {...formField} value={formField.value || ''} disabled />)} />
                                    </TableCell>
                                    <TableCell>
                                        <FormField control={form.control} name={`items.${index}.inventoryNo`} render={({ field: formField }) => (<Input {...formField} value={formField.value || ''} disabled />)} />
                                    </TableCell>
                                     <TableCell>
                                        <FormField control={form.control} name={`items.${index}.brand`} render={({ field: formField }) => (<Input {...formField} value={formField.value || ''} disabled={field.category === "Expendable"} />)} />
                                    </TableCell>
                                    <TableCell>
                                        <FormField control={form.control} name={`items.${index}.model`} render={({ field: formField }) => (<Input {...formField} value={formField.value || ''} disabled={field.category === "Expendable"}/>)} />
                                    </TableCell>
                                     <TableCell>
                                        <FormField control={form.control} name={`items.${index}.serialNo`} render={({ field: formField }) => (<Input {...formField} value={formField.value || ''} disabled={field.category === "Expendable"}/>)} />
                                    </TableCell>
                                    <TableCell>
                                        <FormField control={form.control} name={`items.${index}.remarks`} render={({ field: formField }) => (<Input {...formField} value={formField.value || ''} />)} />
                                    </TableCell>
                                </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="text-right text-lg font-bold mt-4">
                    Grand Total: {formatCurrency(grandTotal)}
                </div>
            </CardContent>
        </Card>


        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {isEditMode ? (
             <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isAcceptButtonDisabled}>
                {isSubmitting ? "Accepting..." : "Accept Items"}
             </Button>
          ) : (
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!form.formState.isValid || isSubmitting}>
                {isSubmitting ? "Creating..." : "Create IAR"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
