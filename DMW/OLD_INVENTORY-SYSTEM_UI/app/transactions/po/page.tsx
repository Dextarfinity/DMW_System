

"use client";

import { useState, useMemo, useCallback } from "react";
import type { PurchaseOrder, Supplier, InspectionAcceptanceReport, Item, ItemCategory } from "@/types";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Search, MoreHorizontal, Eye, Pencil, CheckCircle2, Undo2 } from "lucide-react";
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
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LoadingOverlay } from "@/components/loading-overlay";

const validUacsLength = 10;

export default function PoPage() {
  const { data: purchaseOrders, deleteItem, updateItem, loading: loadingPOs } = useFirestoreCollection<PurchaseOrder>("purchaseOrders");
  const { data: suppliers, loading: loadingSuppliers } = useFirestoreCollection<Supplier>("suppliers");
  const { data: allItems, loading: loadingItems } = useFirestoreCollection<Item>("items");
  const { toast } = useToast();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [poToAction, setPoToAction] = useState<{po: PurchaseOrder, action: 'delete' | 'deliver' | 'unpost'} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsMap = useMemo(() => new Map(allItems.map(item => [item.id, item])), [allItems]);
  
  const handleAddPO = () => {
    router.push('/transactions/po/create');
  };

  const confirmAction = useCallback((po: PurchaseOrder, action: 'delete' | 'deliver' | 'unpost') => {
    setPoToAction({ po, action });
    setIsAlertOpen(true);
  }, []);
  
  const resetState = useCallback(() => {
    setIsAlertOpen(false);
    setPoToAction(null);
  }, []);

  const deliverPO = async (po: PurchaseOrder) => {
    try {
        await updateItem(po.id, { status: 'Delivered' });

        const expandedIARItems = po.items.flatMap(poItem => {
            const masterItem = allItems.find(item => item.id === poItem.itemId);
            if (!masterItem) {
                console.warn(`Master item not found for PO item: ${poItem.itemId}`);
                return []; // Skip if master item doesn't exist
            }
            if (masterItem.category === 'Semi-Expendable' || masterItem.category === 'Capital Outlay') {
                // Split into individual items
                return Array.from({ length: poItem.quantity }, () => ({
                    ...poItem,
                    category: masterItem.category as ItemCategory, // Add category here
                    quantity: 1,
                    unitCost: poItem.unitCost,
                    totalCost: poItem.unitCost,
                }));
            }
            // Keep as a single line item for expendables
            return [{...poItem, category: masterItem.category as ItemCategory}];
        });

        const iarData: Omit<InspectionAcceptanceReport, 'id'> = {
            poId: po.id,
            poNumber: po.poNumber,
            supplierId: po.supplierId,
            supplierName: po.supplierName,
            purpose: po.purpose,
            iarDate: po.poDate,
            iarNumber: "", // IAR number is now manually entered
            invoiceNumber: '',
            invoiceDate: po.poDate,
            status: 'Pending',
            items: expandedIARItems,
        };
        await addDoc(collection(db, "iars"), iarData);
        toast({ title: "Success", description: "PO marked as Delivered and IAR has been generated." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: `Failed to deliver PO. ${error}` });
    }
  }

  const handleDeletePO = async (id: string) => {
      try {
        await deleteItem(id);
        toast({ title: "Success", description: "Purchase order deleted successfully." });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete purchase order." });
      }
  };

  const handleUnpostPO = async (po: PurchaseOrder) => {
      try {
        if (po.status !== 'Delivered' && po.status !== 'Completed') {
            throw new Error('Only delivered or completed POs can be unposted.');
        }
        await updateItem(po.id, { status: 'Pending' });
        toast({ title: "Success", description: "Purchase order has been unposted and set to Pending." });
      } catch (error: any) {
         toast({ variant: "destructive", title: "Error", description: error.message || "Failed to unpost purchase order." });
      }
  }

  const handleConfirmAction = async () => {
    if (!poToAction) return;
    
    setIsSubmitting(true);

    try {
        const { po, action } = poToAction;
        if (action === 'deliver') {
            await deliverPO(po);
        } else if (action === 'delete') {
            await handleDeletePO(po.id);
        } else if (action === 'unpost') {
            await handleUnpostPO(po);
        }
    } finally {
        setIsSubmitting(false);
        resetState();
    }
  };
  
  const getDialogContent = () => {
      if (!poToAction) return { title: "", description: "" };
      switch (poToAction.action) {
          case 'delete':
              return { title: "Confirm Deletion", description: `This action cannot be undone. This will permanently delete the purchase order #${poToAction.po.poNumber}.` };
          case 'deliver':
              return { title: "Confirm Delivery", description: "This will mark the PO as delivered and generate a pending IAR. Are you sure?" };
          case 'unpost':
              return { title: "Confirm Unpost", description: "This will revert the PO status to 'Pending', allowing for re-delivery or edits. This action should be used with caution."};
          default:
              return { title: "", description: "" };
      }
  };
  
  const formatCurrency = (amount: number) => {
    if(!amount) return '₱0.00';
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(
      (po) =>
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchaseOrders, searchTerm]);
  
  const getStatusVariant = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
      case 'Delivered':
        return 'success';
      case 'Processing':
        return 'secondary';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
       case 'Draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const totalAmount = useMemo(() => {
    return filteredPOs.reduce((total, po) => total + po.totalAmount, 0);
  }, [filteredPOs]);
  
  const loading = loadingPOs || loadingSuppliers || loadingItems;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      {isSubmitting && <LoadingOverlay message="Processing..." />}
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Purchase Order Management</h1>
            <p className="text-muted-foreground">Manage purchase orders</p>
          </div>
          <Button onClick={handleAddPO} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New PO
          </Button>
        </header>
        
        <Card>
            <CardHeader>
                <CardTitle>Search Purchase Orders</CardTitle>
                <CardDescription>Search by PO number, supplier, purpose or status</CardDescription>
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
             <CardTitle>Purchase Orders</CardTitle>
             <CardDescription>A list of all purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Date</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Total Amount</TableHead>
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
                  ) : filteredPOs.length > 0 ? (
                    filteredPOs.map((po) => {
                      const isLocked = po.status === 'Delivered' || po.status === 'Completed';
                      return (
                      <TableRow key={po.id}>
                        <TableCell>{format(toDate(po.poDate)!, "PPP")}</TableCell>
                        <TableCell className="font-medium">{po.poNumber}</TableCell>
                        <TableCell>{po.supplierName}</TableCell>
                        <TableCell className="max-w-xs truncate">{po.purpose}</TableCell>
                        <TableCell>{formatCurrency(po.totalAmount)}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(po.status)}>{po.status}</Badge>
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
                                    <DropdownMenuItem onClick={() => router.push(`/transactions/po/${po.id}/edit`)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => router.push(`/transactions/po/${po.id}/edit`)} disabled={isLocked}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => confirmAction(po, 'deliver')}
                                      disabled={isLocked}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Mark as Delivered
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => confirmAction(po, 'unpost')}
                                      disabled={!isLocked}
                                    >
                                        <Undo2 className="mr-2 h-4 w-4" />
                                        Unpost
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={() => confirmAction(po, 'delete')} 
                                        className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )})
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No purchase orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={4}>Total POs: <span className="font-semibold text-primary">{filteredPOs.length}</span></TableCell>
                        <TableCell colSpan={3} className="text-right">Grand Total Amount: <span className="font-semibold text-primary">{formatCurrency(totalAmount)}</span></TableCell>
                    </TableRow>
                </TableFooter>
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
              className={poToAction?.action === 'delete' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
