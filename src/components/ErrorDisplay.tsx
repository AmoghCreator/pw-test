"use client";

import React from "react";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

/** Error message banner with role="alert" for immediate screen reader announcement */
export function ErrorDisplay({
  message,
  onRetry,
}: ErrorDisplayProps): React.JSX.Element {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-red-950/40 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between gap-4 my-4"
    >
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="text-red-400 text-xl font-bold">
          ⚠
        </span>
        <p className="text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Retry
        </button>
      )}
    </div>
  );
}
