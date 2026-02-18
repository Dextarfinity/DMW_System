
"use client";

import { useParams, useRouter } from 'next/navigation';
import useFirestoreDocument from '@/hooks/use-firestore-document';
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import { useToast } from "@/hooks/use-toast";
import type { ReceivedCapitalOutlayItem, Employee, Designation, PropertyAcknowledgementReceipt, SettingsCounters, PropertyCard, PropertyLedgerCard, SuppliesLedgerCardTransaction } from "@/types";
import { IssueParForm, type IssueParFormValues } from "@/components/issue-par-form";
import { LoadingOverlay } from '@/components/loading-overlay';
import { addDoc, collection, doc, updateDoc, Timestamp, runTransaction, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function IssueParPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const { data: item, loading: loadingItem, error: itemError } = useFirestoreDocument<ReceivedCapitalOutlayItem>("receivedCapitalOutlayItems", id);
    const { data: employees, loading: loadingEmployees } = useFirestoreCollection<Employee>("employees");
    const { data: designations, loading: loadingDesignations } = useFirestoreCollection<Designation>("designations");
    
    const handleIssuePar = async (formData: IssueParFormValues) => {
       if (!item) {
            toast({ variant: "destructive", title: "Error", description: "Item data is not available." });
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                const receivedByEmployee = employees.find(e => e.id === formData.receivedById);
                if (!receivedByEmployee) throw new Error("Could not find the 'received by' employee.");
                
                // --- Reference documents needed for the transaction ---
                const settingsRef = doc(db, "settings", "globalCounters");
                const itemRef = doc(db, 'receivedCapitalOutlayItems', item.id);
                const propertyCardQuery = query(collection(db, "propertyCards"), where("propertyNumber", "==", item.ppeNo));
                const ledgerCardQuery = query(collection(db, "propertyLedgerCards"), where("propertyNumber", "==", item.ppeNo));
                
                // --- All reads must be done before writes in a transaction ---
                const settingsSnap = await transaction.get(settingsRef);
                const propertyCardSnap = await getDocs(propertyCardQuery);
                const ledgerCardSnap = await getDocs(ledgerCardQuery);
                
                if (propertyCardSnap.empty) {
                    throw new Error(`Property Card not found for PPE No: ${item.ppeNo}. Issuance cannot proceed.`);
                }
                if (ledgerCardSnap.empty) {
                     throw new Error(`Property Ledger Card not found for PPE No: ${item.ppeNo}. Issuance cannot proceed.`);
                }
                const propertyCardDoc = propertyCardSnap.docs[0];
                const ledgerCardDoc = ledgerCardSnap.docs[0];

                // --- All reads are done, now we can proceed with logic and writes. ---
                
                // 1. Generate PAR Number
                const settingsData = (settingsSnap.data() || {}) as SettingsCounters;
                const parCounters = settingsData.parCounters || {};
                const issueDate = formData.dateOfIssue;
                const year = String(issueDate.getFullYear());
                const currentYearCount = parCounters[year] || 0;
                const newCount = currentYearCount + 1;
                const parNo = `${year}-${String(newCount).padStart(4, '0')}`;

                // 2. Create the new PAR document
                const parData: Omit<PropertyAcknowledgementReceipt, 'id'> = {
                    parNo: parNo,
                    ppeNo: item.ppeNo,
                    description: item.itemDescription,
                    issuedTo: receivedByEmployee.name,
                    dateOfIssue: Timestamp.fromDate(formData.dateOfIssue),
                    receivedFromId: formData.receivedFromId,
                    receivedFromPosition: formData.receivedFromPosition,
                    receivedById: formData.receivedById,
                    receivedByPosition: formData.receivedByPosition,
                    otherInfo: formData.otherInfo
                };
                const newParRef = doc(collection(db, 'propertyAcknowledgementReceipts'));
                transaction.set(newParRef, parData);

                // 3. Update the status of the capital outlay item
                transaction.update(itemRef, {
                    status: 'Issued',
                    issuedTo: receivedByEmployee.name,
                    brand: formData.brand || '',
                    model: formData.model || '',
                    serialNo: formData.serialNo || '',
                });

                // 4. Update the PAR counter in settings
                transaction.set(settingsRef, {
                    parCounters: {
                        ...parCounters,
                        [year]: newCount,
                    }
                }, { merge: true });

                // 5. Update the corresponding Property Card
                transaction.update(propertyCardDoc.ref, {
                    issuedTo: receivedByEmployee.name,
                    issuedDate: Timestamp.fromDate(formData.dateOfIssue),
                    icsNo: parNo, // Using icsNo field for reference number
                });
                
                // 6. Update the corresponding Property Ledger Card with a new transaction
                const ledgerData = ledgerCardDoc.data() as PropertyLedgerCard;
                
                const iarQuery = query(collection(db, 'iars'), where('items', 'array-contains', { generatedItemId: item.generatedItemId }));
                const iarSnaps = await getDocs(iarQuery);
                const iarDoc = iarSnaps.docs.length > 0 ? iarSnaps.docs[0] : null;

                const lastTx = (ledgerData.transactions && ledgerData.transactions.length > 0) 
                    ? ledgerData.transactions[ledgerData.transactions.length - 1]
                    : { balanceQty: 1, balanceUnitCost: ledgerData.acquisitionCost, balanceTotalCost: ledgerData.acquisitionCost };

                const newLedgerTx: SuppliesLedgerCardTransaction = {
                    date: Timestamp.fromDate(formData.dateOfIssue),
                    reference: `PAR#${parNo}`,
                    receiptQty: 0,
                    receiptUnitCost: 0,
                    receiptTotalCost: 0,
                    issueQty: 1,
                    issueUnitCost: lastTx.balanceUnitCost,
                    issueTotalCost: lastTx.balanceTotalCost,
                    balanceQty: 0,
                    balanceUnitCost: 0,
                    balanceTotalCost: 0,
                };
                
                 const existingTransactions = ledgerData.transactions || [];
                 const initialTransaction: SuppliesLedgerCardTransaction = {
                    date: ledgerData.acquisitionDate,
                    reference: iarDoc ? iarDoc.data().iarNumber : `IAR-For-${item.ppeNo}`,
                    receiptQty: 1,
                    receiptUnitCost: ledgerData.acquisitionCost,
                    receiptTotalCost: ledgerData.acquisitionCost,
                    issueQty: 0, issueUnitCost: 0, issueTotalCost: 0,
                    balanceQty: 1,
                    balanceUnitCost: ledgerData.acquisitionCost,
                    balanceTotalCost: ledgerData.acquisitionCost,
                 };
                
                 const transactions = existingTransactions.length > 0 ? existingTransactions : [initialTransaction];

                 transaction.update(ledgerCardDoc.ref, {
                    transactions: [...transactions, newLedgerTx]
                });
            });
            
            toast({ title: "Success", description: "Item issued successfully and PAR created." });
            router.push('/transactions/received-capital-outlay');

        } catch (error: any) {
            console.error("Error issuing item:", error);
            toast({ variant: "destructive", title: "Error", description: `Failed to issue item. ${error.message}` });
        }
    };

    const loading = loadingItem || loadingEmployees || loadingDesignations;

    if (loading) {
        return <LoadingOverlay message="Loading item details..." />;
    }

    if (itemError) {
        return <div className="p-8">Error: {itemError.message}</div>;
    }

    if (!item) {
        return <div className="p-8">Item not found.</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
            <main className="max-w-4xl mx-auto space-y-6">
                 <header>
                    <h1 className="text-3xl font-bold">Issue Property Acknowledgment Receipt</h1>
                    <p className="text-muted-foreground">Fill out the form below to issue the item.</p>
                </header>
                 <IssueParForm
                    item={item}
                    employees={employees}
                    designations={designations}
                    onSubmit={handleIssuePar}
                    onCancel={() => router.push('/transactions/received-capital-outlay')}
                />
            </main>
        </div>
    );
}
