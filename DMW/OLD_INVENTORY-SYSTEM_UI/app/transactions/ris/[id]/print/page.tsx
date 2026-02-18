"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RequisitionIssueSlip, Item } from "@/types";

type EnrichedRISItem = {
    stockNo: string;
    unit: string;
    description: string;
    quantity: number;
}

export default function PrintRIS() {
  const { id } = useParams();
  const [ris, setRis] = useState<RequisitionIssueSlip | null>(null);
  const [items, setItems] = useState<EnrichedRISItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRIS() {
      if (!id) return;
      setLoading(true);
      try {
        const risSnap = await getDoc(doc(db, "requisitionIssueSlips", id as string));
        if (risSnap.exists()) {
          const risData = risSnap.data() as RequisitionIssueSlip;
          setRis(risData);

          const itemsCollection = collection(db, "items");
          const itemsSnap = await getDocs(itemsCollection);
          const itemsMap = new Map(itemsSnap.docs.map(doc => [doc.id, doc.data() as Item]));
          
          const enrichedItems = risData.items.map(risItem => {
              const masterItem = itemsMap.get(risItem.itemId);
              return {
                  stockNo: masterItem?.stockNo || 'N/A',
                  unit: risItem.uom,
                  description: risItem.description,
                  quantity: risItem.quantity
              }
          });
          setItems(enrichedItems);

        }
      } catch (error) {
        console.error("Failed to load RIS data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRIS();
  }, [id]);

  useEffect(() => {
    if (!loading && ris) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, ris]);

  if (loading || !ris) {
    return <div className="p-8 text-center">Loading print preview...</div>;
  }

  return (
    <div className="bg-white p-4 text-black font-sans text-xs print:p-0">
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-2">
                <div></div>
                <div className="text-center">
                    <h1 className="font-bold">REQUISITION AND ISSUE SLIP</h1>
                </div>
                <div className="text-right">
                    <p>Appendix 63</p>
                </div>
            </div>

            <div className="border border-black">
                <div className="grid grid-cols-2">
                    <div className="p-1 border-b border-r border-black">
                        <span className="font-bold">Entity Name:</span> DMW-CARAGA
                    </div>
                    <div className="p-1 border-b border-black">
                        <span className="font-bold">Fund Cluster:</span>
                    </div>
                </div>
                <div className="grid grid-cols-[1fr_2fr] border-b-0">
                    <div className="p-1 border-r border-black">
                       <p><span className="font-bold">Division:</span> {ris.division}</p>
                       <p><span className="font-bold">Office:</span></p>
                    </div>
                    <div className="p-1">
                       <p><span className="font-bold">Responsibility Center Code:</span></p>
                       <p><span className="font-bold">RIS No.:</span> {ris.risNo}</p>
                    </div>
                </div>
            </div>

            <table className="w-full border-collapse border-y-0 border-x border-black mt-0 text-center">
                <thead>
                    <tr>
                        <th colSpan={4} className="border-r border-black p-1 font-bold">Requisition</th>
                        <th colSpan={2} className="border-r border-black p-1 font-bold">Stock Available?</th>
                        <th colSpan={2} className="p-1 font-bold">Issue</th>
                    </tr>
                    <tr>
                        <th className="border-t border-b border-r border-black p-1 font-bold w-[15%]">Stock No.</th>
                        <th className="border-t border-b border-r border-black p-1 font-bold w-[10%]">Unit</th>
                        <th className="border-t border-b border-r border-black p-1 font-bold w-[30%]">Description</th>
                        <th className="border-t border-b border-r border-black p-1 font-bold w-[10%]">Quantity</th>
                        <th className="border-t border-b border-r border-black p-1 font-bold w-[5%]">Yes</th>
                        <th className="border-t border-b border-r border-black p-1 font-bold w-[5%]">No</th>
                        <th className="border-t border-b border-r border-black p-1 font-bold w-[10%]">Quantity</th>
                        <th className="border-t border-b border-black p-1 font-bold">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td className="border-r border-black p-1 text-left">{item.stockNo}</td>
                            <td className="border-r border-black p-1">{item.unit}</td>
                            <td className="border-r border-black p-1 text-left">{item.description}</td>
                            <td className="border-r border-black p-1">{item.quantity}</td>
                            <td className="border-r border-black p-1">✓</td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1">{item.quantity}</td>
                            <td className="p-1"></td>
                        </tr>
                    ))}
                    {[...Array(Math.max(0, 8 - items.length))].map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td className="border-r border-black h-6 p-1">&nbsp;</td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="p-1"></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border border-black border-t-0">
                 <div className="grid grid-cols-5">
                    <div className="p-1 border-r border-black font-bold"></div>
                    <div className="p-1 border-r border-black font-bold text-center">Requested by:</div>
                    <div className="p-1 border-r border-black font-bold text-center">Approved by:</div>
                    <div className="p-1 border-r border-black font-bold text-center">Issued by:</div>
                    <div className="p-1 font-bold text-center">Received by:</div>
                 </div>
                 <div className="grid grid-cols-5 border-t border-black">
                     <div className="p-1 border-r border-black font-bold">Signature:</div>
                     <div className="p-1 border-r border-black h-12"></div>
                     <div className="p-1 border-r border-black h-12"></div>
                     <div className="p-1 border-r border-black h-12"></div>
                     <div className="p-1 h-12"></div>
                 </div>
                 <div className="grid grid-cols-5 border-t border-black">
                    <div className="p-1 border-r border-black font-bold">Printed Name:</div>
                    <div className="p-1 border-r border-black text-center font-semibold">{ris.requestedByName}</div>
                    <div className="p-1 border-r border-black text-center font-semibold">{ris.approvedByName}</div>
                    <div className="p-1 border-r border-black text-center font-semibold">{ris.issuedByName}</div>
                    <div className="p-1 text-center font-semibold">{ris.receivedByName}</div>
                 </div>
                 <div className="grid grid-cols-5 border-t border-black">
                     <div className="p-1 border-r border-black font-bold">Designation:</div>
                     <div className="p-1 border-r border-black text-center font-semibold">{ris.requestedByDesignation}</div>
                     <div className="p-1 border-r border-black text-center font-semibold">{ris.approvedByDesignation}</div>
                     <div className="p-1 border-r border-black text-center font-semibold">{ris.issuedByDesignation}</div>
                     <div className="p-1 text-center font-semibold">{ris.receivedByDesignation}</div>
                 </div>
                 <div className="grid grid-cols-5 border-t border-black">
                     <div className="p-1 border-r border-black font-bold">Date:</div>
                     <div className="p-1 border-r border-black"></div>
                     <div className="p-1 border-r border-black"></div>
                     <div className="p-1 border-r border-black"></div>
                     <div className="p-1"></div>
                 </div>
            </div>
        </div>

        <style jsx global>{`
            @media print {
              body {
                margin: 0;
              }
            }
        `}</style>
    </div>
  );
}
