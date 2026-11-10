import { whatsappLink } from "@/lib/site";

export function WhatsAppButton({ label }: { label: string }) {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-5 end-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1FAF5A] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3a9 9 0 0 0-7.700 13.600L3 21l4.500-1.200A9 9 0 1 0 12 3Z" strokeLinejoin="round" />
        <path d="M9 8.500c0 3.500 3 6.500 6.500 6.500l1-1.500-2-1-1 .800c-1-.500-1.800-1.300-2.300-2.300l.800-1-1-2L9 8.500Z" fill="currentColor" stroke="none" />
      </svg>
    </a>
  );
}
