

"use client";

import { useState, useMemo } from "react";
import type { InspectionAcceptanceReport } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2, Search, MoreHorizontal, Eye, Undo2 } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem,
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { toDate } from "@/lib/utils";
import { unpostIAR } from "@/services/inventory";
import { useRouter } from 'next/navigation';
import { LoadingOverlay } from "@/components/loading-overlay";

export default function IarPage() {
  const { data: iars, deleteItem, loading: loadingIARs } = useFirestoreCollection<InspectionAcceptanceReport>("iars");
  const { toast } = useToast();
  const router = useRouter();
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [iarToAction, setIarToAction] = useState<{iar: InspectionAcceptanceReport, action: 'delete' | 'unpost'} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddIAR = () => {
    router.push('/transactions/iar/create');
  };

  const handleViewIAR = (iar: InspectionAcceptanceReport) => {
    router.push(`/transactions/iar/${iar.id}/view`);
  };

  const handleEditIAR = (iar: InspectionAcceptanceReport) => {
    router.push(`/transactions/iar/${iar.id}`);
  };

  const confirmAction = (iar: InspectionAcceptanceReport, action: 'delete' | 'unpost') => {
    setIarToAction({ iar, action });
    setIsAlertOpen(true);
  };

  const resetState = () => {
    setIsAlertOpen(false);
    setIarToAction(null);
  };

  const handleDeleteIAR = async (id: string) => {
    try {
      await deleteItem(id);
      toast({ title: "Success", description: "IAR deleted successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete IAR." });
    }
  };

  const handleUnpostIAR = async (iar: InspectionAcceptanceReport) => {
    try {
        await unpostIAR(iar);
        toast({ title: "Success", description: "IAR status has been reset to Pending." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: `Failed to unpost IAR. ${error.message}` });
    }
  }
  
  const handleConfirmAction = async () => {
    if (!iarToAction) return;

    setIsSubmitting(true);
    
    try {
        const { iar, action } = iarToAction;
        if(action === 'delete') {
            await handleDeleteIAR(iar.id);
        } else if (action === 'unpost') {
            await handleUnpostIAR(iar);
        }
    } finally {
        setIsSubmitting(false);
        resetState();
    }
  }

  const filteredIARs = useMemo(() => {
    return iars.filter(
      (iar) =>
        (iar.iarNumber && iar.iarNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (iar.poNumber && iar.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (iar.supplierName && iar.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (iar.purpose && iar.purpose.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a,b) => {
        const dateA = toDate(a.iarDate)?.getTime() ?? 0;
        const dateB = toDate(b.iarDate)?.getTime() ?? 0;
        return dateB - dateA;
    });
  }, [iars, searchTerm]);
  
  const getStatusVariant = (status: InspectionAcceptanceReport['status']) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const loading = loadingIARs;

   const getDialogContent = () => {
      if (!iarToAction) return { title: "", description: "" };
      switch (iarToAction.action) {
          case 'delete':
              return { title: "Confirm Deletion", description: `This action cannot be undone. This will permanently delete IAR #${iarToAction.iar.iarNumber}.` };
          case 'unpost':
              return { title: "Confirm Unpost", description: "This will revert the IAR status to 'Pending', allowing for future edits. This action should be used with caution."};
          default:
              return { title: "", description: "" };
      }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      {isSubmitting && <LoadingOverlay message="Processing..." />}
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Inspection and Acceptance Reports</h1>
            <p className="text-muted-foreground">Manage IARs</p>
          </div>
           <Button onClick={handleAddIAR} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New IAR
          </Button>
        </header>
        
        <Card>
            <CardHeader>
                <CardTitle>Search IARs</CardTitle>
                <CardDescription>Search by IAR number, PO number, supplier, or purpose</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-10"
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>Inspection and Acceptance Reports</CardTitle>
             <CardDescription>A list of all IARs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IAR Number</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredIARs.length > 0 ? (
                    filteredIARs.map((iar) => (
                      <TableRow key={iar.id}>
                        <TableCell className="font-medium">{iar.iarNumber}</TableCell>
                        <TableCell>{iar.poNumber}</TableCell>
                        <TableCell>{iar.supplierName}</TableCell>
                        <TableCell className="max-w-xs truncate">{iar.purpose}</TableCell>
                        <TableCell>{toDate(iar.iarDate) ? format(toDate(iar.iarDate)!, "PPP") : 'Invalid Date'}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(iar.status)}>{iar.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={isSubmitting}>
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewIAR(iar)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => handleEditIAR(iar)} disabled={iar.status === 'Completed'}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        {iar.status === 'Pending' ? 'Inspect & Accept' : 'Edit'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => confirmAction(iar, 'unpost')}
                                        disabled={iar.status !== 'Completed'}
                                    >
                                        <Undo2 className="mr-2 h-4 w-4" />
                                        Unpost
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => confirmAction(iar, 'delete')} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No IARs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
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
              className={iarToAction?.action === 'delete' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
