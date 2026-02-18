

"use client";

import { useState, useMemo } from "react";
import type { ProcurementMode } from "@/types";
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
import { ProcurementModeForm } from "@/components/procurement-mode-form";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";


export default function ProcurementPage() {
  const { data: procurementModes, addItem, updateItem, deleteItem, loading } = useFirestoreCollection<ProcurementMode>("procurementModes");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMode, setEditingMode] = useState<ProcurementMode | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [modeToDelete, setModeToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMode = () => {
    setEditingMode(null);
    setIsFormOpen(true);
  };

  const handleEditMode = (mode: ProcurementMode) => {
    setEditingMode(mode);
    setIsFormOpen(true);
  };

  const confirmDeleteMode = (id: string) => {
    setModeToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteMode = async () => {
    if (!modeToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteItem(modeToDelete);
        toast({ title: "Success", description: "Mode of procurement deleted successfully." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete mode of procurement." });
    } finally {
        setModeToDelete(null);
        setIsAlertOpen(false);
        setIsSubmitting(false);
    }
  };

  const handleSaveMode = async (modeData: Omit<ProcurementMode, "id">, id?: string) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await updateItem(id, modeData);
        toast({ title: "Success", description: "Mode of procurement updated successfully." });
      } else {
        await addItem(modeData);
        toast({ title: "Success", description: "Mode of procurement added successfully." });
      }
      setIsFormOpen(false);
      setEditingMode(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save mode of procurement." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredModes = useMemo(() => {
    return [...procurementModes]
      .filter((mode) =>
        mode.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [procurementModes, searchTerm]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Mode of Procurement</h1>
            <p className="text-muted-foreground">Manage modes of procurement</p>
          </div>
          <Button onClick={handleAddMode} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Mode
          </Button>
        </header>
        
        <Card>
            <CardHeader>
                <CardTitle>Search Modes</CardTitle>
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
             <CardTitle>Modes of Procurement</CardTitle>
             <CardDescription>A list of all modes of procurement</CardDescription>
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
                  ) : filteredModes.length > 0 ? (
                    filteredModes.map((mode) => (
                      <TableRow key={mode.id}>
                        <TableCell className="font-medium">{mode.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditMode(mode)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => confirmDeleteMode(mode.id)}>
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
                        No modes found.
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
            <DialogTitle>{editingMode ? "Edit Mode" : "Add New Mode"}</DialogTitle>
             <DialogDescription>
              {editingMode ? "Update the details of the mode." : "Enter the details for the new mode."}
            </DialogDescription>
          </DialogHeader>
          <ProcurementModeForm
            mode={editingMode}
            onSubmit={handleSaveMode}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the mode of procurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMode}
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
