import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Intentaremos leer la imagen como un FormData (estándar html)
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No se incluyó ningún archivo (file)' }, { status: 400 });
    }

    // Subir a Vercel Blob Storage
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true // Agrega letras random al final para evitar que 2 fotos iguales se pisen
    });

    // Devuelve la respuesta con la URL pública donde Vercel guardó la foto
    return NextResponse.json(blob);
    
  } catch (error) {
    console.error("Error al subir a Vercel Blob:", error);
    return NextResponse.json({ error: 'Fallo al subir archivo. Revisa tu BLOB_READ_WRITE_TOKEN' }, { status: 500 });
  }
}
