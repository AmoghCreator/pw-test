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
    LOW: { icon: "🟢", bg: "bg-emerald-950 text-emerald-300 border-emerald-700 shadow-sm" },
    MODERATE: { icon: "🟡", bg: "bg-amber-950 text-amber-300 border-amber-700 shadow-sm" },
    HIGH: { icon: "🟠", bg: "bg-orange-950 text-orange-300 border-orange-700 shadow-sm" },
    CRITICAL: { icon: "🔴", bg: "bg-red-950 text-red-300 border-red-700 shadow-sm animate-pulse" },
  }[level];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg}`}>
      <span aria-hidden="true">{config.icon}</span>
      <span>{level} RISK</span>
    </span>
  );
}

/** Header section of Caregiver card */
function CaregiverCardHeader({ level, inputType, createdAt }: { level: AlertLevel; inputType?: string; createdAt?: string | Date }): React.JSX.Element {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
      <div className="flex items-center gap-2">
        <AlertBadge level={level} />
        {inputType && <span className="text-xs text-slate-300 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-lg font-medium">Type: {inputType}</span>}
      </div>
      <span className="text-xs font-semibold text-slate-400">{createdAt ? new Date(createdAt).toLocaleTimeString() : "Just now"}</span>
    </header>
  );
}

/** Privacy safe summary section */
function CaregiverPrivacySection({ summary }: { summary: string }): React.JSX.Element {
  return (
    <section aria-label="Privacy Safe Context" className="bg-slate-950 p-4 rounded-xl border border-slate-800">
      <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Privacy-Safe Context</h4>
      <p className="text-sm text-slate-100 mt-1 font-semibold leading-relaxed">{summary}</p>
      <p className="text-[11px] text-teal-400 italic mt-1 font-medium flex items-center gap-1">
        <span>🔒</span> User speech abstracted for privacy — no raw quotes shared.
      </p>
    </section>
  );
}

/** Resolves urgency tag configuration for action step */
function getUrgencyTag(idx: number, isEmergency: boolean): { label: string; style: string } {
  if (isEmergency) {
    if (idx === 0) return { label: "IMMEDIATE", style: "bg-red-950 text-red-300 border-red-700" };
    if (idx === 1) return { label: "HIGH PRIORITY", style: "bg-orange-950 text-orange-300 border-orange-700" };
    return { label: "FOLLOW-UP", style: "bg-amber-950 text-amber-300 border-amber-700" };
  }
  if (idx === 0) return { label: "FIRST ACTION", style: "bg-cyan-950 text-cyan-300 border-cyan-700" };
  if (idx === 1) return { label: "SUPPORTIVE", style: "bg-teal-950 text-teal-300 border-teal-700" };
  return { label: "ONGOING", style: "bg-slate-800 text-slate-300 border-slate-600" };
}

/** Single checkable action item with urgency badge */
function ActionChecklistItem({ step, idx, isEmergency, isChecked, onToggle }: { step: string; idx: number; isEmergency: boolean; isChecked: boolean; onToggle: () => void }): React.JSX.Element {
  const tag = getUrgencyTag(idx, isEmergency);
  const checkboxId = `action-step-${idx}-${step.slice(0, 10).replace(/\s+/g, "-")}`;
  return (
    <div className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${isChecked ? "bg-slate-950/60 border-slate-800 opacity-60" : "bg-slate-950 border-slate-800 shadow-inner hover:border-slate-700"}`}>
      <input type="checkbox" id={checkboxId} checked={isChecked} onChange={onToggle} className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 bg-slate-900 cursor-pointer shrink-0" />
      <label htmlFor={checkboxId} className="flex-1 cursor-pointer select-none">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded border ${tag.style}`}>{tag.label}</span>
          {isChecked && <span className="text-[10px] font-bold text-emerald-400">✓ Completed</span>}
        </div>
        <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isChecked ? "line-through text-slate-400" : "text-slate-200"}`}>{step}</p>
      </label>
    </div>
  );
}

