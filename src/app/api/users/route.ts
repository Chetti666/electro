import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error fetching users" }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email, name, password, role } = await request.json();

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
    });

    const userWithoutPassword = { ...newUser };
    delete (userWithoutPassword as { password?: string }).password;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new NextResponse(
        JSON.stringify({ error: 'A user with this email already exists' }),
        { status: 409 } // Conflict
      );
    }
    console.error("Error creating user:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error creating user" }),
      { status: 500 }
    );
  }
}