
"use client";

import type { SettingsCounters } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsForm } from "@/components/settings-form";
import useFirestoreDocument from "@/hooks/use-firestore-document";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Settings } from "lucide-react";


export default function SettingsPage() {
  const { data: settings, loading } = useFirestoreDocument<SettingsCounters>("settings", "globalCounters");
  const { toast } = useToast();

  const handleSaveSettings = async (data: Partial<Omit<SettingsCounters, 'id'>>) => {
    try {
        const settingsRef = doc(db, "settings", "globalCounters");
        await setDoc(settingsRef, data, { merge: true });
        toast({ title: "Success", description: "Settings saved successfully." });
    } catch (error) {
        console.error("Failed to save settings:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to save settings." });
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage application-wide settings and counters here.</p>
            </div>
        </header>
        
        <Card>
            <CardHeader>
                <CardTitle>Global Counters</CardTitle>
                <CardDescription>
                   Set the last used number for various document types. The system will automatically increment from this number.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p>Loading settings...</p>
                ) : (
                    <SettingsForm 
                        settings={settings}
                        onSubmit={handleSaveSettings}
                    />
                )}
            </CardContent>
        </Card>

      </main>
    </div>
  );
}
