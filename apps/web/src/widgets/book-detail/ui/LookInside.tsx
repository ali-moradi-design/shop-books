import type { Book } from '@/entities/book';

/** "Look inside": the first pages as an open book. Pure HTML (<details>), no client JS. */
export function LookInside({ book }: { book: Book }) {
  if (!book.sample) return null;
  const [first, ...rest] = book.sample.split('\n\n');
  return (
    <section
      aria-labelledby="inside-title"
      className="mt-16 grid items-center gap-12 rounded-[10px] bg-[radial-gradient(circle_at_70%_40%,#2c3f36,#14231d_65%)] p-8 text-[#eadfca] md:grid-cols-[1fr_1.3fr] md:p-14"
    >
      <div>
        <h2 id="inside-title" className="font-serif text-4xl font-medium leading-tight">
          Read the first pages — <em className="text-gold-500">before you buy.</em>
        </h2>
        <p className="my-4 font-serif text-lg opacity-85">
          Turn the pages right here, no sign-in needed.
        </p>
      </div>
      <details open className="group">
        <summary className="mb-4 w-fit cursor-pointer rounded-sm bg-gold-500 px-6 py-3 font-serif font-semibold text-[#14231d] marker:content-none">
          <span className="group-open:hidden">Look inside →</span>
          <span className="hidden group-open:inline">Hide pages</span>
        </summary>
        <div className="grid grid-cols-2 shadow-[0_36px_70px_-20px_#000] md:[transform:perspective(1400px)_rotateY(-6deg)]">
          <div className="min-h-[340px] border-r-2 border-[#c9b88f] bg-gradient-to-r from-[#efe4cc] to-[#e0d2b0] p-7 font-serif text-[15px] leading-[1.75] text-[#2a1d10]">
            <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a4b1f]">
              Chapter 1
            </p>
            <p className="first-letter:float-left first-letter:pr-2 first-letter:pt-1.5 first-letter:font-serif first-letter:text-[52px] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-[#8a4b1f]">
              {first}
            </p>
          </div>
          <div className="min-h-[340px] bg-[#efe4cc] p-7 font-serif text-[15px] leading-[1.75] text-[#2a1d10]">
            {rest.map((p) => (
              <p key={p} className="mb-3">
                {p}
              </p>
            ))}
            <p className="mt-10 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a4b1f]">
              {book.title} · p. 1
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
