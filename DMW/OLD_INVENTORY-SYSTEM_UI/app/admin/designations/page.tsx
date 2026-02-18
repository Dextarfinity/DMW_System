

"use client";

import { useState, useMemo } from "react";
import type { Designation } from "@/types";
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
import { DesignationForm } from "@/components/designation-form";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";


export default function DesignationsPage() {
  const { data: designations, addItem, updateItem, deleteItem, loading } = useFirestoreCollection<Designation>("designations");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDesignation = () => {
    setEditingDesignation(null);
    setIsFormOpen(true);
  };

  const handleEditDesignation = (designation: Designation) => {
    setEditingDesignation(designation);
    setIsFormOpen(true);
  };

  const confirmDeleteDesignation = (id: string) => {
    setDesignationToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteDesignation = async () => {
    if (!designationToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteItem(designationToDelete);
        toast({ title: "Success", description: "Designation deleted successfully." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete designation." });
    } finally {
        setDesignationToDelete(null);
        setIsAlertOpen(false);
        setIsSubmitting(false);
    }
  };

  const handleSaveDesignation = async (designationData: Omit<Designation, "id">, id?: string) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await updateItem(id, designationData);
        toast({ title: "Success", description: "Designation updated successfully." });
      } else {
        await addItem(designationData);
        toast({ title: "Success", description: "Designation added successfully." });
      }
      setIsFormOpen(false);
      setEditingDesignation(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save designation." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDesignations = useMemo(() => {
    return [...designations]
      .filter((designation) =>
        designation.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [designations, searchTerm]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Designation Management</h1>
            <p className="text-muted-foreground">Manage job designations</p>
          </div>
          <Button onClick={handleAddDesignation} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Designation
          </Button>
        </header>
        
        <Card>
            <CardHeader>
                <CardTitle>Search Designations</CardTitle>
                <CardDescription>Search by name</CardDescription>
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
             <CardTitle>Designations</CardTitle>
             <CardDescription>A list of all job designations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredDesignations.length > 0 ? (
                    filteredDesignations.map((designation) => (
                      <TableRow key={designation.id}>
                        <TableCell className="font-medium">{designation.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditDesignation(designation)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => confirmDeleteDesignation(designation.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">
                        No designations found.
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingDesignation ? "Edit Designation" : "Add New Designation"}</DialogTitle>
             <DialogDescription>
              {editingDesignation ? "Update the details of the designation." : "Enter the details for the new designation."}
            </DialogDescription>
          </DialogHeader>
          <DesignationForm
            designation={editingDesignation}
            onSubmit={handleSaveDesignation}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the designation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDesignation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
