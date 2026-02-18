
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { ReceivedSemiExpendableItem, Employee, Designation } from "@/types";
import { cn, toDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { LoadingOverlay } from "./loading-overlay";

const formSchema = z.object({
  dateOfIssue: z.date({ required_error: "Date of Issue is required." }),
  otherInfo: z.string().optional(),
  receivedFromId: z.string().min(1, "Received From employee is required."),
  receivedFromPosition: z.string().min(1, "Received From position is required."),
  receivedById: z.string().min(1, "Received By employee is required."),
  receivedByPosition: z.string().min(1, "Received By position is required."),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNo: z.string().optional(),
});

export type IssueIcsFormValues = z.infer<typeof formSchema>;

interface IssueIcsFormProps {
  item: ReceivedSemiExpendableItem;
  employees: Employee[];
  designations: Designation[];
  onSubmit: (data: IssueIcsFormValues) => void;
  onCancel: () => void;
}

export function IssueIcsForm({ item, employees, designations, onSubmit, onCancel }: IssueIcsFormProps) {
  const form = useForm<IssueIcsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateOfIssue: new Date(),
      otherInfo: "",
      receivedFromId: "",
      receivedFromPosition: "",
      receivedById: "",
      receivedByPosition: "",
      brand: item.brand || "",
      model: item.model || "",
      serialNo: item.serialNo || "",
    },
  });

  return (
    <Form {...form as any}>
       {form.formState.isSubmitting && <LoadingOverlay message="Issuing Item..." />}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">{item.itemDescription.toUpperCase()}</CardTitle>
            <CardDescription>Issue this item by filling out the details below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>PPE No.</FormLabel>
                <FormControl>
                  <Input value={item.ppeNo} disabled />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Inventory No.</FormLabel>
                <FormControl>
                  <Input value={item.inventoryNo} disabled />
                </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="serialNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial No.</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter serial number" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter model" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfIssue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Issue</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="otherInfo"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Other Info (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter other relevant information..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <FormField
                control={form.control}
                name="receivedFromId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Received From</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an employee" />
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
                name="receivedFromPosition"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a position" />
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
                <FormField
                control={form.control}
                name="receivedById"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Received By</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an employee" />
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
                name="receivedByPosition"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a position" />
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
          </CardContent>
        </Card>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Confirm Issuance
          </Button>
        </div>
      </form>
    </Form>
  );
}
