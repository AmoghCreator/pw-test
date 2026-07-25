"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FIRESTORE_SESSIONS_COLLECTION, CAREGIVER_FEED_LIMIT } from "@/lib/constants";
import { HeaderNav } from "@/components/HeaderNav";
import { CaregiverCard } from "@/components/CaregiverCard";
import { AuthHistoryBar } from "@/components/AuthHistoryBar";
import type { CaregiverFacingOutput } from "@/lib/types";

interface LiveSessionItem {
  id: string;
  caregiverFacing: CaregiverFacingOutput;
  createdAt: Date;
  inputType: string;
}

export default function CaregiverPage(): React.JSX.Element {
  const [feed, setFeed] = useState<LiveSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const q = query(
      collection(db, FIRESTORE_SESSIONS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(CAREGIVER_FEED_LIMIT)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: LiveSessionItem[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            inputType: data.inputType ?? "emotion",
            caregiverFacing: data.caregiverFacing,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          };
        });
        setFeed(items);
        setIsLoading(false);
      },
      (err) => {
        if (err.code !== "permission-denied") {
          console.error("[Caregiver Feed] Firestore live sync error:", err);
        }
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <HeaderNav />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <section aria-label="Command Center Header" className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-teal-400">Caregiver Command Center</h2>
              <p className="text-sm text-slate-300 mt-1">
                Real-time actionable nudges and emergency response scripts.
              </p>
            </div>
            <div className="bg-teal-950/80 border border-teal-700/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-300 flex items-center gap-1.5">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Live Firestore Sync Active
            </div>
          </div>
        </section>

        <AuthHistoryBar />

        <section aria-label="Caregiver Guidance Feed" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Actionable Feed</h3>
            <span className="text-xs text-slate-400">{feed.length} Active Guidance Card(s)</span>
          </div>

          <div role="status" aria-live="polite" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-800 rounded-xl" aria-busy="true">
                Connecting to live Firestore feed...
              </div>
            ) : feed.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No active guidance sessions recorded yet. Perform a check-in on the Sanctuary page.
              </div>
            ) : (
              feed.map((item) => (
                <CaregiverCard
                  key={item.id}
                  id={item.id}
                  caregiverFacing={item.caregiverFacing}
                  createdAt={item.createdAt}
                  inputType={item.inputType}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
