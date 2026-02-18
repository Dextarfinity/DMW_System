
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, query, Query } from 'firebase/firestore';

// A helper function to convert Firestore Timestamps to JS Dates in nested objects
const convertTimestamps = (data: any): any => {
    if (data === null || data === undefined) {
        return data;
    }
    if (data instanceof Timestamp) {
        return data.toDate();
    }
    if (Array.isArray(data)) {
        return data.map(convertTimestamps);
    }
    if (typeof data === 'object') {
        const newObj: { [key: string]: any } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                newObj[key] = convertTimestamps(data[key]);
            }
        }
        return newObj;
    }
    return data;
};


function useFirestoreCollection<T extends { id?: string }>(collectionName: string, customQuery?: Query) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the data processing function to prevent unnecessary re-renders
  const processSnapshot = useCallback((querySnapshot: any) => {
    const collectionData = querySnapshot.docs.map((doc: any) => {
      const docData = doc.data();
      // Convert any Timestamps to Date objects
      const convertedData = convertTimestamps(docData);
      return { id: doc.id, ...convertedData } as T;
    });
    setData(collectionData);
    setLoading(false);
  }, []);


  useEffect(() => {
    const collRef = customQuery || collection(db, collectionName);
    const unsubscribe = onSnapshot(
      collRef,
      processSnapshot, // Use the memoized callback
      (err) => {
        console.error(`Error fetching collection ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, processSnapshot, customQuery]);

  const addItem = async (itemData: Omit<T, 'id'>) => {
    try {
      const collRef = collection(db, collectionName);
      return await addDoc(collRef, itemData);
    } catch (err) {
      console.error(`Error adding document to ${collectionName}:`, err);
      // Optionally re-throw or handle the error in the UI
      throw err;
    }
  };

  const updateItem = async (id: string, itemData: Partial<Omit<T, 'id'>>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, itemData);
    } catch (err) {
      console.error(`Error updating document in ${collectionName}:`, err);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error(`Error deleting document from ${collectionName}:`, err);
      throw err;
    }
  };

  return { data, loading, error, addItem, updateItem, deleteItem };
}

export default useFirestoreCollection;
