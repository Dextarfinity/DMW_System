
"use client";

import { useState, useMemo } from "react";
import type { ReceivedCapitalOutlayItem } from "@/types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function ReceivedCapitalOutlayPage() {
  const { data: items, loading } = useFirestoreCollection<ReceivedCapitalOutlayItem>("receivedCapitalOutlayItems");
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ppeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.serialNo && item.serialNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.issuedTo && item.issuedTo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [items, searchTerm]);

  const totalItems = useMemo(() => items.length, [items]);
  const availableItems = useMemo(() => items.filter(item => item.status === 'Available').length, [items]);

  const getStatusVariant = (status: ReceivedCapitalOutlayItem['status']) => {
    switch (status) {
      case 'Available':
        return 'secondary';
      case 'Issued':
        return 'success';
      case 'For Repair':
      case 'Unserviceable':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const handleIssueItem = (item: ReceivedCapitalOutlayItem) => {
    if (item.status !== 'Available') {
        toast({
            title: "Item Not Available",
            description: "This item cannot be issued as it is not currently available.",
            variant: "destructive",
        })
        return;
    }
    router.push(`/transactions/par/issue/${item.id}`);
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
      <main className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold">Received Capital Outlay Items</h1>
                <p className="text-muted-foreground">
                A list of all received capital outlay items ready for issuance.
                </p>
            </div>
            <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 pl-10"
                />
            </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IAR Item ID</TableHead>
                    <TableHead>PPE No.</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Serial No.</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.generatedItemId}</TableCell>
                        <TableCell className="font-mono">{item.ppeNo}</TableCell>
                        <TableCell className="font-medium">{item.itemDescription}</TableCell>
                        <TableCell>{item.serialNo || 'N/A'}</TableCell>
                        <TableCell>{item.issuedTo || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleIssueItem(item)} disabled={item.status !== 'Available'}>Generate PAR Form</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/reports/property-card/${item.id}?type=Capital Outlay`)}>View Property Card</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction("Unpost")}>Unpost</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction("View")}>View</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction("Edit")}>Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction("Transfer")}>Transfer</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction("Repair")}>Repair</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction("Unserviceable")}>Unserviceable</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction("Destroy")}>Destroyed</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        No items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                 <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5}>
                            Total Items: <span className="font-semibold text-primary">{totalItems}</span>
                        </TableCell>
                        <TableCell colSpan={2} className="text-right">
                            Available for Distribution: <span className="font-semibold text-primary">{availableItems}</span>
                        </TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
