
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import useFirestoreDocument from '@/hooks/use-firestore-document';
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import type { PropertyAcknowledgementReceipt, ReceivedCapitalOutlayItem, Employee, PurchaseOrder, Item, InspectionAcceptanceReport } from '@/types';
import { format } from 'date-fns';
import { toDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { LoadingOverlay } from '@/components/loading-overlay';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';

const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return '₱0.00';
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
};

export default function ViewParPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: par, loading: loadingPar } = useFirestoreDocument<PropertyAcknowledgementReceipt>('propertyAcknowledgementReceipts', id);
    const { data: receivedItems, loading: loadingReceivedItems } = useFirestoreCollection<ReceivedCapitalOutlayItem>('receivedCapitalOutlayItems');
    const { data: employees, loading: loadingEmployees } = useFirestoreCollection<Employee>('employees');
    const { data: iars, loading: loadingIars } = useFirestoreCollection<InspectionAcceptanceReport>('iars');
    const { data: pos, loading: loadingPos } = useFirestoreCollection<PurchaseOrder>('purchaseOrders');
    const { data: masterItems, loading: loadingMasterItems } = useFirestoreCollection<Item>('items');

    const receivedItem = useMemo(() => {
        if (!par || !receivedItems) return null;
        return receivedItems.find(item => item.ppeNo === par.ppeNo);
    }, [par, receivedItems]);
    
    const iar = useMemo(() => {
       if(!receivedItem || !iars) return null;
       return iars.find(iar => iar.items.some((i: any) => i.generatedItemId === receivedItem.generatedItemId))
    },[receivedItem, iars]);
    
    const iarItemDetails = useMemo(() => {
        if (!iar || !receivedItem) return null;
        return iar.items.find((i:any) => i.generatedItemId === receivedItem.generatedItemId)
    }, [iar, receivedItem]);

    const po = useMemo(() => {
        if (!iar || !pos) return null;
        return pos.find(p => p.id === iar.poId);
    }, [iar, pos]);

    const masterItem = useMemo(() => {
        if (!receivedItem || !masterItems) return null;
        return masterItems.find(item => item.id === receivedItem.itemId);
    }, [receivedItem, masterItems]);

    const receivedFrom = useMemo(() => {
        if (!par || !employees) return null;
        return employees.find(e => e.id === par.receivedFromId);
    }, [par, employees]);

    const receivedBy = useMemo(() => {
        if (!par || !employees) return null;
        return employees.find(e => e.id === par.receivedById);
    }, [par, employees]);


    const handlePrint = () => window.print();

    const loading = loadingPar || loadingReceivedItems || loadingEmployees || loadingIars || loadingPos || loadingMasterItems;

    if (loading) return <LoadingOverlay message="Loading PAR..." />;
    if (!par || !receivedItem || !masterItem) return <div className="p-8 text-center">PAR data not found.</div>;
    
    return (
        <div className="bg-white text-black font-serif print:m-0 print:p-0">
            <div className="max-w-4xl mx-auto border border-black p-4 print:border-none print:shadow-none print:p-0">
                <div className="flex justify-end space-x-2 print:hidden">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={handlePrint}>
                        <Printer className="h-5 w-5" />
                        <span className="sr-only">Print</span>
                    </Button>
                </div>

                <header className="grid grid-cols-5 items-center mb-4">
                    <div className="flex flex-col items-center justify-center col-span-1">
                        <Image src="/dmw-logo-1.png" alt="DMW Logo" width={100} height={100} />
                    </div>
                    <div className="col-span-3 text-center">
                        <p className="text-sm">Republic of the Philippines</p>
                        <h1 className="text-3xl font-bold font-body" style={{ fontFamily: '"PT Sans", sans-serif' }}>
                        Department of Migrant Workers
                        </h1>
                        <p className="text-sm">Regional Office - XIII (Caraga)</p>
                        <p className="text-xs">Balanghai Hotel and Convention Center - Annex, Malvar Circle Corner J. Rosales Avenue, Butuan City, 8600</p>
                    </div>
                    <div className="flex flex-col items-center justify-center col-span-1">
                        <Image src="/dmw-logo-3.png" alt="Bagong Pilipinas Logo" width={100} height={100} />
                    </div>
                </header>
                
                <header className="text-center mb-4">
                    <h1 className="text-xl font-bold">PROPERTY ACKNOWLEDGMENT RECEIPT</h1>
                </header>

                <div className="flex justify-between text-sm mb-4">
                    <div>
                        <p><span className="font-bold">PAR No.:</span> {par.parNo}</p>
                    </div>
                    <div>
                        <p><span className="font-bold">Fund Cluster:</span> {po?.fundCluster || 'N/A'}</p>
                    </div>
                </div>

                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="text-center font-bold">
                            <th className="border border-black p-1 w-[10%]">Quantity</th>
                            <th className="border border-black p-1 w-[10%]">Unit</th>
                            <th className="border border-black p-1 w-[55%]">Description</th>
                            <th className="border border-black p-1 w-[25%]">Property No.</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-1 text-center align-top">1</td>
                            <td className="border border-black p-1 text-center align-top">{masterItem.unit}</td>
                            <td className="border border-black p-1 align-top">
                                <p className="font-bold">{par.description.toUpperCase()}</p>
                                <p>Brand: {receivedItem.brand}</p>
                                <p>Model: {receivedItem.model}</p>
                                <p>Serial No.: {receivedItem.serialNo}</p>
                                <p>Amount: {formatCurrency(iarItemDetails?.unitCost || 0)}</p>
                                {iar?.iarDate && <p>Date Purchased: {format(toDate(iar.iarDate)!, 'MMMM d, yyyy')}</p>}
                                <p>Supplier: {po?.supplierName || 'N/A'}</p>
                                {par.otherInfo && <p>Other Info: {par.otherInfo}</p>}
                            </td>
                            <td className="border border-black p-1 text-center align-top">{par.ppeNo}</td>
                        </tr>
                        {[...Array(5)].map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td className="border border-black h-6">&nbsp;</td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="grid grid-cols-2 mt-4 text-sm">
                    <div className="pr-4">
                        <p>Received By:</p>
                        <div className="text-center mt-12 space-y-1">
                            <p className="font-bold border-b border-black w-4/5 mx-auto">{receivedBy?.name.toUpperCase()}</p>
                            <p className="text-xs">Signature over Printed Name</p>
                            <p className="font-bold border-b border-black w-4/5 mx-auto">{par.receivedByPosition}</p>
                            <p className="text-xs">Position/Office</p>
                            {par.dateOfIssue && <p className="font-bold border-b border-black w-4/5 mx-auto">{format(toDate(par.dateOfIssue)!, 'MM/dd/yyyy')}</p>}
                             <p className="text-xs">Date</p>
                        </div>
                    </div>
                     <div className="pl-4">
                        <p>Received From:</p>
                        <div className="text-center mt-12 space-y-1">
                            <p className="font-bold border-b border-black w-4/5 mx-auto">{receivedFrom?.name.toUpperCase()}</p>
                             <p className="text-xs">Signature over Printed Name</p>
                            <p className="font-bold border-b border-black w-4/5 mx-auto">{par.receivedFromPosition}</p>
                            <p className="text-xs">Position/Office</p>
                             <p className="font-bold border-b border-black w-4/5 mx-auto">&nbsp;</p>
                             <p className="text-xs">Date</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
