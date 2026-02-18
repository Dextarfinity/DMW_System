
"use server";

import { db } from "@/lib/firebase"; 
import { runTransaction, doc, collection, Timestamp, serverTimestamp } from "firebase/firestore";
import type { RequisitionIssueSlip } from "@/types";

// This type now includes the 'ByName' fields because they are required on RequisitionIssueSlip
type EnrichedRISFormValues = Omit<RequisitionIssueSlip, 'id' | 'createdAt' | 'updatedAt' | 'risDate'> & { risDate: Date; createdAt?: Timestamp };

export async function saveRis(data: EnrichedRISFormValues, id?: string) {
  const isEditMode = !!id;
  const risRef = isEditMode ? doc(db, "requisitionIssueSlips", id as string) : doc(collection(db, "requisitionIssueSlips"));
  const settingsRef = doc(db, "settings", "counters");

  try {
    await runTransaction(db, async (transaction) => {
      let finalRisNo = data.risNo;

      if (!isEditMode) {
        const settingsSnap = await transaction.get(settingsRef);
        const counters = settingsSnap.exists() ? settingsSnap.data().risCounters : {};
        const year = data.risDate.getFullYear().toString();
        const nextCount = (counters?.[year] || 0) + 1;
        finalRisNo = `${year}-${String(nextCount).padStart(4, '0')}`;
        
        const newCounters = { ...counters, [year]: nextCount };
        transaction.set(settingsRef, { risCounters: newCounters }, { merge: true });
      }
      
      const risData: Omit<RequisitionIssueSlip, 'id'> = {
        risNo: finalRisNo,
        risDate: Timestamp.fromDate(data.risDate),
        division: data.division,
        purpose: data.purpose ?? "",
        items: data.items,
        requestedById: data.requestedById,
        requestedByName: data.requestedByName,
        requestedByDesignation: data.requestedByDesignation,
        approvedById: data.approvedById,
        approvedByName: data.approvedByName,
        approvedByDesignation: data.approvedByDesignation,
        issuedById: data.issuedById,
        issuedByName: data.issuedByName,
        issuedByDesignation: data.issuedByDesignation,
        receivedById: data.receivedById,
        receivedByName: data.receivedByName,
        receivedByDesignation: data.receivedByDesignation,
        status: "POSTED",
        updatedAt: serverTimestamp(),
        createdAt: isEditMode ? data.createdAt : serverTimestamp(),
      };

      // Ensure createdAt is not overwritten on edit
      if (isEditMode) {
        delete (risData as Partial<typeof risData>).createdAt;
      }

      transaction.set(risRef, risData, { merge: true });
    });

    return { success: true };
  } catch (error) {
    console.error("Save RIS Transaction failed:", error);
    if (error instanceof Error) {
        throw new Error(`Transaction failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during the RIS save transaction.");
  }
}
