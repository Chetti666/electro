import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import PanelSidebarNav from '@/components/panel/PanelSidebarNav';
import LogoutButton from '@/components/panel/LogoutButton';

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'ADMIN') {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <nav className="w-full md:w-64 shrink-0 rounded-lg p-4 h-fit md:sticky md:top-28 card">
            <div className="mb-4 pb-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h2
                className="text-lg font-semibold"
                style={{
                  fontFamily: 'var(--font-rajdhani)',
                  color: 'var(--foreground)',
                  letterSpacing: '1px',
                }}
              >
                Mi Panel
              </h2>
              <p className="text-xs mt-1 truncate" style={{ color: 'var(--foreground-dim)' }}>
                {user.name || user.email}
              </p>
              <span
                className="badge inline-block mt-2"
                style={{
                  background: 'rgba(37, 99, 235, 0.15)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  color: 'var(--primary-light)',
                }}
              >
                Cliente
              </span>
            </div>

            <PanelSidebarNav />

            <div className="h-px my-3" style={{ background: 'var(--card-border)' }} />

            <div className="flex flex-col space-y-1">
              <Link
                href="/calculadoras"
                className="px-3 py-2 rounded text-sm transition-all hover:bg-slate-800/40"
                style={{
                  color: 'var(--secondary)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                }}
              >
                Calculadoras
              </Link>
              <Link
                href="/informes"
                className="px-3 py-2 rounded text-sm transition-all hover:bg-slate-800/40"
                style={{
                  color: 'var(--success)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                Generadores de informes
              </Link>
              <Link
                href="/"
                className="px-3 py-2 rounded text-sm transition-all hover:bg-slate-800/40"
                style={{
                  color: 'var(--foreground-muted)',
                  border: '1px solid var(--card-border)',
                }}
              >
                ← Sitio público
              </Link>
              <div className="pt-2">
                <LogoutButton className="w-full" />
              </div>
            </div>
          </nav>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
