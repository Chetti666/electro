'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton({
  className = '',
}: {
  className?: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`px-3 py-2 rounded text-sm transition-all flex items-center gap-2 hover:bg-slate-800/40 ${className}`}
      style={{
        color: 'var(--danger)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
      }}
    >
      <LogOut className="w-4 h-4 shrink-0" />
      <span>Cerrar sesión</span>
    </button>
  );
}
