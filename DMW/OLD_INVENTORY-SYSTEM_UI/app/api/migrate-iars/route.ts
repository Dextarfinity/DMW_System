
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// --- Firebase Admin Initialization ---

function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return;
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        console.error("Firebase Admin SDK initialization failed: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
        throw new Error("Server configuration error: Firebase credentials are not set.");
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", error.message);
        throw new Error("Server configuration error: Firebase credentials are not valid JSON.");
    }
}


export async function GET() {
  try {
    initializeFirebaseAdmin();
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
  }

  const db = admin.firestore();
  console.log("Starting IAR migration script...");
  const iarsRef = db.collection('iars');
  const purchaseOrdersRef = db.collection('purchaseOrders');
  const logs: string[] = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    const iarsSnapshot = await iarsRef.get();
    logs.push(`Found ${iarsSnapshot.size} IAR documents to process.`);

    const updatePromises: Promise<void>[] = [];

    for (const iarDoc of iarsSnapshot.docs) {
      const iarData = iarDoc.data();
      const iarId = iarDoc.id;

      // Skip if supplierId already exists and is not an empty string
      if (iarData.supplierId) {
        logs.push(`[SKIPPED] IAR ${iarId} already has a supplierId.`);
        skippedCount++;
        continue;
      }

      // Check if poId exists
      if (!iarData.poId) {
        logs.push(`[ERROR] IAR ${iarId} is missing poId.`);
        errorCount++;
        continue;
      }

      try {
        const poDocRef = purchaseOrdersRef.doc(iarData.poId);
        const poDoc = await poDocRef.get();

        if (!poDoc.exists) {
          logs.push(`[ERROR] PurchaseOrder with ID ${iarData.poId} not found for IAR ${iarId}.`);
          errorCount++;
          continue;
        }

        const poData = poDoc.data();
        if (!poData) {
            logs.push(`[ERROR] PurchaseOrder data is empty for ID ${iarData.poId}.`);
            errorCount++;
            continue;
        }

        const { supplierId, supplierName } = poData;

        if (!supplierId) {
          logs.push(`[ERROR] supplierId is missing in PurchaseOrder ${iarData.poId}.`);
          errorCount++;
          continue;
        }
        
        // Add the update operation to an array of promises
        const updatePromise = iarDoc.ref.update({
          supplierId,
          supplierName,
        }).then(() => {
          logs.push(`[SUCCESS] Updated IAR ${iarId} with supplierId: ${supplierId}`);
          updatedCount++;
        });

        updatePromises.push(updatePromise);

      } catch (e: any) {
        logs.push(`[ERROR] Failed to process IAR ${iarId}. Reason: ${e.message}`);
        errorCount++;
      }
    }
    
    // Wait for all the update operations to complete
    await Promise.all(updatePromises);

    const summary = `Migration finished. Updated: ${updatedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}.`;
    logs.push(summary);
    console.log(summary);

    return NextResponse.json({
      message: "Migration completed successfully.",
      summary,
      logs,
    });

  } catch (error: any) {
    console.error("Critical error during migration:", error);
    logs.push(`[CRITICAL ERROR] ${error.message}`);
    return new NextResponse(JSON.stringify({
        message: "Migration failed with a critical error.",
        logs
    }), { status: 500 });
  }
}
