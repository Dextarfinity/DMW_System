
'use server';

import { 
    doc, 
    runTransaction, 
    collection, 
    writeBatch, 
    Timestamp,
    increment,
    DocumentReference,
    DocumentSnapshot,
    query,
    where,
    getDocs,
    deleteDoc,
    updateDoc,
    getDoc,
    addDoc,
    serverTimestamp,
    Firestore,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toDate } from "@/lib/utils";
import type { 
    InspectionAcceptanceReport, 
    Item, 
    StockCard,
    StockCardTransaction,
    SuppliesLedgerCard,
    SuppliesLedgerCardTransaction,
    ReceivedSemiExpendableItem,
    ReceivedCapitalOutlayItem,
    PropertyCard,
    PropertyLedgerCard,
    SettingsCounters,
    IARItem,
    PurchaseOrder,
    RISItem,
    RequisitionIssueSlip,
    Employee,
    Designation,
} from "@/types";
import { RISFormValues } from "@/components/ris-form";

const uacsToPpeMap: { [key: string]: { subMajor: string, gl: string } } = {
    '1040501000': { subMajor: '05', gl: '01' },
    '1040502000': { subMajor: '05', gl: '02' },
    '1040503000': { subMajor: '05', gl: '03' },
    '1040507000': { subMajor: '05', gl: '07' },
    '1040510000': { subMajor: '51', gl: '10' },
    '1040512000': { subMajor: '51', gl: '12' },
    '1040513000': { subMajor: '51', gl: '13' },
    '1040519000': { subMajor: '51', gl: '19' },
    '1040601000': { subMajor: '60', gl: '01' },
    '1040602000': { subMajor: '60', gl: '02' },
    '1060101000': { subMajor: '01', gl: '01' },
    '1060401000': { subMajor: '04', gl: '01' },
    '1060501000': { subMajor: '05', gl: '01' },
    '1060502000': { subMajor: '05', gl: '02' },
    '1060503000': { subMajor: '05', gl: '03' },
    '1060514000': { subMajor: '05', gl: '14' },
    '1060513000': { subMajor: '05', gl: '13' },
    '1060511000': { subMajor: '05', gl: '11' },
    '1060512000': { subMajor: '05', gl: '12' },
    '1080102000': { subMajor: '01', gl: '02' },
    '1060599000': { subMajor: '05', gl: '99' },
    '1060601000': { subMajor: '06', gl: '01' },
    '1060701000': { subMajor: '07', gl: '01' },
    '1060702000': { subMajor: '07', gl: '02' },
    '1069899000': { subMajor: '98', gl: '99' },
};

const normalizeToTimestamp = (value: unknown): Timestamp => {
    if (value instanceof Timestamp) {
      return value;
    }
    if (value instanceof Date) {
      return Timestamp.fromDate(value);
    }
    if (typeof value === 'string') {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        return Timestamp.fromDate(parsedDate);
      }
    }
     if (typeof value === 'object' && value !== null && 'seconds' in value && 'nanoseconds' in value) {
        return new Timestamp((value as any).seconds, (value as any).nanoseconds);
    }
    throw new Error('Invalid date value provided for timestamp conversion.');
};


