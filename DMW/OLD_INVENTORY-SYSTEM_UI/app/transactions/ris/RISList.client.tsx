"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toDate } from "@/lib/utils";
import { type RequisitionIssueSlip } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { PrintPreviewModal } from "@/components/ris/PrintPreviewModal";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface RISListProps {
  onEdit: (ris: RequisitionIssueSlip) => void;
}

export default function RISList({ onEdit }: RISListProps) {
  const [risRecords, setRisRecords] = useState<RequisitionIssueSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingRisId, setViewingRisId] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [risToDelete, setRisToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const confirmDelete = (id: string) => {
    setRisToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!risToDelete) return;

    try {
      await deleteDoc(doc(db, "requisitionIssueSlips", risToDelete));
      setRisRecords(prev => prev.filter(r => r.id !== risToDelete));
      toast({ title: "Success", description: "RIS deleted successfully." });
    } catch (error) {
      console.error("Error deleting RIS:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete RIS." });
    } finally {
      setRisToDelete(null);
      setIsAlertOpen(false);
    }
  };


  // Function to add a new RIS to the state, used by the event listener
  const addRIS = (ris: RequisitionIssueSlip) => {
    setRisRecords(prev => [ris, ...prev]);
  };
  
  // Listen for the custom event dispatched from the form
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<RequisitionIssueSlip>;
      addRIS(customEvent.detail);
    };

    window.addEventListener("ris-created", handler);
    return () => window.removeEventListener("ris-created", handler);
  }, []);


  // Initial fetch of data
  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, "requisitionIssueSlips"),
          where("status", "==", "POSTED"),
          orderBy("risDate", "desc")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((d) => {
          const docData = d.data();
          return {
            id: d.id,
            ...docData,
            risDate: toDate(docData.risDate),
            requestedByName: docData.requestedByName || "N/A",
            approvedByName: docData.approvedByName || "N/A",
            issuedByName: docData.issuedByName || "N/A",
            receivedByName: docData.receivedByName || "N/A",
          } as RequisitionIssueSlip;
        });

        setRisRecords(data);
      } catch (e: any) {
        console.error(e);
        if (e.code === "failed-precondition" && e.message.includes("index")) {
          // This specific error means Firestore needs an index.
          setError(e.message);
        } else {
          setError("An unexpected error occurred while fetching data.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading RIS documents...</div>;
  }

  // Display a helpful message if the Firestore index is missing
  if (error) {
    const indexCreationUrl = error.match(/https:\/\/[^\s]+/)?.[0];
    return (
      <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.515 2.625H3.72c-1.345 0-2.188-1.458-1.515-2.625L8.485 2.495zM10 15a1 1 0 110-2 1 1 0 010 2zm0-4a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">
              Action Required: Database Index Missing
            </p>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                The query to fetch your RIS documents requires a specific index
                in Firestore. This is a one-time setup.
              </p>
              {indexCreationUrl ? (
                <p className="mt-2">
                  Please click the link below to create the index
                  automatically, then refresh this page in a minute or two.
                </p>
              ) : (
                <p className="mt-2">
                  Please create a composite index in your Firestore database on
                  the 'requisitionIssueSlips' collection for the fields 'status'
                  (ascending) and 'risDate' (descending).
                </p>
              )}
            </div>
            {indexCreationUrl && (
              <div className="mt-4">
                <a
                  href={indexCreationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Firestore Index
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Posted Slips</CardTitle>
        <CardDescription>A list of all posted RIS documents.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RIS No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risRecords.length > 0 ? (
              risRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono">{r.risNo}</TableCell>
                  <TableCell>{r.risDate ? format(r.risDate, "PPP") : 'N/A'}</TableCell>
                  <TableCell>{r.division}</TableCell>
                  <TableCell className="max-w-xs truncate">{r.purpose}</TableCell>
                  <TableCell>{r.requestedByName}</TableCell>
                  <TableCell><Badge>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingRisId(r.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(r)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => confirmDelete(r.id)} className="text-destructive">
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
                  No posted RIS documents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
       {viewingRisId && (
        <PrintPreviewModal
            open={!!viewingRisId}
            onClose={() => setViewingRisId(null)}
            risId={viewingRisId}
        />
    )}
    </Card>
     <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the RIS document.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
            Continue
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
