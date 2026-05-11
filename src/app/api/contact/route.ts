import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, type, message } = await request.json();

    if (!name || !email || !type || !message) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Correo electrónico inválido' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const typeLabels: Record<string, string> = {
      consulta: 'Consulta',
      sugerencia: 'Sugerencia',
      reporte_bug: 'Reporte de Error',
      otro: 'Otro',
    };

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `Nuevo mensaje de contacto: ${typeLabels[type] || type} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 30px; border-radius: 10px;">
            <h2 style="color: #00ffff; margin-bottom: 20px;">Nuevo mensaje de ElectroCalc</h2>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #fff; margin: 10px 0;"><strong style="color: #ff00ff;">Nombre:</strong> ${name}</p>
              <p style="color: #fff; margin: 10px 0;"><strong style="color: #ff00ff;">Email:</strong> <a href="mailto:${email}" style="color: #00ffff;">${email}</a></p>
              <p style="color: #fff; margin: 10px 0;"><strong style="color: #ff00ff;">Tipo:</strong> ${typeLabels[type] || type}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px;">
              <h3 style="color: #ff00ff; margin-bottom: 10px;">Mensaje:</h3>
              <p style="color: #e0e0e0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #888; margin-top: 20px; font-size: 12px;">
              Enviado desde ElectroCalc - ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      `,
      replyTo: email,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el mensaje. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}