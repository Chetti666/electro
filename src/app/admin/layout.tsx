import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getSessionUserFromCookie } from '@/lib/auth';
import AdminSidebarNav from '@/components/AdminSidebarNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  const user = token ? getSessionUserFromCookie(token) : null;

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex gap-6">
          <nav
            className="w-64 shrink-0 rounded-lg p-4 h-fit sticky top-28 card"
          >
            <h2
              className="text-lg mb-4 pb-3 font-semibold"
              style={{
                fontFamily: 'var(--font-rajdhani)',
                color: 'var(--foreground)',
                borderBottom: '1px solid var(--card-border)',
                letterSpacing: '1px'
              }}
            >
              Panel Admin
            </h2>
            <div className="flex flex-col space-y-1">
              <AdminSidebarNav />
              <div className="h-px my-3" style={{ background: 'var(--card-border)' }} />
              <Link
                href="/"
                className="px-3 py-2 rounded text-sm transition-all hover:bg-slate-800/40"
                style={{
                  color: 'var(--secondary)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                }}
              >
                ← Sitio público
              </Link>
              <Link
                href="/blog"
                className="px-3 py-2 rounded text-sm transition-all hover:bg-slate-800/40"
                style={{
                  color: 'var(--warning)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                Blog público
              </Link>
            </div>
          </nav>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
