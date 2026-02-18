
"use client";

import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import useFirestoreCollection from '@/hooks/use-firestore-collection';
import type { TripTicket } from '@/types';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import Image from 'next/image';
import { toDate } from '@/lib/utils';

function MonthlyTravelSummary() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const fromDate = from ? parseISO(from) : null;
  const toDateRange = to ? parseISO(to) : null;

  const { data: allTickets, loading: loadingTickets } = useFirestoreCollection<TripTicket>('tripTickets');

  const filteredTickets = useMemo(() => {
    if (!fromDate || !toDateRange || !allTickets) return [];
    
    const reportInterval = { start: fromDate, end: toDateRange };

    return allTickets
      .filter(ticket => ticket.status === 'Approved' || ticket.status === 'Cancelled')
      .filter(ticket => {
        const travelStart = toDate(ticket.dateOfTravel);
        const travelEnd = toDate(ticket.returnDate);
         if (!travelStart || !travelEnd) {
          return false; // skip tickets with missing/invalid dates
        }
        return travelStart <= reportInterval.end && travelEnd >= reportInterval.start;
      })
      .sort((a, b) => {
        const dateA = toDate(a.dateOfTravel);
        const dateB = toDate(b.dateOfTravel);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      });
  }, [allTickets, fromDate, toDateRange]);

  const reportDateHeader = useMemo(() => {
    if (!fromDate || !toDateRange) return "";
    const fromMonth = format(fromDate, 'MMMM');
    const toMonth = format(toDateRange, 'MMMM');
    const fromDay = format(fromDate, 'd');
    const toDay = format(toDateRange, 'd');
    const fromYear = format(fromDate, 'yyyy');
    const toYear = format(toDateRange, 'yyyy');

    if (fromMonth === toMonth && fromYear === toYear) {
      if (fromDay === toDay) return `${fromMonth} ${fromDay}, ${fromYear}`;
      return `${fromMonth} ${fromDay}-${toDay}, ${fromYear}`;
    }
    return `${format(fromDate, 'MMMM d, yyyy')} - ${format(toDateRange, 'MMMM d, yyyy')}`;
  }, [fromDate, toDateRange]);

  const handlePrint = () => window.print();

  if (loadingTickets) return <div className="p-8">Loading...</div>;
  if (!from || !to) return <div className="p-8">Please provide a date range.</div>;

  return (
    <div className="bg-white text-black font-serif print:m-0 print:p-0">
      <div className="max-w-4xl mx-auto border border-black p-4 print:border-none print:shadow-none print:p-0">
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={handlePrint} className="print:hidden">
            <Printer className="h-5 w-5" />
            <span className="sr-only">Print</span>
          </Button>
        </div>

        <header className="grid grid-cols-5 items-center mb-4">
          <div className="flex flex-col items-center justify-center col-span-1">
            <Image src="/dmw-logo-1.png" alt="DMW Logo" width={100} height={100} />
          </div>
          <div className="col-span-3 text-center">
            <p className="text-sm">Republic of the Philippines</p>
            <h1 className="text-3xl font-bold font-body" style={{ fontFamily: '"PT Sans", sans-serif' }}>
              Department of Migrant Workers
            </h1>
            <p className="text-sm">Regional Office - XIII (Caraga)</p>
            <p className="text-xs">Balanghai Hotel and Convention Center - Annex, Malvar Circle Corner J. Rosales Avenue, Butuan City, 8600</p>
          </div>
          <div className="flex flex-col items-center justify-center col-span-1">
            <Image src="/dmw-logo-3.png" alt="Bagong Pilipinas Logo" width={100} height={100} />
          </div>
        </header>

        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">MONTHLY REPORT OF OFFICIAL TRAVELS</h2>
          <p className="text-sm">for the period {reportDateHeader}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 text-sm mb-4">
          <div>
            <p>Vehicle Plate No.</p>
            <p className="border-b border-black text-center font-bold">Avanza / SNA 9481</p>
          </div>
          <div className="flex flex-col space-y-1 text-right">
            <div className="flex justify-end">
              <span className="w-36 shrink-0 text-left">Date:</span>
              <span className="border-b border-black flex-grow text-center">{reportDateHeader}</span>
            </div>
            <div className="flex justify-end">
              <span className="w-36 shrink-0 text-left">Driver's Name:</span>
              <span className="border-b border-black flex-grow text-center font-bold">ANTONIO E. LIGAN</span>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse border border-black text-xs text-center">
          <thead>
            <tr className="font-bold">
              <th className="border border-black p-1 w-[15%]">Date</th>
              <th className="border border-black p-1 w-[15%]">Distance Traveled (in Kms.)</th>
              <th className="border border-black p-1 w-[15%]">Gasoline Consumed (in liters)</th>
              <th className="border border-black p-1 w-[15%]">Oil Used (in liters)</th>
              <th className="border border-black p-1">Grease Used</th>
              <th className="border border-black p-1 w-[25%]">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket.id}>
                <td className="border border-black p-1 h-6">
                  {(() => {
                    const travelDate = toDate(ticket.dateOfTravel);
                    return travelDate ? format(travelDate, 'MM/dd/yy') : '—';
                  })()}
                </td>
                <td className="border border-black p-1">{ticket.status === 'Cancelled' ? 'cancelled' : ''}</td>
                <td className="border border-black p-1">{ticket.status === 'Cancelled' ? 'cancelled' : ''}</td>
                <td className="border border-black p-1">NONE</td>
                <td className="border border-black p-1">NONE</td>
                <td className="border border-black p-1 text-left">{`T.T. No. ${ticket.tripTicketNo}`}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 15 - filteredTickets.length))].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-black h-6 p-1"><span className="text-white">.</span></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1">NONE</td>
                <td className="border border-black p-1">NONE</td>
                <td className="border border-black p-1"></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="border border-black p-1 text-center">TOTALS</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-4 text-sm">
          <p>I hereby certify to the correctness of the above statements and that the motor vehicle was used on strictly official business only.</p>
        </div>

        <div className="grid grid-cols-2 mt-8 text-sm">
          <div></div>
          <div className="text-center">
            <p className="font-bold border-b border-black w-48 mx-auto">ANTONIO LIGAN</p>
            <p>Driver</p>
          </div>
        </div>

        <div className="mt-8 text-sm">
          <p>Approved by:</p>
          <div className="mt-8 w-64 mx-auto">
            <p className="font-bold border-b border-black text-center">REGIENALD S. ESPALDON</p>
            <p className="text-center">Chief AO, FAD</p>
          </div>
        </div>

        <div className="mt-8 text-xs">
          <p>Note: This report should be accomplished in triplicate; the original of which, supported by the originals of duly accomplished Driver's Record of Travel (Form A) should be submitted through the Administrative Officer or his equivalent to the Auditor concerned.</p>
        </div>
      </div>
    </div>
  );
}

// This is now a Server Component by default
export default function MonthlyTravelSummaryPage() {
    // It wraps the Client Component in a Suspense boundary
    return (
        <Suspense fallback={<div className="p-8">Loading Report...</div>}>
            <MonthlyTravelSummary />
        </Suspense>
    )
}
