
"use client";

import { useState, useMemo } from 'react';
import type { ReceivedCapitalOutlayItem, ReceivedSemiExpendableItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import { useRouter } from 'next/navigation';
import { LoadingOverlay } from '@/components/loading-overlay';

export default function PropertyLedgerCardListPage() {
  const { data: capitalOutlayItems, loading: loadingCapital } = useFirestoreCollection<ReceivedCapitalOutlayItem>('receivedCapitalOutlayItems');
  const { data: semiExpendableItems, loading: loadingSemi } = useFirestoreCollection<ReceivedSemiExpendableItem>('receivedSemiExpendableItems');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const allItems = useMemo(() => {
    const combined = [
      ...capitalOutlayItems.map(item => ({ ...item, type: 'Capital Outlay' as const })),
      ...semiExpendableItems.map(item => ({ ...item, type: 'Semi-Expendable' as const }))
    ];
    return combined.sort((a, b) => (a.ppeNo || '').localeCompare(b.ppeNo || ''));
  }, [capitalOutlayItems, semiExpendableItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item =>
      item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ppeNo && item.ppeNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allItems, searchTerm]);

  const handleViewCard = (id: string, type: 'Capital Outlay' | 'Semi-Expendable') => {
    router.push(`/reports/property-ledger-card/${id}?type=${encodeURIComponent(type)}`);
  };

  const loading = loadingCapital || loadingSemi;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Property Ledger Cards</h1>
          <p className="text-muted-foreground">Select an item to view its Property Ledger Card.</p>
        </header>
        
        <Card>
          <CardHeader>
            <CardTitle>Search for a Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by description or PPE No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {loading && <LoadingOverlay message="Loading items..." />}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PPE No.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">Loading...</TableCell>
                  </TableRow>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.ppeNo}</TableCell>
                      <TableCell>{item.itemDescription}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewCard(item.id, item.type)}>
                          View Ledger Card
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No items found.</TableCell>
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
