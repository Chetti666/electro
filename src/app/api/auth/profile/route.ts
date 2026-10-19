import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import {
  requireUser,
  serializeSessionUser,
  sessionCookieOptions,
} from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();

    const name =
      typeof body.name === 'string' ? body.name.trim() : undefined;
    const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
    const email = rawEmail ? rawEmail.toLowerCase() : undefined;
    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword : '';

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Ingresa un email válido' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'La nueva contraseña debe tener al menos 8 caracteres' },
          { status: 400 }
        );
      }
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Debes ingresar tu contraseña actual' },
          { status: 400 }
        );
      }
      const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!passwordMatches) {
        return NextResponse.json(
          { error: 'La contraseña actual no es correcta' },
          { status: 400 }
        );
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (name !== undefined) data.name = name || null;
    if (email) data.email = email;
    if (newPassword) data.password = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    const response = NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    });

    if (updated.email !== user.email || updated.name !== user.name) {
      response.cookies.set(
        'session_token',
        serializeSessionUser(updated),
        sessionCookieOptions
      );
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      );
    }
    console.error('Error actualizando perfil:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
