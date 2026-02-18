
"use client";

import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import useFirestoreDocument from '@/hooks/use-firestore-document';
import type { Item, InspectionAcceptanceReport, RequisitionIssueSlip, PurchaseOrder } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { toDate } from '@/lib/utils';
import { LoadingOverlay } from '@/components/loading-overlay';

// Define the structure for a unified transaction
interface UnifiedTransaction {
    date: Date;
    reference: string;
    receiptQty: number;
    issueQty: number;
    issueOffice: string;
    balance: number;
}

function StockCardComponent() {
    const searchParams = useSearchParams();
    const itemId = searchParams.get('itemId');

    // Fetch the specific item
    const { data: item, loading: loadingItem } = useFirestoreDocument<Item>('items', itemId || '---');
    
    // Fetch all related transactions
    const { data: iars, loading: loadingIARs } = useFirestoreCollection<InspectionAcceptanceReport>('iars');
    const { data: slips, loading: loadingRIS } = useFirestoreCollection<RequisitionIssueSlip>('requisitionIssueSlips');
    const { data: pos, loading: loadingPOs } = useFirestoreCollection<PurchaseOrder>('purchaseOrders');

    // Find the first PO associated with this item to get a fund cluster
    const associatedPO = useMemo(() => {
        if (!iars || !pos || !itemId) return null;
        const relevantIar = iars.find(iar => iar.status === 'Completed' && iar.items.some(i => i.itemId === itemId));
        if (!relevantIar) return null;
        return pos.find(p => p.id === relevantIar.poId);
    }, [iars, pos, itemId]);

    const transactions = useMemo(() => {
        if (!itemId || !iars || !slips) return [];

        const receiptTxs = iars
            .filter(iar => iar.status === 'Completed')
            .flatMap(iar => 
                iar.items
                    .filter(i => i.itemId === itemId)
                    .map(i => ({
                        date: toDate(iar.iarDate),
                        reference: iar.iarNumber,
                        receiptQty: i.quantity,
                        issueQty: 0,
                        issueOffice: ''
                    }))
            );
        
        const issueTxs = slips
            .filter(ris => ris.status === 'POSTED')
            .flatMap(ris => 
                ris.items
                    .filter(i => i.itemId === itemId)
                    .map(i => ({
                        date: toDate(ris.risDate),
                        reference: ris.risNo,
                        receiptQty: 0,
                        issueQty: i.quantity,
                        issueOffice: ris.division
                    }))
            );

        const combined = [...receiptTxs, ...issueTxs]
            .filter(tx => tx.date) // Ensure date is valid
            .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());

        // Calculate running balance
        let currentBalance = 0;
        return combined.map(tx => {
            currentBalance += tx.receiptQty - tx.issueQty;
            return {
                ...tx,
                date: tx.date as Date,
                balance: currentBalance
            };
        });

    }, [itemId, iars, slips]);

    const handlePrint = () => window.print();
    
    const loading = loadingItem || loadingIARs || loadingRIS || loadingPOs;

    if (loading) return <LoadingOverlay message="Generating Stock Card..." />;
    if (!item) return <div className="p-8 text-center">Item not found. Please select an item from the inventory list.</div>;

    return (
        <div className="bg-white text-black font-serif print:m-0 print:p-0">
            <div className="max-w-4xl mx-auto p-4 print:border-none print:shadow-none print:p-0">
                <div className="flex justify-end items-center mb-2">
                    <p className="text-sm mr-auto">Appendix 58</p>
                    <Button variant="ghost" size="icon" onClick={handlePrint} className="print:hidden">
                        <Printer className="h-5 w-5" />
                        <span className="sr-only">Print</span>
                    </Button>
                </div>
                
                <h1 className="text-xl font-bold text-center mb-4">STOCK CARD</h1>

                <div className="border border-black p-2 text-sm">
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>
                            <div className="flex"><p className="w-36">Entity Name:</p><p className="border-b border-black flex-grow">DMW-CARAGA</p></div>
                            <div className="flex"><p className="w-36">Item:</p><p className="border-b border-black flex-grow font-semibold">{item.description}</p></div>
                            <div className="flex"><p className="w-36">Description:</p><p className="border-b border-black flex-grow"></p></div>
                            <div className="flex"><p className="w-36">Unit of Measurement:</p><p className="border-b border-black flex-grow">{item.unit}</p></div>
                        </div>
                        <div>
                            <div className="flex"><p className="w-36">Fund Cluster:</p><p className="border-b border-black flex-grow">{associatedPO?.fundCluster || ''}</p></div>
                            <div className="flex"><p className="w-36">Stock No.:</p><p className="border-b border-black flex-grow">{item.stockNo}</p></div>
                            <div className="flex"><p className="w-36">Re-order Point:</p><p className="border-b border-black flex-grow">{item.reorderPoint}</p></div>
                        </div>
                    </div>
                </div>

                <table className="w-full border-collapse border border-black text-xs text-center mt-[-1px]">
                    <thead>
                        <tr className="font-bold">
                            <th rowSpan={2} className="border border-black p-1 w-[12%]">Date</th>
                            <th rowSpan={2} className="border border-black p-1 w-[15%]">Reference</th>
                            <th colSpan={1} className="border border-black p-1">Receipt</th>
                            <th colSpan={2} className="border border-black p-1">Issue</th>
                            <th colSpan={1} className="border border-black p-1">Balance</th>
                            <th rowSpan={2} className="border border-black p-1">No. of Days to Consume</th>
                        </tr>
                         <tr className="font-bold">
                            <th className="border border-black p-1 w-[10%]">Qty.</th>
                            <th className="border border-black p-1 w-[10%]">Qty.</th>
                            <th className="border border-black p-1 w-[20%]">Office</th>
                            <th className="border border-black p-1 w-[10%]">Qty.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <tr key={index}>
                                <td className="border border-black p-1">{format(tx.date, 'MM/dd/yyyy')}</td>
                                <td className="border border-black p-1">{tx.reference}</td>
                                <td className="border border-black p-1">{tx.receiptQty > 0 ? tx.receiptQty : ''}</td>
                                <td className="border border-black p-1">{tx.issueQty > 0 ? tx.issueQty : ''}</td>
                                <td className="border border-black p-1 text-left">{tx.issueOffice}</td>
                                <td className="border border-black p-1 font-bold">{tx.balance}</td>
                                <td className="border border-black p-1"></td>
                            </tr>
                        ))}
                        {[...Array(Math.max(0, 15 - transactions.length))].map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td className="border border-black h-6">&nbsp;</td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function StockCardPage() {
    return (
        <Suspense fallback={<LoadingOverlay message="Loading Stock Card..." />}>
            <StockCardComponent />
        </Suspense>
    )
}
