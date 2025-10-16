import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error fetching users" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return new NextResponse(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    return new NextResponse(JSON.stringify(newUser), {
      status: 201, // Created
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the code for unique constraint violation
      if (error.code === 'P2002') {
        return new NextResponse(
          JSON.stringify({ error: "An account with this email already exists." }),
          { status: 409, headers: { "Content-Type": "application/json" } } // Conflict
        );
      }
    }

    return new NextResponse(
      JSON.stringify({ error: "Error creating user" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
