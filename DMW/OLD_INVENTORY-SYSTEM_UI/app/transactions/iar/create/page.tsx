
"use client";

import { useRouter } from "next/navigation";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";
import type { PurchaseOrder, Supplier, InspectionAcceptanceReport } from "@/types";
import { IARForm, type IARFormValues } from "@/components/iar-form";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CreateIarPage() {
    const router = useRouter();
    const { toast } = useToast();

    const { data: purchaseOrders, loading: loadingPOs } = useFirestoreCollection<PurchaseOrder>("purchaseOrders");
    const { data: suppliers, loading: loadingSuppliers } = useFirestoreCollection<Supplier>("suppliers");

    const handleSaveIAR = async (iarData: IARFormValues) => {
        try {
            const po = purchaseOrders.find(p => p.id === iarData.poId);
            if (!po) {
                throw new Error("Invalid PO selected.");
            }

            const supplier = suppliers.find(s => s.id === po.supplierId);
            if (!supplier) {
                throw new Error("Invalid supplier for the selected PO.");
            }

            const dataToSave: Omit<InspectionAcceptanceReport, 'id'> = {
                // Keep only fields that are part of InspectionAcceptanceReport
                iarDate: Timestamp.fromDate(iarData.iarDate),
                invoiceNumber: iarData.invoiceNumber,
                invoiceDate: Timestamp.fromDate(iarData.invoiceDate),
                iarNumber: iarData.iarNumber,
                poId: po.id,
                supplierId: po.supplierId,
                poNumber: po.poNumber,
                supplierName: supplier.name,
                purpose: po.purpose,
                items: po.items.map(item => ({...item})), // Copy items from PO
                status: 'Pending'
            };

            await addDoc(collection(db, "iars"), dataToSave);
            toast({ title: "Success", description: "IAR created successfully." });
            router.push("/transactions/iar");

        } catch (error: any) {
            console.error("Error creating IAR:", error);
            toast({ variant: "destructive", title: "Error", description: `Failed to create IAR. ${error.message}` });
        }
    };
    
    const loading = loadingPOs || loadingSuppliers;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
            <main className="max-w-4xl mx-auto space-y-6">
                <header>
                    <h1 className="text-3xl font-bold">New Inspection & Acceptance Report</h1>
                    <p className="text-muted-foreground">Fill in the details to create a new IAR.</p>
                </header>

                {loading ? (
                    <p>Loading form data...</p>
                ) : (
                    <IARForm 
                        iar={null}
                        purchaseOrders={purchaseOrders}
                        suppliers={suppliers}
                        onSubmit={handleSaveIAR}
                        onCancel={() => router.push('/transactions/iar')}
                    />
                )}
            </main>
        </div>
    );
}

    
