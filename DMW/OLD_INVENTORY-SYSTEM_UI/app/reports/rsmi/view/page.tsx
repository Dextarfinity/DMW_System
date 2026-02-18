
"use client";

import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import type { RequisitionIssueSlip, Item, SuppliesLedgerCard } from '@/types';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { toDate } from '@/lib/utils';
import { LoadingOverlay } from '@/components/loading-overlay';

interface EnrichedRISItem {
    risNo: string;
    itemId: string;
    stockNo: string;
    itemDescription: string;
    unit: string;
    quantityIssued: number;
    unitCost: number;
    amount: number;
}

const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return '₱0.00';
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
};


function RSMIReportView() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const fromDate = from ? parseISO(from) : null;
  const toDateRange = to ? parseISO(to) : null;

  const { data: slips, loading: loadingSlips } = useFirestoreCollection<RequisitionIssueSlip>('requisitionIssueSlips');
  const { data: masterItems, loading: loadingItems } = useFirestoreCollection<Item>('items');
  const { data: ledgerCards, loading: loadingLedgers } = useFirestoreCollection<SuppliesLedgerCard>('suppliesLedgerCards');

  const itemsMap = useMemo(() => new Map(masterItems.map(item => [item.id, item])), [masterItems]);
  const ledgerCardsMap = useMemo(() => new Map(ledgerCards.map(card => [card.itemId, card])), [ledgerCards]);

  const reportItems = useMemo(() => {
    if (!fromDate || !toDateRange || !slips.length) return [];

    return slips
        .filter(slip => {
            const slipDate = toDate(slip.risDate);
            return slipDate && slipDate >= fromDate && slipDate <= toDateRange;
        })
        .flatMap(slip => slip.items.map(item => {
            const masterItem = itemsMap.get(item.itemId);
            const ledgerCard = ledgerCardsMap.get(item.itemId);
            
            const lastTx = ledgerCard?.transactions?.[ledgerCard.transactions.length - 1];
            const unitCost = lastTx?.balanceUnitCost ?? 0;

            return {
                itemId: item.itemId,
                risNo: slip.risNo,
                stockNo: masterItem?.stockNo ?? 'N/A',
                itemDescription: item.description,
                unit: item.uom,
                quantityIssued: item.quantity,
                unitCost: unitCost,
                amount: item.quantity * unitCost,
            };
        }))
        .sort((a, b) => a.risNo.localeCompare(b.risNo));
  }, [slips, fromDate, toDateRange, itemsMap, ledgerCardsMap]);
  
  const grandTotal = useMemo(() => reportItems.reduce((acc, item) => acc + item.amount, 0), [reportItems]);
  
  const recapData = useMemo(() => {
    const summary = new Map<
      string,
      {
        stockNo: string;
        uacsCode: string;
        quantity: number;
        totalCost: number;
      }
    >();

    for (const item of reportItems) {
        const masterItem = itemsMap.get(item.itemId);
        if (!masterItem) continue;

        const stockNo = masterItem.stockNo;
        const uacsCode = masterItem.uacsCode;

        const entry = summary.get(stockNo);

        if (entry) {
            entry.quantity += item.quantityIssued;
            entry.totalCost += item.amount;
        } else {
            summary.set(stockNo, {
                stockNo: stockNo,
                uacsCode: uacsCode,
                quantity: item.quantityIssued,
                totalCost: item.amount,
            });
        }
    }

    return Array.from(summary.values()).map(item => ({
        ...item,
        unitCost: item.quantity > 0 ? item.totalCost / item.quantity : 0,
    })).sort((a,b) => a.stockNo.localeCompare(b.stockNo));
  }, [reportItems, itemsMap]);

  const handlePrint = () => window.print();

  const loading = loadingSlips || loadingItems || loadingLedgers;

  if (loading) return <LoadingOverlay message="Generating RSMI Report..." />;
  if (!from || !to) return <div className="p-8">Please provide a date range.</div>;
  if (reportItems.length === 0) return <div className="p-8">No data available for the selected period.</div>;
  
  const reportDate = format(new Date(), 'MMMM d, yyyy');
  
  return (
    <div className="bg-white text-black font-serif print:m-0 print:p-0">
        <div className="max-w-4xl mx-auto p-4 print:border-none print:shadow-none print:p-0">
             <div className="flex justify-between items-center mb-2">
                <p className="text-sm mr-auto">Appendix 64</p>
                <Button variant="ghost" size="icon" onClick={handlePrint} className="print:hidden">
                    <Printer className="h-5 w-5" />
                    <span className="sr-only">Print</span>
                </Button>
            </div>
            
            <h1 className="text-xl font-bold text-center mb-4">REPORT OF SUPPLIES AND MATERIALS ISSUED</h1>
            
            <div className="grid grid-cols-2 gap-x-8 text-sm mb-2 border-t border-b border-black py-1">
                <div><span className="font-bold">Entity Name:</span> DMW-CARAGA</div>
                <div className="text-right"><span className="font-bold">Serial No.:</span> _______________</div>
                 <div><span className="font-bold">Fund Cluster:</span> _______________</div>
                <div className="text-right"><span className="font-bold">Date:</span> {reportDate}</div>
            </div>

            <table className="w-full border-collapse border border-black text-xs text-center">
                <thead>
                    <tr className="font-bold">
                        <th colSpan={6} className="border-r border-black p-1">To be filled up by the Supply and/or Property Division/Unit</th>
                        <th colSpan={2} className="p-1">To be filled up by the Accounting Division/Unit</th>
                    </tr>
                    <tr className="font-bold">
                        <th className="border-t border-b border-r border-black p-1">RIS No.</th>
                        <th className="border-t border-b border-r border-black p-1">Responsibility Center Code</th>
                        <th className="border-t border-b border-r border-black p-1">Stock No.</th>
                        <th className="border-t border-b border-r border-black p-1">Item</th>
                        <th className="border-t border-b border-r border-black p-1">Unit</th>
                        <th className="border-t border-b border-r border-black p-1">Quantity Issued</th>
                        <th className="border-t border-b border-r border-black p-1">Unit Cost</th>
                        <th className="border-t border-b border-black p-1">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {reportItems.map((item, index) => (
                        <tr key={index}>
                            <td className="border-r border-black p-1">{item.risNo}</td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1 text-left">{item.stockNo}</td>
                            <td className="border-r border-black p-1 text-left">{item.itemDescription}</td>
                            <td className="border-r border-black p-1">{item.unit}</td>
                            <td className="border-r border-black p-1">{item.quantityIssued}</td>
                            <td className="border-r border-black p-1 text-right">{formatCurrency(item.unitCost)}</td>
                            <td className="p-1 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                    ))}
                    {[...Array(Math.max(0, 15 - reportItems.length))].map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td className="border-r border-black h-6 p-1">&nbsp;</td>
                            <td className="border-r border-black"></td>
                            <td className="border-r border-black"></td>
                            <td className="border-r border-black"></td>
                            <td className="border-r border-black"></td>
                            <td className="border-r border-black"></td>
                            <td className="border-r border-black"></td>
                            <td></td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-bold">
                        <td colSpan={7} className="text-right p-1 border-t border-black">TOTAL</td>
                        <td className="text-right p-1 border-t border-black">{formatCurrency(grandTotal)}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="grid grid-cols-2 mt-[-1px]">
                {/* Left Recapitulation */}
                <div className="border-r border-l border-black">
                    <table className="w-full border-collapse text-xs text-center">
                        <thead>
                            <tr>
                                <th colSpan={2} className="border-t border-b border-black p-1 font-bold">Recapitulation</th>
                            </tr>
                            <tr>
                                <th className="border-b border-r border-black p-1 font-bold w-1/2">Stock No.</th>
                                <th className="border-b border-black p-1 font-bold w-1/2">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recapData.map((item, index) => (
                                <tr key={`recap-left-${index}`}>
                                    <td className="border-r border-black p-1 h-6">{item.stockNo}</td>
                                    <td className="p-1">{item.quantity}</td>
                                </tr>
                            ))}
                            {[...Array(Math.max(0, 5 - recapData.length))].map((_, i) => (
                                <tr key={`empty-recap-left-${i}`}>
                                    <td className="border-r border-black h-6 p-1">&nbsp;</td>
                                    <td className="p-1"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Right Recapitulation */}
                <div className="border-r border-black">
                    <table className="w-full border-collapse text-xs text-center">
                        <thead>
                            <tr>
                                <th colSpan={3} className="border-t border-b border-black p-1 font-bold">Recapitulation</th>
                            </tr>
                            <tr>
                                <th className="border-b border-r border-black p-1 font-bold">Unit Cost</th>
                                <th className="border-b border-r border-black p-1 font-bold">Total Cost</th>
                                <th className="border-b border-black p-1 font-bold">UACS Object Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recapData.map((item, index) => (
                                <tr key={`recap-right-${index}`}>
                                    <td className="border-r border-black p-1 h-6 text-right">{formatCurrency(item.unitCost)}</td>
                                    <td className="border-r border-black p-1 text-right">{formatCurrency(item.totalCost)}</td>
                                    <td className="p-1">{item.uacsCode}</td>
                                </tr>
                            ))}
                            {[...Array(Math.max(0, 5 - recapData.length))].map((_, i) => (
                                <tr key={`empty-recap-right-${i}`}>
                                    <td className="border-r border-black h-6 p-1">&nbsp;</td>
                                    <td className="border-r border-black p-1"></td>
                                    <td className="p-1"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-2 mt-[-1px] border border-black border-b-0">
                <div className="p-2 border-r border-black">
                    <p className="mb-8">I hereby certify to the correctness of the above information.</p>
                    <div className="text-center">
                        <p className="font-bold border-b border-black w-4/5 mx-auto">&nbsp;</p>
                        <p className="text-xs">Signature over Printed Name of Supply and/or Property Custodian</p>
                    </div>
                </div>
                <div className="p-2">
                    <p className="mb-2">Posted by:</p>
                    <div className="text-center">
                        <p className="font-bold border-b border-black w-4/5 mx-auto mb-2">&nbsp;</p>
                        <p className="text-xs mb-4">Signature over Printed Name of Designated Accounting Staff</p>
                        <div className="w-4/5 mx-auto flex justify-end">
                            <div className="w-2/5">
                                <p className="font-bold border-b border-black">&nbsp;</p>
                                <p className="text-xs text-center">Date</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default function RsmiViewPage() {
    return (
        <Suspense fallback={<LoadingOverlay message="Loading RSMI Report..." />}>
            <RSMIReportView />
        </Suspense>
    )
}

    