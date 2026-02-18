
"use client";

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import useFirestoreDocument from '@/hooks/use-firestore-document';
import type { TripTicket, Employee } from '@/types';
import { format, parse } from 'date-fns';
import { toDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import Image from 'next/image';


export default function TripTicketDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: ticket, loading: loadingTicket } = useFirestoreDocument<TripTicket>('tripTickets', id);
  // This hook call seems to fetch a specific document, but the collection is 'employees'.
  // This is likely incorrect if you want to display a specific driver's name not tied to this single doc.
  // For now, we will keep the hardcoded driver as the logic for fetching a specific driver is unclear.
  const { data: employee, loading: loadingEmployees } = useFirestoreDocument<Employee>('employees', 'ANTONIO LIGAN');
  const assignedBy = useMemo(() => ({ name: 'MARK E. MARASIGAN', designation: 'Admin Officer I' }), []);
  const fadApprovedBy = useMemo(() => ({ name: 'REGIENALD S. ESPALDON', designation: 'Chief, Admin Officer' }), []);
  const vehicle = useMemo(() => ({ model: 'AVANZA', plateNo: 'XV908A' }), []);
  
  const passengerList = useMemo(() => {
    if (!ticket) return [];
    // Ensure passengers is an array before mapping
    return Array.isArray(ticket.passengers) ? ticket.passengers.map(p => p.name) : [];
  }, [ticket]);

  const formattedTimeOfDeparture = useMemo(() => {
    if (!ticket?.timeOfDeparture) return '';
    try {
      const [hours, minutes] = ticket.timeOfDeparture.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, 'hh:mm a');
    } catch {
      return ticket.timeOfDeparture;
    }
  }, [ticket?.timeOfDeparture]);


  const loading = loadingTicket || loadingEmployees;
  
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!ticket) {
    return <div className="p-8">Trip ticket not found.</div>;
  }

  return (
    <div className="bg-white text-black font-serif print:m-0 print:p-0">
      <div className="max-w-4xl mx-auto border border-black p-4 print:border-none print:shadow-none print:p-0">
        <div className="flex justify-end">
             <Button variant="ghost" size="icon" onClick={handlePrint} className="print:hidden">
                <Printer className="h-5 w-5" />
                <span className="sr-only">Print</span>
            </Button>
        </div>
        
        <div className="grid grid-cols-5 items-center mb-4">
            <div className="flex flex-col items-center justify-center col-span-1">
                <Image src="/dmw-logo-1.png" alt="DMW Logo" width={100} height={100} data-ai-hint="logo" />
            </div>
            <div className="col-span-3 text-center">
                <p className="text-sm">Republic of the Philippines</p>
                <h1 className="text-3xl font-bold font-body" style={{ fontFamily: '"PT Sans", sans-serif' }}>Department of Migrant Workers</h1>
                <p className="text-sm">Regional Office - XIII (Caraga)</p>
                <p className="text-xs">Balanghai Hotel and Convention Center - Annex, Malvar Circle Corner J. Rosales</p>
                <p className="text-xs">Avenue, Butuan City, 8600</p>
            </div>
            <div className="flex flex-col items-center justify-center col-span-1">
                 <Image src="/dmw-logo-3.png" alt="Bagong Pilipinas Logo" width={100} height={100} data-ai-hint="logo" />
            </div>
        </div>

        <h2 className="text-lg font-bold text-center mb-2">REQUEST FOR VEHICLE</h2>

        {/* Request Details */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-0 text-xs mb-1">
            <div className="flex"><span className="w-36 shrink-0">Requesting Party:</span><span className="border-b border-black flex-grow">{ticket.requestingParty}</span></div>
            <div className="flex"><span className="w-36 shrink-0">Date of Request:</span><span className="border-b border-black flex-grow">{ticket.dateOfRequest ? format(new Date(ticket.dateOfRequest as any), 'MMMM d, yyyy') : ''}</span></div>
            <div className="flex"><span className="w-36 shrink-0">Date of Travel:</span><span className="border-b border-black flex-grow">{ticket.dateOfTravel ? format(new Date(ticket.dateOfTravel as any), 'MMMM d, yyyy') : ''}</span></div>
            <div className="flex"><span className="w-36 shrink-0">Return Date:</span><span className="border-b border-black flex-grow">{ticket.returnDate ? format(new Date(ticket.returnDate as any), 'MMMM d, yyyy') : ''}</span></div>
            <div className="flex"><span className="w-36 shrink-0">Contact No.:</span><span className="border-b border-black flex-grow">{ticket.contactNo}</span></div>
            <div className="flex"><span className="w-36 shrink-0">Est'd Time of Departure:</span><span className="border-b border-black flex-grow">{formattedTimeOfDeparture}</span></div>
            <div className="flex col-span-2"><span className="w-36 shrink-0">Purpose:</span><span className="border-b border-black flex-grow">{ticket.purpose}</span></div>
            <div className="flex col-span-2"><span className="w-36 shrink-0">Destination:</span><span className="border-b border-black flex-grow">{ticket.destination}</span></div>
        </div>

        {/* Signatories */}
        <div className="grid grid-cols-2 gap-x-16 text-xs mt-1">
            <div>
                <p>Requested by:</p>
                <div className="text-center mt-4">
                    <p className="font-bold underline">{ticket.requestedByEmployee.toUpperCase()}</p>
                    <p>{ticket.requestedByDesignation}</p>
                </div>
            </div>
            <div>
                <p>Approved by:</p>
                <div className="text-center mt-4">
                    <p className="font-bold underline">{ticket.approvedByEmployee.toUpperCase()}</p>
                    <p>{ticket.approvedByDesignation}</p>
                </div>
            </div>
        </div>

        <div className="text-center font-bold border-y-2 border-black my-1 py-0 text-xs">FAD</div>

        <div className="grid grid-cols-2 gap-x-16 text-xs">
             <div>
                <div className="flex"><span className="w-32 shrink-0">Assigned Driver:</span><span className="font-bold border-b border-black flex-grow">ANTONIO LIGAN</span></div>
                <div className="mt-1">
                    <p>Assigned by:</p>
                     <div className="text-center mt-3">
                        <p className="font-bold underline">{assignedBy.name}</p>
                        <p>{assignedBy.designation}</p>
                    </div>
                </div>
             </div>
             <div>
                <div className="flex"><span className="w-32 shrink-0">Vehicle/ Plate No.:</span><span className="font-bold border-b border-black flex-grow">{`${vehicle.model} / ${vehicle.plateNo}`}</span></div>
                 <div className="mt-1">
                    <p>Approved by:</p>
                     <div className="text-center mt-3">
                        <p className="font-bold underline">{fadApprovedBy.name}</p>
                        <p>{fadApprovedBy.designation}</p>
                    </div>
                </div>
             </div>
        </div>
        
        <h2 className="text-sm font-bold text-center border-t-2 border-black pt-1 mt-1">DRIVER'S TRIP TICKET</h2>

        {/* Driver's Trip Ticket Details */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-0 my-1 text-xs">
            <div className="flex"><span className="w-48 shrink-0">Date:</span><span className="border-b border-black flex-grow">{ticket.dateOfRequest ? format(new Date(ticket.dateOfRequest as any), 'MMMM d, yyyy') : ''}</span></div>
            <div className="flex"><span className="w-48 shrink-0">Trip Ticket Number:</span><span className="border-b border-black flex-grow">{ticket.tripTicketNo}</span></div>
            <div className="flex"><span className="w-48 shrink-0">Driver:</span><span className="font-bold border-b border-black flex-grow">ANTONIO LIGAN</span></div>
            <div className="flex"><span className="w-48 shrink-0">Vehicle/ Plate No.:</span><span className="font-bold border-b border-black flex-grow">{`${vehicle.model} / ${vehicle.plateNo}`}</span></div>

            <div className="flex col-span-2"><span className="w-48 shrink-0">Time of Departure from Office/Garage:</span><span className="border-b border-black flex-grow"></span></div>
            <div className="flex col-span-2"><span className="w-48 shrink-0">Time of Arrival back to Office/Garage:</span><span className="border-b border-black flex-grow"></span></div>

            <div className="col-span-2 mt-1">
                <p className="font-bold">Fuel issued by the Office</p>
                <div className="pl-4 space-y-0">
                    <div className="flex"><span className="w-44 shrink-0">Balance in Tank before the trip:</span><span className="border-b border-black flex-grow"></span></div>
                    <div className="flex"><span className="w-44 shrink-0">Add: Issued by the Officer:</span><span className="border-b border-black flex-grow"></span></div>
                    <div className="flex"><span className="w-44 shrink-0">Purchase during the trip:</span><span className="border-b border-black flex-grow"></span></div>
                    <div className="flex"><span className="w-44 shrink-0">Total Fuel in tank:</span><span className="border-b border-black flex-grow"></span></div>
                    <div className="flex"><span className="w-44 shrink-0">Less: Consumed during the trip:</span><span className="border-b border-black flex-grow"></span></div>
                    <div className="flex"><span className="w-44 shrink-0">Balance in Tank after the trip:</span><span className="border-b border-black flex-grow"></span></div>
                </div>
            </div>
             <div className="col-span-2 mt-1">
                <p className="font-bold">Odometer reading</p>
                 <div className="pl-4 space-y-0">
                    <div className="flex"><span className="w-44 shrink-0">At the end of the trip:</span><span className="border-b border-black flex-grow"></span></div>
                    <div className="flex"><span className="w-44 shrink-0">Less: Beginning of the trip:</span><span className="border-b border-black flex-grow"></span></div>
                    <div className="flex"><span className="w-44 shrink-0">Distance traveled:</span><span className="border-b border-black flex-grow"></span></div>
                </div>
            </div>
        </div>

        {/* Travel Log Table */}
        <table className="w-full border-collapse border border-black text-xs text-center mt-1">
            <thead>
                <tr>
                    <th rowSpan={2} className="border border-black p-0.5 font-semibold">DATE</th>
                    <th colSpan={2} className="border border-black p-0.5 font-semibold">TIME</th>
                    <th rowSpan={2} className="border border-black p-0.5 font-semibold">Destination of the travel</th>
                    <th rowSpan={2} className="border border-black p-0.5 font-semibold">No. of Km. used</th>
                    <th rowSpan={2} className="border border-black p-0.5 font-semibold">Name of Passengers</th>
                    <th rowSpan={2} className="border border-black p-0.5 font-semibold">Passenger's Signature</th>
                </tr>
                <tr>
                    <th className="border border-black p-0.5 font-semibold">Departure</th>
                    <th className="border border-black p-0.5 font-semibold">Arrival</th>
                </tr>
            </thead>
            <tbody>
                 {[...Array(5)].map((_, i) => (
                     <tr key={i}>
                        <td className="border border-black h-4"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black p-0.5 text-left align-top">
                            {passengerList[i] || ''}
                        </td>
                        <td className="border border-black"></td>
                    </tr>
                 ))}

            </tbody>
        </table>
        
        <div className="flex justify-end mt-2">
            <div className="text-center text-xs">
                <br />
                <br />
                <p className="font-bold underline">ANTONIO LIGAN</p>
                <p className="text-center">Driver</p>
            </div>
        </div>
      </div>
    </div>
  );
}

    