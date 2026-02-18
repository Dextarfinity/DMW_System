
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Clock, PlusCircle, Trash2, Send } from "lucide-react";
import type { TripTicket, Office, Employee, Designation } from "@/types";
import { cn } from "@/lib/utils";
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
import { Separator } from "@/components/ui/separator";
import { Timestamp } from "firebase/firestore";
import { useEffect } from "react";

const formSchema = z.object({
  requestingParty: z.string().min(1, { message: "Requesting party is required." }),
  dateOfRequest: z.date({ required_error: "Date of request is required." }),
  dateOfTravel: z.date({ required_error: "Date of travel is required." }),
  returnDate: z.date({ required_error: "Return date is required." }),
  contactNo: z.string().min(1, { message: "Contact number is required." }),
  timeOfDeparture: z.string().min(1, { message: "Time of departure is required." }),
  purpose: z.string().min(1, { message: "Purpose of the trip is required." }),
  destination: z.string().min(1, { message: "Destination is required." }),
  passengers: z.array(z.object({ name: z.string().min(1, {message: "Passenger name is required."}) })).min(1, { message: "At least one passenger is required." }),
  requestedByEmployee: z.string().min(1, { message: "Requested by employee is required." }),
  requestedByDesignation: z.string().min(1, { message: "Requested by designation is required." }),
  approvedByEmployee: z.string().min(1, { message: "Approved by employee is required." }),
  approvedByDesignation: z.string().min(1, { message: "Approved by designation is required." }),
}).refine(data => data.dateOfTravel >= data.dateOfRequest, {
    message: "Date of travel must be on or after the date of request.",
    path: ["dateOfTravel"],
}).refine(data => data.returnDate >= data.dateOfTravel, {
    message: "Return date must be on or after the date of travel.",
    path: ["returnDate"],
});

export type TripTicketFormValues = z.infer<typeof formSchema>;

export interface TripTicketFormProps {
  ticket: TripTicket | null;
  onSave: (
    ticketData: Omit<TripTicket, "status" | "id" | "tripTicketNo">,
    id?: string
  ) => Promise<void>;
  onCancel: () => void;
  offices: Office[];
  employees: Employee[];
  designations: Designation[];
}

export function TripTicketForm({ ticket, onSave, onCancel, offices, employees, designations }: TripTicketFormProps) {
  const form = useForm<TripTicketFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: ticket
        ? {
          ...ticket,
          dateOfRequest: ticket.dateOfRequest ? (ticket.dateOfRequest as any).toDate() : new Date(),
          dateOfTravel: ticket.dateOfTravel ? (ticket.dateOfTravel as any).toDate() : new Date(),
          returnDate: ticket.returnDate ? (ticket.returnDate as any).toDate() : new Date(),
        }
        : {
          requestingParty: "",
          dateOfRequest: new Date(),
          dateOfTravel: new Date(),
          returnDate: new Date(),
          contactNo: "",
          timeOfDeparture: "",
          purpose: "",
          destination: "",
          passengers: [{ name: "" }],
          requestedByEmployee: "",
          requestedByDesignation: "",
          approvedByEmployee: "",
          approvedByDesignation: "",
        },
  });

  useEffect(() => {
    if (ticket) {
      form.reset({
        ...ticket,
        dateOfRequest: ticket.dateOfRequest ? (ticket.dateOfRequest as any).toDate() : new Date(),
        dateOfTravel: ticket.dateOfTravel ? (ticket.dateOfTravel as any).toDate() : new Date(),
        returnDate: ticket.returnDate ? (ticket.returnDate as any).toDate() : new Date(),
      });
    }
  }, [ticket, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "passengers",
  });

  const handleSubmit = (data: TripTicketFormValues) => {
    const submissionData = {
        ...data,
        dateOfRequest: Timestamp.fromDate(data.dateOfRequest),
        dateOfTravel: Timestamp.fromDate(data.dateOfTravel),
        returnDate: Timestamp.fromDate(data.returnDate),
    };
    onSave(submissionData, ticket?.id);
  };

  return (
    <Form {...(form as unknown as UseFormReturn<any>)}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0">
        <div className="p-6 space-y-6">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <FormField
                  control={form.control}
                  name="requestingParty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requesting Party:</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an office" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {offices.map((office) => (
                            <SelectItem key={office.id} value={office.name}>
                              {office.name}
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
                  name="dateOfRequest"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Request:</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfTravel"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Travel:</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="returnDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Return Date:</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact No.:</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 09123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="timeOfDeparture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est'd Time of Departure:</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input type="time" className="pr-8" {...field} />
                            <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <Separator />

            <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Purpose:</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder="Purpose of travel"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Destination:</FormLabel>
                    <FormControl>
                    <Input
                        placeholder="Destination"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <Separator />
            
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Passengers</h3>
                    <FormField
                        control={form.control}
                        name="passengers"
                        render={() => (
                            <FormItem>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`passengers.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormLabel className={cn(index !== 0 && "sr-only")}>
                            Name of Passenger
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a passenger" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.name}>
                                  {employee.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(fields.length > 1 && "mt-1", fields.length === 1 && "mt-8")}
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Remove passenger</span>
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "" })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Passenger
                </Button>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                    <h4 className="font-medium mb-2">Requested by:</h4>
                    <div className="space-y-2">
                        <FormField
                        control={form.control}
                        name="requestedByEmployee"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Employee</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                 {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.name}>
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
                        name="requestedByDesignation"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Designation</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a designation" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                 {designations.map((designation) => (
                                    <SelectItem key={designation.id} value={designation.name}>
                                      {designation.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
                <div>
                    <h4 className="font-medium mb-2">Approved by:</h4>
                    <div className="space-y-2">
                        <FormField
                        control={form.control}
                        name="approvedByEmployee"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Employee</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                 {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.name}>
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
                        name="approvedByDesignation"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Designation</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a designation" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {designations.map((designation) => (
                                    <SelectItem key={designation.id} value={designation.name}>
                                      {designation.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
            </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4 px-6 pb-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
             <Send className="mr-2 h-4 w-4" />
            {ticket ? "Save Changes" : "Submit Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

    