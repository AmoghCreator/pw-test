"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FIRESTORE_SESSIONS_COLLECTION, CAREGIVER_FEED_LIMIT } from "@/lib/constants";
import { HeaderNav } from "@/components/HeaderNav";
import { CaregiverAppWindow } from "@/components/CaregiverAppWindow";
import { AuthHistoryBar } from "@/components/AuthHistoryBar";
import type { CaregiverFacingOutput } from "@/lib/types";

interface LiveSessionItem {
  id: string;
  caregiverFacing: CaregiverFacingOutput;
  createdAt: Date;
  inputType: string;
}

/** Hook for listening to real-time session feed from Firestore */
function useCaregiverFeed(): { feed: LiveSessionItem[]; isLoading: boolean } {
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
        const items: LiveSessionItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          inputType: doc.data().inputType ?? "emotion",
          caregiverFacing: doc.data().caregiverFacing,
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
        }));
        setFeed(items);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { feed, isLoading };
}

/** Header banner for Caregiver Command Center */
function CaregiverHeaderBanner(): React.JSX.Element {
  return (
    <section aria-label="Command Center Header" className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-teal-400">Caregiver Command Center</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time actionable nudges and emergency response scripts.
          </p>
        </div>
        <div className="bg-teal-950/80 border border-teal-700/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-300 flex items-center gap-1.5">
          <span aria-hidden="true" className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          Live Firestore Sync Active
        </div>
      </div>
    </section>
  );
}

/** Main content area containing banner and mobile app window */
function CaregiverMainView({ feed, isLoading }: { feed: LiveSessionItem[]; isLoading: boolean }): React.JSX.Element {
  return (
    <main id="main-content" tabIndex={0} className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6 flex flex-col items-center focus:outline-none">
      <div className="w-full space-y-4">
        <CaregiverHeaderBanner />
        <AuthHistoryBar />
      </div>
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-800 rounded-xl w-full max-w-[430px]" aria-busy="true">
          Connecting to live Firestore feed...
        </div>
      ) : (
        <CaregiverAppWindow caregiverFeed={feed} />
      )}
    </main>
  );
}

export default function CaregiverPage(): React.JSX.Element {
  const { feed, isLoading } = useCaregiverFeed();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <HeaderNav />
      <CaregiverMainView feed={feed} isLoading={isLoading} />
    </div>
  );
}
