

"use client";

import { useState, useMemo } from "react";
import type { PropertyTransferReport, Employee } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { PtrForm, type PtrFormValues } from "@/components/ptr-form";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { toDate } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

export default function PtrPage() {
  const { data: ptrs, addItem, updateItem, deleteItem, loading: loadingPtrs } = useFirestoreCollection<PropertyTransferReport>("propertyTransferReports");
  const { data: employees, loading: loadingEmployees } = useFirestoreCollection<Employee>("employees");
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPtr, setEditingPtr] = useState<PropertyTransferReport | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [ptrToDelete, setPtrToDelete] = useState<string | null>(null);

  const handleAddPtr = () => {
    setEditingPtr(null);
    setIsFormOpen(true);
  };

  const handleEditPtr = (ptr: PropertyTransferReport) => {
    setEditingPtr(ptr);
    setIsFormOpen(true);
  };

  const confirmDeletePtr = (id: string) => {
    setPtrToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeletePtr = async () => {
    if (!ptrToDelete) return;
    try {
        await deleteItem(ptrToDelete);
        toast({ title: "Success", description: "PTR deleted successfully." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete PTR." });
    } finally {
        setPtrToDelete(null);
        setIsAlertOpen(false);
    }
  };

  const handleSavePtr = async (ptrData: PtrFormValues, id?: string) => {
    const fromOfficer = employees.find(e => e.id === ptrData.fromAccountableOfficerId);
    const toOfficer = employees.find(e => e.id === ptrData.toAccountableOfficerId);

    if (!fromOfficer || !toOfficer) {
        toast({ variant: "destructive", title: "Error", description: "Invalid accountable officer selected." });
        return;
    }

    const dataToSave = {
        ...ptrData,
        date: Timestamp.fromDate(ptrData.date),
        fromAccountableOfficerName: fromOfficer.name,
        toAccountableOfficerName: toOfficer.name,
    };

    try {
      if (id) {
        await updateItem(id, dataToSave);
        toast({ title: "Success", description: "PTR updated successfully." });
      } else {
        await addItem(dataToSave);
        toast({ title: "Success", description: "PTR added successfully." });
      }
      setIsFormOpen(false);
      setEditingPtr(null);
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to save PTR." });
    }
  };

  const filteredPtrs = useMemo(() => {
    return ptrs.filter(
      (ptr) =>
        ptr.ptrNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ptr.fromAccountableOfficerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ptr.toAccountableOfficerName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      const dateA = toDate(a.date)?.getTime() ?? 0;
      const dateB = toDate(b.date)?.getTime() ?? 0;
      return dateB - dateA;
    });
  }, [ptrs, searchTerm]);
  
  const getStatusVariant = (status: PropertyTransferReport['status']) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const loading = loadingPtrs || loadingEmployees;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Property Transfer Reports</h1>
            <p className="text-muted-foreground">Manage PTRs</p>
          </div>
          <Button onClick={handleAddPtr} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New PTR
          </Button>
        </header>
        
        <Card>
            <CardHeader>
                <CardTitle>Search PTRs</CardTitle>
                <CardDescription>Search by PTR number or accountable officer</CardDescription>
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
             <CardTitle>Reports</CardTitle>
             <CardDescription>A list of all Property Transfer Reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PTR No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredPtrs.length > 0 ? (
                    filteredPtrs.map((ptr) => (
                      <TableRow key={ptr.id}>
                        <TableCell className="font-medium">{ptr.ptrNo}</TableCell>
                        <TableCell>{format(toDate(ptr.date)!, "PPP")}</TableCell>
                        <TableCell>{ptr.fromAccountableOfficerName}</TableCell>
                        <TableCell>{ptr.toAccountableOfficerName}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(ptr.status)}>{ptr.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditPtr(ptr)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => confirmDeletePtr(ptr.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No PTRs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingPtr ? "Edit PTR" : "Add New PTR"}</DialogTitle>
             <DialogDescription>
              {editingPtr ? "Update the details of the PTR." : "Fill in the details for the new PTR."}
            </DialogDescription>
          </DialogHeader>
          <PtrForm
            ptr={editingPtr}
            employees={employees}
            onSubmit={handleSavePtr}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the PTR.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePtr}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
