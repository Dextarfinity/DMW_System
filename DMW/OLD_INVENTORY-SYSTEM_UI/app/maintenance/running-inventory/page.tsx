
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Item, InspectionAcceptanceReport, RequisitionIssueSlip } from '@/types';
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingOverlay } from '@/components/loading-overlay';

export default function RunningInventoryPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all necessary data
    const { data: masterItems, loading: loadingItems } = useFirestoreCollection<Item>('items');
    const { data: iars, loading: loadingIARs } = useFirestoreCollection<InspectionAcceptanceReport>('iars');
    const { data: slips, loading: loadingRIS } = useFirestoreCollection<RequisitionIssueSlip>('requisitionIssueSlips');
    
    // Filter for only expendable items from the master list
    const expendableItems = useMemo(() => {
        return masterItems.filter(item => item.category === 'Expendable');
    }, [masterItems]);

    // Pre-process and filter IARs and RIS documents once
    const completedIARs = useMemo(() => {
        return iars.filter(iar => iar.status === 'Completed');
    }, [iars]);

    const postedRIS = useMemo(() => {
        return slips.filter(ris => ris.status === 'POSTED');
    }, [slips]);

    // Create maps for quick lookups
    const receivedTotals = useMemo(() => {
        const totals = new Map<string, number>();
        completedIARs.forEach(iar => {
            iar.items.forEach(item => {
                if (item.category === 'Expendable') {
                    totals.set(item.itemId, (totals.get(item.itemId) || 0) + item.quantity);
                }
            });
        });
        return totals;
    }, [completedIARs]);

    const issuedTotals = useMemo(() => {
        const totals = new Map<string, number>();
        postedRIS.forEach(ris => {
            ris.items.forEach(item => {
                totals.set(item.itemId, (totals.get(item.itemId) || 0) + item.quantity);
            });
        });
        return totals;
    }, [postedRIS]);

    // Combine data and compute balances
    const inventoryData = useMemo(() => {
        return expendableItems
            .map(item => {
                const totalReceived = receivedTotals.get(item.id) || 0;
                const totalIssued = issuedTotals.get(item.id) || 0;
                const balance = totalReceived - totalIssued;
                
                return {
                    ...item,
                    totalReceived,
                    totalIssued,
                    balance,
                };
            })
            // Only show items that have been received
            .filter(item => item.totalReceived > 0)
            .sort((a, b) => a.description.localeCompare(b.description) || (a.stockNo || '').localeCompare(b.stockNo || ''));
    }, [expendableItems, receivedTotals, issuedTotals]);
    
    const filteredInventory = useMemo(() => {
        if (!searchTerm) return inventoryData;
        return inventoryData.filter(item =>
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.stockNo && item.stockNo.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [inventoryData, searchTerm]);

    const handleViewStockCard = (itemId: string) => {
        router.push(`/reports/stock-card?itemId=${itemId}`);
    };
    
    const loading = loadingItems || loadingIARs || loadingRIS;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
            {loading && <LoadingOverlay message="Calculating inventory..." />}
            <main className="max-w-7xl mx-auto space-y-6">
                <header>
                    <h1 className="text-3xl font-bold">Running Inventory</h1>
                    <p className="text-muted-foreground">
                        Dynamically computed inventory of expendable items from accepted IARs and issued RIS.
                    </p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Search Inventory</CardTitle>
                         <CardDescription>Search by item name or stock number.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full max-w-sm pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Stock No.</TableHead>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead className="text-center">Total Received</TableHead>
                                    <TableHead>Total Issued</TableHead>
                                    <TableHead className="text-center">Balance</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">Loading inventory...</TableCell>
                                    </TableRow>
                                ) : filteredInventory.length > 0 ? (
                                    filteredInventory.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono">{item.stockNo || 'N/A'}</TableCell>
                                            <TableCell className="font-medium">{item.description}</TableCell>
                                            <TableCell className="text-center">{item.totalReceived}</TableCell>
                                            <TableCell className="text-center">{item.totalIssued}</TableCell>
                                            <TableCell className={cn("text-center font-bold", item.balance < 0 ? "text-destructive" : "")}>
                                                {item.balance}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleViewStockCard(item.id)}>
                                                    View Stock Card
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No inventory records found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
