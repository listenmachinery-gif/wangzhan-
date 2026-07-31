"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Expand, X } from "lucide-react";
import type { CompanyMediaItem } from "@/data/company";

type CompanyMediaDialogProps = {
  items: CompanyMediaItem[];
  variant?: "gallery" | "certificate";
};

export function CompanyMediaDialog({
  items,
  variant = "gallery",
}: CompanyMediaDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];

  function openDialog(index: number, trigger: HTMLButtonElement) {
    setActiveIndex(index);
    lastTriggerRef.current = trigger;
    dialogRef.current?.showModal();
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
  }

  function closeDialog() {
    dialogRef.current?.close();
    window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }

  return (
    <>
      <div
        className={
          variant === "certificate"
            ? "grid"
            : "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
        }
      >
        {items.map((item, index) => (
          <button
            key={`${item.src}-${item.title}`}
            type="button"
            onClick={(event) => openDialog(index, event.currentTarget)}
            aria-label={`Open larger view: ${item.title}`}
            className={`group relative overflow-hidden bg-[#12161A] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900] ${
              variant === "certificate" ? "aspect-[16/9]" : "aspect-[4/3]"
            }`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              loading="lazy"
              sizes={
                variant === "certificate"
                  ? "(min-width: 1024px) 50vw, 100vw"
                  : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              }
              className={
                item.fit === "contain"
                  ? "object-contain"
                  : "object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
              }
            />
            <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center bg-[#0B0D10]/90 text-[#76B900]">
              <Expand size={17} aria-hidden="true" />
            </span>
            {variant === "gallery" ? (
              <span className="absolute inset-x-0 bottom-0 bg-[#0B0D10]/90 px-3 py-2 text-xs font-semibold text-white">
                {item.title}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={activeItem ? `Image viewer: ${activeItem.title}` : "Image viewer"}
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeDialog();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDialog();
          }
        }}
        className="m-auto h-[min(90vh,920px)] w-[min(94vw,1320px)] max-w-none overflow-hidden border border-white/15 bg-[#0B0D10] p-0 text-white shadow-2xl backdrop:bg-black/80"
      >
        {activeItem ? (
          <div className="grid h-full grid-rows-[auto_1fr_auto]">
            <div className="flex items-center justify-between gap-5 border-b border-white/10 px-4 py-3 sm:px-6">
              <p className="min-w-0 truncate text-sm font-semibold">
                {activeItem.title}
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDialog}
                aria-label="Close image viewer"
                className="grid h-10 w-10 shrink-0 place-items-center border border-white/20 text-white transition hover:border-[#76B900] hover:text-[#8DDB00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76B900]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="relative min-h-0 bg-black">
              <Image
                src={activeItem.src}
                alt={activeItem.alt}
                fill
                sizes="94vw"
                className="object-contain"
              />
            </div>
            <div className="border-t border-white/10 px-4 py-4 sm:px-6">
              <p className="text-sm leading-6 text-zinc-400">
                {activeItem.description}
              </p>
              {items.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2" aria-label="Select gallery image">
                  {items.map((item, index) => (
                    <button
                      key={`${item.src}-selector`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`View ${item.title}`}
                      aria-current={index === activeIndex ? "true" : undefined}
                      className={`h-1.5 w-8 transition ${
                        index === activeIndex ? "bg-[#76B900]" : "bg-white/25 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
