
"use client";

import { PurchaseOrderForm, type PurchaseOrderFormValues } from "@/components/purchase-order-form";
import type { PurchaseOrder, Supplier, FundCluster, ProcurementMode, Item } from "@/types";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function CreatePurchaseOrderPage() {
    const { data: suppliers, loading: loadingSuppliers } = useFirestoreCollection<Supplier>("suppliers");
    const { data: fundClusters, loading: loadingFundClusters } = useFirestoreCollection<FundCluster>("fundClusters");
    const { data: procurementModes, loading: loadingProcurementModes } = useFirestoreCollection<ProcurementMode>("procurementModes");
    const { data: items, loading: loadingItems } = useFirestoreCollection<Item>("items");
    const { toast } = useToast();
    const router = useRouter();

    const handleSavePO = async (poData: PurchaseOrderFormValues, poId?: string, status: PurchaseOrder['status'] = 'Pending') => {
        const selectedSupplier = suppliers.find(s => s.id === poData.supplierId);
        if (!selectedSupplier) {
            toast({ variant: "destructive", title: "Error", description: "Invalid supplier selected." });
            return;
        }

        try {
             const dataToSave = {
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
            await addDoc(collection(db, "purchaseOrders"), dataToSave);
            toast({ title: "Success", description: `Purchase order ${status === 'Draft' ? 'draft saved' : 'created'} successfully.` });
            router.push("/transactions/po");
        } catch (error) {
            console.error(`Error creating purchase order: `, error);
            toast({ variant: "destructive", title: "Error", description: "Failed to create purchase order." });
        }
    };

    const loading = loadingSuppliers || loadingFundClusters || loadingProcurementModes || loadingItems;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
            <main className="max-w-4xl mx-auto space-y-6">
                <header>
                    <h1 className="text-3xl font-bold">Create Purchase Order</h1>
                    <p className="text-muted-foreground">Fill out the form below to create a new purchase order.</p>
                </header>

                {loading ? (
                    <p>Loading form data...</p>
                ) : (
                    <PurchaseOrderForm 
                        purchaseOrder={null}
                        suppliers={suppliers}
                        fundClusters={fundClusters}
                        procurementModes={procurementModes}
                        items={items}
                        onSubmit={handleSavePO}
                        onCancel={() => router.push("/transactions/po")}
                    />
                )}
            </main>
        </div>
    );
}
