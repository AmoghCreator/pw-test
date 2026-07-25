"use client";

import React from "react";
import type { AlertLevel, CaregiverFacingOutput } from "@/lib/types";

interface CaregiverCardProps {
  id: string;
  caregiverFacing: CaregiverFacingOutput;
  createdAt?: string | Date;
  inputType?: string;
}

/** Renders alert level badge with icon + text (never color alone) */
function AlertBadge({ level }: { level: AlertLevel }): React.JSX.Element {
  const config = {
    LOW: { icon: "🟢", bg: "bg-emerald-950/60 text-emerald-300 border-emerald-700" },
    MODERATE: { icon: "🟡", bg: "bg-amber-950/60 text-amber-300 border-amber-700" },
    HIGH: { icon: "🟠", bg: "bg-orange-950/60 text-orange-300 border-orange-700" },
    CRITICAL: { icon: "🔴", bg: "bg-red-950/60 text-red-300 border-red-700" },
  }[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{level} RISK</span>
    </span>
  );
}

/** Caregiver Nudge / Emergency Script Card */
export function CaregiverCard({
  id,
  caregiverFacing,
  createdAt,
  inputType,
}: CaregiverCardProps): React.JSX.Element {
  const isEmergency = caregiverFacing.alert_level === "HIGH" || caregiverFacing.alert_level === "CRITICAL";

  return (
    <article
      data-testid={`caregiver-card-${id}`}
      className={`rounded-2xl p-6 border shadow-lg space-y-4 transition-all ${
        isEmergency
          ? "bg-slate-900 border-red-800/80 ring-1 ring-red-700/50"
          : "bg-slate-900 border-slate-800"
      }`}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <AlertBadge level={caregiverFacing.alert_level} />
          {inputType && (
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Input: {inputType}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {createdAt ? new Date(createdAt).toLocaleTimeString() : "Just now"}
        </span>
      </header>

      <section aria-label="Privacy Safe Context">
        <h4 className="text-xs uppercase font-semibold text-slate-400">
          Privacy-Safe Context
        </h4>
        <p className="text-sm text-slate-200 mt-1 font-medium">
          {caregiverFacing.privacy_safe_summary}
        </p>
        <p className="text-[11px] text-teal-400/80 italic mt-0.5">
          🔒 User speech abstracted for privacy — no raw quotes shared.
        </p>
      </section>

      <section aria-label="Action Script">
        <h4 className="text-xs uppercase font-semibold text-slate-400 mb-2">
          {isEmergency ? "🚨 Emergency Response Script" : "💡 Recommended Nudge Steps"}
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-200">
          {caregiverFacing.action_script.map((step, idx) => (
            <li key={idx} className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/40">
              {step}
            </li>
          ))}
        </ol>
      </section>

      <footer className="pt-2 border-t border-slate-800/80">
        <div className="bg-teal-950/30 border border-teal-800/40 p-3 rounded-xl">
          <span className="text-xs font-bold text-teal-400 block mb-0.5">
            Why This Helps:
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {caregiverFacing.educational_rationale}
          </p>
        </div>
      </footer>
    </article>
  );
}
