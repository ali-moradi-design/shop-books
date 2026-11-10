'use client';

export function PrintButton({ label = 'Print label' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-sm bg-forest-900 px-5 py-2 font-sans text-sm font-semibold text-white"
    >
      {label}
    </button>
  );
}
