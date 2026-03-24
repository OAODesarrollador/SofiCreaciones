import { put } from '@vercel/blob';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testBlob() {
  console.log("Testeando Vercel Blob Upload...");
  console.log("Token detectado:", process.env.BLOB_READ_WRITE_TOKEN ? "SI (" + process.env.BLOB_READ_WRITE_TOKEN.substring(0, 15) + "...)" : "NO");
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("FALTA EL TOKEN. El archivo .env.local todavía no tiene la variable BLOB_READ_WRITE_TOKEN o está mal escrita.");
    return;
  }

  try {
    const textBuffer = Buffer.from("Hello Vercel Blob Test");
    const result = await put('prueba-conexion.txt', textBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    console.log("!!! ÉXITO !!! Archivo subido correctamente a Vercel.");
    console.log("URL Pública:", result.url);
  } catch (error) {
    console.error("!!! FATAL ERROR !!! Vercel rechazó la subida:");
    console.error(error.message);
  }
}

testBlob();
