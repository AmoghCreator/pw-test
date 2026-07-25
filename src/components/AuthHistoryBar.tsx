"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { auth, db, signInWithGoogle, signInAnon, logAnalyticsEvent } from "@/lib/firebase";
import { FIRESTORE_SESSIONS_COLLECTION } from "@/lib/constants";
import type { GeminiOutput } from "@/lib/types";

interface SessionHistoryItem {
  id: string;
  inputType: string;
  userFacing: GeminiOutput["user_facing"];
  caregiverFacing: GeminiOutput["caregiver_facing"];
  createdAt: Date;
}

interface AuthHistoryBarProps {
  onSelectHistoryItem?: (item: SessionHistoryItem) => void;
}

/** Render user profile badge */
function UserBadge({ user, onSignOut }: { user: User; onSignOut: () => void }): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
      <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
        {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
      </div>
      <div className="text-xs">
        <p className="font-semibold text-slate-200">{user.displayName || "Anonymous User"}</p>
        <p className="text-[10px] text-slate-400">{user.email || user.uid.slice(0, 8)}</p>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        aria-label="Sign out of Haven Bridge"
        className="ml-2 text-xs text-slate-400 hover:text-red-400 transition-colors focus:outline-none focus:ring-1 focus:ring-red-400"
      >
        Sign Out
      </button>
    </div>
  );
}

/** Main Auth & History Component */
export function AuthHistoryBar({ onSelectHistoryItem }: AuthHistoryBarProps): React.JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, FIRESTORE_SESSIONS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: SessionHistoryItem[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            inputType: data.inputType ?? "emotion",
            userFacing: data.userFacing,
            caregiverFacing: data.caregiverFacing,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          };
        });
        setHistory(items);
      },
      (err) => {
        if (err.code !== "permission-denied") {
          console.error("[Firestore] Snapshot listener non-fatal error:", err);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  async function handleGoogleSignIn(): Promise<void> {
    setIsAuthenticating(true);
    try {
      await signInWithGoogle();
      await logAnalyticsEvent("auth_google_signin");
    } catch (err) {
      console.error("[Auth] Google sign in failed:", err);
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function handleAnonSignIn(): Promise<void> {
    setIsAuthenticating(true);
    try {
      await signInAnon();
      await logAnalyticsEvent("auth_anon_signin");
    } catch (err) {
      console.error("[Auth] Anon sign in failed:", err);
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleSelect(item: SessionHistoryItem): void {
    logAnalyticsEvent("history_item_clicked", { docId: item.id });
    if (onSelectHistoryItem) onSelectHistoryItem(item);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-200">Firebase Identity &amp; Past Sessions</h3>
        {currentUser ? (
          <UserBadge user={currentUser} onSignOut={() => signOut(auth)} />
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isAuthenticating}
              aria-busy={isAuthenticating}
              onClick={handleGoogleSignIn}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Sign In (Google)
            </button>
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={handleAnonSignIn}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Anonymous Access
            </button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <section aria-label="Recent Session History">
          <h4 className="text-[11px] uppercase font-semibold text-slate-400 mb-2">
            Recent Guidance Sessions (Firestore Sync)
          </h4>
          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 rounded-lg border border-slate-700/60 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <span aria-hidden="true">⏱</span>
                <span>{item.inputType} ({item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
