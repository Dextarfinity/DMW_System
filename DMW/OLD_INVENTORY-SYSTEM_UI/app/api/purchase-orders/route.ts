
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

// Helper to serialize Firestore data, converting Timestamps to ISO strings
const serializeFirestoreData = (doc: admin.firestore.DocumentSnapshot) => {
    const data = doc.data();
    if (!data) return null;

    const serializedData: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(data)) {
        if (value instanceof admin.firestore.Timestamp) {
            serializedData[key] = value.toDate().toISOString();
        } else {
            serializedData[key] = value;
        }
    }

    return { id: doc.id, ...serializedData };
};


export async function GET() {
  try {
    initializeFirebaseAdmin();
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
  }

  const db = admin.firestore();
  const purchaseOrdersRef = db.collection('purchaseOrders');

  try {
    const snapshot = await purchaseOrdersRef.orderBy('poDate', 'desc').get();
    
    if (snapshot.empty) {
      return NextResponse.json({ message: "No purchase orders found." }, { status: 404 });
    }

    const purchaseOrders = snapshot.docs.map(serializeFirestoreData);

    return NextResponse.json(purchaseOrders);

  } catch (error: any) {
    console.error("Error fetching purchase orders:", error);
    return new NextResponse(JSON.stringify({
        message: "Failed to fetch purchase orders.",
        error: error.message
    }), { status: 500 });
  }
}
