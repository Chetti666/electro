import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Función para eliminar un usuario
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = Number(id);
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    if (!deletedUser) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error) {
    console.error("Error deleting user:", error);
    return new NextResponse(JSON.stringify({ error: 'Error deleting user' }), { status: 500 });
  }
}

// Función para actualizar un usuario
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
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
      role,
    };

    // Solo hasheamos y actualizamos la contraseña si se proporciona una nueva
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error updating user" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}