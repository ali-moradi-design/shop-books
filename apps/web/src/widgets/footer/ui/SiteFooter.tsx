import Link from 'next/link';
import { subscribe } from '@/features/newsletter/actions';
import { ActionForm } from '@/shared/ui/ActionForm';
import { Logo } from '@/shared/ui/Logo';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      ['All books', '/books'],
      ['Staff picks', '/books?featured=true'],
      ['New arrivals', '/books?sort=createdAt&order=desc'],
      ['Reading list', '/reading-list'],
    ],
  },
  {
    title: 'Help',
    links: [
      ['Help & FAQ', '/help'],
      ['Shipping', '/help#shipping'],
      ['Returns', '/help#returns'],
      ['My orders', '/orders'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About us', '/about'],
      ['Events', '/#events'],
      ['Contact', '/help#contact'],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-forest-900 text-mint-100">
      <div className="mx-auto grid max-w-shop gap-10 px-6 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo className="text-xl text-white" />
          <p className="font-serif text-[15px]">
            New arrivals, staff picks and events, about once a month.
          </p>
          <ActionForm
            action={subscribe}
            submit="Subscribe"
            variant="gold"
            className="max-w-sm"
            buttonClassName="w-full py-2.5"
          >
            <label className="block font-sans text-sm">
              <span className="sr-only">Email address</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Email address"
                className="w-full rounded-sm bg-white px-3 py-2.5 font-sans text-ink"
              />
            </label>
          </ActionForm>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="font-sans text-sm">
            <h2 className="mb-3 font-semibold uppercase tracking-widest text-mint-300">
              {col.title}
            </h2>
            <ul className="space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="border-t border-forest-700 px-6 py-5 text-center font-sans text-xs">
        © Bay Book Company — a demo shop. Payments are simulated; no real card is charged.
      </p>
    </footer>
  );
}
