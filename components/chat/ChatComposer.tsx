"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function ChatComposer({ disabled, onSend }: { disabled?: boolean; onSend: (body: string) => Promise<void> | void }) {
  const [value, setValue] = useState("");

  async function submit() {
    const body = value.trim();
    if (!body || disabled) return;
    setValue("");
    await onSend(body);
  }

  return (
    <div className="border-t border-zinc-200 bg-white p-3 sm:p-4">
      <div className="flex items-end gap-2 rounded-xl border border-zinc-300 bg-zinc-50 p-2 focus-within:border-[#76B900] focus-within:ring-2 focus-within:ring-[#76B900]/20">
        <label className="sr-only" htmlFor="zyron-chat-message">Message</label>
        <textarea
          id="zyron-chat-message"
          value={value}
          onChange={(event) => setValue(event.target.value.slice(0, 5000))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          rows={1}
          maxLength={5000}
          placeholder="Type your message…"
          className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-5 text-zinc-900 outline-none placeholder:text-zinc-400"
        />
        <button
          type="button"
          aria-label="Send message"
          disabled={disabled || value.trim().length === 0}
          onClick={() => { void submit(); }}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#76B900] text-[#0B0D10] transition-colors hover:bg-[#8DDB00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0D10] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send aria-hidden="true" className="size-4" />
        </button>
      </div>
      <p className="mt-2 px-1 text-[11px] text-zinc-500">Enter to send · Shift + Enter for a new line</p>
    </div>
  );
}
