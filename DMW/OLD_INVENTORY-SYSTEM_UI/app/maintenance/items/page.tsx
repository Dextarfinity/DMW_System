
"use client";

import { useState, useMemo } from "react";
import type { Item, UacsCode, Uom } from "@/types";
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
import { ItemForm, type ItemFormValues } from "@/components/item-form";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";

export default function ItemsPage() {
  const { data: items, addItem, updateItem, deleteItem, loading: loadingItems } = useFirestoreCollection<Item>("items");
  const { data: uacsCodes, loading: loadingUacs } = useFirestoreCollection<UacsCode>("uacsCodes");
  const { data: uoms, loading: loadingUoms } = useFirestoreCollection<Uom>("uoms");
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const confirmDeleteItem = (id: string) => {
    setItemToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
        await deleteItem(itemToDelete);
        toast({ title: "Success", description: "Item deleted successfully." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete item." });
    } finally {
        setItemToDelete(null);
        setIsAlertOpen(false);
    }
  };
  
  const handleSaveItem = async (itemData: ItemFormValues, id?: string) => {
    try {
        const uacs = uacsCodes.find(u => u.code === itemData.uacsCode);
        if (!uacs) {
            toast({ variant: "destructive", title: "Error", description: "Invalid UACS code selected." });
            return;
        }
        
        if (id) {
            // Update existing item
            const dataToSave = { ...itemData, category: uacs.category };
            await updateItem(id, dataToSave);
            toast({ title: "Success", description: "Item updated successfully." });
        } else {
            // Add new item
            const categoryPrefix = uacs.category.substring(0,3).toUpperCase();
            const timestamp = Math.floor(Date.now() / 1000);
            const newStockNo = `${categoryPrefix}-${timestamp}`;

            const dataToSave: Omit<Item, 'id'> = {
                ...itemData,
                stockNo: newStockNo,
                category: uacs.category,
                currentQuantity: 0,
            };
            await addItem(dataToSave);
            toast({ title: "Success", description: "Item added successfully." });
        }

      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to save item." });
    }
  };


  const filteredItems = useMemo(() => {
    return [...items].filter(
      (item) =>
        (item.stockNo && item.stockNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.uacsCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.description.localeCompare(b.description));
  }, [items, searchTerm]);

  const loading = loadingItems || loadingUacs || loadingUoms;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Item Management</h1>
            <p className="text-muted-foreground">Manage inventory items and categories</p>
          </div>
          <Button onClick={handleAddItem} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </header>
        
        <Card>
            <CardHeader>
                <CardTitle>Search Items</CardTitle>
                <CardDescription>Search by stock number, UACS code, category, or description</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-10"
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>Items</CardTitle>
             <CardDescription>A list of all inventory items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock No.</TableHead>
                    <TableHead>UACS Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Re-order Point</TableHead>
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
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.stockNo || "N/A"}</TableCell>
                        <TableCell>{item.uacsCode}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.reorderPoint}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => confirmDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No items found.
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
             <DialogDescription>
              {editingItem ? "Update the details of the item." : "Fill in the form to add a new item to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <ItemForm
            item={editingItem}
            uoms={uoms}
            uacsCodes={uacsCodes}
            onSubmit={handleSaveItem}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>


      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
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

    