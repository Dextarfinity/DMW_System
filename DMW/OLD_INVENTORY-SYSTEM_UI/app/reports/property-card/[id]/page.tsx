
"use client";

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useEffect, useState } from 'react';
import useFirestoreDocument from '@/hooks/use-firestore-document';
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import type { PropertyCard, PurchaseOrder, Item, UacsCode, ReceivedCapitalOutlayItem, ReceivedSemiExpendableItem, InspectionAcceptanceReport } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import Image from 'next/image';
import { LoadingOverlay } from '@/components/loading-overlay';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function PropertyCardComponent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const type = searchParams.get('type') as 'Capital Outlay' | 'Semi-Expendable';
    
    const collectionName = type === 'Capital Outlay' ? 'receivedCapitalOutlayItems' : 'receivedSemiExpendableItems';

    const { data: item, loading: loadingItem } = useFirestoreDocument<ReceivedCapitalOutlayItem | ReceivedSemiExpendableItem>(collectionName, id);
    const [propertyCard, setPropertyCard] = useState<PropertyCard | null>(null);
    const [loadingCard, setLoadingCard] = useState(true);

    useEffect(() => {
        if (!item?.ppeNo) return;
        setLoadingCard(true);
        const q = query(collection(db, 'propertyCards'), where('propertyNumber', '==', item.ppeNo));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                setPropertyCard({ id: doc.id, ...doc.data() } as PropertyCard);
            } else {
                setPropertyCard(null);
            }
            setLoadingCard(false);
        });
        return () => unsubscribe();
    }, [item?.ppeNo]);

    const { data: masterItem, loading: loadingMasterItem } = useFirestoreDocument<Item>('items', item?.itemId || '---');
    
    // We fetch all UACS codes once and find the matching one client-side
    const { data: allUacsCodes, loading: loadingUacsData } = useFirestoreCollection<UacsCode>('uacsCodes');
    const uacsCode = useMemo(() => {
        if (!allUacsCodes || !masterItem) return null;
        return allUacsCodes.find(code => code.code === masterItem.uacsCode);
    }, [allUacsCodes, masterItem]);

    const { data: iars, loading: loadingIars } = useFirestoreCollection<InspectionAcceptanceReport>('iars');
    
    const iar = iars.find(i => i.items.some((i_item: any) => i_item.ppeNo === item?.ppeNo));
    const { data: po, loading: loadingPo } = useFirestoreDocument<PurchaseOrder>('purchaseOrders', iar?.poId || '---');
    
    const formatCurrency = (amount: number) => {
        if (typeof amount !== 'number') return '₱0.00';
        return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        }).format(amount);
    };

    const handlePrint = () => window.print();

    const loading = loadingItem || loadingCard || loadingMasterItem || loadingUacsData || loadingIars || loadingPo;
    
    if (loading) return <LoadingOverlay message="Loading Property Card..." />;
    if (!item) return <div className="p-8 text-center">Item not found.</div>;
    if (!propertyCard) return <div className="p-8 text-center">Property Card not found for PPE No: {item.ppeNo}.</div>;


  return (
    <div className="bg-white text-black font-serif print:m-0 print:p-0">
      <div className="max-w-4xl mx-auto border border-black p-4 print:border-none print:shadow-none print:p-0">
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={handlePrint} className="print:hidden">
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

        <div className="text-center mb-2">
            <h2 className="text-xl font-bold" style={{ fontFamily: '"PT Sans", sans-serif' }}>PROPERTY CARD</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 text-sm mb-2 border-b border-black pb-2">
            <div>
                <p><span className="font-bold">Entity Name:</span> DMW-CARAGA, Butuan City</p>
            </div>
             <div className="text-right">
                <p><span className="font-bold">Fund Cluster:</span> {po?.fundCluster || 'N/A'}</p>
            </div>
        </div>
        
         <div className="grid grid-cols-2 gap-x-8 text-sm mb-2 border-b border-black pb-2">
            <div>
                <p><span className="font-bold">Property, Plant and Equipment:</span> {uacsCode?.title || 'N/A'}</p>
                 <p><span className="font-bold">Description:</span> {masterItem?.description || 'N/A'}</p>
            </div>
             <div className="text-right">
                <p><span className="font-bold">Property Number:</span> {item.ppeNo}</p>
            </div>
        </div>

        <table className="w-full border-collapse text-xs text-center">
          <thead>
            <tr className="font-bold">
              <th rowSpan={2} className="border border-black p-1 w-[15%]">Date</th>
              <th rowSpan={2} className="border border-black p-1 w-[15%]">Reference/ PAR No.</th>
              <th className="border border-black p-1 w-[10%]">Receipt</th>
              <th colSpan={2} className="border border-black p-1 w-[25%]">Issue/Transfer/Disposal</th>
              <th className="border border-black p-1 w-[10%]">Balance</th>
              <th rowSpan={2} className="border border-black p-1 w-[10%]">Amount</th>
              <th rowSpan={2} className="border border-black p-1">Remarks</th>
            </tr>
            <tr className="font-bold">
                 <th className="border border-black p-1">Qty.</th>
                 <th className="border border-black p-1">Qty.</th>
                 <th className="border border-black p-1">Office/Officer</th>
                 <th className="border border-black p-1">Qty.</th>
            </tr>
          </thead>
          <tbody>
              <tr key={propertyCard.id}>
                <td className="border border-black p-1 h-6">{propertyCard.receivedDate ? format(propertyCard.receivedDate.toDate(), 'MM/dd/yyyy') : ''}</td>
                <td className="border border-black p-1">{iar?.iarNumber || 'N/A'}</td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1">1</td>
                <td className="border border-black p-1">{formatCurrency(propertyCard.acquisitionCost)}</td>
                <td className="border border-black p-1 text-left">New Item</td>
              </tr>
              {propertyCard.issuedTo && (
                 <tr key={`${propertyCard.id}-issued`}>
                    <td className="border border-black p-1 h-6">{propertyCard.issuedDate ? format(propertyCard.issuedDate.toDate(), 'MM/dd/yyyy') : ''}</td>
                    <td className="border border-black p-1">{propertyCard.icsNo || 'N/A'}</td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1">1</td>
                    <td className="border border-black p-1">{propertyCard.issuedTo}</td>
                    <td className="border border-black p-1">0</td>
                    <td className="border border-black p-1">{formatCurrency(propertyCard.acquisitionCost)}</td>
                    <td className="border border-black p-1 text-left">Issued to employee</td>
                </tr>
              )}
            {[...Array(Math.max(0, 15 - (propertyCard.issuedTo ? 2 : 1)))].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-black h-6 p-1"><span className="text-white">.</span></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default function PropertyCardPage() {
    return (
        <Suspense fallback={<LoadingOverlay message="Loading Property Card..." />}>
            <PropertyCardComponent />
        </Suspense>
    )
}
