
"use client";

import { useState, useMemo } from "react";
import type { Uom } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { UomForm } from "@/components/uom-form";
import { PlusCircle, Pencil, Trash2, Search, MoreHorizontal } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";


export default function UomPage() {
  const { data: uoms, addItem, updateItem, deleteItem, loading } = useFirestoreCollection<Uom>("uoms");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUom, setEditingUom] = useState<Uom | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [uomToDelete, setUomToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUom = () => {
    setEditingUom(null);
    setIsFormOpen(true);
  };

  const handleEditUom = (uom: Uom) => {
    setEditingUom(uom);
    setIsFormOpen(true);
  };

  const confirmDeleteUom = (id: string) => {
    setUomToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteUom = async () => {
    if (!uomToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteItem(uomToDelete);
        toast({ title: "Success", description: "UOM deleted successfully." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete UOM." });
    } finally {
        setUomToDelete(null);
        setIsAlertOpen(false);
        setIsSubmitting(false);
    }
  };

  const handleSaveUom = async (uomData: Omit<Uom, "id">, id?: string) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await updateItem(id, uomData);
        toast({ title: "Success", description: "UOM updated successfully." });
      } else {
        await addItem(uomData);
        toast({ title: "Success", description: "UOM added successfully." });
      }
      setIsFormOpen(false);
      setEditingUom(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save UOM." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUoms = useMemo(() => {
    return [...uoms]
      .filter(
        (uom) =>
          uom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          uom.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [uoms, searchTerm]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Unit of Measurement (UOM)</h1>
            <p className="text-muted-foreground">Manage UOMs here.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Filter by name or abbreviation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm pl-10 bg-muted border-none"
                />
            </div>
            <Button onClick={handleAddUom} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
            </Button>
          </div>
        </header>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Abbreviation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredUoms.length > 0 ? (
                    filteredUoms.map((uom) => (
                      <TableRow key={uom.id}>
                        <TableCell className="font-medium">{uom.name}</TableCell>
                        <TableCell>{uom.abbreviation}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditUom(uom)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => confirmDeleteUom(uom.id)} className="text-destructive">
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
                      <TableCell colSpan={3} className="text-center h-24">
                        No UOMs found.
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
            <DialogTitle>{editingUom ? "Edit UOM" : "Add New UOM"}</DialogTitle>
             <DialogDescription>
              {editingUom ? "Update the details of the UOM." : "Enter the details for the new UOM."}
            </DialogDescription>
          </DialogHeader>
          <UomForm
            uom={editingUom}
            onSubmit={handleSaveUom}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the UOM.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUom}
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

    