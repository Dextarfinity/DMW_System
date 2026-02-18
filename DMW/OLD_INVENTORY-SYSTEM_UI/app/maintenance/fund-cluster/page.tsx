

"use client";

import { useState, useMemo } from "react";
import type { FundCluster } from "@/types";
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
import { FundClusterForm } from "@/components/fund-cluster-form";
import { PlusCircle, Pencil, Trash2, Search, MoreHorizontal } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";


export default function FundClusterPage() {
  const { data: fundClusters, addItem, updateItem, deleteItem, loading } = useFirestoreCollection<FundCluster>("fundClusters");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFundCluster, setEditingFundCluster] = useState<FundCluster | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [fundClusterToDelete, setFundClusterToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFundCluster = () => {
    setEditingFundCluster(null);
    setIsFormOpen(true);
  };

  const handleEditFundCluster = (fundCluster: FundCluster) => {
    setEditingFundCluster(fundCluster);
    setIsFormOpen(true);
  };

  const confirmDeleteFundCluster = (id: string) => {
    setFundClusterToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteFundCluster = async () => {
    if (!fundClusterToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteItem(fundClusterToDelete);
        toast({ title: "Success", description: "Fund cluster deleted successfully." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete fund cluster." });
    } finally {
        setFundClusterToDelete(null);
        setIsAlertOpen(false);
        setIsSubmitting(false);
    }
  };

  const handleSaveFundCluster = async (fundClusterData: Omit<FundCluster, "id">, id?: string) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await updateItem(id, fundClusterData);
        toast({ title: "Success", description: "Fund cluster updated successfully." });
      } else {
        await addItem(fundClusterData);
        toast({ title: "Success", description: "Fund cluster added successfully." });
      }
      setIsFormOpen(false);
      setEditingFundCluster(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save fund cluster." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFundClusters = useMemo(() => {
    return [...fundClusters]
      .filter((cluster) =>
        cluster.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [fundClusters, searchTerm]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Fund Clusters</h1>
            <p className="text-muted-foreground">Manage fund clusters here.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Filter by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm pl-10 bg-muted border-none"
                />
            </div>
            <Button onClick={handleAddFundCluster} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                  ) : filteredFundClusters.length > 0 ? (
                    filteredFundClusters.map((cluster) => (
                      <TableRow key={cluster.id}>
                        <TableCell className="font-medium">{cluster.name}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditFundCluster(cluster)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => confirmDeleteFundCluster(cluster.id)} className="text-destructive">
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
                      <TableCell colSpan={2} className="text-center h-24">
                        No fund clusters found.
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
            <DialogTitle>{editingFundCluster ? "Edit Fund Cluster" : "Add New Fund Cluster"}</DialogTitle>
             <DialogDescription>
              {editingFundCluster ? "Update the details of the fund cluster." : "Enter the details for the new fund cluster."}
            </DialogDescription>
          </DialogHeader>
          <FundClusterForm
            fundCluster={editingFundCluster}
            onSubmit={handleSaveFundCluster}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the fund cluster.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFundCluster}
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
