
"use client";

import { useParams, useRouter } from 'next/navigation';
import useFirestoreDocument from '@/hooks/use-firestore-document';
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import { useToast } from "@/hooks/use-toast";
import type { InspectionAcceptanceReport, PurchaseOrder, Supplier, IARItem } from "@/types";
import { IARForm, type IARFormValues } from "@/components/iar-form";
import { Timestamp } from "firebase/firestore";
import { LoadingOverlay } from '@/components/loading-overlay';
import { acceptIAR } from '@/services/inventory';
import { toDate } from '@/lib/utils';
import { useState } from 'react';

export default function EditIarPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: iar, loading: loadingIAR, error: iarError } = useFirestoreDocument<InspectionAcceptanceReport>("iars", id);
    const { data: purchaseOrders, loading: loadingPOs, error: poError } = useFirestoreCollection<PurchaseOrder>("purchaseOrders");
    const { data: suppliers, loading: loadingSuppliers, error: supplierError } = useFirestoreCollection<Supplier>("suppliers");


    const handleAcceptIAR = async (iarData: IARFormValues, iarId?: string) => {
        if (!iarId || !iar) {
            toast({ variant: "destructive", title: "Error", description: "IAR data not found." });
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Construct the full IAR object with the latest updates from the form.
            // This ensures all user-entered data, including iarNumber, is preserved.
            const updatedIAR: InspectionAcceptanceReport = {
                ...iar,
                iarNumber: iarData.iarNumber,
                iarDate: iarData.iarDate as any,
                invoiceNumber: iarData.invoiceNumber,
                invoiceDate: iarData.invoiceDate as any,
                purpose: iarData.purpose,
                items: iarData.items.map(item => ({
                    ...item,
                    brand: item.brand || '',
                    model: item.model || '',
                    serialNo: item.serialNo || '',
                    remarks: item.remarks || '',
                    ppeNo: item.ppeNo || '',
                    inventoryNo: item.inventoryNo || '',
                    generatedItemId: item.generatedItemId || '',
                })),
            };

            // The service will handle final conversion to Timestamps and all business logic.
            await acceptIAR(updatedIAR);

            toast({ title: "Success", description: "IAR accepted and inventory updated successfully." });
            router.push("/transactions/iar");

        } catch (error: any) {
            console.error("Error accepting IAR: ", error);
            toast({ variant: "destructive", title: "Error", description: `Failed to accept IAR. ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const loading = loadingIAR || loadingPOs || loadingSuppliers;
    const error = iarError || poError || supplierError;

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
                <main className="max-w-4xl mx-auto space-y-6">
                    <LoadingOverlay message="Loading IAR data..." />
                </main>
            </div>
        )
    }

    if (error) {
        return <div className="p-8">Error: {error.message}</div>;
    }

    if (!iar) {
        return <div className="p-8">IAR not found.</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
             {isSubmitting && <LoadingOverlay message="Accepting IAR..." />}
            <main className="max-w-4xl mx-auto space-y-6">
                 <header>
                    <h1 className="text-3xl font-bold">Edit Inspection & Acceptance Report</h1>
                    <p className="text-muted-foreground">
                        Editing IAR for PO #{iar.poNumber}
                    </p>
                </header>
                <IARForm 
                    key={iar.id}
                    iar={iar}
                    purchaseOrders={purchaseOrders}
                    suppliers={suppliers}
                    onSubmit={handleAcceptIAR}
                    onCancel={() => router.push('/transactions/iar')}
                    isEditMode={true}
                    isSubmitting={isSubmitting}
                />
            </main>
        </div>
    );
}
