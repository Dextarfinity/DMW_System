
"use client";

import { useParams, useRouter } from 'next/navigation';
import useFirestoreDocument from '@/hooks/use-firestore-document';
import type { InspectionAcceptanceReport, Item } from "@/types";
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toDate } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';

const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(0);
    }
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
};

export default function ViewIarPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const { data: iar, loading: loadingIAR, error: iarError } = useFirestoreDocument<InspectionAcceptanceReport>("iars", id);
    const { data: masterItems, loading: loadingMasterItems } = useFirestoreCollection<Item>("items");

    const grandTotal = iar?.items.reduce((total, item) => total + item.totalCost, 0) || 0;

    const getStatusVariant = (status: InspectionAcceptanceReport['status']) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Pending': return 'secondary';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    };
    
    const masterItemsMap = useMemo(() => {
        if (!masterItems) return new Map();
        return new Map(masterItems.map(item => [item.id, item]));
    }, [masterItems]);
    
    const loading = loadingIAR || loadingMasterItems;

    if (loading) {
        return <LoadingOverlay message="Loading IAR..." />;
    }

    if (iarError || !iar) {
        return <div className="p-8">Error: {iarError?.message || 'IAR not found.'}</div>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
            <main className="max-w-7xl mx-auto space-y-6">
                <header className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">View Inspection & Acceptance Report</h1>
                        <p className="text-muted-foreground">
                            Viewing read-only details for IAR #{iar.iarNumber}
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Button>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>IAR Details</CardTitle>
                        <CardDescription>
                            <Badge variant={getStatusVariant(iar.status)}>{iar.status}</Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="font-semibold text-muted-foreground">Supplier:</p><p>{iar.supplierName}</p></div>
                            <div><p className="font-semibold text-muted-foreground">PO Number:</p><p>{iar.poNumber}</p></div>
                            <div><p className="font-semibold text-muted-foreground">IAR Number:</p><p>{iar.iarNumber}</p></div>
                            <div><p className="font-semibold text-muted-foreground">IAR Date:</p><p>{format(toDate(iar.iarDate)!, 'PPP')}</p></div>
                            <div><p className="font-semibold text-muted-foreground">Invoice Number:</p><p>{iar.invoiceNumber}</p></div>
                            <div><p className="font-semibold text-muted-foreground">Invoice Date:</p><p>{format(toDate(iar.invoiceDate)!, 'PPP')}</p></div>
                            <div className="col-span-2"><p className="font-semibold text-muted-foreground">Purpose:</p><p>{iar.purpose}</p></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Items Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>IAR Item ID</TableHead>
                                        <TableHead>Stock No.</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-center">Unit</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                        <TableHead className="text-right">Total Cost</TableHead>
                                        <TableHead>PPE No.</TableHead>
                                        <TableHead>Inventory No.</TableHead>
                                        <TableHead>Brand</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Serial No.</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {iar.items.map((item, index) => {
                                    const masterItem = masterItemsMap.get(item.itemId);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{item.generatedItemId || 'N/A'}</TableCell>
                                            <TableCell>{masterItem?.stockNo || 'N/A'}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-center">{masterItem?.unit}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                                            <TableCell>{item.ppeNo || 'N/A'}</TableCell>
                                            <TableCell>{item.inventoryNo || 'N/A'}</TableCell>
                                            <TableCell>{item.brand || 'N/A'}</TableCell>
                                            <TableCell>{item.model || 'N/A'}</TableCell>
                                            <TableCell>{item.serialNo || 'N/A'}</TableCell>
                                            <TableCell>{item.remarks || 'N/A'}</TableCell>
                                        </TableRow>
                                    )
                                })}
                                </TableBody>
                            </Table>
                        </div>
                        <Separator className="my-4" />
                        <div className="text-right text-xl font-bold">
                            Grand Total: {formatCurrency(grandTotal)}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