/** Interactive checkable action script list section */
function CaregiverActionScript({ isEmergency, steps }: { isEmergency: boolean; steps: string[] }): React.JSX.Element {
  const [checkedIndices, setCheckedIndices] = React.useState<number[]>([]);
  const toggleStep = (idx: number) => {
    setCheckedIndices((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  };
  return (
    <fieldset aria-label="Caregiver Action Checklist">
      <legend className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2.5 flex items-center justify-between w-full">
        <span>{isEmergency ? "🚨 Emergency Action Checklist" : "💡 Recommended Nudge Checklist"}</span>
        <span className="text-[10px] font-normal text-slate-400">{checkedIndices.length}/{steps.length} checked</span>
      </legend>
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <ActionChecklistItem key={idx} step={step} idx={idx} isEmergency={isEmergency} isChecked={checkedIndices.includes(idx)} onToggle={() => toggleStep(idx)} />
        ))}
      </div>
    </fieldset>
  );
}

/** Educational rationale footer */
function CaregiverFooterRationale({ rationale }: { rationale: string }): React.JSX.Element {
  return (
    <footer className="pt-2 border-t border-slate-800">
      <div className="bg-teal-950/80 border border-teal-800 p-3.5 rounded-xl">
        <span className="text-xs font-bold text-teal-300 block mb-1 uppercase tracking-wider">Why This Helps:</span>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">{rationale}</p>
      </div>
    </footer>
  );
}

/** Handover action buttons */
function HandoverButtons({ onCopy, onPrint, copied }: { onCopy: () => void; onPrint: () => void; copied: boolean }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onCopy} aria-label="Copy helpline handover summary to clipboard" className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400">
        <span aria-hidden="true">{copied ? "✅" : "📋"}</span>
        <span>{copied ? "Copied Handover!" : "Copy for Helpline"}</span>
      </button>
      <button type="button" onClick={onPrint} aria-label="Print handover support card" className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400">
        <span aria-hidden="true">🖨️</span>
        <span>Print Card</span>
      </button>
    </div>
  );
}

/** Shareable Support Handover bar */
function CaregiverHandoverBar({ level, summary, steps, rationale, createdAt }: { level: AlertLevel; summary: string; steps: string[]; rationale: string; createdAt?: string | Date }): React.JSX.Element {
  const [copied, setCopied] = React.useState(false);
  const copyToClipboard = async (): Promise<void> => {
    const timeStr = createdAt ? new Date(createdAt).toLocaleTimeString() : "Just now";
    const text = `--- HAVEN BRIDGE SUPPORT HANDOVER CARD ---\nRisk Alert Level: ${level}\nTime: ${timeStr}\nPrivacy-Safe Context: ${summary}\nRecommended Action Script:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\nRationale: ${rationale}\n------------------------------------------`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs">
      <span className="text-slate-400 font-semibold flex items-center gap-1">
        <span aria-hidden="true">🤝</span> Helpline & Medical Handover:
      </span>
      <HandoverButtons onCopy={copyToClipboard} onPrint={() => window.print()} copied={copied} />
    </div>
  );
}

/** Caregiver Nudge / Emergency Script Card */
export function CaregiverCard({ id, caregiverFacing, createdAt, inputType }: CaregiverCardProps): React.JSX.Element {
  const isEmergency = caregiverFacing.alert_level === "HIGH" || caregiverFacing.alert_level === "CRITICAL";

  return (
    <article
      data-testid={`caregiver-card-${id}`}
      className={`rounded-2xl p-6 border shadow-2xl space-y-4 transition-all text-white ${
        isEmergency ? "bg-slate-900 border-red-700/80 ring-1 ring-red-500/40 shadow-red-950/40" : "bg-slate-900 border-slate-700/80"
      }`}
    >
      <CaregiverCardHeader level={caregiverFacing.alert_level} inputType={inputType} createdAt={createdAt} />
      <CaregiverPrivacySection summary={caregiverFacing.privacy_safe_summary} />
      <CaregiverActionScript isEmergency={isEmergency} steps={caregiverFacing.action_script} />
      <CaregiverFooterRationale rationale={caregiverFacing.educational_rationale} />
      <CaregiverHandoverBar level={caregiverFacing.alert_level} summary={caregiverFacing.privacy_safe_summary} steps={caregiverFacing.action_script} rationale={caregiverFacing.educational_rationale} createdAt={createdAt} />
    </article>
  );
}
