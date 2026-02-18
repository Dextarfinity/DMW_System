
"use client";

import { PurchaseOrderForm, type PurchaseOrderFormValues } from "@/components/purchase-order-form";
import type { PurchaseOrder, Supplier, FundCluster, ProcurementMode, Item } from "@/types";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import useFirestoreDocument from "@/hooks/use-firestore-document";
import { useToast } from "@/hooks/use-toast";
import { updateDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LoadingOverlay } from "@/components/loading-overlay";

export default function EditPurchaseOrderPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { data: purchaseOrder, loading: loadingPO } = useFirestoreDocument<PurchaseOrder>("purchaseOrders", id);
    const { data: suppliers, loading: loadingSuppliers } = useFirestoreCollection<Supplier>("suppliers");
    const { data: fundClusters, loading: loadingFundClusters } = useFirestoreCollection<FundCluster>("fundClusters");
    const { data: procurementModes, loading: loadingProcurementModes } = useFirestoreCollection<ProcurementMode>("procurementModes");
    const { data: items, loading: loadingItems } = useFirestoreCollection<Item>("items");
    const { toast } = useToast();

    const handleSavePO = async (poData: PurchaseOrderFormValues, poId?: string, status: PurchaseOrder['status'] = 'Pending') => {
        if (!poId) return;

        const selectedSupplier = suppliers.find(s => s.id === poData.supplierId);
        if (!selectedSupplier) {
            toast({ variant: "destructive", title: "Error", description: "Invalid supplier selected." });
            return;
        }

        try {
            const poRef = doc(db, "purchaseOrders", poId);
            const poSnap = await getDoc(poRef);
            if (!poSnap.exists()) {
                throw new Error("Purchase Order not found.");
            }
            const existingPO = poSnap.data() as PurchaseOrder;

            // This check is now redundant due to the page-level guard, but kept for backend safety
            if (existingPO.status === 'Delivered' || existingPO.status === 'Completed') {
                throw new Error("This Purchase Order is already delivered or completed and cannot be edited.");
            }

            const dataToUpdate = {
                ...poData,
                poDate: Timestamp.fromDate(poData.poDate),
                dateOfDelivery: Timestamp.fromDate(poData.dateOfDelivery),
                supplierName: selectedSupplier.name,
                status: status,
                totalAmount: poData.items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0),
                 items: poData.items.map(item => ({
                    ...item,
                    totalCost: item.quantity * item.unitCost,
                }))
            };
            
            await updateDoc(poRef, dataToUpdate as any);
            toast({ title: "Success", description: "Purchase order updated successfully." });
            router.push("/transactions/po");
        } catch (error: any) {
            console.error("Error updating purchase order: ", error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update purchase order." });
        }
    };

    const loading = loadingPO || loadingSuppliers || loadingFundClusters || loadingProcurementModes || loadingItems;

    if (loading) {
        return <LoadingOverlay message="Loading Purchase Order..." />;
    }

    if (!purchaseOrder) {
        return (
            <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
                <main className="max-w-4xl mx-auto space-y-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>Purchase Order not found.</AlertDescription>
                    </Alert>
                </main>
            </div>
        );
    }
    
    // Page-level guard to prevent editing of delivered or completed POs
    if (purchaseOrder.status === 'Delivered' || purchaseOrder.status === 'Completed') {
        return (
            <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
                <main className="max-w-4xl mx-auto space-y-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Editing Locked</AlertTitle>
                        <AlertDescription>
                            This Purchase Order can no longer be edited because its status is '{purchaseOrder.status}'. Please unpost it first if you need to make changes.
                        </AlertDescription>
                    </Alert>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
            <main className="max-w-4xl mx-auto space-y-6">
                <header>
                    <h1 className="text-3xl font-bold">Edit Purchase Order</h1>
                    <p className="text-muted-foreground">Update the details of the purchase order below.</p>
                </header>
                <PurchaseOrderForm 
                    purchaseOrder={purchaseOrder}
                    suppliers={suppliers}
                    fundClusters={fundClusters}
                    procurementModes={procurementModes}
                    items={items}
                    onSubmit={handleSavePO}
                    onCancel={() => router.push("/transactions/po")}
                />
            </main>
        </div>
    );
}
