import type { Metadata } from 'next';
import { AdminNav } from '@/features/admin/ui/AdminNav';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
};

/** Admin shell: the menu is static; each page checks the admin role next to its data. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10">
      <aside className="mb-6 lg:sticky lg:top-6 lg:mb-0 lg:self-start">
        <p className="mb-3 hidden font-sans text-xs font-semibold uppercase tracking-widest text-mint-500 lg:block">
          Admin
        </p>
        <AdminNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
