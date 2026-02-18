

"use client";

import { useState, useMemo } from "react";
import type { InventoryCustodianSlip } from "@/types";
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
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toDate } from "@/lib/utils";

export default function IcsPage() {
  const { data: slips, loading } = useFirestoreCollection<InventoryCustodianSlip>("inventoryCustodianSlips");
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSlips = useMemo(() => {
    return slips.filter(
      (slip) =>
        slip.icsNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.inventoryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.issuedTo.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const dateA = toDate(a.dateOfIssue)?.getTime() ?? 0;
        const dateB = toDate(b.dateOfIssue)?.getTime() ?? 0;
        return dateB - dateA;
    });
  }, [slips, searchTerm]);
  
  const handleViewICS = (id: string) => {
    router.push(`/transactions/ics/${id}`);
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
                <h1 className="text-3xl font-bold">Inventory Custodian Slips</h1>
                <p className="text-muted-foreground">
                    View all generated Inventory Custodian Slips.
                </p>
            </div>
            <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by ICS No, description, etc."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-72 pl-10"
                />
            </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ICS No.</TableHead>
                    <TableHead>Date Issued</TableHead>
                    <TableHead>Inventory No.</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredSlips.length > 0 ? (
                    filteredSlips.map((slip) => (
                      <TableRow key={slip.id}>
                        <TableCell className="font-mono">{slip.icsNo}</TableCell>
                        <TableCell>{format(toDate(slip.dateOfIssue)!, 'PPP')}</TableCell>
                        <TableCell>{slip.inventoryNo}</TableCell>
                        <TableCell className="font-medium">{slip.description}</TableCell>
                        <TableCell>{slip.issuedTo}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewICS(slip.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Generate ICS Form
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
                      <TableCell colSpan={6} className="text-center h-24">
                        No slips found.
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
