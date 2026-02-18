
"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { Timestamp } from "firebase/firestore";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

import type {
  TripTicket,
  Office,
  Employee,
  Designation,
  TripTicketCounter,
} from "@/types";
import type { UseFormReturn } from "react-hook-form";

import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { LoadingOverlay } from "@/components/loading-overlay";
import { TripTicketForm, type TripTicketFormValues } from "@/components/trip-ticket-form";

import {
  Ticket,
  PlusCircle,
  MoreHorizontal,
  CalendarDays,
  FileText,
  Eye,
  User,
  Power,
  PowerOff,
  Printer
} from "lucide-react";

import type { DateRange } from "react-day-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const toSafeDate = (
  value: Timestamp | Date | string | null | undefined
): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if ("toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  return null;
};

const formatDate = (
  value: Timestamp | Date | string | null | undefined,
  pattern = "PPP"
) => {
  const d = toSafeDate(value);
  return d ? format(d, pattern) : "N/A";
};

const TripTicketStatus = {
  Approved: "Approved",
  Pending: "Pending",
  Rejected: "Rejected",
  Cancelled: "Cancelled",
  Completed: "Completed",
} as const;

/* -------------------------------------------------------------------------- */
/* Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function TripTicketPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    data: tickets,
    addItem,
    updateItem,
    deleteItem,
    loading: loadingTickets,
  } = useFirestoreCollection<TripTicket>("tripTickets");

  const { data: offices, loading: loadingOffices } =
    useFirestoreCollection<Office>("offices");
  const { data: employees, loading: loadingEmployees } =
    useFirestoreCollection<Employee>("employees");
  const { data: designations, loading: loadingDesignations } =
    useFirestoreCollection<Designation>("designations");

  const loading =
    loadingTickets ||
    loadingOffices ||
    loadingEmployees ||
    loadingDesignations;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] =
    useState<TripTicket | null>(null);

  const [dialogAction, setDialogAction] = useState<
    "approve" | "disapprove" | "unpost" | "cancel" | "delete" | null
  >(null);
  const [activeTicket, setActiveTicket] =
    useState<TripTicket | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientView, setIsClientView] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const [reportRange, setReportRange] = useState<DateRange | undefined>();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Memoized Data                                                          */
  /* ---------------------------------------------------------------------- */

  const approvedTicketsCurrentYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [...(tickets ?? [])].filter(t => {
      const travelDate = toSafeDate(t.dateOfTravel);
      return t.status === TripTicketStatus.Approved && travelDate && travelDate.getFullYear() === currentYear;
    })
    .sort((a, b) => {
      const bTime = toSafeDate(b.dateOfTravel)?.getTime() ?? 0;
      const aTime = toSafeDate(a.dateOfTravel)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [tickets]);


  const approvedDates = useMemo(() => {
    return (approvedTicketsCurrentYear ?? [])
      .map((t) => toSafeDate(t.dateOfTravel))
      .filter((d): d is Date => Boolean(d));
  }, [approvedTicketsCurrentYear]);

  const tripsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return (approvedTicketsCurrentYear ?? [])
      .filter(
        (t) =>
          toSafeDate(t.dateOfTravel)?.toDateString() ===
            selectedDate.toDateString()
    );
  }, [approvedTicketsCurrentYear, selectedDate]);
  
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const sortedTickets = useMemo(() => {
    return [...(tickets ?? [])].sort((a, b) => {
      const aTime = toSafeDate(a.dateOfTravel)?.getTime() ?? 0;
      const bTime = toSafeDate(b.dateOfTravel)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [tickets]);

  /* ---------------------------------------------------------------------- */
  /* Actions                                                                */
  /* ---------------------------------------------------------------------- */

  const openConfirm = (
    action: typeof dialogAction,
    ticket: TripTicket
  ) => {
    setDialogAction(action);
    setActiveTicket(ticket);
    setConfirmOpen(true);
  };

  const resetConfirm = () => {
    setDialogAction(null);
    setActiveTicket(null);
    setConfirmOpen(false);
  };

  const handleConfirmAction = async () => {
    if (!activeTicket || !dialogAction) return;
  
    setIsSubmitting(true);
    try {
      let updateData: Partial<TripTicket> = {};
      let successMessage = "";
  
      if (dialogAction === "approve") {
        const reqDate = toSafeDate(activeTicket.dateOfRequest);
        if (!reqDate) throw new Error("Invalid request date.");
  
        const year = reqDate.getFullYear();
        const month = String(reqDate.getMonth() + 1).padStart(2, "0");
        const key = `${year}-${month}`;
  
        const counterRef = doc(db, "settings", "tripTicketCounter");
        const snap = await getDoc(counterRef);
        const data = snap.data() as TripTicketCounter | undefined;
  
        const current = data?.counters?.[key] ?? 0;
        const next = current + 1;
  
        if (snap.exists()) {
          await updateDoc(counterRef, {
            [`counters.${key}`]: next,
          });
        } else {
          await setDoc(counterRef, {
            counters: { [key]: next },
          });
        }
  
        updateData = {
          status: TripTicketStatus.Approved,
          tripTicketNo: `T${year}-${month}-${String(next).padStart(3, "0")}`,
        };
  
        successMessage = "Trip ticket approved.";
      }
  
      if (dialogAction === "disapprove") {
        updateData = { status: TripTicketStatus.Rejected };
        successMessage = "Trip ticket disapproved.";
      }
  
      if (dialogAction === "cancel") {
        updateData = { status: TripTicketStatus.Cancelled };
        successMessage = "Trip ticket cancelled.";
      }
  
      if (dialogAction === "unpost") {
        updateData = {
          status: TripTicketStatus.Pending,
          tripTicketNo: "TBA",
        };
        successMessage = "Trip ticket reset to Pending.";
      }
  
      if (dialogAction === "delete") {
        await deleteItem(activeTicket.id);
        toast({ title: "Success", description: "Trip ticket deleted." });
        return;
      }
  
      await updateItem(activeTicket.id, updateData);
      toast({ title: "Success", description: successMessage });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Action failed.",
      });
    } finally {
      setIsSubmitting(false);
      resetConfirm();
    }
  };
  
  const handleSaveTicket = async (
    ticketData: Omit<TripTicket, "status" | "id" | "tripTicketNo">,
    id?: string
  ) => {
    try {
      if (id) {
        await updateItem(id, ticketData);
        toast({ title: "Success", description: "Trip ticket updated successfully." });
      } else {
        await addItem({
          ...ticketData,
          status: TripTicketStatus.Pending,
          tripTicketNo: "TBA",
        });
        toast({ title: "Success", description: "Trip ticket created successfully." });
      }
      setIsFormOpen(false);
      setEditingTicket(null);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save trip ticket.",
      });
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen p-6">
      {isSubmitting && <LoadingOverlay message="Processing..." />}

        {isClientView ? (
            // Client View
            <div className="max-w-7xl mx-auto space-y-8">
                 <div className="absolute top-6 right-6">
                    <Button variant="ghost" onClick={() => setIsClientView(false)}>
                        <Power className="mr-2 h-4 w-4" /> Go to Admin View
                    </Button>
                </div>
                 <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Vehicle Reservation</h1>
                    <p className="text-muted-foreground max-w-xl mx-auto mt-2">
                        Need to book a vehicle for official business? Click the button below. You can view scheduled trips on the calendar.
                    </p>
                    <Button size="lg" onClick={() => setIsFormOpen(true)} className="mt-4">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create Trip Ticket
                    </Button>
                </div>

                <Card>
                  <CardHeader>
                      <CardTitle>Approved Trip Tickets ({approvedTicketsCurrentYear.length})</CardTitle>
                      <CardDescription>This is a list of all official trips for the current year that have been approved.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Date of Request</TableHead>
                                  <TableHead>Departure Date</TableHead>
                                  <TableHead>Return Date</TableHead>
                                  <TableHead>Trip Ticket No.</TableHead>
                                  <TableHead>Requested By</TableHead>
                                  <TableHead>Purpose</TableHead>
                                  <TableHead>Destination</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {loading ? (
                                  <TableRow>
                                      <TableCell colSpan={8} className="text-center h-24">Loading...</TableCell>
                                  </TableRow>
                              ) : approvedTicketsCurrentYear.length > 0 ? (
                                  approvedTicketsCurrentYear.map((ticket) => (
                                      <TableRow key={ticket.id}>
                                          <TableCell>{formatDate(ticket.dateOfRequest)}</TableCell>
                                          <TableCell>{formatDate(ticket.dateOfTravel)}</TableCell>
                                          <TableCell>{formatDate(ticket.returnDate)}</TableCell>
                                          <TableCell className="font-mono">{ticket.tripTicketNo}</TableCell>
                                          <TableCell>{ticket.requestingParty}</TableCell>
                                          <TableCell className="max-w-xs truncate">{ticket.purpose}</TableCell>
                                          <TableCell>{ticket.destination}</TableCell>
                                          <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => router.push(`/trip-ticket/${ticket.id}`)}>
                                                <Printer className="mr-2 h-4 w-4" /> Print
                                            </Button>
                                          </TableCell>
                                      </TableRow>
                                  ))
                              ) : (
                                  <TableRow>
                                      <TableCell colSpan={8} className="text-center h-24">No approved trip tickets found for the current year.</TableCell>
                                  </TableRow>
                              )}
                          </TableBody>
                      </Table>
                  </CardContent>
                </Card>
                
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 flex justify-center">
                        <Card className="w-full max-w-2xl">
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5" />
                                Booking Calendar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onDayClick={handleDayClick}
                                    modifiers={{ approved: approvedDates }}
                                    modifiersClassNames={{ approved: "bg-green-500 text-white" }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        {selectedDate && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Trips for {format(selectedDate, "PPP")}</CardTitle>
                                    <CardDescription>Approved trips for the selected date.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-96">
                                        <div className="space-y-4 pr-4">
                                            {tripsForSelectedDate.length > 0 ? (
                                                tripsForSelectedDate.map(trip => (
                                                    <div key={trip.id} className="p-3 border rounded-md">
                                                        <p className="font-semibold">{trip.destination}</p>
                                                        <p className="text-sm text-muted-foreground">Requested by: {trip.requestingParty}</p>
                                                        <p className="text-sm mt-1">{trip.purpose}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted-foreground text-center py-4">No approved trips for this date.</p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            // Admin View
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Ticket className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Trip Tickets</h1>
                </div>

                <div className="flex gap-2">
                     <Button variant="ghost" onClick={() => setIsClientView(true)}>
                        <PowerOff className="mr-2 h-4 w-4" /> Go to Client View
                    </Button>
                    <Button
                    variant="outline"
                    onClick={() => {
                        const today = new Date();
                        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        setReportRange({ from: startOfMonth, to: endOfMonth });
                        setReportDialogOpen(true);
                    }}
                    >
                    <FileText className="mr-2 h-4 w-4" />
                    Monthly Summary
                    </Button>
                    <Button onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Request Vehicle
                    </Button>
                </div>
                </div>

                {/* Table */}
                <Card>
                <CardHeader>
                    <CardTitle>All Trip Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Request</TableHead>
                        <TableHead>Departure</TableHead>
                        <TableHead>Return</TableHead>
                        <TableHead>No.</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedTickets.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell>{formatDate(t.dateOfRequest)}</TableCell>
                            <TableCell>{formatDate(t.dateOfTravel)}</TableCell>
                            <TableCell>{formatDate(t.returnDate)}</TableCell>
                            <TableCell className="font-mono">
                            {t.tripTicketNo}
                            </TableCell>
                            <TableCell>{t.requestingParty}</TableCell>
                            <TableCell>
                            <Badge>{t.status}</Badge>
                            </TableCell>
                            <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/trip-ticket/${t.id}`}>View</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => openConfirm("approve", t)}
                                >
                                    Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => openConfirm("cancel", t)}
                                >
                                    Cancel
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => openConfirm("delete", t)}
                                >
                                    Delete
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
                </Card>

                {/* Calendar */}
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Booking Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onDayClick={handleDayClick}
                        modifiers={{ approved: approvedDates }}
                        modifiersClassNames={{
                            approved: "bg-green-500 text-white",
                        }}
                    />
                </CardContent>
                </Card>
            </div>
        )}

      {/* Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Trip Ticket Request</DialogTitle>
          </DialogHeader>
           <div className="max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <TripTicketForm
                ticket={editingTicket}
                onSave={handleSaveTicket}
                onCancel={() => setIsFormOpen(false)}
                offices={offices}
                employees={employees}
                designations={designations}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Monthly Travel Summary</DialogTitle>
                    <DialogDescription>Select a date range for the report.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <div className="grid gap-2">
                        <Label>Date range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !reportRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {reportRange?.from ? (
                                reportRange.to ? (
                                    <>
                                    {format(reportRange.from, "LLL dd, y")} -{" "}
                                    {format(reportRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(reportRange.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date range</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={reportRange?.from}
                                selected={reportRange}
                                onSelect={setReportRange}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <Button onClick={() => {
                     if (reportRange?.from && reportRange?.to) {
                        const from = format(reportRange.from, 'yyyy-MM-dd');
                        const to = format(reportRange.to, 'yyyy-MM-dd');
                        router.push(`/reports/monthly-travel-summary?from=${from}&to=${to}`);
                        setReportDialogOpen(false);
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Error",
                            description: "Please select a valid date range.",
                        });
                    }
                }}>Generate Report</Button>
            </DialogContent>
        </Dialog>
    </div>
  );
}
