"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { RISForm, type RISFormValues } from "@/components/ris-form";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import {
  type RequisitionIssueSlip,
  type Office,
  type Employee,
  type Designation,
  type SettingsCounters,
  type IARItem,
  type InspectionAcceptanceReport,
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import { saveRis } from "@/app/actions/ris";
import RISList from "./RISList.client";
import { toDate } from "@/lib/utils";

export default function RISPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRis, setEditingRis] = useState<RequisitionIssueSlip | null>(
    null
  );
  const { toast } = useToast();

  // Data fetching for the form
  const { data: offices, loading: loadingOffices } =
    useFirestoreCollection<Office>("offices");
  const { data: employees, loading: loadingEmployees } =
    useFirestoreCollection<Employee>("employees");
  const { data: designations, loading: loadingDesignations } =
    useFirestoreCollection<Designation>("designations");
  const { data: iars, loading: loadingIARs } =
    useFirestoreCollection<InspectionAcceptanceReport>("iars");
  const { data: slips, loading: loadingRIS } =
    useFirestoreCollection<RequisitionIssueSlip>("requisitionIssueSlips");
  const { data: settingsData, loading: loadingSettings } =
    useFirestoreCollection<SettingsCounters>("settings");

  const expendableBatches = useMemo(() => {
    return iars
      .filter((iar) => iar.status === "Completed")
      .flatMap((iar) =>
        (iar.items as IARItem[])
          .filter((item) => item.category === "Expendable")
          .map((item) => ({
            ...item,
            iarId: iar.id,
            iarNo: iar.iarNumber,
            iarDate: toDate(iar.iarDate),
          }))
      );
  }, [iars]);

  const availableStock = useMemo(() => {
    const stockMap = new Map<string, number>();

    // Calculate total received from completed IARs for expendable items
    iars.filter(iar => iar.status === 'Completed').forEach(iar => {
        iar.items.forEach(item => {
            if (item.category === 'Expendable') {
                stockMap.set(item.itemId, (stockMap.get(item.itemId) || 0) + item.quantity);
            }
        });
    });

    // Calculate total issued from posted RIS
    slips.filter(ris => ris.status === 'POSTED').forEach(ris => {
        ris.items.forEach(item => {
            // Ensure we only subtract from items that could have been received
            if (stockMap.has(item.itemId)) {
                stockMap.set(item.itemId, stockMap.get(item.itemId)! - item.quantity);
            }
        });
    });

    return stockMap;
  }, [iars, slips]);

  const settings = settingsData.find((s) => s.id === "counters") ?? null;

  const handleAddNew = () => {
    setEditingRis(null);
    setIsFormOpen(true);
  };

  const handleEdit = (ris: RequisitionIssueSlip) => {
    setEditingRis(ris);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: RISFormValues, id?: string) => {
    const isEditMode = !!id;

    // Enrich data with names before saving
    const enrichedData = {
      ...data,
      requestedByName:
        employees.find((e) => e.id === data.requestedById)?.name || "",
      approvedByName:
        employees.find((e) => e.id === data.approvedById)?.name || "",
      issuedByName:
        employees.find((e) => e.id === data.issuedById)?.name || "",
      receivedByName:
        employees.find((e) => e.id === data.receivedById)?.name || "",
    };

    try {
      await saveRis(enrichedData, id);
      toast({
        title: "Success!",
        description: `RIS ${isEditMode ? "updated" : "created"} successfully.`,
      });
      setIsFormOpen(false);
      setEditingRis(null);
      // The list component will update itself via the custom event
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  const loading =
    loadingOffices ||
    loadingEmployees ||
    loadingDesignations ||
    loadingIARs ||
    loadingRIS ||
    loadingSettings;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">
              Requisition & Issue Slips
            </h1>
            <p className="text-muted-foreground">
              Manage and create new RIS documents.
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New RIS
          </Button>
        </header>

        <RISList onEdit={handleEdit} />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen} modal={false}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingRis ? "Edit" : "Create"} Requisition & Issue Slip
              </DialogTitle>
              <DialogDescription>
                Fill out the form below to{" "}
                {editingRis ? "update the" : "create a new"} RIS.
              </DialogDescription>
            </DialogHeader>
            {loading ? (
              <div className="flex-grow flex items-center justify-center">
                Loading form dependencies...
              </div>
            ) : (
              <RISForm
                ris={editingRis}
                onSubmit={handleSubmit}
                onCancel={() => setIsFormOpen(false)}
                isSubmitting={false} // form manages its own submitting state
                offices={offices}
                employees={employees}
                designations={designations}
                expendableBatches={expendableBatches}
                availableStock={availableStock}
                settings={settings}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
