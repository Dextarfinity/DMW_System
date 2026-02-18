

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import type { PurchaseOrder, Supplier, FundCluster, ProcurementMode, Item, ItemCategory } from "@/types";
import { cn, toDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo } from "react";
import { Separator } from "./ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LoadingOverlay } from "./loading-overlay";

const poItemSchema = z.object({
    itemId: z.string().min(1, "Item selection is required."),
    description: z.string().min(1, "Description is required."),
    quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0."),
    uom: z.string().min(1, "UOM is required."),
    unitCost: z.coerce.number().min(0.01, "Unit Cost must be greater than 0."),
    totalCost: z.number().optional(),
    category: z.enum(["Expendable", "Semi-Expendable", "Capital Outlay"]),
});

const formSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required."),
  poNumber: z.string().min(1, "P.O. No. is required."),
  poDate: z.date({ required_error: "P.O. Date is required."}),
  modeOfProcurement: z.string().min(1, "Mode of Procurement is required."),
  obrNo: z.string().optional(),
  fundCluster: z.string().min(1, "Fund Cluster is required."),
  placeOfDelivery: z.string().min(1, "Place of Delivery is required."),
  dateOfDelivery: z.date({ required_error: "Date of Delivery is required." }),
  deliveryTerm: z.string().min(1, "Delivery Term is required."),
  paymentTerm: z.string().min(1, "Payment Term is required."),
  purpose: z.string().min(1, "Purpose is required."),
  address: z.string().optional(),
  tin: z.string().optional(),
  items: z.array(poItemSchema).min(1, "At least one item is required."),
});

export type PurchaseOrderFormValues = z.infer<typeof formSchema>;

interface PurchaseOrderFormProps {
  purchaseOrder: PurchaseOrder | null;
  suppliers: Supplier[];
  fundClusters: FundCluster[];
  procurementModes: ProcurementMode[];
  items: Item[];
  onSubmit: (data: PurchaseOrderFormValues, id?: string, status?: PurchaseOrder['status']) => void;
  onCancel: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

export function PurchaseOrderForm({ purchaseOrder, suppliers, fundClusters, procurementModes, items, onSubmit, onCancel }: PurchaseOrderFormProps) {
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: purchaseOrder
      ? {
          ...purchaseOrder,
          poDate: toDate(purchaseOrder.poDate) ?? undefined,
          dateOfDelivery: toDate(purchaseOrder.dateOfDelivery) ?? undefined,
          address: suppliers.find(s => s.id === purchaseOrder.supplierId)?.address || "",
          tin: suppliers.find(s => s.id === purchaseOrder.supplierId)?.tin || "",
        }
      : {
          supplierId: "",
          poNumber: "",
          poDate: new Date(),
          modeOfProcurement: "",
          obrNo: "",
          fundCluster: "",
          placeOfDelivery: "DMW-CARAGA, Butuan City",
          dateOfDelivery: new Date(),
          deliveryTerm: "30 days",
          paymentTerm: "30 days",
          purpose: "",
          address: "",
          tin: "",
          items: [{ itemId: "", description: "", quantity: 1, uom: "", unitCost: 0, category: 'Expendable' }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const watchedItems = useWatch({ control: form.control, name: 'items' });

  const grandTotal = useMemo(() => {
    return (watchedItems || []).reduce((total, item) => {
        const itemTotal = (item.quantity || 0) * (item.unitCost || 0);
        return total + itemTotal;
    }, 0);
  }, [watchedItems]);


  const selectedSupplierId = form.watch("supplierId");

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.description.localeCompare(b.description));
  }, [items]);
  
  useEffect(() => {
    const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
    if (selectedSupplier) {
      form.setValue("address", selectedSupplier.address);
      form.setValue("tin", selectedSupplier.tin || "");
    }
  }, [selectedSupplierId, suppliers, form]);

  useEffect(() => {
    if (purchaseOrder) {
      form.reset({
        ...purchaseOrder,
        poDate: toDate(purchaseOrder.poDate) ?? undefined,
        dateOfDelivery: toDate(purchaseOrder.dateOfDelivery) ?? undefined,
        address: suppliers.find(s => s.id === purchaseOrder.supplierId)?.address || "",
        tin: suppliers.find(s => s.id === purchaseOrder.supplierId)?.tin || "",
      });
    }
  }, [purchaseOrder, suppliers, form]);


