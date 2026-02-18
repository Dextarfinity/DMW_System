
import type { Timestamp } from 'firebase/firestore';

export type ItemCategory = 'Expendable' | 'Semi-Expendable' | 'Capital Outlay';

export type SemiExpendableClassification = 'Low' | 'High';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: ItemCategory;
  gamClassification?: string;
  semiExpendableClassification?: SemiExpendableClassification;
}

export interface TripTicket {
  id: string;
  tripTicketNo: string;
  requestingParty: string;
  dateOfRequest: Timestamp;
  dateOfTravel: Timestamp;
  returnDate: Timestamp;
  contactNo: string;
  timeOfDeparture: string;
  purpose: string;
  destination: string;
  passengers: { name: string }[];
  requestedByEmployee: string;
  requestedByDesignation: string;
  approvedByEmployee: string;
  approvedByDesignation: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled';
}

export interface PurchaseOrderItem {
    itemId: string;
    description: string;
    quantity: number;
    uom: string;
    unitCost: number;
    totalCost: number;
    category: ItemCategory;
}

export interface PurchaseOrder {
    id: string;
    poDate: Timestamp;
    poNumber: string;
    supplierId: string;
    supplierName: string; 
    purpose: string;
    totalAmount: number;
    status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled' | 'Draft' | 'Delivered' | 'Processing';
    modeOfProcurement: string;
    obrNo?: string;
    fundCluster: string;
    placeOfDelivery: string;
    dateOfDelivery: Timestamp;
    deliveryTerm: string;
    paymentTerm: string;
    items: PurchaseOrderItem[];
    address?: string;
    tin?: string;
}

export interface IARItem {
  itemId: string;
  generatedItemId?: string;
  description: string;
  category: "Expendable" | "Semi-Expendable" | "Capital Outlay";
  brand?: string;
  model?: string;
  serialNo?: string;
  ppeNo?: string;
  inventoryNo?: string;
  remarks?: string;
  quantity: number;
  uom: string;
  unitCost: number;
  totalCost: number;
}

export interface InspectionAcceptanceReport {
    id: string;
    iarDate: Timestamp;
    invoiceNumber: string;
    invoiceDate: Timestamp;
    iarNumber: string;
    poId: string;
    supplierId?: string;
    poNumber: string;
    supplierName: string;
    purpose: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
    items: IARItem[];
}

export interface RISItem {
    itemId: string;
    description: string;
    uom: string;
    quantity: number;
}

export interface RequisitionIssueSlip {
    id: string;
    risNo: string;
    division: string;
    risDate: Timestamp;
    purpose: string;
    items: RISItem[];
    requestedById: string;
    requestedByName: string;
    requestedByDesignation: string;
    approvedById: string;
    approvedByName: string;
    approvedByDesignation: string;
    issuedById: string;
    issuedByName: string;
    issuedByDesignation: string;
    receivedById: string;
    receivedByName: string;
    receivedByDesignation: string;
    status: 'POSTED' | 'PENDING' | 'CANCELLED';
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}


export interface InventoryCustodianSlip {
    id: string;
    icsNo: string;
    inventoryNo: string;
    description: string;
    issuedTo: string;
    dateOfIssue: Timestamp;
    receivedFromId: string;
    receivedFromPosition: string;
    receivedById: string;
    receivedByPosition: string;
    ppeNo: string;
    otherInfo?: string;
}

export interface PropertyAcknowledgementReceipt {
    id: string;
    parNo: string;
    ppeNo: string;
    description: string;
    issuedTo: string;
    dateOfIssue: Timestamp;
    receivedFromId: string;
    receivedFromPosition: string;
    receivedById: string;
    receivedByPosition: string;
    otherInfo?: string;
}

export interface PropertyTransferReport {
    id: string;
    ptrNo: string;
    date: Timestamp;
    fromAccountableOfficerId: string;
    fromAccountableOfficerName: string;
    toAccountableOfficerId: string;
    toAccountableOfficerName: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
}

export interface ReceivedSemiExpendableItem {
  id: string;
  itemId: string;
  generatedItemId: string;
  itemDescription: string;
  inventoryNo: string;
  icsNo?: string;
  ppeNo: string;
  serialNo?: string;
  issuedTo?: string;
  brand?: string;
  model?: string;
  status: 'Available' | 'Issued' | 'For Repair' | 'Unserviceable';
}

export interface ReceivedCapitalOutlayItem {
  id: string;
  itemId: string;
  generatedItemId: string;
  itemDescription: string;
  ppeNo: string;
  serialNo?: string;
  issuedTo?: string;
  brand?: string;
  model?: string;
  status: 'Available' | 'Issued' | 'For Repair' | 'Unserviceable';
}

export interface StockCardTransaction {
    date: Timestamp;
    reference: string;
    receiptQty: number;
    issueQty: number;
    balance: number;
}

export interface StockCard {
    id: string;
    itemId: string;
    itemName: string;
    transactions: StockCardTransaction[];
}

export interface SuppliesLedgerCardTransaction {
    date: Timestamp;
    reference: string;
    receiptQty: number;
    receiptUnitCost: number;
    receiptTotalCost: number;
    issueQty: number;
    issueUnitCost: number;
    issueTotalCost: number;
    balanceQty: number;
    balanceUnitCost: number;
    balanceTotalCost: number;
}

export interface SuppliesLedgerCard {
    id: string;
    itemId: string;
    itemName: string;
    transactions: SuppliesLedgerCardTransaction[];
}

export interface PropertyCard {
    id: string;
    propertyNumber: string;
    description: string;
    receivedFrom: string;
    receivedDate: Timestamp;
    acquisitionCost: number;
    issuedTo?: string;
    issuedDate?: Timestamp;
    icsNo?: string;
}

export interface PropertyLedgerCard {
    id: string;
    propertyNumber: string;
    description: string;
    acquisitionDate: Timestamp;
    acquisitionCost: number;
    transactions?: SuppliesLedgerCardTransaction[];
}


export interface UacsCode {
  id: string;
  code: string;
  title: string;
  category: ItemCategory;
}

export interface Employee {
  id: string;
  name: string;
  designation?: string;
}

export interface Designation {
  id: string;
  name: string;
}

export interface Office {
  id: string;
  name: string;
}

export interface Division {
  id: string;
  name: string;
}

export interface FundCluster {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  orgType: 'Non-Government' | 'Government';
  tin?: string;
  taxType: 'VAT' | 'Non-VAT';
}

export interface Item {
  id: string;
  stockNo: string;
  uacsCode: string;
  category: ItemCategory;
  description: string;
  unit: string;
  reorderPoint: number;
  currentQuantity: number;
}

export interface Uom {
    id: string;
    name: string;
    abbreviation: string;
}

export interface ProcurementMode {
  id:string;
  name: string;
}

export interface SettingsCounters {
    id: string;
    counters?: { 
        [yearMonth: string]: number;
    };
    ppeCounters?: {
      [yearSubMajorGL: string]: number;
    };
    inventoryCounters?: {
        [yearUACS: string]: number;
    };
    generatedItemIdCounter?: number;
    icsCounters?: {
        [year: string]: number;
    };
    parCounters?: {
        [year: string]: number;
    };
    risCounters?: {
        [year: string]: number;
    };
}

export type TripTicketCounter = {
    counters: {
        [yearMonth: string]: number;
    }
}
