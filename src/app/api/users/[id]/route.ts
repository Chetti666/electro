import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { requireAdmin } from '@/lib/auth';

function unauthorizedResponse() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}

// Función para eliminar un usuario
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const userId = Number(id);
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Error deleting user' },
      { status: 500 }
    );
  }
}

// Función para actualizar un usuario
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const userId = Number(id);
    const { email, name, password, role } = await request.json();

    const dataToUpdate: {
      email?: string;
      name?: string;
      password?: string;
      role?: 'USER' | 'ADMIN';
    } = {
      email,
      name,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
    };

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'La contraseña debe tener al menos 8 caracteres' },
          { status: 400 }
        );
      }
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const userWithoutPassword = { ...updatedUser };
    delete (userWithoutPassword as { password?: string }).password;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error updating user' },
      { status: 500 }
    );
  }
}
