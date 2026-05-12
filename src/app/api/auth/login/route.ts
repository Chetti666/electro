import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ error: 'Email y contraseña son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Buscar al usuario por su email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Si el usuario no existe, las credenciales son inválidas
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Credenciales inválidas' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Comparar la contraseña proporcionada con el hash almacenado
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return new NextResponse(
        JSON.stringify({ error: 'Credenciales inválidas' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Crear sesión codificando datos del usuario en base64
    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    // Excluir la contraseña de la respuesta
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as { password?: string }).password;

    // 4. Crear la respuesta y establecer la cookie de sesión
    const response = NextResponse.json(userWithoutPassword);
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true, // La cookie no es accesible desde el JavaScript del cliente
      secure: process.env.NODE_ENV === 'production', // Solo enviar por HTTPS en producción
      path: '/', // Disponible en todo el sitio
    });

    return response;

  } catch (error) {
    console.error("Error en el login:", error);
    return new NextResponse(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
}