export const acceptIAR = async (iar: InspectionAcceptanceReport) => {
    let normalizedIAR: InspectionAcceptanceReport;
    try {
        normalizedIAR = {
            ...iar,
            iarDate: normalizeToTimestamp(iar.iarDate),
            invoiceDate: normalizeToTimestamp(iar.invoiceDate),
            items: iar.items.map(item => ({
                ...item,
                brand: item.brand || '',
                model: item.model || '',
                serialNo: item.serialNo || '',
                remarks: item.remarks || '',
            }))
        };
    } catch (e: any) {
        console.error("Date normalization failed:", e.message, "Original IAR data:", iar);
        throw new Error("Invalid IAR date provided. Please ensure all dates are correct.");
    }

    const iarDate = normalizedIAR.iarDate.toDate();

    return await runTransaction(db, async (transaction) => {
        const poRef = doc(db, "purchaseOrders", iar.poId);
        const iarRef = doc(db, "iars", iar.id);
        const countersRef = doc(db, "settings", "globalCounters");
        
        const [countersSnap, ...masterItemSnaps] = await Promise.all([
            transaction.get(countersRef),
            ...iar.items.map(item => transaction.get(doc(db, "items", item.itemId)))
        ]);
        
        const itemsMap = new Map(masterItemSnaps.map(snap => [snap.id, snap.data() as Item]));

        for (const iarItem of iar.items) {
            const itemData = itemsMap.get(iarItem.itemId);
            if (!itemData) {
                 throw new Error(`Master Item with ID ${iarItem.itemId} not found. Please check PO data.`);
            }
             if (!itemData.uacsCode || itemData.uacsCode.length !== 10) {
                 throw new Error(`Item "${itemData.description}" has an invalid UACS code: ${itemData.uacsCode}. It must be 10 digits long. Please check the item setup in Maintenance.`);
            }
            if ((itemData.category === 'Semi-Expendable' || itemData.category === 'Capital Outlay') && !uacsToPpeMap[itemData.uacsCode]) {
                 throw new Error(`PPE mapping not found for UACS code ${itemData.uacsCode} for item "${itemData.description}". Please check the item setup.`);
            }
        }
        
        const uniqueItemIds = [...new Set(iar.items.map(item => item.itemId))];
        const stockCardRefs = uniqueItemIds.map(id => doc(db, "stockCards", id));
        const ledgerCardRefs = uniqueItemIds.map(id => doc(db, "suppliesLedgerCards", id));
        
        const stockCardSnaps = await Promise.all(stockCardRefs.map(ref => transaction.get(ref)));
        const ledgerCardSnaps = await Promise.all(ledgerCardRefs.map(ref => transaction.get(ref)));

        const stockCardsMap = new Map(stockCardSnaps.map(snap => [snap.id, snap.data() as StockCard]));
        const ledgerCardsMap = new Map(ledgerCardSnaps.map(snap => [snap.id, snap.data() as SuppliesLedgerCard]));

        const countersData = (countersSnap.data() || {}) as SettingsCounters;
        let ppeCounters = countersData.ppeCounters || {};
        let inventoryCounters = countersData.inventoryCounters || {};
        let generatedItemIdCounter = countersData.generatedItemIdCounter || 3;
        
        const finalIARItems: IARItem[] = [];
        
        const year = iarDate.getFullYear();
        const month = String(iarDate.getMonth() + 1).padStart(2, '0');

        for (const iarItem of normalizedIAR.items) {
            const itemData = itemsMap.get(iarItem.itemId);
            if (!itemData) {
                throw new Error(`Item with ID ${iarItem.itemId} not found.`);
            }

            const itemRef = doc(db, "items", iarItem.itemId);
            let updatedIarItem = { ...iarItem };
            
            const receivedDate = normalizedIAR.iarDate;

            if (itemData.category === 'Expendable') {
                transaction.update(itemRef, { currentQuantity: increment(iarItem.quantity) });
                
                generatedItemIdCounter++;
                const generatedItemId = String(generatedItemIdCounter).padStart(2, '0');
                updatedIarItem.generatedItemId = generatedItemId;

                const stockCardData = stockCardsMap.get(iarItem.itemId);
                const stockCardRef = doc(db, "stockCards", iarItem.itemId);
                let currentBalance = 0;
                let existingTransactions: StockCardTransaction[] = [];
                if (stockCardData && stockCardData.transactions) {
                    existingTransactions = stockCardData.transactions;
                    currentBalance = stockCardData.transactions[stockCardData.transactions.length - 1]?.balance || 0;
                }
                const newStockTx: StockCardTransaction = {
                    date: receivedDate,
                    reference: iar.iarNumber,
                    receiptQty: iarItem.quantity,
                    issueQty: 0,
                    balance: currentBalance + iarItem.quantity,
                };
                if (stockCardData) {
                     transaction.update(stockCardRef, { transactions: [...existingTransactions, newStockTx] });
                } else {
                     transaction.set(stockCardRef, { itemId: iarItem.itemId, itemName: itemData.description, transactions: [newStockTx] });
                }

                const ledgerCardData = ledgerCardsMap.get(iarItem.itemId);
                const ledgerCardRef = doc(db, "suppliesLedgerCards", iarItem.itemId);
                let currentLedgerBalanceQty = 0;
                let currentLedgerBalanceTotalCost = 0;
                let existingLedgerTxs: SuppliesLedgerCardTransaction[] = [];

                if (ledgerCardData && ledgerCardData.transactions) {
                    existingLedgerTxs = ledgerCardData.transactions;
                    const lastTx = ledgerCardData.transactions[ledgerCardData.transactions.length - 1];
                    currentLedgerBalanceQty = lastTx?.balanceQty || 0;
                    currentLedgerBalanceTotalCost = lastTx?.balanceTotalCost || 0;
                }

                const newBalanceQty = currentLedgerBalanceQty + iarItem.quantity;
                const newBalanceTotalCost = currentLedgerBalanceTotalCost + iarItem.totalCost;
                const newUnitCost = newBalanceQty > 0 ? newBalanceTotalCost / newBalanceQty : 0;
                const newLedgerTx: SuppliesLedgerCardTransaction = {
                    date: receivedDate, reference: iar.iarNumber, receiptQty: iarItem.quantity, receiptUnitCost: iarItem.unitCost, receiptTotalCost: iarItem.totalCost, issueQty: 0, issueUnitCost: 0, issueTotalCost: 0, balanceQty: newBalanceQty, balanceUnitCost: newUnitCost, balanceTotalCost: newBalanceTotalCost,
                };
                if (ledgerCardData) {
                    transaction.update(ledgerCardRef, { transactions: [...existingLedgerTxs, newLedgerTx] });
                } else {
                    transaction.set(ledgerCardRef, { itemId: iarItem.itemId, itemName: itemData.description, transactions: [newLedgerTx] });
                }
                finalIARItems.push(updatedIarItem);

            } else {
                
                generatedItemIdCounter++;
                const generatedItemId = String(generatedItemIdCounter).padStart(2, '0');
                updatedIarItem.generatedItemId = generatedItemId;
                updatedIarItem.quantity = 1;
                updatedIarItem.totalCost = updatedIarItem.unitCost;

                const ppeMapInfo = uacsToPpeMap[itemData.uacsCode];
                const ppeCounterKey = `${year}-${ppeMapInfo.subMajor}-${ppeMapInfo.gl}`;
                const currentPpeCount = ppeCounters[ppeCounterKey] || 0;
                const newPpeCount = currentPpeCount + 1;
                ppeCounters[ppeCounterKey] = newPpeCount;
                updatedIarItem.ppeNo = `${year}-${ppeMapInfo.subMajor}-${ppeMapInfo.gl}-${String(newPpeCount).padStart(4, '0')}`;
                
                let newItemRef: DocumentReference;
                
                if (itemData.category === 'Semi-Expendable') {
                    const uacsDigits = itemData.uacsCode.slice(4, 8);
                    const invCounterKey = `${year}-${uacsDigits}`;
                    const currentInvCount = inventoryCounters[invCounterKey] || 0;
                    const newInvCount = currentInvCount + 1;
                    inventoryCounters[invCounterKey] = newInvCount;
                    updatedIarItem.inventoryNo = `${uacsDigits}-${month}-${String(newInvCount).padStart(4, '0')}`;
                    
                    newItemRef = doc(collection(db, "receivedSemiExpendableItems"));
                    const newItemData: Omit<ReceivedSemiExpendableItem, 'id'> = {
                        itemId: iarItem.itemId,
                        generatedItemId: generatedItemId,
                        itemDescription: itemData.description, 
                        inventoryNo: updatedIarItem.inventoryNo, 
                        ppeNo: updatedIarItem.ppeNo, 
                        status: 'Available', 
                        serialNo: iarItem.serialNo || '', 
                        brand: iarItem.brand || '', 
                        model: iarItem.model || '',
                    };
                    transaction.set(newItemRef, newItemData);

                } else {
                    updatedIarItem.inventoryNo = '';
                    newItemRef = doc(collection(db, "receivedCapitalOutlayItems"));
                    const newItemData: Omit<ReceivedCapitalOutlayItem, 'id'> = {
                        itemId: iarItem.itemId,
                        generatedItemId: generatedItemId,
                        itemDescription: itemData.description, 
                        status: 'Available', 
                        ppeNo: updatedIarItem.ppeNo, 
                        serialNo: iarItem.serialNo || '', 
                        brand: iarItem.brand || '', 
                        model: iarItem.model || '',
                    };
                    transaction.set(newItemRef, newItemData);
                }
                
                const propertyCardRef = doc(collection(db, "propertyCards"));
                const propertyCardData: Omit<PropertyCard, 'id'> = {
                    propertyNumber: updatedIarItem.ppeNo, 
                    description: itemData.description, 
                    receivedFrom: iar.supplierName, 
                    receivedDate: receivedDate, 
                    acquisitionCost: iarItem.unitCost,
                };
                transaction.set(propertyCardRef, propertyCardData);

                const propertyLedgerCardRef = doc(collection(db, "propertyLedgerCards"));
                const propertyLedgerCardData: Omit<PropertyLedgerCard, 'id'> = {
                    propertyNumber: updatedIarItem.ppeNo, 
                    description: itemData.description, 
                    acquisitionDate: receivedDate, 
                    acquisitionCost: iarItem.unitCost
                };
                transaction.set(propertyLedgerCardRef, propertyLedgerCardData);
                
                finalIARItems.push(updatedIarItem);
            }
        }
        
        transaction.update(iarRef, {
            status: 'Completed',
            items: finalIARItems,
            iarNumber: normalizedIAR.iarNumber,
            iarDate: normalizedIAR.iarDate,
            invoiceNumber: normalizedIAR.invoiceNumber,
            invoiceDate: normalizedIAR.invoiceDate,
        });

        transaction.set(countersRef, { ppeCounters, inventoryCounters, generatedItemIdCounter }, { merge: true });
        transaction.update(poRef, { status: 'Completed' });
    });
};


