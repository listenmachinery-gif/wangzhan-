"use client";

import { MessageCircle, ShieldCheck, Wifi, WifiOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ChatComposer } from "@/components/chat/ChatComposer";
import { storedChatConversationId, useChatConnection } from "@/components/chat/useChatConnection";

type View = "contact" | "chat";

export function PublicChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("contact");
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const initializedOpen = useRef(false);
  const connection = useChatConnection();
  const resumeConversation = connection.resume;

  useEffect(() => {
    if (!open) {
      initializedOpen.current = false;
      return;
    }
    if (initializedOpen.current) return;
    initializedOpen.current = true;
    closeRef.current?.focus();
    const stored = storedChatConversationId();
    if (stored) {
      setView("chat");
      void resumeConversation(stored).then((resumed) => {
        if (!resumed) setView("contact");
      });
    } else {
      setView("contact");
    }
  }, [open, resumeConversation]);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  function onDialogKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ) ?? []);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function startConversation(includeContact: boolean) {
    const contact = includeContact ? {
      ...(form.name.trim() ? { name: form.name.trim() } : {}),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.whatsapp.trim() ? { whatsapp: form.whatsapp.trim() } : {}),
    } : {};
    const started = await connection.start(contact);
    if (started) setView("chat");
  }

  const status = connection.state === "online"
    ? { text: "Live support connected", icon: Wifi, tone: "text-[#558900]" }
    : connection.state === "offline"
      ? { text: "Offline · Messages will send when connected", icon: WifiOff, tone: "text-amber-700" }
      : connection.state === "connecting"
        ? { text: "Connecting securely…", icon: Wifi, tone: "text-zinc-500" }
        : { text: "Messages are saved · Live updates unavailable", icon: ShieldCheck, tone: "text-zinc-600" };
  const StatusIcon = status.icon;

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        aria-label="Chat With Us"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 right-4 z-[80] flex h-14 items-center gap-2.5 rounded-full border border-white/10 bg-[#0B0D10] px-4 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#171A1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 ${open ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-[#76B900] text-[#0B0D10]">
          <MessageCircle aria-hidden="true" className="size-4" />
        </span>
        <span className="hidden sm:inline">Chat With Us</span>
      </button>

      {open ? (
        <section
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Chat with ZYRON"
          data-mobile-fullscreen="true"
          onKeyDown={onDialogKeyDown}
          className="fixed inset-0 z-[90] flex flex-col overflow-hidden bg-white shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(680px,calc(100dvh-48px))] sm:w-[410px] sm:rounded-2xl sm:border sm:border-black/10"
        >
          <header className="relative overflow-hidden bg-[#0B0D10] px-5 pb-5 pt-4 text-white">
            <div aria-hidden="true" className="absolute inset-y-0 right-0 w-40 bg-[linear-gradient(135deg,transparent_30%,rgba(118,185,0,0.12))]" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#76B900]/40 bg-[#76B900]/10 text-[#8DDB00]">
                  <span className="text-xs font-black tracking-tight">ZY</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold tracking-tight">ZYRON Machinery Support</p>
                  <p className="mt-0.5 text-xs text-zinc-400">Industrial solutions · Global response</p>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close chat"
                onClick={close}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900]"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
          </header>

          {view === "contact" ? (
            <div className="flex flex-1 flex-col overflow-y-auto bg-[#F5F6F8] px-5 py-6 sm:px-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5B8F00]">Direct engineering support</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#171A1F]">How can we help?</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">Start anonymously, or leave optional contact details so our export team can follow up.</p>
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void startConversation(true);
                  }}
                >
                  <ChatField label="Name (optional)" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} autoComplete="name" />
                  <ChatField label="Work email (optional)" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} type="email" autoComplete="email" />
                  <ChatField label="WhatsApp (optional)" value={form.whatsapp} onChange={(whatsapp) => setForm((current) => ({ ...current, whatsapp }))} autoComplete="tel" />
                  <button
                    type="submit"
                    disabled={connection.state === "connecting"}
                    className="mt-2 w-full rounded-xl bg-[#76B900] px-4 py-3 text-sm font-bold text-[#0B0D10] transition-colors hover:bg-[#8DDB00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0D10] disabled:opacity-50"
                  >
                    Start conversation
                  </button>
                  <button
                    type="button"
                    disabled={connection.state === "connecting"}
                    onClick={() => { void startConversation(false); }}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900] disabled:opacity-50"
                  >
                    Continue without contact details
                  </button>
                </form>
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-zinc-500">
                <ShieldCheck aria-hidden="true" className="size-4" /> Chat works independently of analytics cookies
              </p>
            </div>
          ) : (
            <>
              <div className={`flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2.5 text-[11px] font-medium ${status.tone}`} role="status">
                <StatusIcon aria-hidden="true" className="size-3.5" />
                <span>{status.text}</span>
              </div>
              <div role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto bg-[#F5F6F8] px-4 py-5 sm:px-5">
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-700 shadow-sm">
                  Hello. Tell us about the machine, material, thickness, or working length you need.
                </div>
                {connection.messages.map((message) => (
                  <article
                    key={message.id}
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.senderType === "VISITOR" ? "ml-auto rounded-tr-sm bg-[#15181C] text-white" : "rounded-tl-sm border border-zinc-200 bg-white text-zinc-800"}`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.body}</p>
                    {message.queued ? <p className="mt-1.5 text-[10px] font-medium text-amber-300">Waiting to send</p> : message.pending ? <p className="mt-1.5 text-[10px] text-zinc-400">Sending…</p> : null}
                  </article>
                ))}
                {connection.agentTyping ? <p className="text-xs text-zinc-500">Support is typing…</p> : null}
              </div>
              <ChatComposer disabled={!connection.conversationId} onSend={connection.send} />
            </>
          )}
        </section>
      ) : null}
    </>
  );
}

function ChatField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-zinc-700">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-normal text-zinc-900 outline-none transition focus:border-[#76B900] focus:ring-2 focus:ring-[#76B900]/20"
      />
    </label>
  );
}
