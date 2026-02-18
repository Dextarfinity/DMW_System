
// app/transactions/ris/[id]/page.tsx

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function ViewRIS({
  params,
}: {
  params: { id: string };
}) {
  const ref = doc(db, "requisitionIssueSlips", params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) notFound();

  const ris = snap.data();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Requisition & Issue Slip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div><strong>RIS No:</strong> {ris.risNo}</div>
          <div><strong>RIS Date:</strong> {ris.risDate.toDate().toLocaleDateString()}</div>
          <div><strong>Division:</strong> {ris.division}</div>
          <div><strong>Purpose:</strong> {ris.purpose || "—"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm border">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Item</th>
                <th className="p-2">Qty</th>
                <th className="p-2">UOM</th>
              </tr>
            </thead>
            <tbody>
              {ris.items.map((i: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{i.description}</td>
                  <td className="p-2 text-center">{i.quantity}</td>
                  <td className="p-2 text-center">{i.uom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
