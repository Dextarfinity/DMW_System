
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { PropertyTransferReport, Employee } from "@/types";
import { cn, toDate } from "@/lib/utils";
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
import { useEffect } from "react";
import { LoadingOverlay } from "./loading-overlay";


const formSchema = z.object({
  date: z.date({ required_error: "PTR Date is required." }),
  ptrNo: z.string().min(1, { message: "PTR Number is required." }),
  fromAccountableOfficerId: z.string().min(1, { message: "From Accountable Officer is required." }),
  toAccountableOfficerId: z.string().min(1, { message: "To Accountable Officer is required." }),
  status: z.enum(["Pending", "Completed", "Cancelled"]),
});


export type PtrFormValues = z.infer<typeof formSchema>;

interface PtrFormProps {
  ptr: PropertyTransferReport | null;
  employees: Employee[];
  onSubmit: (data: PtrFormValues, id?: string) => void;
  onCancel: () => void;
}

export function PtrForm({ ptr, employees, onSubmit, onCancel }: PtrFormProps) {
  const form = useForm<PtrFormValues>({
    resolver: zodResolver(formSchema),
     defaultValues: {
      date: ptr?.date ? toDate(ptr.date) ?? new Date() : new Date(),
      ptrNo: ptr?.ptrNo || "",
      fromAccountableOfficerId: ptr?.fromAccountableOfficerId || "",
      toAccountableOfficerId: ptr?.toAccountableOfficerId || "",
      status: ptr?.status || "Pending",
    },
  });

  useEffect(() => {
     form.reset({
      date: ptr?.date ? toDate(ptr.date) ?? new Date() : new Date(),
      ptrNo: ptr?.ptrNo || "",
      fromAccountableOfficerId: ptr?.fromAccountableOfficerId || "",
      toAccountableOfficerId: ptr?.toAccountableOfficerId || "",
      status: ptr?.status || "Pending",
    });
  }, [ptr, form]);

  const handleSubmit = (data: PtrFormValues) => {
    onSubmit(data, ptr?.id);
  };

  return (
    <Form {...form as any}>
      {form.formState.isSubmitting && <LoadingOverlay />}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(toDate(field.value)!, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={toDate(field.value) ?? undefined}
                        onSelect={field.onChange}
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
              name="ptrNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PTR Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PTR-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="fromAccountableOfficerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accountable officer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
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
              name="toAccountableOfficerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accountable officer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
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
              name="status"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Status</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : (ptr ? "Save Changes" : "Add PTR")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
