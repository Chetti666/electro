import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import ProfileForm from '@/components/panel/ProfileForm';

export default async function PanelProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect('/login');
  if (session.role === 'ADMIN') redirect('/admin');

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, email: true, createdAt: true },
  });

  if (!user) redirect('/login');

  return (
    <div>
      <h1
        className="text-2xl mb-2 font-bold"
        style={{
          fontFamily: 'var(--font-rajdhani)',
          color: 'var(--foreground)',
          letterSpacing: '1px',
        }}
      >
        Mi perfil
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
        Actualiza tus datos de cuenta. Miembro desde{' '}
        {new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(
          user.createdAt
        )}
        .
      </p>

      <div className="max-w-xl">
        <ProfileForm
          initialName={user.name ?? ''}
          initialEmail={user.email}
        />
      </div>
    </div>
  );
}
