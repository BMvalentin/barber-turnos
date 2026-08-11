"use client";
// src/components/test-mp/PanelConsole.tsx

import type { RefObject } from "react";
import type { LogEntry } from "./tipos";
import { LOG_COLOR, LOG_PREFIX } from "./constantes";

export function PanelConsole({
  logs,
  onClear,
  endRef,
}: {
  logs: LogEntry[];
  onClear: () => void;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <aside className="w-80 border-l border-zinc-800 flex flex-col overflow-hidden flex-shrink-0">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
          Console
        </p>
        <button
          onClick={onClear}
          className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors"
        >
          clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-[11px]">
        {logs.map((entry) => (
          <div key={entry.id} className="group">
            <div className="flex items-start gap-2">
              <span className="text-zinc-700 flex-shrink-0 tabular-nums">
                {entry.ts}
              </span>
              <span
                className={`flex-shrink-0 ${LOG_COLOR[entry.type]}`}
              >
                {LOG_PREFIX[entry.type]}
              </span>
              <span className={`${LOG_COLOR[entry.type]} leading-relaxed`}>
                {entry.label}
              </span>
            </div>
            {entry.payload != null && (
              <pre className="mt-1 ml-7 text-[10px] text-zinc-600 bg-zinc-900/40 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all border border-zinc-800/50">
                {JSON.stringify(entry.payload, null, 2)}
              </pre>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </aside>
  );
}