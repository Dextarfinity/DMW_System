
"use client";

import { useState, useMemo } from "react";
import type { TripTicket, Office, Employee, Designation, TripTicketCounter } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { TripTicketForm } from "@/components/trip-ticket-form";
import { PlusCircle, MoreHorizontal, Ticket, CalendarDays, FileText, Calendar as CalendarIcon } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";
import type { Timestamp } from "firebase/firestore";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, toDate } from "@/lib/utils";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/loading-overlay";

/** Helper: safely convert Timestamp | string | null to Date | null */
const toSafeDate = (value: Timestamp | Date | string | null | undefined): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  if ('toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  return null;
};


export default function TripTicketPage() {
  const { data: tickets, addItem, updateItem, deleteItem, loading: loadingTickets } = useFirestoreCollection<TripTicket>("tripTickets");
  const { data: offices, loading: loadingOffices } = useFirestoreCollection<Office>("offices");
  const { data: employees, loading: loadingEmployees } = useFirestoreCollection<Employee>("employees");
  const { data: designations, loading: loadingDesignations } = useFirestoreCollection<Designation>("designations");
  const { toast } = useToast();
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TripTicket | null>(null);
  const [dialogAction, setDialogAction] = useState<"approve" | "disapprove" | "unpost" | "delete" | "cancel" | null>(null);
  const [activeTicket, setActiveTicket] = useState<TripTicket | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportDateRange, setReportDateRange] = useState<DateRange | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvedDates = useMemo(() => {
    return tickets
      .filter((ticket) => ticket.status === "Approved")
      .map((ticket) => toSafeDate(ticket.dateOfTravel))
      .filter((d): d is Date => !!d);
  }, [tickets]);

  const handleAddTicket = () => {
    setEditingTicket(null);
    setIsFormOpen(true);
  };

  const handleActionClick = (action: "approve" | "disapprove" | "unpost" | "delete" | "cancel", ticket: TripTicket) => {
    setDialogAction(action);
    setActiveTicket(ticket);
    setIsConfirmOpen(true);
  };

  const resetState = () => {
    setDialogAction(null);
    setActiveTicket(null);
    setIsConfirmOpen(false);
  };

  const handleGenerateReport = () => {
    if (reportDateRange?.from && reportDateRange?.to) {
        const from = format(reportDateRange.from, 'yyyy-MM-dd');
        const to = format(reportDateRange.to, 'yyyy-MM-dd');
        router.push(`/reports/monthly-travel-summary?from=${from}&to=${to}`);
        setIsReportDialogOpen(false);
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select a valid date range.",
        });
    }
  };

  const handleConfirmAction = async () => {
    if (!activeTicket || !dialogAction) return;

    setIsSubmitting(true);
    
    try {
        let updateData: Partial<TripTicket> = {};
        let successMessage = "";

        switch (dialogAction) {
            case "approve":
                const requestDate = toSafeDate(activeTicket.dateOfRequest);
                if (!requestDate) throw new Error("Date of request is invalid.");
                const year = requestDate.getFullYear();
                const month = requestDate.getMonth() + 1;
                const yearMonthKey = `${year}-${String(month).padStart(2, '0')}`;

                const counterRef = doc(db, 'settings', 'tripTicketCounter');
                const counterSnap = await getDoc(counterRef);
                const counterData = counterSnap.data() as TripTicketCounter | undefined;

                const currentCount = counterData?.counters?.[yearMonthKey] || 0;
                const newCount = currentCount + 1;

                if (counterSnap.exists()) {
                    await updateDoc(counterRef, { [`counters.${yearMonthKey}`]: newCount });
                } else {
                    await setDoc(counterRef, { counters: { [yearMonthKey]: newCount } });
                }

                const increment = newCount.toString().padStart(3, '0');
                updateData = { status: "Approved", tripTicketNo: `T${year}-${String(month).padStart(2, '0')}-${increment}` };
                successMessage = "Trip ticket approved.";
                break;

            case "disapprove":
                updateData = { status: "Rejected" };
                successMessage = "Trip ticket disapproved.";
                break;

            case "cancel":
                updateData = { status: "Cancelled" };
                successMessage = "Trip ticket cancelled.";
                break;

            case "unpost":
                updateData = { status: "Pending", tripTicketNo: 'TBA' };
                successMessage = "Trip ticket status reset to Pending.";
                break;

            case "delete":
                await deleteItem(activeTicket.id);
                successMessage = "Trip ticket deleted successfully.";
                break;
        }

        if (dialogAction !== 'delete') {
            await updateItem(activeTicket.id, updateData);
        }

        toast({ title: "Success", description: successMessage });

    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: `Failed to perform action. ${error}` });
    } finally {
        setIsSubmitting(false);
        resetState();
    }
  };

  const getDialogContent = () => {
    if (!dialogAction) return { title: "", description: ""};
    switch (dialogAction) {
        case "approve":
            return { title: "Approve Trip Ticket?", description: "This will approve the ticket and generate a final trip ticket number. This action cannot be undone." };
        case "disapprove":
            return { title: "Disapprove Trip Ticket?", description: "This will mark the ticket as rejected. This action cannot be undone." };
        case "cancel":
            return { title: "Cancel Trip Ticket?", description: "This will mark the ticket as cancelled. This action cannot be undone." };
        case "unpost":
            return { title: "Unpost Trip Ticket?", description: "This will reset the ticket's approval status to 'Pending' and remove the trip ticket number. Are you sure?" };
        case "delete":
            return { title: "Are you sure?", description: "This action cannot be undone. This will permanently delete the trip ticket." };
        default:
            return { title: "", description: ""};
    }
  };

  const handleSaveTicket = async (ticketData: Omit<TripTicket, "id" | "tripTicketNo" | "status">, id?: string) => {
    try {
        if (id) {
            await updateItem(id, ticketData);
            toast({ title: "Success", description: "Trip ticket updated successfully." });
        } else {
            const newTicket = {
                ...ticketData,
                tripTicketNo: "TBA",
                status: "Pending" as const
            };
            await addItem(newTicket);
            toast({ title: "Success", description: "Trip ticket requested successfully." });
        }
        setIsFormOpen(false);
        setEditingTicket(null);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to save trip ticket." });
    }
  };

  const sortedTickets = useMemo(() => {
    const safeTickets = Array.isArray(tickets) ? tickets : [];
    return [...safeTickets].sort((a, b) => {
        const dateA = toSafeDate(a.dateOfTravel)?.getTime() ?? 0;
        const dateB = toSafeDate(b.dateOfTravel)?.getTime() ?? 0;
        return dateB - dateA;
    });
  }, [tickets]);

  const getStatusVariant = (status: TripTicket['status']) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const tripsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const safeTickets = Array.isArray(tickets) ? tickets : [];
    return safeTickets.filter(
      (ticket) =>
        ticket.status === 'Approved' &&
        toSafeDate(ticket.dateOfTravel)?.toDateString() === selectedDate.toDateString()
    );
  }, [tickets, selectedDate]);

  const loading = loadingTickets || loadingOffices || loadingEmployees || loadingDesignations;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      {isSubmitting && <LoadingOverlay message="Processing..." />}
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Ticket className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold font-headline">Trip Tickets</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
                onClick={() => setIsReportDialogOpen(true)}
                variant="outline"
            >
                <FileText className="mr-2 h-4 w-4" />
                Summary of Monthly Travel
            </Button>
            <Button
                onClick={handleAddTicket}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Request for Vehicle
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                <CardHeader>
                    <CardTitle>All Trip Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
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
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={9} className="text-center h-24">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : sortedTickets.length > 0 ? (
                            sortedTickets.map((ticket) => (
                            <TableRow key={ticket.id}>
                                <TableCell>
                                    {toSafeDate(ticket.dateOfRequest) ? format(toSafeDate(ticket.dateOfRequest)!, "PPP") : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {toSafeDate(ticket.dateOfTravel) ? format(toSafeDate(ticket.dateOfTravel)!, "PPP") : 'N/A'}
                                </TableCell>
                                 <TableCell>
                                    {toSafeDate(ticket.returnDate) ? format(toSafeDate(ticket.returnDate)!, "PPP") : 'N/A'}
                                </TableCell>
                                <TableCell className="font-mono">{ticket.tripTicketNo}</TableCell>
                                <TableCell className="font-medium">
                                    {ticket.requestingParty}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">{ticket.purpose}</TableCell>
                                <TableCell>{ticket.destination}</TableCell>
                                <TableCell>
                                  <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={isSubmitting}>
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/trip-ticket/${ticket.id}`} passHref>View</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleActionClick('approve', ticket)}>
                                                Approve
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleActionClick('cancel', ticket)}>
                                                Cancel
                                            </DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => handleActionClick('unpost', ticket)}>
                                                Unpost
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleActionClick('delete', ticket)} className="text-destructive">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={9} className="text-center h-24">
                                No trip tickets found.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CalendarDays className="mr-2 h-5 w-5 text-muted-foreground" />
                            Booking Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                       <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            modifiers={{ approved: approvedDates }}
                            modifiersClassNames={{
                                approved: "bg-green-500 text-white",
                            }}
                            className="p-0"
                        />
                    </CardContent>
                </Card>
                 {tripsForSelectedDate.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Travel Details for {selectedDate ? format(selectedDate, "PPP") : ""}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {tripsForSelectedDate.map(trip => (
                                    <li key={trip.id} className="text-sm space-y-1">
                                        <p><span className="font-semibold">Destination:</span> {trip.destination}</p>
                                        <p><span className="font-semibold">Requested By:</span> {trip.requestingParty}, {trip.requestedByEmployee}</p>
                                        <p><span className="font-semibold">Purpose:</span> {trip.purpose}</p>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-center text-2xl font-bold">
              REQUEST FOR VEHICLE
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
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
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getDialogContent().title}</AlertDialogTitle>
            <AlertDialogDescription>
              {getDialogContent().description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetState}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={isSubmitting}
               className={dialogAction === 'delete' || dialogAction === 'disapprove' || dialogAction === 'cancel' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Generate Monthly Travel Report</DialogTitle>
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
                        !reportDateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reportDateRange?.from ? (
                        reportDateRange.to ? (
                            <>
                            {format(reportDateRange.from, "LLL dd, y")} -{" "}
                            {format(reportDateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(reportDateRange.from, "LLL dd, y")
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
                        defaultMonth={reportDateRange?.from}
                        selected={reportDateRange}
                        onSelect={setReportDateRange}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                </div>
            </div>
            <Button onClick={handleGenerateReport}>Generate Report</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
