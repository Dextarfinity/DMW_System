
"use client";

import { useState, useMemo } from "react";
import type { UacsCode } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UacsCodeForm } from "@/components/uacs-code-form";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";

const officialUacsCodes: Omit<UacsCode, "id">[] = [
    // Semi-Expendable
    { code: '1040501000', title: 'Semi-Expendable Machinery', category: 'Semi-Expendable' },
    { code: '1040502000', title: 'Semi-Expendable Office Equipment', category: 'Semi-Expendable' },
    { code: '1040503000', title: 'Semi-Expendable Information and Communications Technology Equipment ICT', category: 'Semi-Expendable' },
    { code: '1040507000', title: 'Semi-Expendable Communications Equipment', category: 'Semi-Expendable' },
    { code: '1040510000', title: 'Semi-Expendable Medical Equipment', category: 'Semi-Expendable' },
    { code: '1040512000', title: 'Semi-Expendable Sports Equipment', category: 'Semi-Expendable' },
    { code: '1040513000', title: 'Semi-Expendable Technical and Scientific Equipment', category: 'Semi-Expendable' },
    { code: '1040519000', title: 'Semi-Expendable Other Machinery and Equipment', category: 'Semi-Expendable' },
    { code: '1040601000', title: 'Semi-Expendable Furniture and Fixtures', category: 'Semi-Expendable' },
    { code: '1040602000', title: 'Semi-Expendable Books', category: 'Semi-Expendable' },
    // Property, Plant and Equipment (Capital Outlay)
    { code: '1060101000', title: 'Land', category: 'Capital Outlay' },
    { code: '1060401000', title: 'Buildings', category: 'Capital Outlay' },
    { code: '1060501000', title: 'Machinery', category: 'Capital Outlay' },
    { code: '1060502000', title: 'Office Equipment', category: 'Capital Outlay' },
    { code: '1060503000', title: 'Information and Communications Technology Equipment', category: 'Capital Outlay' },
    { code: '1060514000', title: 'Technical and Scientific Equipment', category: 'Capital Outlay' },
    { code: '1060513000', title: 'Sports Equipment', category: 'Capital Outlay' },
    { code: '1060511000', title: 'Medical Equipment', category: 'Capital Outlay' },
    { code: '1060512000', title: 'Printing Equipment', category: 'Capital Outlay' },
    { code: '1080102000', title: 'Computer Software', category: 'Capital Outlay' },
    { code: '1060599000', title: 'Other Machinery and Equipment', category: 'Capital Outlay' },
    { code: '1060601000', title: 'Motor Vehicles', category: 'Capital Outlay' },
    { code: '1060701000', title: 'Furniture and Fixtures', category: 'Capital Outlay' },
    { code: '1060702000', title: 'Books', category: 'Capital Outlay' },
    { code: '1069899000', title: 'Other Property, Plant and Equipment', category: 'Capital Outlay' },
];

export default function UacsPage() {
  // We will use the hardcoded list for display and disable Firestore interactions for this page.
  const uacsCodes: UacsCode[] = officialUacsCodes.map((code, index) => ({...code, id: `static-${index}`}));
  const loading = false;
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<UacsCode | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null);

  const handleDisabledAction = () => {
      toast({
          title: "Action Disabled",
          description: "UACS codes are now managed by the system and cannot be modified here.",
          variant: "destructive",
      });
      setIsFormOpen(false);
      setIsAlertOpen(false);
  }

  const filteredCodes = useMemo(() => {
    return uacsCodes.filter(
      (code) =>
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uacsCodes, searchTerm]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">UACS Code Management</h1>
            <p className="text-muted-foreground">Official list of UACS codes for PPE and Semi-Expendable items.</p>
          </div>
          <Button onClick={handleDisabledAction} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Code
          </Button>
        </header>
        
        <Card>
          <CardHeader>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Filter by Code or Title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm pl-10"
                />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredCodes.length > 0 ? (
                    filteredCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono">{code.code}</TableCell>
                        <TableCell className="font-medium">{code.title}</TableCell>
                        <TableCell>{code.category}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={handleDisabledAction}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleDisabledAction}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No UACS codes found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Action Disabled</DialogTitle>
             <DialogDescription>
              UACS codes are managed by the system and cannot be modified.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Action Disabled</AlertDialogTitle>
            <AlertDialogDescription>
              This action is not permitted. UACS codes are managed by the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
