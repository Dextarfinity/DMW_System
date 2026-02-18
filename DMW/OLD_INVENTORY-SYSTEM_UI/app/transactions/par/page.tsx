

"use client";

import { useState, useMemo } from "react";
import type { PropertyAcknowledgementReceipt, ReceivedCapitalOutlayItem } from "@/types";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toDate } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { LoadingOverlay } from "@/components/loading-overlay";

export default function ParManagementPage() {
  const { data: pars, loading: loadingPars } = useFirestoreCollection<PropertyAcknowledgementReceipt>("propertyAcknowledgementReceipts");
  const { data: receivedItems, loading: loadingReceivedItems } = useFirestoreCollection<ReceivedCapitalOutlayItem>("receivedCapitalOutlayItems");
  
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const receivedItemsMap = useMemo(() => {
    return new Map(receivedItems.map(item => [item.ppeNo, item]));
  }, [receivedItems]);

  const combinedData = useMemo(() => {
    return pars.map(par => {
      const receivedItem = receivedItemsMap.get(par.ppeNo);
      return {
        ...par,
        brand: receivedItem?.brand || 'N/A',
        model: receivedItem?.model || 'N/A',
        serialNo: receivedItem?.serialNo || 'N/A',
      };
    }).sort((a, b) => {
        const dateA = toDate(a.dateOfIssue)?.getTime() ?? 0;
        const dateB = toDate(b.dateOfIssue)?.getTime() ?? 0;
        return dateB - dateA;
    });
  }, [pars, receivedItemsMap]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return combinedData;
    return combinedData.filter(
      (item) =>
        item.parNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.issuedTo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [combinedData, searchTerm]);

  const loading = loadingPars || loadingReceivedItems;
  
  const handleViewPAR = (id: string) => {
    router.push(`/transactions/par/${id}`);
  }

  const handleAction = (description: string) => {
    toast({
        title: "Feature Not Available",
        description: `${description} is not yet implemented.`,
        variant: "destructive",
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      {loading && <LoadingOverlay message="Loading PARs..." />}
      <main className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">PAR Management</h1>
          <p className="text-muted-foreground">
            View and manage all Property Acknowledgement Receipts.
          </p>
        </header>

         <Card>
            <CardHeader>
                <CardTitle>Search PARs</CardTitle>
                <CardDescription>Search by PAR No., description, brand, model, serial, or issued to.</CardDescription>
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
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PAR No.</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Serial No.</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.parNo}</TableCell>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell>{item.model}</TableCell>
                        <TableCell>{item.serialNo}</TableCell>
                        <TableCell>{item.issuedTo}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewPAR(item.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Generate PAR Form
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction("Editing")}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction("Deleting")} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No PARs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