  const handleSave = (status: PurchaseOrder['status']) => (data: PurchaseOrderFormValues) => {
    onSubmit(data, purchaseOrder?.id, status);
  };
  
  const currentStatus = purchaseOrder?.status;
  const isLocked = currentStatus === 'Delivered' || currentStatus === 'Completed';

  return (
    <Form {...(form as any)}>
      {form.formState.isSubmitting && <LoadingOverlay />}
      <form className="space-y-6">
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">PURCHASE ORDER</CardTitle>
                <FormDescription>DMW-CARAGA</FormDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="supplierId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Supplier</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLocked}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select supplier" />
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
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Supplier address" {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>TIN</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Supplier TIN" {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="fundCluster"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Fund Cluster</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLocked}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select cluster" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {fundClusters.map((fc) => (
                                        <SelectItem key={fc.id} value={fc.name}>
                                        {fc.name}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Right Column */}
                    <div className="space-y-4">
                         <FormField
                            control={form.control}
                            name="poNumber"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>P.O. No.</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter P.O. Number" {...field} disabled={isLocked} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="poDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                        disabled={isLocked}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(toDate(field.value)!, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={toDate(field.value) ?? undefined} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="modeOfProcurement"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Mode of Procurement</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLocked}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select mode" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {procurementModes.map((m) => (
                                        <SelectItem key={m.id} value={m.name}>
                                        {m.name}
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
                            name="obrNo"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>OBR No./BUR No.</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter OBR/BUR Number" {...field} disabled={isLocked}/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                     <FormField
                        control={form.control}
                        name="placeOfDelivery"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Place of Delivery</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isLocked} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="dateOfDelivery"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Date of Delivery</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                    disabled={isLocked}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(toDate(field.value)!, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={toDate(field.value) ?? undefined} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="deliveryTerm"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Delivery Term</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isLocked}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="paymentTerm"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Payment Term</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isLocked}/>
                            </FormControl>
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
                            <Textarea placeholder="Describe the purpose of this purchase order" {...field} disabled={isLocked}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-2/5">Item Description</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>UOM</TableHead>
                                <TableHead>Unit Cost</TableHead>
                                <TableHead className="text-right">Total Cost</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => {
                                const quantity = watchedItems?.[index]?.quantity || 0;
                                const unitCost = watchedItems?.[index]?.unitCost || 0;
                                const totalCost = quantity * unitCost;
                                return (
                                <TableRow key={field.id}>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.itemId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Select onValueChange={(value) => {
                                                            field.onChange(value)
                                                            const selectedItem = items.find(item => item.id === value);
                                                            if (selectedItem) {
                                                                form.setValue(`items.${index}.description`, selectedItem.description);
                                                                form.setValue(`items.${index}.uom`, selectedItem.unit);
                                                                form.setValue(`items.${index}.category`, selectedItem.category);
                                                            }
                                                        }} defaultValue={field.value} disabled={isLocked}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select an item" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {sortedItems.map((item) => (
                                                                    <SelectItem key={item.id} value={item.id}>
                                                                        {item.description}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} disabled={isLocked}/>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.uom`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="pc" {...field} disabled />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unitCost`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0.00" {...field} disabled={isLocked}/>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(totalCost)}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => remove(index)} disabled={isLocked}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
                {!isLocked && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="mt-4" 
                        onClick={() => append({ itemId: "", description: "", quantity: 1, uom: "", unitCost: 0, totalCost: 0, category: 'Expendable' })}
                        disabled={isLocked}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                )}
                <div className="text-right text-lg font-bold mt-4">
                    Grand Total: {formatCurrency(grandTotal)}
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {isLocked ? 'Close' : 'Cancel'}
          </Button>
           {(currentStatus === 'Draft' || !purchaseOrder) && !isLocked && (
                 <Button type="button" variant="secondary" onClick={form.handleSubmit(handleSave('Draft'))} disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save as Draft"}
                </Button>
            )}
            {!isLocked && (
                <Button type="button" onClick={form.handleSubmit(handleSave('Pending'))} disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : (currentStatus === 'Draft' || !purchaseOrder ? 'Save & Post' : 'Save Changes & Re-post')}
                </Button>
            )}
        </div>
      </form>
    </Form>
  );
}