export const unpostIAR = async (iar: InspectionAcceptanceReport) => {
    // Step 1: Get IDs of all related documents that need to be deleted.
    const generatedIdsToDelete = iar.items.map(i => i.generatedItemId).filter(Boolean) as string[];
    const ppeNumbersToDelete = iar.items.map(item => item.ppeNo).filter(Boolean) as string[];

    const queries = [];
    if (generatedIdsToDelete.length > 0) {
        queries.push(getDocs(query(collection(db, "receivedSemiExpendableItems"), where("generatedItemId", "in", generatedIdsToDelete))));
        queries.push(getDocs(query(collection(db, "receivedCapitalOutlayItems"), where("generatedItemId", "in", generatedIdsToDelete))));
    } else {
        // Push empty promises to maintain array structure if no IDs
        queries.push(Promise.resolve({ docs: [] }));
        queries.push(Promise.resolve({ docs: [] }));
    }

    if (ppeNumbersToDelete.length > 0) {
        queries.push(getDocs(query(collection(db, "propertyCards"), where("propertyNumber", "in", ppeNumbersToDelete))));
        queries.push(getDocs(query(collection(db, "propertyLedgerCards"), where("propertyNumber", "in", ppeNumbersToDelete))));
    } else {
        // Push empty promises
        queries.push(Promise.resolve({ docs: [] }));
        queries.push(Promise.resolve({ docs: [] }));
    }

    const queryResults = await Promise.all(queries);
    const docsToDelete: DocumentReference[] = queryResults.flatMap(snap => snap.docs.map(d => d.ref));

    // Step 2: Run the transaction to update/delete everything atomically.
    return await runTransaction(db, async (transaction) => {
        const iarRef = doc(db, "iars", iar.id);
        const poRef = doc(db, "purchaseOrders", iar.poId);

        // Fetch master items to determine which are expendable
        const allItemIds = [...new Set(iar.items.map(i => i.itemId))];
        if (allItemIds.length === 0) {
             // If there are no items, just update statuses and delete docs.
             transaction.update(iarRef, { status: 'Pending' });
             transaction.update(poRef, { status: 'Delivered' });
             docsToDelete.forEach(docRef => transaction.delete(docRef));
             return;
        }

        const masterItemRefs = allItemIds.map(id => doc(db, "items", id));
        const masterItemSnaps = await Promise.all(masterItemRefs.map(ref => transaction.get(ref)));
        const itemsMap = new Map(masterItemSnaps.map(snap => [snap.id, snap.data() as Item]));

        const expendableItems = iar.items.filter(item => itemsMap.get(item.itemId)?.category === 'Expendable');
        
        // Fetch stock/ledger cards for expendable items
        const expendableItemIds = expendableItems.map(i => i.itemId);
        let stockCardSnaps: DocumentSnapshot[] = [];
        let ledgerCardSnaps: DocumentSnapshot[] = [];

        if(expendableItemIds.length > 0) {
            const stockCardRefs = expendableItemIds.map(id => doc(db, "stockCards", id));
            const ledgerCardRefs = expendableItemIds.map(id => doc(db, "suppliesLedgerCards", id));
            stockCardSnaps = await Promise.all(stockCardRefs.map(ref => transaction.get(ref)));
            ledgerCardSnaps = await Promise.all(ledgerCardRefs.map(ref => transaction.get(ref)));
        }

        // --- All reads are complete. Perform writes. ---

        // Update IAR and PO statuses
        transaction.update(iarRef, { status: 'Pending' });
        transaction.update(poRef, { status: 'Delivered' });

        // Delete all related property/asset documents
        docsToDelete.forEach(docRef => transaction.delete(docRef));

        // Revert changes for expendable items
        for (const iarItem of expendableItems) {
            const itemRef = doc(db, "items", iarItem.itemId);
            transaction.update(itemRef, { currentQuantity: increment(-iarItem.quantity) });

            const stockCardSnap = stockCardSnaps.find(s => s.id === iarItem.itemId);
            if (stockCardSnap?.exists()) {
                const stockCard = stockCardSnap.data() as StockCard;
                const newTransactions = stockCard.transactions.filter(tx => tx.reference !== iar.iarNumber);
                transaction.update(stockCardSnap.ref, { transactions: newTransactions });
            }

            const ledgerCardSnap = ledgerCardSnaps.find(s => s.id === iarItem.itemId);
            if (ledgerCardSnap?.exists()) {
                const ledgerCard = ledgerCardSnap.data() as SuppliesLedgerCard;
                const newTransactions = ledgerCard.transactions.filter(tx => tx.reference !== iar.iarNumber);
                transaction.update(ledgerCardSnap.ref, { transactions: newTransactions });
            }
        }
    });
};
