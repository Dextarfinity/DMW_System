
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import type { RequisitionIssueSlip } from '@/types';
import { format, startOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { toDate } from '@/lib/utils';
import { LoadingOverlay } from '@/components/loading-overlay';
import { useToast } from "@/hooks/use-toast";

export default function RsmiPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { data: slips, loading } = useFirestoreCollection<RequisitionIssueSlip>('requisitionIssueSlips');

    const monthlySummaries = useMemo(() => {
        const monthMap = new Map<string, { count: number; date: Date }>();

        slips.forEach(slip => {
            const slipDate = toDate(slip.risDate);
            if (slipDate) {
                const monthKey = format(slipDate, 'yyyy-MM');
                if (monthMap.has(monthKey)) {
                    monthMap.get(monthKey)!.count++;
                } else {
                    monthMap.set(monthKey, { count: 1, date: startOfMonth(slipDate) });
                }
            }
        });

        return Array.from(monthMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [slips]);

    const handleViewReport = (date: Date) => {
        const from = format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
        const to = format(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd');
        router.push(`/reports/rsmi/view?from=${from}&to=${to}`);
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
            {loading && <LoadingOverlay message="Loading RSMI data..." />}
            <main className="max-w-7xl mx-auto space-y-6">
                <header>
                    <h1 className="text-3xl font-bold">Report of Supplies and Materials Issued (RSMI)</h1>
                    <p className="text-muted-foreground">Monthly summary of issued supplies and materials.</p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Reports</CardTitle>
                        <CardDescription>Select a month to view the generated RSMI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead>Number of RIS</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">Loading...</TableCell>
                                    </TableRow>
                                ) : monthlySummaries.length > 0 ? (
                                    monthlySummaries.map(summary => (
                                        <TableRow key={summary.date.toISOString()}>
                                            <TableCell className="font-medium">{format(summary.date, 'MMMM yyyy')}</TableCell>
                                            <TableCell>{summary.count}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleViewReport(summary.date)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Report
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">No issued items found to generate reports.</TableCell>
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
